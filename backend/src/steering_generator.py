"""Steering file generator for Kiro projects using kiro-cli."""

from pathlib import Path
from typing import Dict, Optional

from src.models import Project, CLIResult
from src.file_ops import FileOperations, FileOperationError
from src.cli_executor import CLIExecutor, CLIExecutionError
from src.logger import get_logger, log_operation


class SteeringGeneratorError(Exception):
    """Base exception for steering generator errors."""
    pass


class SteeringGenerator:
    """Generates steering files for AI assistants using kiro-cli for AI-powered content."""

    def __init__(self, cli_executor: Optional[CLIExecutor] = None):
        """
        Initialize the SteeringGenerator.
        
        Args:
            cli_executor: Optional CLIExecutor instance for testing
        """
        self.file_ops = FileOperations()
        self.cli_executor = cli_executor or CLIExecutor(self.file_ops)
        self.logger = get_logger()

    def _get_steering_dir(self, project_root: str) -> Path:
        """
        Get the steering directory path for a project.

        Args:
            project_root: The project root directory

        Returns:
            Path to steering directory: <project_root>/.kiro/steering/
        """
        return Path(project_root) / ".kiro" / "steering"

    def _generate_steering_instruction(self, project: Project, force: bool = False) -> str:
        """
        Generate instruction for kiro-cli to create steering files.

        Args:
            project: The project object containing metadata
            force: If True, overwrite existing files

        Returns:
            Instruction string for kiro-cli
        """
        metadata = project.metadata
        steering_dir = self._get_steering_dir(project.project_root)
        
        # Check if files exist
        existing_files = []
        for filename in ["product.md", "tech.md", "structure.md"]:
            if self.file_ops.file_exists(str(steering_dir / filename)):
                existing_files.append(filename)
        
        force_note = ""
        if existing_files and force:
            force_note = f" Note: The following files already exist and should be OVERWRITTEN: {', '.join(existing_files)}."
        elif existing_files and not force:
            force_note = f" Note: The following files already exist and should be SKIPPED: {', '.join(existing_files)}."

        instruction = "/tools trust-all\n"
        instruction += (
            f"You are generating steering files for a Kiro project located at {steering_dir}. "
            f"Steering files provide AI assistants with project-specific context and conventions. "
            f"Project details: Name='{metadata.name}', ID='{metadata.project_id}', "
            f"Description='{metadata.description}', Phase={metadata.phase.value}, "
            f"Language={metadata.build_config.language or 'Not specified'}, "
            f"Build Command={metadata.build_config.build_command or 'Not specified'}, "
            f"Test Command={metadata.build_config.test_command or 'Not specified'}, "
            f"Completion={metadata.completion_percentage}%, "
            f"Tasks: {metadata.task_stats.completed}/{metadata.task_stats.total} completed. "
            f"Create THREE steering files in {steering_dir}: "
            f"1) product.md - Product overview including project name, description, purpose, goals, objectives, target audience, stakeholders, success criteria, and current status (phase, completion, task stats). "
            f"2) tech.md - Technology stack including frameworks, dependencies, development tools, linters, formatters, build/test commands, environment setup, configuration, architecture patterns, and testing strategy. "
            f"3) structure.md - Project structure including directory organization (.kiro/specs/ and .kiro/steering/), naming conventions for files/directories/code, code organization patterns, configuration files, build artifacts location, and project-specific best practices. "
            f"Generate comprehensive, detailed, AI-assistant-friendly content based on the project information provided. "
            f"Use markdown formatting with clear sections, subsections, and code blocks. "
            f"Be specific and actionable, not generic.{force_note}"
        )

        return instruction

    @log_operation("generate_all_steering_files")
    def generate_all(self, project: Project, force: bool = False) -> Dict[str, str]:
        """
        Generate all steering files for a project using kiro-cli.

        Args:
            project: The project object containing metadata
            force: If True, overwrite existing files. If False, skip existing files.

        Returns:
            Dictionary with generation results including:
                - 'status': 'success' or 'failure'
                - 'files': Dictionary mapping file names to their paths
                - 'logs': CLI execution logs
                - 'error': Error message if generation failed

        Raises:
            SteeringGeneratorError: If generation fails
        """
        steering_dir = self._get_steering_dir(project.project_root)
        
        try:
            # Create steering directory if it doesn't exist
            self.file_ops.create_directory(str(steering_dir))
            self.logger.info(f"Steering directory: {steering_dir}")
            
            # Check existing files before generation
            existing_files = []
            for filename in ["product.md", "tech.md", "structure.md"]:
                if self.file_ops.file_exists(str(steering_dir / filename)):
                    existing_files.append(filename)
            
            if existing_files and not force:
                self.logger.info(
                    f"Skipping generation - files already exist: {', '.join(existing_files)}. "
                    f"Use force=True to overwrite."
                )
                return {
                    "status": "skipped",
                    "files": {f: str(steering_dir / f) for f in existing_files},
                    "logs": f"Files already exist: {', '.join(existing_files)}",
                    "message": "Use force=True to overwrite existing files"
                }
            
            # Generate instruction for kiro-cli
            instruction = self._generate_steering_instruction(project, force)
            self.logger.info("Generated steering instruction for kiro-cli")
            
            # Execute via kiro-cli
            self.logger.info("Executing kiro-cli to generate steering files...")
            cli_result: CLIResult = self.cli_executor.execute_instruction(
                instruction=instruction,
                spec_dir=project.spec_dir,
                project_root=project.project_root
            )
            
            # Check if generation was successful
            if cli_result.status == "success":
                # Verify files were created
                generated_files = {}
                for filename in ["product.md", "tech.md", "structure.md"]:
                    file_path = steering_dir / filename
                    if self.file_ops.file_exists(str(file_path)):
                        generated_files[filename] = str(file_path)
                        self.logger.info(f"Generated steering file: {filename}")
                    else:
                        self.logger.warning(f"Expected file not found: {filename}")
                
                if not generated_files:
                    raise SteeringGeneratorError(
                        "CLI execution succeeded but no steering files were created"
                    )
                
                return {
                    "status": "success",
                    "files": generated_files,
                    "logs": cli_result.stdout,
                    "files_modified": cli_result.files_modified
                }
            else:
                # Generation failed
                error_msg = cli_result.error or "Unknown error during CLI execution"
                self.logger.error(f"Steering generation failed: {error_msg}")
                
                return {
                    "status": "failure",
                    "files": {},
                    "logs": cli_result.stdout + "\n" + cli_result.stderr,
                    "error": error_msg
                }
            
        except CLIExecutionError as e:
            raise SteeringGeneratorError(
                f"Failed to execute kiro-cli for steering generation: {str(e)}"
            ) from e
        except FileOperationError as e:
            raise SteeringGeneratorError(
                f"Failed to create steering directory for project '{project.metadata.project_id}': {str(e)}"
            ) from e
        except Exception as e:
            raise SteeringGeneratorError(
                f"Unexpected error generating steering files: {str(e)}"
            ) from e
