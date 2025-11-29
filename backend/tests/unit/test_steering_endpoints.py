"""Tests for steering file API endpoints."""

import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import tempfile
import shutil

from src.app import app
from src.project_manager import ProjectManager
from src.config import settings


@pytest.fixture
def temp_base_path():
    """Create a temporary directory for test projects."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def test_client(temp_base_path, monkeypatch):
    """Create a test client with a temporary base path."""
    monkeypatch.setattr(settings, "base_path", Path(temp_base_path))
    
    # Reinitialize project manager with new base path
    from src import app as app_module
    app_module.project_manager = ProjectManager(base_path=temp_base_path)
    
    client = TestClient(app)
    return client


@pytest.fixture
def test_project(test_client):
    """Create a test project."""
    response = test_client.post(
        "/projects/create",
        json={
            "name": "Test Steering Project",
            "description": "A test project for steering endpoints"
        }
    )
    assert response.status_code == 201
    data = response.json()
    return data["projectId"]


class TestSteeringGeneration:
    """Tests for steering file generation endpoint."""
    
    def test_generate_steering_success(self, test_client, test_project):
        """Test successful steering file generation."""
        response = test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "generate-steering"
        assert data["projectId"] == test_project
        assert "files_generated" in data["output"]
        assert len(data["output"]["files_generated"]) == 3
        assert "product.md" in data["output"]["files_generated"]
        assert "tech.md" in data["output"]["files_generated"]
        assert "structure.md" in data["output"]["files_generated"]
    
    def test_generate_steering_already_exists(self, test_client, test_project):
        """Test generating steering files when they already exist."""
        # Generate first time
        response1 = test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        assert response1.status_code == 200
        
        # Try to generate again without force
        response2 = test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        assert response2.status_code == 200
        data = response2.json()
        assert data["status"] == "success"
        assert len(data["output"]["files_generated"]) == 0
        assert "files_skipped" in data["output"]
    
    def test_generate_steering_with_force(self, test_client, test_project):
        """Test generating steering files with force flag."""
        # Generate first time
        response1 = test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        assert response1.status_code == 200
        
        # Generate again with force
        response2 = test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": True}
        )
        assert response2.status_code == 200
        data = response2.json()
        assert data["status"] == "success"
        assert len(data["output"]["files_generated"]) == 3
    
    def test_generate_steering_project_not_found(self, test_client):
        """Test generating steering files for non-existent project."""
        response = test_client.post(
            "/projects/nonexistent/steering/generate",
            json={"force": False}
        )
        assert response.status_code == 404


class TestListSteeringFiles:
    """Tests for listing steering files endpoint."""
    
    def test_list_steering_files_empty(self, test_client, test_project):
        """Test listing steering files when none exist."""
        response = test_client.get(f"/projects/{test_project}/steering/files")
        
        assert response.status_code == 200
        data = response.json()
        assert data["projectId"] == test_project
        assert data["files"] == []
        assert "message" in data
    
    def test_list_steering_files_success(self, test_client, test_project):
        """Test listing steering files after generation."""
        # Generate steering files first
        test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        
        # List files
        response = test_client.get(f"/projects/{test_project}/steering/files")
        
        assert response.status_code == 200
        data = response.json()
        assert data["projectId"] == test_project
        assert len(data["files"]) == 3
        assert data["count"] == 3
        
        # Check file info structure
        for file_info in data["files"]:
            assert "fileName" in file_info
            assert "filePath" in file_info
            assert "exists" in file_info
            assert "size" in file_info
    
    def test_list_steering_files_project_not_found(self, test_client):
        """Test listing steering files for non-existent project."""
        response = test_client.get("/projects/nonexistent/steering/files")
        assert response.status_code == 404


class TestReadSteeringFile:
    """Tests for reading steering file endpoint."""
    
    def test_read_steering_file_success(self, test_client, test_project):
        """Test reading a steering file."""
        # Generate steering files first
        test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        
        # Read product.md
        response = test_client.get(
            f"/projects/{test_project}/steering/files/product.md"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["projectId"] == test_project
        assert data["fileName"] == "product.md"
        assert "content" in data
        assert len(data["content"]) > 0
        assert "metadata" in data
        assert data["metadata"]["projectName"] == "Test Steering Project"
    
    def test_read_steering_file_not_found(self, test_client, test_project):
        """Test reading a non-existent steering file."""
        response = test_client.get(
            f"/projects/{test_project}/steering/files/nonexistent.md"
        )
        assert response.status_code == 404
    
    def test_read_steering_file_invalid_extension(self, test_client, test_project):
        """Test reading a file with invalid extension."""
        response = test_client.get(
            f"/projects/{test_project}/steering/files/test.txt"
        )
        assert response.status_code == 400
    
    def test_read_steering_file_project_not_found(self, test_client):
        """Test reading steering file for non-existent project."""
        response = test_client.get(
            "/projects/nonexistent/steering/files/product.md"
        )
        assert response.status_code == 404


class TestUpdateSteeringFile:
    """Tests for updating steering file endpoint."""
    
    def test_update_steering_file_success(self, test_client, test_project):
        """Test updating a steering file."""
        # Generate steering files first
        test_client.post(
            f"/projects/{test_project}/steering/generate",
            json={"force": False}
        )
        
        # Update product.md
        new_content = "# Updated Product Overview\n\nThis is updated content."
        response = test_client.put(
            f"/projects/{test_project}/steering/files/product.md",
            json={"content": new_content}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["action"] == "update-steering-file"
        assert data["projectId"] == test_project
        assert data["output"]["fileName"] == "product.md"
        
        # Verify the content was updated
        read_response = test_client.get(
            f"/projects/{test_project}/steering/files/product.md"
        )
        assert read_response.status_code == 200
        read_data = read_response.json()
        assert read_data["content"] == new_content
    
    def test_update_steering_file_not_found(self, test_client, test_project):
        """Test updating a non-existent steering file."""
        response = test_client.put(
            f"/projects/{test_project}/steering/files/nonexistent.md",
            json={"content": "test"}
        )
        assert response.status_code == 404
    
    def test_update_steering_file_invalid_extension(self, test_client, test_project):
        """Test updating a file with invalid extension."""
        response = test_client.put(
            f"/projects/{test_project}/steering/files/test.txt",
            json={"content": "test"}
        )
        assert response.status_code == 400
    
    def test_update_steering_file_project_not_found(self, test_client):
        """Test updating steering file for non-existent project."""
        response = test_client.put(
            "/projects/nonexistent/steering/files/product.md",
            json={"content": "test"}
        )
        assert response.status_code == 404
