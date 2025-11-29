"""Tests for file explorer API endpoints."""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import tempfile
import shutil

from src.app import app, project_manager


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def test_project():
    """Create a test project with some files."""
    # Create a temporary directory for the test project
    with tempfile.TemporaryDirectory() as temp_dir:
        project_root = Path(temp_dir) / "test-project"
        project_root.mkdir()
        
        # Create some test files and directories
        (project_root / "README.md").write_text("# Test Project")
        (project_root / "src").mkdir()
        (project_root / "src" / "main.py").write_text("print('Hello')")
        (project_root / "src" / "utils.py").write_text("def helper(): pass")
        
        # Create .kiro/specs directory
        specs_dir = project_root / ".kiro" / "specs"
        specs_dir.mkdir(parents=True)
        
        # Create project.json
        project_json = specs_dir / "project.json"
        project_json.write_text("""{
            "projectId": "test-project",
            "name": "Test Project",
            "description": "A test project",
            "phase": "INIT",
            "createdAt": "2024-01-01T00:00:00Z",
            "updatedAt": "2024-01-01T00:00:00Z",
            "specGenerated": {
                "requirements": null,
                "design": null,
                "tasks": null
            },
            "taskStats": {
                "total": 0,
                "completed": 0,
                "inProgress": 0,
                "pending": 0,
                "failed": 0
            },
            "buildConfig": {
                "buildCommand": null,
                "testCommand": null,
                "language": null
            },
            "completionPercentage": 0.0
        }""")
        
        # Create empty spec files
        (specs_dir / "requirements.md").write_text("")
        (specs_dir / "design.md").write_text("")
        (specs_dir / "tasks.md").write_text("")
        
        yield {
            "project_id": "test-project",
            "project_root": str(project_root),
        }


def test_get_file_tree_success(client, test_project, monkeypatch):
    """Test getting file tree for a project."""
    # Mock the project_manager to return our test project
    def mock_load_project(project_id):
        from src.models import Project, ProjectMetadata, Phase
        from datetime import datetime
        
        metadata = ProjectMetadata(
            project_id=test_project["project_id"],
            name="Test Project",
            description="A test project",
            phase=Phase.INIT,
            created_at=datetime(2024, 1, 1),
            updated_at=datetime(2024, 1, 1),
        )
        
        return Project(
            metadata=metadata,
            project_root=test_project["project_root"],
            spec_dir=str(Path(test_project["project_root"]) / ".kiro" / "specs"),
        )
    
    monkeypatch.setattr(project_manager, "load_project", mock_load_project)
    
    # Make the request
    response = client.get(f"/projects/{test_project['project_id']}/files/tree")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    assert "projectId" in data
    assert "projectRoot" in data
    assert "tree" in data
    assert data["projectId"] == test_project["project_id"]
    
    # Check tree structure
    tree = data["tree"]
    assert tree["type"] == "folder"
    assert "children" in tree


def test_get_file_content_success(client, test_project, monkeypatch):
    """Test getting file content for a project."""
    # Mock the project_manager to return our test project
    def mock_load_project(project_id):
        from src.models import Project, ProjectMetadata, Phase
        from datetime import datetime
        
        metadata = ProjectMetadata(
            project_id=test_project["project_id"],
            name="Test Project",
            description="A test project",
            phase=Phase.INIT,
            created_at=datetime(2024, 1, 1),
            updated_at=datetime(2024, 1, 1),
        )
        
        return Project(
            metadata=metadata,
            project_root=test_project["project_root"],
            spec_dir=str(Path(test_project["project_root"]) / ".kiro" / "specs"),
        )
    
    monkeypatch.setattr(project_manager, "load_project", mock_load_project)
    
    # Make the request
    response = client.get(
        f"/projects/{test_project['project_id']}/files/content",
        params={"file_path": "README.md"}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    
    assert "projectId" in data
    assert "filePath" in data
    assert "content" in data
    assert "isBinary" in data
    assert data["projectId"] == test_project["project_id"]
    assert data["content"] == "# Test Project"
    assert data["isBinary"] is False


def test_get_file_content_missing_file_path(client, test_project, monkeypatch):
    """Test getting file content without file_path parameter."""
    # Mock the project_manager to return our test project
    def mock_load_project(project_id):
        from src.models import Project, ProjectMetadata, Phase
        from datetime import datetime
        
        metadata = ProjectMetadata(
            project_id=test_project["project_id"],
            name="Test Project",
            description="A test project",
            phase=Phase.INIT,
            created_at=datetime(2024, 1, 1),
            updated_at=datetime(2024, 1, 1),
        )
        
        return Project(
            metadata=metadata,
            project_root=test_project["project_root"],
            spec_dir=str(Path(test_project["project_root"]) / ".kiro" / "specs"),
        )
    
    monkeypatch.setattr(project_manager, "load_project", mock_load_project)
    
    # Make the request without file_path
    response = client.get(f"/projects/{test_project['project_id']}/files/content")
    
    # Check response - should fail validation
    assert response.status_code == 400


def test_get_file_tree_project_not_found(client):
    """Test getting file tree for non-existent project."""
    response = client.get("/projects/non-existent-project/files/tree")
    
    # Check response
    assert response.status_code == 404
    data = response.json()
    assert data["status"] == "failure"
    assert "PROJECT_NOT_FOUND" in data["output"]["error"]["code"]


def test_get_file_content_project_not_found(client):
    """Test getting file content for non-existent project."""
    response = client.get(
        "/projects/non-existent-project/files/content",
        params={"file_path": "README.md"}
    )
    
    # Check response
    assert response.status_code == 404
    data = response.json()
    assert data["status"] == "failure"
    assert "PROJECT_NOT_FOUND" in data["output"]["error"]["code"]
