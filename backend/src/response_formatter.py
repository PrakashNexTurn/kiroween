"""Response formatter module for creating standardized API responses."""

import re
from typing import Dict, Any, List, Optional

from src.models import OrchestratorResponse, CLIResult


class ResponseFormatter:
    """Formats API responses from CLI execution results."""

    def format_success(
        self,
        action: str,
        project_id: str,
        cli_output: CLIResult,
        additional_output: Optional[Dict[str, Any]] = None
    ) -> OrchestratorResponse:
        """
        Create an OrchestratorResponse for successful operations.

        Args:
            action: The action that was performed (e.g., "create-project", "execute-task")
            project_id: The project identifier
            cli_output: The CLIResult from kiro-cli execution
            additional_output: Optional additional data to include in output

        Returns:
            OrchestratorResponse with success status
        """
        output = {
            "files_modified": cli_output.files_modified,
            "exit_code": cli_output.exit_code,
        }
        
        # Add any additional output data
        if additional_output:
            output.update(additional_output)
        
        # Combine stdout and stderr for logs
        logs = self._combine_logs(cli_output.stdout, cli_output.stderr)
        
        return OrchestratorResponse(
            status="success",
            action=action,
            project_id=project_id,
            output=output,
            logs=logs
        )

    def format_failure(
        self,
        action: str,
        project_id: str,
        error: str,
        logs: str,
        additional_output: Optional[Dict[str, Any]] = None
    ) -> OrchestratorResponse:
        """
        Create an OrchestratorResponse for failed operations.

        Args:
            action: The action that was attempted
            project_id: The project identifier
            error: Error message describing the failure
            logs: Execution logs
            additional_output: Optional additional data to include in output

        Returns:
            OrchestratorResponse with failure status
        """
        output = {
            "error": {
                "message": error,
            }
        }
        
        # Add any additional output data
        if additional_output:
            output.update(additional_output)
        
        return OrchestratorResponse(
            status="failure",
            action=action,
            project_id=project_id,
            output=output,
            logs=logs
        )

    def extract_files_modified(self, cli_output: str) -> List[str]:
        """
        Parse file changes from CLI output.

        Args:
            cli_output: The output text from kiro-cli

        Returns:
            List of file paths that were modified
        """
        files = []
        
        # Look for common patterns indicating file modifications
        # Pattern 1: "Created file: <path>"
        created_pattern = r"Created file:\s+(.+)"
        files.extend(re.findall(created_pattern, cli_output, re.IGNORECASE))
        
        # Pattern 2: "Modified file: <path>"
        modified_pattern = r"Modified file:\s+(.+)"
        files.extend(re.findall(modified_pattern, cli_output, re.IGNORECASE))
        
        # Pattern 3: "Updated file: <path>"
        updated_pattern = r"Updated file:\s+(.+)"
        files.extend(re.findall(updated_pattern, cli_output, re.IGNORECASE))
        
        # Pattern 4: "Writing to <path>"
        writing_pattern = r"Writing to\s+(.+)"
        files.extend(re.findall(writing_pattern, cli_output, re.IGNORECASE))
        
        # Pattern 5: "Saved <path>"
        saved_pattern = r"Saved\s+(.+)"
        files.extend(re.findall(saved_pattern, cli_output, re.IGNORECASE))
        
        # Pattern 6: File paths in .kiro/specs/ directories
        spec_file_pattern = r"\.kiro/specs/[^/\s]+/(?:requirements|design|tasks|project)\.(?:md|json)"
        files.extend(re.findall(spec_file_pattern, cli_output))
        
        # Remove duplicates and clean up paths
        files = list(set(f.strip() for f in files))
        
        return files

    def extract_status(self, cli_output: str) -> str:
        """
        Determine operation outcome from CLI output.

        Args:
            cli_output: The output text from kiro-cli

        Returns:
            Status string: "success" or "failure"
        """
        # Look for explicit success indicators
        success_patterns = [
            r"success",
            r"completed successfully",
            r"done",
            r"finished",
            r"✓",
            r"✔",
        ]
        
        # Look for explicit failure indicators
        failure_patterns = [
            r"error",
            r"failed",
            r"exception",
            r"✗",
            r"✘",
            r"abort",
        ]
        
        output_lower = cli_output.lower()
        
        # Check for failure patterns first (more specific)
        for pattern in failure_patterns:
            if re.search(pattern, output_lower):
                return "failure"
        
        # Check for success patterns
        for pattern in success_patterns:
            if re.search(pattern, output_lower):
                return "success"
        
        # If no clear indicators, assume success if there's output
        # (kiro-cli typically produces output on success)
        return "success" if cli_output.strip() else "failure"

    def _combine_logs(self, stdout: str, stderr: str) -> str:
        """
        Combine stdout and stderr into a single log string.

        Args:
            stdout: Standard output
            stderr: Standard error

        Returns:
            Combined log string
        """
        logs = []
        
        if stdout.strip():
            logs.append("=== STDOUT ===")
            logs.append(stdout.strip())
        
        if stderr.strip():
            logs.append("=== STDERR ===")
            logs.append(stderr.strip())
        
        return "\n\n".join(logs) if logs else ""
