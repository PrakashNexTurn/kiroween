"""Unit tests for data models."""

import pytest
from datetime import datetime
from src.models import (
    Phase,
    ProjectMetadata,
    Project,
    Task,
    ExecutionResult,
    CLIResult,
    OrchestratorResponse,
    ProjectSummary,
    SpecGenerated,
    TaskStats,
    BuildConfig,
)


def test_phase_enum():
    """Test Phase enum values."""
    assert Phase.INIT == "INIT"
    assert Phase.SPEC == "SPEC"
    assert Phase.BUILD == "BUILD"
    assert Phase.TEST == "TEST"
    assert Phase.FIX == "FIX"
    assert Phase.COMPLETE == "COMPLETE"


def test_project_metadata_creation():
    """Test ProjectMetadata model creation."""
    now = datetime.now()
    metadata = ProjectMetadata(
        projectId="test-project",
        name="Test Project",
        description="A test project",
        phase=Phase.INIT,
        createdAt=now,
        updatedAt=now,
    )
    
    assert metadata.project_id == "test-project"
    assert metadata.name == "Test Project"
    assert metadata.phase == Phase.INIT
    assert metadata.completion_percentage == 0.0


def test_project_metadata_serialization():
    """Test ProjectMetadata JSON serialization with camelCase."""
    now = datetime.now()
    metadata = ProjectMetadata(
        projectId="test-project",
        name="Test Project",
        description="A test project",
        phase=Phase.INIT,
        createdAt=now,
        updatedAt=now,
    )
    
    data = metadata.to_dict()
    assert "projectId" in data
    assert "createdAt" in data
    assert "updatedAt" in data
    assert "completionPercentage" in data
    assert data["projectId"] == "test-project"


def test_project_metadata_deserialization():
    """Test ProjectMetadata creation from dictionary."""
    now = datetime.now()
    data = {
        "projectId": "test-project",
        "name": "Test Project",
        "description": "A test project",
        "phase": "INIT",
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
        "completionPercentage": 0.0,
    }
    
    metadata = ProjectMetadata.from_dict(data)
    assert metadata.project_id == "test-project"
    assert metadata.name == "Test Project"
    assert metadata.phase == Phase.INIT


def test_project_model():
    """Test Project model."""
    now = datetime.now()
    metadata = ProjectMetadata(
        projectId="test-project",
        name="Test Project",
        description="A test project",
        phase=Phase.SPEC,
        createdAt=now,
        updatedAt=now,
    )
    
    project = Project(
        metadata=metadata,
        project_root="./test-project",
        spec_dir="./test-project/.kiro/specs",
        project_path="./test-project/.kiro/specs",
        requirements_path="./test-project/.kiro/specs/requirements.md",
        design_path="./test-project/.kiro/specs/design.md",
        tasks_path="./test-project/.kiro/specs/tasks.md",
    )
    
    assert project.metadata.project_id == "test-project"
    assert project.project_root == "./test-project"
    assert project.spec_dir == "./test-project/.kiro/specs"
    assert project.project_path == "./test-project/.kiro/specs"


def test_task_model():
    """Test Task model."""
    task = Task(
        number="1.1",
        description="Implement feature X",
        status="pending",
        is_optional=False,
        requirements_refs=["1.1", "1.2"],
        parent="1",
        subtasks=["1.1.1", "1.1.2"],
    )
    
    assert task.number == "1.1"
    assert task.status == "pending"
    assert not task.is_optional
    assert len(task.requirements_refs) == 2


def test_execution_result_model():
    """Test ExecutionResult model."""
    result = ExecutionResult(
        task_number="2.1",
        status="success",
        duration_seconds=5.2,
        logs="Task completed successfully",
        files_modified=["src/app.py", "tests/test_app.py"],
    )
    
    assert result.task_number == "2.1"
    assert result.status == "success"
    assert result.duration_seconds == 5.2
    assert len(result.files_modified) == 2
    assert result.error is None


def test_cli_result_model():
    """Test CLIResult model."""
    result = CLIResult(
        status="success",
        stdout="Command output",
        stderr="",
        exit_code=0,
        files_modified=["file1.py"],
    )
    
    assert result.status == "success"
    assert result.exit_code == 0
    assert len(result.files_modified) == 1


def test_orchestrator_response_model():
    """Test OrchestratorResponse model."""
    response = OrchestratorResponse(
        status="success",
        action="create-project",
        projectId="test-project",
        output={"message": "Project created"},
        logs="Operation completed",
    )
    
    assert response.status == "success"
    assert response.action == "create-project"
    assert response.project_id == "test-project"


def test_orchestrator_response_serialization():
    """Test OrchestratorResponse JSON serialization with camelCase."""
    response = OrchestratorResponse(
        status="success",
        action="create-project",
        projectId="test-project",
        output={"message": "Project created"},
        logs="Operation completed",
    )
    
    data = response.to_dict()
    assert "projectId" in data
    assert data["projectId"] == "test-project"
    assert data["status"] == "success"


def test_project_summary_model():
    """Test ProjectSummary model."""
    now = datetime.now()
    summary = ProjectSummary(
        projectId="test-project",
        name="Test Project",
        description="A test project",
        phase=Phase.BUILD,
        completionPercentage=45.5,
        updatedAt=now,
    )
    
    assert summary.project_id == "test-project"
    assert summary.phase == Phase.BUILD
    assert summary.completion_percentage == 45.5


def test_spec_generated_model():
    """Test SpecGenerated model."""
    now = datetime.now()
    spec = SpecGenerated(
        requirements=now,
        design=now,
        tasks=None,
    )
    
    assert spec.requirements == now
    assert spec.design == now
    assert spec.tasks is None


def test_task_stats_model():
    """Test TaskStats model."""
    stats = TaskStats(
        total=10,
        completed=5,
        in_progress=1,
        pending=3,
        failed=1,
    )
    
    assert stats.total == 10
    assert stats.completed == 5
    assert stats.in_progress == 1


def test_build_config_model():
    """Test BuildConfig model."""
    config = BuildConfig(
        buildCommand="python -m build",
        testCommand="pytest",
        language="python",
    )
    
    assert config.build_command == "python -m build"
    assert config.test_command == "pytest"
    assert config.language == "python"
