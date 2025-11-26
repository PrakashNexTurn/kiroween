"""Instruction generator module for creating kiro-cli instructions."""

from typing import Optional


class InstructionGenerator:
    """Generates instruction files for kiro-cli execution."""

    def __init__(self):
        """Initialize the InstructionGenerator."""
        pass

    def generate_spec_instruction(
        self,
        project_id: str,
        spec_type: str,
        description: str
    ) -> str:
        """
        Generate instruction for spec file generation (requirements/design/tasks).

        Args:
            project_id: The project identifier
            spec_type: Type of spec to generate ("requirements", "design", or "tasks")
            description: Project description or context for generation

        Returns:
            Instruction string for kiro-cli

        Raises:
            ValueError: If spec_type is invalid
        """
        valid_types = ["requirements", "design", "tasks"]
        if spec_type not in valid_types:
            raise ValueError(
                f"Invalid spec_type '{spec_type}'. Must be one of: {', '.join(valid_types)}"
            )

        instruction = "/tools trust-all\n"

        if spec_type == "requirements":
            instruction += (
                f"Create a new feature spec for project '{project_id}' "
                f"in .kiro/specs/{project_id}/ with the following description: {description}"
            )
        elif spec_type == "design":
            instruction += (
                f"Generate the design document for project '{project_id}' "
                f"in .kiro/specs/{project_id}/ based on the requirements.md file."
            )
        elif spec_type == "tasks":
            instruction += (
                f"Generate the task list for project '{project_id}' "
                f"in .kiro/specs/{project_id}/ based on the design.md file."
            )

        return instruction

    def generate_task_instruction(
        self,
        project_id: str,
        task_number: Optional[str] = None
    ) -> str:
        """
        Generate instruction for task execution.

        Args:
            project_id: The project identifier
            task_number: Optional specific task number to execute (e.g., "2.3").
                        If None, executes all tasks.

        Returns:
            Instruction string for kiro-cli
        """
        instruction = "/tools trust-all\n"

        if task_number:
            instruction += (
                f"Execute task {task_number} from .kiro/specs/{project_id}/tasks.md"
            )
        else:
            instruction += (
                f"Execute all tasks from .kiro/specs/{project_id}/tasks.md in sequential order"
            )

        return instruction

    def generate_build_instruction(self, project_id: str) -> str:
        """
        Generate instruction for building the project.

        Args:
            project_id: The project identifier

        Returns:
            Instruction string for kiro-cli
        """
        instruction = "/tools trust-all\n"
        instruction += (
            f"Build the project in .kiro/specs/{project_id}/ "
            f"using the configured build command"
        )

        return instruction

    def generate_test_instruction(self, project_id: str) -> str:
        """
        Generate instruction for running tests.

        Args:
            project_id: The project identifier

        Returns:
            Instruction string for kiro-cli
        """
        instruction = "/tools trust-all\n"
        instruction += f"Run all tests for the project in .kiro/specs/{project_id}/"

        return instruction

    def generate_fix_instruction(
        self,
        project_id: str,
        failure_details: str
    ) -> str:
        """
        Generate instruction for auto-fixing issues.

        Args:
            project_id: The project identifier
            failure_details: Details about the failures to fix

        Returns:
            Instruction string for kiro-cli
        """
        instruction = "/tools trust-all\n"
        instruction += (
            f"The following tests are failing in .kiro/specs/{project_id}/:\n"
            f"{failure_details}\n"
            f"Please analyze and fix these issues."
        )

        return instruction
