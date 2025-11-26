"""CLI executor module for running kiro-cli commands."""

import os
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from src.file_ops import FileOperations, FileWriteError, FileOperationError
from src.models import CLIResult
from src.logger import log_operation


class CLIExecutionError(Exception):
    """Base exception for CLI execution errors."""
    pass


class InstructionFileError(CLIExecutionError):
    """Exception raised when instruction file operations fail."""
    pass


class CLIExecutor:
    """Executes kiro-cli commands and captures output."""

    def __init__(self, file_ops: Optional[FileOperations] = None):
        """
        Initialize the CLIExecutor.

        Args:
            file_ops: FileOperations instance for file handling (optional)
        """
        self.file_ops = file_ops or FileOperations()

    def write_instruction_file(self, instruction: str, project_id: str) -> str:
        """
        Write instruction to a temporary file.

        Args:
            instruction: The instruction text to write
            project_id: The project identifier

        Returns:
            Path to the created instruction file

        Raises:
            InstructionFileError: If the file cannot be written
        """
        # Create instruction file path in project directory
        project_path = Path(f".kiro/specs/{project_id}")
        instruction_path = project_path / "instruction.txt"

        try:
            # Ensure project directory exists
            self.file_ops.create_directory(str(project_path))
            
            # Write instruction to file
            self.file_ops.write_file(str(instruction_path), instruction)
            
            return str(instruction_path)
        except FileOperationError as e:
            raise InstructionFileError(
                f"Failed to write instruction file: {str(e)}"
            ) from e

    def run_kiro_cli(self, instruction_file: str) -> subprocess.CompletedProcess:
        """
        Execute kiro-cli with the instruction file.

        Args:
            instruction_file: Path to the instruction file

        Returns:
            CompletedProcess object with execution results

        Raises:
            CLIExecutionError: If the CLI execution fails
        """
        try:
            # Construct the command: cat instruction_file | kiro-cli
            # On Windows, use 'type' instead of 'cat'
            if os.name == 'nt':  # Windows
                command = f'type "{instruction_file}" | kiro-cli'
            else:  # Unix-like systems
                command = f'cat "{instruction_file}" | kiro-cli'

            # Execute the command
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            return result

        except subprocess.TimeoutExpired as e:
            raise CLIExecutionError(
                f"CLI execution timed out after 300 seconds"
            ) from e
        except Exception as e:
            raise CLIExecutionError(
                f"Failed to execute kiro-cli: {str(e)}"
            ) from e

    def parse_output(self, stdout: str, stderr: str, exit_code: int) -> CLIResult:
        """
        Parse kiro-cli output to extract status, files modified, and errors.

        Args:
            stdout: Standard output from kiro-cli
            stderr: Standard error from kiro-cli
            exit_code: Exit code from the process

        Returns:
            CLIResult with parsed information
        """
        # Determine status based on exit code and output
        status = "success" if exit_code == 0 else "failure"
        
        # Extract files modified from output
        files_modified = self._extract_files_modified(stdout)
        
        # Extract error information
        error = None
        if exit_code != 0:
            error = self._extract_error(stdout, stderr)
        
        return CLIResult(
            status=status,
            stdout=stdout,
            stderr=stderr,
            exit_code=exit_code,
            files_modified=files_modified,
            error=error
        )

    def _extract_files_modified(self, output: str) -> list[str]:
        """
        Extract list of modified files from CLI output.

        Args:
            output: CLI output text

        Returns:
            List of file paths that were modified
        """
        files = []
        
        # Look for common patterns indicating file modifications
        # Pattern 1: "Created file: <path>"
        created_pattern = r"Created file:\s+(.+)"
        files.extend(re.findall(created_pattern, output, re.IGNORECASE))
        
        # Pattern 2: "Modified file: <path>"
        modified_pattern = r"Modified file:\s+(.+)"
        files.extend(re.findall(modified_pattern, output, re.IGNORECASE))
        
        # Pattern 3: "Updated file: <path>"
        updated_pattern = r"Updated file:\s+(.+)"
        files.extend(re.findall(updated_pattern, output, re.IGNORECASE))
        
        # Pattern 4: "Writing to <path>"
        writing_pattern = r"Writing to\s+(.+)"
        files.extend(re.findall(writing_pattern, output, re.IGNORECASE))
        
        # Pattern 5: File paths in .kiro/specs/ directories
        spec_file_pattern = r"\.kiro/specs/[^/]+/(?:requirements|design|tasks)\.md"
        files.extend(re.findall(spec_file_pattern, output))
        
        # Remove duplicates and clean up paths
        files = list(set(f.strip() for f in files))
        
        return files

    def _extract_error(self, stdout: str, stderr: str) -> str:
        """
        Extract error message from CLI output.

        Args:
            stdout: Standard output
            stderr: Standard error

        Returns:
            Error message string
        """
        # Prefer stderr if it has content
        if stderr.strip():
            return stderr.strip()
        
        # Look for error patterns in stdout
        error_patterns = [
            r"Error:\s*(.+)",
            r"ERROR:\s*(.+)",
            r"Failed:\s*(.+)",
            r"Exception:\s*(.+)",
        ]
        
        for pattern in error_patterns:
            matches = re.findall(pattern, stdout, re.IGNORECASE | re.MULTILINE)
            if matches:
                return matches[0].strip()
        
        # If no specific error found, return a generic message
        return "CLI execution failed with non-zero exit code"

    @log_operation("execute_instruction")
    def execute_instruction(self, instruction: str, project_id: str) -> CLIResult:
        """
        Main entry point for executing an instruction via kiro-cli.

        This method:
        1. Writes the instruction to a temp file
        2. Executes kiro-cli with the instruction
        3. Parses the output
        4. Cleans up the temp file
        5. Returns the result

        Args:
            instruction: The instruction text to execute
            project_id: The project identifier

        Returns:
            CLIResult with execution results

        Raises:
            CLIExecutionError: If execution fails
        """
        instruction_file = None
        
        try:
            # Step 1: Write instruction file
            instruction_file = self.write_instruction_file(instruction, project_id)
            
            # Step 2: Execute kiro-cli
            process_result = self.run_kiro_cli(instruction_file)
            
            # Step 3: Parse output
            cli_result = self.parse_output(
                process_result.stdout,
                process_result.stderr,
                process_result.returncode
            )
            
            return cli_result
            
        finally:
            # Step 4: Cleanup temp file
            if instruction_file:
                try:
                    self.file_ops.delete_file(instruction_file)
                except Exception:
                    # Best effort cleanup - don't fail if cleanup fails
                    pass
