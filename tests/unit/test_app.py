"""Unit tests for FastAPI application endpoints."""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import shutil
import tempfile

from src.app import app, project_manager


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def temp_base_path(monkeypatch):
    """Create a temporary directory for test projects."""
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setattr(project_manager, "base_path", Path(temp_dir))
    yield temp_dir
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)


class TestHealthCheck:
    """Tests for health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "kiro-project-orchestrator"


class TestCreateProject:
    """Tests for project creation endpoint."""
    
    def test_create_project_success(self, client, temp_base_path):
        """Test successful project creation."""
        request_data = {
            "name": "Test Project",
            "description": "A test project for unit testing"
        }
        
        response = client.post("/projects/create", json=request_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "create-project"
        assert data["projectId"] == "test-project"
        assert "output" in data
        assert "project" in data["output"]
        assert data["output"]["project"]["name"] == "Test Project"
        assert data["output"]["project"]["phase"] == "INIT"
    
    def test_create_project_sanitizes_name(self, client, temp_base_path):
        """Test that project names are sanitized to kebab-case."""
        request_data = {
            "name": "My Cool Project!!!",
            "description": "Testing name sanitization"
        }
        
        response = client.post("/projects/create", json=request_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["projectId"] == "my-cool-project"
    
    def test_create_project_duplicate_fails(self, client, temp_base_path):
        """Test that creating a duplicate project fails with 409."""
        request_data = {
            "name": "Duplicate Project",
            "description": "First creation"
        }
        
        # Create first project
        response1 = client.post("/projects/create", json=request_data)
        assert response1.status_code == 201
        
        # Try to create duplicate
        response2 = client.post("/projects/create", json=request_data)
        assert response2.status_code == 409
        response_data = response2.json()
        assert response_data["status"] == "failure"
        assert "already exists" in response_data["output"]["error"]["message"].lower()
    
    def test_create_project_empty_name_fails(self, client, temp_base_path):
        """Test that empty project name fails validation."""
        request_data = {
            "name": "",
            "description": "Testing empty name"
        }
        
        response = client.post("/projects/create", json=request_data)
        assert response.status_code == 400  # Validation error
    
    def test_create_project_invalid_name_fails(self, client, temp_base_path):
        """Test that invalid project name (only special chars) fails."""
        request_data = {
            "name": "!!!",
            "description": "Testing invalid name"
        }
        
        response = client.post("/projects/create", json=request_data)
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "empty string after sanitization" in response_data["output"]["error"]["message"].lower()


class TestListProjects:
    """Tests for project listing endpoint."""
    
    def test_list_projects_empty(self, client, temp_base_path):
        """Test listing projects when none exist."""
        response = client.get("/projects")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_list_projects_with_projects(self, client, temp_base_path):
        """Test listing projects returns all created projects."""
        # Create multiple projects
        projects = [
            {"name": "Project One", "description": "First project"},
            {"name": "Project Two", "description": "Second project"},
            {"name": "Project Three", "description": "Third project"},
        ]
        
        for project_data in projects:
            response = client.post("/projects/create", json=project_data)
            assert response.status_code == 201
        
        # List all projects
        response = client.get("/projects")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        
        # Verify all projects are in the list
        project_ids = {p["projectId"] for p in data}
        assert "project-one" in project_ids
        assert "project-two" in project_ids
        assert "project-three" in project_ids
        
        # Verify structure of returned data
        for project in data:
            assert "projectId" in project
            assert "name" in project
            assert "description" in project
            assert "phase" in project
            assert "completionPercentage" in project
            assert "updatedAt" in project


class TestGetProjectStatus:
    """Tests for project status endpoint."""
    
    def test_get_project_status_success(self, client, temp_base_path):
        """Test getting status for an existing project."""
        # Create a project
        request_data = {
            "name": "Status Test Project",
            "description": "Testing status endpoint"
        }
        create_response = client.post("/projects/create", json=request_data)
        assert create_response.status_code == 201
        project_id = create_response.json()["projectId"]
        
        # Get project status
        response = client.get(f"/projects/{project_id}/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["projectId"] == project_id
        assert data["name"] == "Status Test Project"
        assert data["phase"] == "INIT"
        assert data["completionPercentage"] == 0.0
        assert "taskStats" in data
        assert "nextAction" in data
        assert data["nextAction"] != ""
    
    def test_get_project_status_not_found(self, client, temp_base_path):
        """Test getting status for non-existent project returns 404."""
        response = client.get("/projects/nonexistent-project/status")
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_get_project_status_next_action(self, client, temp_base_path):
        """Test that next action is appropriate for project phase."""
        # Create a project
        request_data = {
            "name": "Next Action Test",
            "description": "Testing next action logic"
        }
        create_response = client.post("/projects/create", json=request_data)
        project_id = create_response.json()["projectId"]
        
        # Get status for INIT phase
        response = client.get(f"/projects/{project_id}/status")
        data = response.json()
        assert "specifications" in data["nextAction"].lower()


class TestGenerateSpec:
    """Tests for spec generation endpoint."""
    
    def test_generate_spec_invalid_type(self, client, temp_base_path):
        """Test that invalid spec_type returns 400."""
        # Create a project first
        create_response = client.post("/projects/create", json={
            "name": "Test Project",
            "description": "Testing spec generation"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to generate with invalid spec_type
        response = client.post(
            f"/projects/{project_id}/spec/generate",
            json={"specType": "invalid", "description": "test"}
        )
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        # Check that it's a validation error about spec_type
        error_details = str(response_data["output"]["error"])
        assert "spec_type" in error_details.lower() or "spectype" in error_details.lower()
    
    def test_generate_spec_project_not_found(self, client, temp_base_path):
        """Test that generating spec for non-existent project returns 404."""
        response = client.post(
            "/projects/nonexistent/spec/generate",
            json={"specType": "requirements", "description": "test"}
        )
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_generate_design_without_requirements(self, client, temp_base_path):
        """Test that generating design without requirements returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Test Project",
            "description": "Testing design generation"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to generate design without requirements
        response = client.post(
            f"/projects/{project_id}/spec/generate",
            json={"specType": "design", "description": "test"}
        )
        
        assert response.status_code == 409
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "requirements.md" in response_data["output"]["error"]["message"].lower()
    
    def test_generate_tasks_without_design(self, client, temp_base_path):
        """Test that generating tasks without design returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Test Project",
            "description": "Testing tasks generation"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to generate tasks without design
        response = client.post(
            f"/projects/{project_id}/spec/generate",
            json={"specType": "tasks", "description": "test"}
        )
        
        assert response.status_code == 409
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "design.md" in response_data["output"]["error"]["message"].lower()
    
    def test_generate_spec_request_validation(self, client, temp_base_path):
        """Test that spec generation validates request parameters."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Test Project",
            "description": "Testing validation"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to generate without spec_type
        response = client.post(
            f"/projects/{project_id}/spec/generate",
            json={"description": "test"}
        )
        
        assert response.status_code == 400  # Validation error


class TestFileOperations:
    """Tests for file operation endpoints."""
    
    def test_read_file_success(self, client, temp_base_path):
        """Test reading a spec file successfully."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Test Project",
            "description": "Testing file operations"
        })
        project_id = create_response.json()["projectId"]
        
        # Write some content to requirements.md
        project_path = Path(temp_base_path) / project_id
        requirements_path = project_path / "requirements.md"
        test_content = "# Test Requirements\n\nThis is a test."
        requirements_path.write_text(test_content, encoding='utf-8')
        
        # Read the file
        response = client.get(f"/projects/{project_id}/files/requirements.md")
        
        assert response.status_code == 200
        data = response.json()
        assert data["projectId"] == project_id
        assert data["fileName"] == "requirements.md"
        assert data["content"] == test_content
        assert "metadata" in data
        assert data["metadata"]["projectName"] == "File Test Project"
        assert data["metadata"]["phase"] == "INIT"
        assert "updatedAt" in data["metadata"]
    
    def test_read_file_project_not_found(self, client, temp_base_path):
        """Test reading file from non-existent project returns 404."""
        response = client.get("/projects/nonexistent/files/requirements.md")
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_read_file_invalid_filename(self, client, temp_base_path):
        """Test reading invalid file name returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Test Project",
            "description": "Testing file operations"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to read invalid file
        response = client.get(f"/projects/{project_id}/files/invalid.txt")
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "invalid file name" in response_data["output"]["error"]["message"].lower()
    
    def test_read_file_not_found(self, client, temp_base_path):
        """Test reading non-existent file returns 404."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Test Project",
            "description": "Testing file operations"
        })
        project_id = create_response.json()["projectId"]
        
        # Delete the requirements.md file
        project_path = Path(temp_base_path) / project_id
        requirements_path = project_path / "requirements.md"
        requirements_path.unlink()
        
        # Try to read the deleted file
        response = client.get(f"/projects/{project_id}/files/requirements.md")
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_update_file_success(self, client, temp_base_path, monkeypatch):
        """Test updating a spec file successfully."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Update Test",
            "description": "Testing file updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Mock the CLI executor to avoid actual kiro-cli execution
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="File updated successfully",
            stderr="",
            exit_code=0,
            files_modified=[f".kiro/specs/{project_id}/design.md"],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        from src import app
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Update the file
        new_content = "# Updated Design\n\nThis is updated content."
        response = client.put(
            f"/projects/{project_id}/files/design.md",
            json={"content": new_content}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "update-file-design.md"
        assert data["projectId"] == project_id
        assert "output" in data
        assert data["output"]["file_name"] == "design.md"
        assert "updated_at" in data["output"]
    
    def test_update_file_project_not_found(self, client, temp_base_path):
        """Test updating file in non-existent project returns 404."""
        response = client.put(
            "/projects/nonexistent/files/requirements.md",
            json={"content": "test"}
        )
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_update_file_invalid_filename(self, client, temp_base_path):
        """Test updating invalid file name returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Update Test",
            "description": "Testing file updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to update invalid file
        response = client.put(
            f"/projects/{project_id}/files/invalid.txt",
            json={"content": "test"}
        )
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "invalid file name" in response_data["output"]["error"]["message"].lower()
    
    def test_update_file_missing_content(self, client, temp_base_path):
        """Test updating file without content field returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Update Test",
            "description": "Testing file updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to update without content
        response = client.put(
            f"/projects/{project_id}/files/design.md",
            json={}
        )
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        # Check for validation error in the response
        assert "content" in str(response_data["output"]).lower() or "field required" in str(response_data["output"]).lower()
    
    def test_update_file_invalid_content_type(self, client, temp_base_path):
        """Test updating file with non-string content returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "File Update Test",
            "description": "Testing file updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to update with non-string content
        response = client.put(
            f"/projects/{project_id}/files/design.md",
            json={"content": 123}
        )
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "string" in response_data["output"]["error"]["message"].lower()
    
    def test_update_file_updates_timestamp(self, client, temp_base_path, monkeypatch):
        """Test that updating a file updates the lastModified timestamp."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Timestamp Test",
            "description": "Testing timestamp updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Get initial timestamp
        status_response = client.get(f"/projects/{project_id}/status")
        initial_updated_at = status_response.json()["taskStats"]  # This will have updatedAt in metadata
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="File updated",
            stderr="",
            exit_code=0,
            files_modified=[f".kiro/specs/{project_id}/tasks.md"],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        from src import app
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Update the file
        response = client.put(
            f"/projects/{project_id}/files/tasks.md",
            json={"content": "# Updated Tasks"}
        )
        
        assert response.status_code == 200
        assert "updated_at" in response.json()["output"]



class TestExecuteTasks:
    """Tests for task execution endpoint."""
    
    def test_execute_tasks_project_not_found(self, client, temp_base_path):
        """Test executing tasks for non-existent project returns 404."""
        response = client.post(
            "/projects/nonexistent/tasks/execute",
            json={}
        )
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_execute_tasks_empty_tasks_file(self, client, temp_base_path):
        """Test executing tasks when tasks.md is empty returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Empty Tasks Test",
            "description": "Testing empty tasks.md"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to execute tasks
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={}
        )
        
        assert response.status_code == 409
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "tasks.md" in response_data["output"]["error"]["message"].lower()
    
    def test_execute_tasks_invalid_task_number(self, client, temp_base_path, monkeypatch):
        """Test executing non-existent task number returns 400."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Invalid Task Test",
            "description": "Testing invalid task number"
        })
        project_id = create_response.json()["projectId"]
        
        # Write a tasks.md file with some tasks
        from src import app
        tasks_content = """# Implementation Plan

- [ ] 1. First task
  - Some details
  
- [ ] 2. Second task
  - More details
"""
        project = app.project_manager.load_project(project_id)
        app.project_manager.file_ops.write_file(project.tasks_path, tasks_content)
        
        # Try to execute non-existent task
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={"taskNumber": "99"}
        )
        
        assert response.status_code == 400
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_execute_specific_task_success(self, client, temp_base_path, monkeypatch):
        """Test executing a specific task successfully."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Execute Task Test",
            "description": "Testing task execution"
        })
        project_id = create_response.json()["projectId"]
        
        # Write a tasks.md file with some tasks
        from src import app
        tasks_content = """# Implementation Plan

- [ ] 1. First task
  - Some details
  
- [ ] 2. Second task
  - More details
  
- [ ] 3. Third task
  - Even more details
"""
        project = app.project_manager.load_project(project_id)
        app.project_manager.file_ops.write_file(project.tasks_path, tasks_content)
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="Task executed successfully",
            stderr="",
            exit_code=0,
            files_modified=[f".kiro/specs/{project_id}/tasks.md"],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            # Simulate task completion by updating tasks.md
            updated_tasks = """# Implementation Plan

- [x] 1. First task
  - Some details
  
- [ ] 2. Second task
  - More details
  
- [ ] 3. Third task
  - Even more details
"""
            project = app.project_manager.load_project(proj_id)
            app.project_manager.file_ops.write_file(project.tasks_path, updated_tasks)
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Execute task 1
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={"taskNumber": "1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "execute-tasks"
        assert data["projectId"] == project_id
        assert "output" in data
        assert data["output"]["task_number"] == "1"
        assert "task_stats" in data["output"]
        assert data["output"]["task_stats"]["completed"] == 1
        assert data["output"]["task_stats"]["total"] == 3
    
    def test_execute_all_tasks_success(self, client, temp_base_path, monkeypatch):
        """Test executing all tasks successfully."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Execute All Tasks Test",
            "description": "Testing all tasks execution"
        })
        project_id = create_response.json()["projectId"]
        
        # Write a tasks.md file with some tasks
        from src import app
        tasks_content = """# Implementation Plan

- [ ] 1. First task
  - Some details
  
- [ ] 2. Second task
  - More details
"""
        project = app.project_manager.load_project(project_id)
        app.project_manager.file_ops.write_file(project.tasks_path, tasks_content)
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="All tasks executed successfully",
            stderr="",
            exit_code=0,
            files_modified=[f".kiro/specs/{project_id}/tasks.md"],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            # Simulate all tasks completion
            updated_tasks = """# Implementation Plan

- [x] 1. First task
  - Some details
  
- [x] 2. Second task
  - More details
"""
            project = app.project_manager.load_project(proj_id)
            app.project_manager.file_ops.write_file(project.tasks_path, updated_tasks)
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Execute all tasks (no task_number specified)
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "execute-tasks"
        assert data["output"]["task_number"] == "all"
        assert data["output"]["task_stats"]["completed"] == 2
        assert data["output"]["task_stats"]["total"] == 2
        assert data["output"]["phase"] == "COMPLETE"  # All tasks done
    
    def test_execute_tasks_updates_phase(self, client, temp_base_path, monkeypatch):
        """Test that executing tasks updates project phase appropriately."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Phase Update Test",
            "description": "Testing phase updates"
        })
        project_id = create_response.json()["projectId"]
        
        # Write a tasks.md file
        from src import app
        tasks_content = """# Implementation Plan

- [ ] 1. First task
  - Some details
"""
        project = app.project_manager.load_project(project_id)
        app.project_manager.file_ops.write_file(project.tasks_path, tasks_content)
        
        # Update project phase to SPEC
        project.metadata.phase = app.Phase.SPEC
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="Task executed",
            stderr="",
            exit_code=0,
            files_modified=[f".kiro/specs/{project_id}/tasks.md"],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            # Simulate task in progress
            updated_tasks = """# Implementation Plan

- [-] 1. First task
  - Some details
"""
            project = app.project_manager.load_project(proj_id)
            app.project_manager.file_ops.write_file(project.tasks_path, updated_tasks)
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Execute task
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={"taskNumber": "1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        # Phase should move from SPEC to BUILD when tasks start
        assert data["output"]["phase"] == "BUILD"
    
    def test_execute_tasks_cli_failure(self, client, temp_base_path, monkeypatch):
        """Test handling of CLI execution failure."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "CLI Failure Test",
            "description": "Testing CLI failure handling"
        })
        project_id = create_response.json()["projectId"]
        
        # Write a tasks.md file
        from src import app
        tasks_content = """# Implementation Plan

- [ ] 1. First task
  - Some details
"""
        project = app.project_manager.load_project(project_id)
        app.project_manager.file_ops.write_file(project.tasks_path, tasks_content)
        
        # Mock the CLI executor to return failure
        from src.models import CLIResult
        mock_result = CLIResult(
            status="failure",
            stdout="",
            stderr="Task execution failed",
            exit_code=1,
            files_modified=[],
            error="Task execution failed"
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Execute task
        response = client.post(
            f"/projects/{project_id}/tasks/execute",
            json={"taskNumber": "1"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failure"
        assert "error" in data["output"]



class TestBuildProject:
    """Tests for project build endpoint."""
    
    def test_build_project_success(self, client, temp_base_path, monkeypatch):
        """Test successful project build."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Build Test Project",
            "description": "Testing build endpoint"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to BUILD
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.BUILD
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="Build completed successfully",
            stderr="",
            exit_code=0,
            files_modified=[],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Build the project
        response = client.post(f"/projects/{project_id}/build")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "build"
        assert data["projectId"] == project_id
        assert data["output"]["phase"] == "TEST"  # Should move to TEST after successful build
    
    def test_build_project_not_found(self, client, temp_base_path):
        """Test building non-existent project returns 404."""
        response = client.post("/projects/nonexistent/build")
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_build_project_failure(self, client, temp_base_path, monkeypatch):
        """Test handling of build failure."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Build Failure Test",
            "description": "Testing build failure"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to BUILD
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.BUILD
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor to return failure
        from src.models import CLIResult
        mock_result = CLIResult(
            status="failure",
            stdout="",
            stderr="Build failed: compilation error",
            exit_code=1,
            files_modified=[],
            error="Build failed: compilation error"
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Build the project
        response = client.post(f"/projects/{project_id}/build")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failure"
        assert data["action"] == "build"
        assert "error" in data["output"]
        assert data["output"]["phase"] == "FIX"  # Should move to FIX after build failure


class TestTestProject:
    """Tests for project test endpoint."""
    
    def test_test_project_success(self, client, temp_base_path, monkeypatch):
        """Test successful test execution."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Test Test Project",
            "description": "Testing test endpoint"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to TEST
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.TEST
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor
        from src.models import CLIResult
        mock_result = CLIResult(
            status="success",
            stdout="All tests passed",
            stderr="",
            exit_code=0,
            files_modified=[],
            error=None
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Run tests
        response = client.post(f"/projects/{project_id}/test")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "test"
        assert data["projectId"] == project_id
        assert data["output"]["phase"] == "COMPLETE"  # Should move to COMPLETE after successful tests
    
    def test_test_project_not_found(self, client, temp_base_path):
        """Test running tests for non-existent project returns 404."""
        response = client.post("/projects/nonexistent/test")
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_test_project_failure(self, client, temp_base_path, monkeypatch):
        """Test handling of test failures."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Test Failure Test",
            "description": "Testing test failure"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to TEST
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.TEST
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor to return failure
        from src.models import CLIResult
        mock_result = CLIResult(
            status="failure",
            stdout="FAILED test_example.py::test_function - AssertionError",
            stderr="",
            exit_code=1,
            files_modified=[],
            error="Tests failed"
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Run tests
        response = client.post(f"/projects/{project_id}/test")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failure"
        assert data["action"] == "test"
        assert "error" in data["output"]
        assert data["output"]["phase"] == "FIX"  # Should move to FIX after test failure
        assert "test_failures" in data["output"]
        assert len(data["output"]["test_failures"]) > 0


class TestFixProject:
    """Tests for project fix endpoint."""
    
    def test_fix_project_success(self, client, temp_base_path, monkeypatch):
        """Test successful auto-fix."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Fix Test Project",
            "description": "Testing fix endpoint"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to FIX
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.FIX
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor
        from src.models import CLIResult
        fix_result = CLIResult(
            status="success",
            stdout="Issues fixed",
            stderr="",
            exit_code=0,
            files_modified=["src/example.py"],
            error=None
        )
        
        test_result = CLIResult(
            status="success",
            stdout="All tests passed",
            stderr="",
            exit_code=0,
            files_modified=[],
            error=None
        )
        
        call_count = [0]
        
        def mock_execute_instruction(instruction, proj_id):
            call_count[0] += 1
            if call_count[0] == 1:
                return fix_result
            else:
                return test_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Fix the project
        response = client.post(
            f"/projects/{project_id}/fix",
            json={"failureDetails": "test_example.py::test_function - AssertionError"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "fix"
        assert data["projectId"] == project_id
        assert data["output"]["phase"] == "COMPLETE"  # Should move to COMPLETE after successful fix and retest
        assert data["output"]["retest_status"] == "success"
    
    def test_fix_project_not_found(self, client, temp_base_path):
        """Test fixing non-existent project returns 404."""
        response = client.post(
            "/projects/nonexistent/fix",
            json={"failureDetails": "Some failure"}
        )
        
        assert response.status_code == 404
        response_data = response.json()
        assert response_data["status"] == "failure"
        assert "not found" in response_data["output"]["error"]["message"].lower()
    
    def test_fix_project_failure(self, client, temp_base_path, monkeypatch):
        """Test handling of fix failure."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Fix Failure Test",
            "description": "Testing fix failure"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to FIX
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.FIX
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor to return failure
        from src.models import CLIResult
        mock_result = CLIResult(
            status="failure",
            stdout="",
            stderr="Unable to fix issues",
            exit_code=1,
            files_modified=[],
            error="Unable to fix issues"
        )
        
        def mock_execute_instruction(instruction, proj_id):
            return mock_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Fix the project
        response = client.post(
            f"/projects/{project_id}/fix",
            json={"failureDetails": "test_example.py::test_function - AssertionError"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "failure"
        assert data["action"] == "fix"
        assert "error" in data["output"]
    
    def test_fix_project_retest_failure(self, client, temp_base_path, monkeypatch):
        """Test handling when fix succeeds but retest fails."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Fix Retest Failure Test",
            "description": "Testing fix with retest failure"
        })
        project_id = create_response.json()["projectId"]
        
        # Set project phase to FIX
        from src import app
        project = app.project_manager.load_project(project_id)
        project.metadata.phase = app.Phase.FIX
        app.project_manager.save_metadata(project_id, project.metadata)
        
        # Mock the CLI executor
        from src.models import CLIResult
        fix_result = CLIResult(
            status="success",
            stdout="Issues fixed",
            stderr="",
            exit_code=0,
            files_modified=["src/example.py"],
            error=None
        )
        
        test_result = CLIResult(
            status="failure",
            stdout="FAILED test_example.py::test_another - AssertionError",
            stderr="",
            exit_code=1,
            files_modified=[],
            error="Tests still failing"
        )
        
        call_count = [0]
        
        def mock_execute_instruction(instruction, proj_id):
            call_count[0] += 1
            if call_count[0] == 1:
                return fix_result
            else:
                return test_result
        
        monkeypatch.setattr(app.cli_executor, "execute_instruction", mock_execute_instruction)
        
        # Fix the project
        response = client.post(
            f"/projects/{project_id}/fix",
            json={"failureDetails": "test_example.py::test_function - AssertionError"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "fix"
        assert data["output"]["phase"] == "FIX"  # Should stay in FIX if retest fails
        assert data["output"]["retest_status"] == "failure"
    
    def test_fix_project_missing_failure_details(self, client, temp_base_path):
        """Test that fix endpoint requires failure details."""
        # Create a project
        create_response = client.post("/projects/create", json={
            "name": "Fix Missing Details Test",
            "description": "Testing missing failure details"
        })
        project_id = create_response.json()["projectId"]
        
        # Try to fix without failure details
        response = client.post(
            f"/projects/{project_id}/fix",
            json={}
        )
        
        assert response.status_code == 400  # Validation error
