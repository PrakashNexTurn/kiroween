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
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/. "
                f"Generate the requirements.md file following the Kiro spec format: "
                f"Use EARS (Easy Approach to Requirements Syntax) patterns, "
                f"include Introduction, Glossary, and numbered Requirements sections, "
                f"each requirement should have a user story and 2-5 acceptance criteria, "
                f"follow INCOSE quality rules (active voice, no vague terms, measurable criteria). "
                f"Feature description: {description}. "
                f"Create ONLY the requirements.md file. Do not create design.md or tasks.md yet."
            )
        elif spec_type == "design":
            instruction += (
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/. "
                f"The requirements.md file already exists. Now generate the design.md file following the Kiro spec format: "
                f"Include sections: Overview, Architecture, Components and Interfaces, Data Models, "
                f"Correctness Properties, Error Handling, Testing Strategy. "
                f"Use the prework tool to analyze acceptance criteria before writing Correctness Properties. "
                f"Each correctness property should reference specific requirements. "
                f"Include both unit testing and property-based testing approaches. "
                f"Create ONLY the design.md file based on requirements.md. Do not modify requirements.md or create tasks.md yet."
            )
        elif spec_type == "tasks":
            instruction += (
                f"You are working on a spec for feature '{project_id}' located at .kiro/specs/{project_id}/. "
                f"The requirements.md and design.md files already exist. Now generate the tasks.md file following the exact Kiro spec format. "
                f"CRITICAL FORMAT RULES: "
                f"1) Start with title '# Implementation Plan' (not '# Tasks'), "
                f"2) Main tasks use format '- [ ] 1. Task name', "
                f"3) ALWAYS add 3-4 blank lines between main tasks (e.g., after task 1 and all its sub-tasks, add blank lines before task 2), "
                f"4) Sub-tasks use format '- [ ] 1.1 Sub-task' (indented with 2 spaces), "
                f"5) Task details are indented sub-bullets (2 spaces, no checkbox, e.g., '  - Create User table...'), "
                f"6) Requirements reference is indented sub-bullet '  - _Requirements: 1.1, 2.3_', "
                f"7) Optional test sub-tasks use '- [ ]* X.Y Task name' format, "
                f"8) Property-based test sub-tasks include '  - **Property N: Name**' and '  - **Validates: Requirements X.Y**', "
                f"9) Checkpoint tasks use '- [ ] N. Checkpoint - Ensure all tests pass' with sub-bullet '  - Ensure all tests pass, ask the user if questions arise.'. "
                f"IMPORTANT: The FIRST task (task 1) MUST be about creating/deciding on the project folder structure. "
                f"This task should include sub-tasks for: creating the directory structure, setting up configuration files, and establishing the basic project skeleton. "
                f"The blank lines between main tasks are ESSENTIAL for readability. "
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
                f"You are implementing task {task_number} from the spec at .kiro/specs/{project_id}/tasks.md. "
                f"Read the task description carefully and implement ONLY what is specified in that task. "
                f"Create or modify code files as needed to complete the task requirements. "
                f"DO NOT delete any existing project files unless the task explicitly requires it. "
                f"After completing the implementation, use the taskStatus tool to mark task {task_number} as completed."
            )
        else:
            instruction += (
                f"You are implementing ALL tasks from the spec at .kiro/specs/{project_id}/tasks.md in sequential order. "
                f"For each task: 1) Read the task description, 2) Implement what is specified, 3) Use taskStatus tool to mark it complete. "
                f"Create or modify code files as needed to complete each task. "
                f"DO NOT delete any existing project files unless a specific task explicitly requires it. "
                f"Work through tasks incrementally and update status after each completion."
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
            f"The following tests are failing in .kiro/specs/{project_id}/: "
            f"{failure_details}. "
            f"Please analyze and fix these issues."
        )

        return instruction
