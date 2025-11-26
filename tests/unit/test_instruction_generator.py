"""Unit tests for the InstructionGenerator class."""

import pytest
from src.instruction_generator import InstructionGenerator


class TestInstructionGenerator:
    """Test suite for InstructionGenerator."""

    def setup_method(self):
        """Set up test fixtures."""
        self.generator = InstructionGenerator()

    def test_generate_spec_instruction_requirements(self):
        """Test generating requirements spec instruction."""
        project_id = "test-project"
        description = "A test project for unit testing"

        instruction = self.generator.generate_spec_instruction(
            project_id=project_id,
            spec_type="requirements",
            description=description
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains project details
        assert project_id in instruction
        assert description in instruction
        assert ".kiro/specs/test-project/" in instruction
        assert "requirements.md" in instruction
        assert "EARS" in instruction
        assert "Do not create design.md or tasks.md" in instruction

    def test_generate_spec_instruction_design(self):
        """Test generating design spec instruction."""
        project_id = "my-app"
        description = "Design context"

        instruction = self.generator.generate_spec_instruction(
            project_id=project_id,
            spec_type="design",
            description=description
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains project details
        assert project_id in instruction
        assert ".kiro/specs/my-app/" in instruction
        assert "design.md" in instruction
        assert "requirements.md" in instruction
        assert "Correctness Properties" in instruction
        assert "Do not modify requirements.md or create tasks.md" in instruction

    def test_generate_spec_instruction_tasks(self):
        """Test generating tasks spec instruction."""
        project_id = "todo-app"
        description = "Task context"

        instruction = self.generator.generate_spec_instruction(
            project_id=project_id,
            spec_type="tasks",
            description=description
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains project details
        assert project_id in instruction
        assert ".kiro/specs/todo-app/" in instruction
        assert "tasks.md" in instruction
        assert "design.md" in instruction
        assert "checkbox format" in instruction or "checkbox tasks" in instruction
        assert "Implementation Plan" in instruction
        assert "Do not modify requirements.md or design.md" in instruction

    def test_generate_spec_instruction_invalid_type(self):
        """Test that invalid spec_type raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            self.generator.generate_spec_instruction(
                project_id="test",
                spec_type="invalid",
                description="test"
            )

        assert "Invalid spec_type" in str(exc_info.value)
        assert "invalid" in str(exc_info.value)

    def test_generate_task_instruction_specific_task(self):
        """Test generating instruction for specific task execution."""
        project_id = "my-project"
        task_number = "2.3"

        instruction = self.generator.generate_task_instruction(
            project_id=project_id,
            task_number=task_number
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains task details
        assert project_id in instruction
        assert task_number in instruction
        assert ".kiro/specs/my-project/tasks.md" in instruction
        assert "Execute task" in instruction

    def test_generate_task_instruction_all_tasks(self):
        """Test generating instruction for executing all tasks."""
        project_id = "full-project"

        instruction = self.generator.generate_task_instruction(
            project_id=project_id,
            task_number=None
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains project details
        assert project_id in instruction
        assert ".kiro/specs/full-project/tasks.md" in instruction
        assert "all tasks" in instruction.lower() or "sequential" in instruction.lower()

    def test_generate_build_instruction(self):
        """Test generating build instruction."""
        project_id = "build-test"

        instruction = self.generator.generate_build_instruction(project_id)

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains build details
        assert project_id in instruction
        assert ".kiro/specs/build-test/" in instruction
        assert "build" in instruction.lower()

    def test_generate_test_instruction(self):
        """Test generating test instruction."""
        project_id = "test-project"

        instruction = self.generator.generate_test_instruction(project_id)

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains test details
        assert project_id in instruction
        assert ".kiro/specs/test-project/" in instruction
        assert "test" in instruction.lower()

    def test_generate_fix_instruction(self):
        """Test generating fix instruction with failure details."""
        project_id = "buggy-project"
        failure_details = (
            "- test_task_creation: AssertionError on line 45\n"
            "- test_task_deletion: KeyError 'id'"
        )

        instruction = self.generator.generate_fix_instruction(
            project_id=project_id,
            failure_details=failure_details
        )

        # Verify instruction starts with /tools trust-all
        assert instruction.startswith("/tools trust-all\n")

        # Verify instruction contains fix details
        assert project_id in instruction
        assert ".kiro/specs/buggy-project/" in instruction
        assert failure_details in instruction
        assert "failing" in instruction.lower()
        assert "fix" in instruction.lower()

    def test_all_instructions_start_with_trust_all(self):
        """Verify all instruction types start with /tools trust-all."""
        project_id = "test"

        instructions = [
            self.generator.generate_spec_instruction(project_id, "requirements", "desc"),
            self.generator.generate_spec_instruction(project_id, "design", "desc"),
            self.generator.generate_spec_instruction(project_id, "tasks", "desc"),
            self.generator.generate_task_instruction(project_id, "1.1"),
            self.generator.generate_task_instruction(project_id, None),
            self.generator.generate_build_instruction(project_id),
            self.generator.generate_test_instruction(project_id),
            self.generator.generate_fix_instruction(project_id, "failures"),
        ]

        for instruction in instructions:
            assert instruction.startswith("/tools trust-all\n"), (
                f"Instruction does not start with /tools trust-all: {instruction[:50]}"
            )
