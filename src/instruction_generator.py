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
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/\n\n"
                f"Generate the requirements.md file following the Kiro spec format:\n"
                f"- Use EARS (Easy Approach to Requirements Syntax) patterns\n"
                f"- Include Introduction, Glossary, and numbered Requirements sections\n"
                f"- Each requirement should have a user story and 2-5 acceptance criteria\n"
                f"- Follow INCOSE quality rules (active voice, no vague terms, measurable criteria)\n\n"
                f"Feature description: {description}\n\n"
                f"Create ONLY the requirements.md file. Do not create design.md or tasks.md yet."
            )
        elif spec_type == "design":
            instruction += (
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/\n\n"
                f"The requirements.md file already exists. Now generate the design.md file following the Kiro spec format:\n"
                f"- Include sections: Overview, Architecture, Components and Interfaces, Data Models, "
                f"Correctness Properties, Error Handling, Testing Strategy\n"
                f"- Use the prework tool to analyze acceptance criteria before writing Correctness Properties\n"
                f"- Each correctness property should reference specific requirements\n"
                f"- Include both unit testing and property-based testing approaches\n\n"
                f"Create ONLY the design.md file based on requirements.md. Do not modify requirements.md or create tasks.md yet."
            )
        elif spec_type == "tasks":
            instruction += (
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/\n\n"
                f"The requirements.md and design.md files already exist. Now generate the tasks.md file following the Kiro spec format:\n"
                f"- Create numbered checkbox tasks (e.g., - [ ] 1. Task name)\n"
                f"- Use decimal notation for sub-tasks (e.g., - [ ] 1.1, - [ ] 1.2)\n"
                f"- Each task should reference specific requirements (e.g., _Requirements: 1.1, 2.3_)\n"
                f"- Mark optional test-related sub-tasks with '*' suffix (e.g., - [ ]* 2.1 Write unit tests)\n"
                f"- Include checkpoint tasks: 'Ensure all tests pass, ask the user if questions arise.'\n"
                f"- Each property-based test should be its own sub-task with property number and requirement reference\n\n"
                f"Create ONLY the tasks.md file based on design.md. Do not modify requirements.md or design.md."
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
