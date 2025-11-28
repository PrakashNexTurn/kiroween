"""Unit tests for file operations module."""

import json
import os
import tempfile
from pathlib import Path
import pytest

from src.file_ops import (
    FileOperations,
    FileOperationError,
    FileNotFoundError,
    FileWriteError,
    FileReadError,
    DirectoryCreationError,
    JSONParseError,
)


class TestFileOperations:
    """Test suite for FileOperations class."""

    def test_read_file_success(self, tmp_path):
        """Test reading a file successfully."""
        test_file = tmp_path / "test.txt"
        test_content = "Hello, World!"
        test_file.write_text(test_content, encoding='utf-8')
        
        result = FileOperations.read_file(str(test_file))
        assert result == test_content

    def test_read_file_not_found(self):
        """Test reading a non-existent file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError) as exc_info:
            FileOperations.read_file("/nonexistent/file.txt")
        assert "File not found" in str(exc_info.value)

    def test_read_file_is_directory(self, tmp_path):
        """Test reading a directory raises FileReadError."""
        with pytest.raises(FileReadError) as exc_info:
            FileOperations.read_file(str(tmp_path))
        assert "not a file" in str(exc_info.value)

    def test_write_file_success(self, tmp_path):
        """Test writing a file successfully."""
        test_file = tmp_path / "test.txt"
        test_content = "Hello, World!"
        
        FileOperations.write_file(str(test_file), test_content)
        
        assert test_file.exists()
        assert test_file.read_text(encoding='utf-8') == test_content

    def test_write_file_creates_parent_directories(self, tmp_path):
        """Test that write_file creates parent directories."""
        test_file = tmp_path / "subdir1" / "subdir2" / "test.txt"
        test_content = "Hello, World!"
        
        FileOperations.write_file(str(test_file), test_content)
        
        assert test_file.exists()
        assert test_file.read_text(encoding='utf-8') == test_content

    def test_write_file_overwrites_existing(self, tmp_path):
        """Test that write_file overwrites existing files."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("Old content", encoding='utf-8')
        
        new_content = "New content"
        FileOperations.write_file(str(test_file), new_content)
        
        assert test_file.read_text(encoding='utf-8') == new_content

    def test_create_directory_success(self, tmp_path):
        """Test creating a directory successfully."""
        test_dir = tmp_path / "testdir"
        
        FileOperations.create_directory(str(test_dir))
        
        assert test_dir.exists()
        assert test_dir.is_dir()

    def test_create_directory_nested(self, tmp_path):
        """Test creating nested directories."""
        test_dir = tmp_path / "dir1" / "dir2" / "dir3"
        
        FileOperations.create_directory(str(test_dir))
        
        assert test_dir.exists()
        assert test_dir.is_dir()

    def test_create_directory_already_exists(self, tmp_path):
        """Test creating a directory that already exists doesn't raise error."""
        test_dir = tmp_path / "testdir"
        test_dir.mkdir()
        
        # Should not raise an error
        FileOperations.create_directory(str(test_dir))
        
        assert test_dir.exists()

    def test_file_exists_true(self, tmp_path):
        """Test file_exists returns True for existing file."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content", encoding='utf-8')
        
        assert FileOperations.file_exists(str(test_file)) is True

    def test_file_exists_false(self, tmp_path):
        """Test file_exists returns False for non-existent file."""
        test_file = tmp_path / "nonexistent.txt"
        
        assert FileOperations.file_exists(str(test_file)) is False

    def test_file_exists_directory(self, tmp_path):
        """Test file_exists returns False for directories."""
        assert FileOperations.file_exists(str(tmp_path)) is False

    def test_directory_exists_true(self, tmp_path):
        """Test directory_exists returns True for existing directory."""
        assert FileOperations.directory_exists(str(tmp_path)) is True

    def test_directory_exists_false(self, tmp_path):
        """Test directory_exists returns False for non-existent directory."""
        test_dir = tmp_path / "nonexistent"
        
        assert FileOperations.directory_exists(str(test_dir)) is False

    def test_directory_exists_file(self, tmp_path):
        """Test directory_exists returns False for files."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content", encoding='utf-8')
        
        assert FileOperations.directory_exists(str(test_file)) is False

    def test_list_directory_success(self, tmp_path):
        """Test listing directory contents."""
        # Create some files and directories
        (tmp_path / "file1.txt").write_text("content", encoding='utf-8')
        (tmp_path / "file2.txt").write_text("content", encoding='utf-8')
        (tmp_path / "subdir").mkdir()
        
        result = FileOperations.list_directory(str(tmp_path))
        
        assert len(result) == 3
        assert "file1.txt" in result
        assert "file2.txt" in result
        assert "subdir" in result

    def test_list_directory_empty(self, tmp_path):
        """Test listing an empty directory."""
        result = FileOperations.list_directory(str(tmp_path))
        
        assert result == []

    def test_list_directory_not_found(self):
        """Test listing a non-existent directory raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError) as exc_info:
            FileOperations.list_directory("/nonexistent/directory")
        assert "Directory not found" in str(exc_info.value)

    def test_list_directory_is_file(self, tmp_path):
        """Test listing a file raises FileReadError."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content", encoding='utf-8')
        
        with pytest.raises(FileReadError) as exc_info:
            FileOperations.list_directory(str(test_file))
        assert "not a directory" in str(exc_info.value)

    def test_read_json_success(self, tmp_path):
        """Test reading a JSON file successfully."""
        test_file = tmp_path / "test.json"
        test_data = {"key": "value", "number": 42, "nested": {"inner": "data"}}
        test_file.write_text(json.dumps(test_data), encoding='utf-8')
        
        result = FileOperations.read_json(str(test_file))
        
        assert result == test_data

    def test_read_json_invalid(self, tmp_path):
        """Test reading invalid JSON raises JSONParseError."""
        test_file = tmp_path / "invalid.json"
        test_file.write_text("{ invalid json }", encoding='utf-8')
        
        with pytest.raises(JSONParseError) as exc_info:
            FileOperations.read_json(str(test_file))
        assert "Invalid JSON" in str(exc_info.value)

    def test_read_json_not_found(self):
        """Test reading non-existent JSON file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            FileOperations.read_json("/nonexistent/file.json")

    def test_write_json_success(self, tmp_path):
        """Test writing a JSON file successfully."""
        test_file = tmp_path / "test.json"
        test_data = {"key": "value", "number": 42, "nested": {"inner": "data"}}
        
        FileOperations.write_json(str(test_file), test_data)
        
        assert test_file.exists()
        loaded_data = json.loads(test_file.read_text(encoding='utf-8'))
        assert loaded_data == test_data

    def test_write_json_with_indent(self, tmp_path):
        """Test writing JSON with custom indentation."""
        test_file = tmp_path / "test.json"
        test_data = {"key": "value"}
        
        FileOperations.write_json(str(test_file), test_data, indent=4)
        
        content = test_file.read_text(encoding='utf-8')
        assert "    " in content  # 4-space indent

    def test_write_json_creates_parent_directories(self, tmp_path):
        """Test that write_json creates parent directories."""
        test_file = tmp_path / "subdir" / "test.json"
        test_data = {"key": "value"}
        
        FileOperations.write_json(str(test_file), test_data)
        
        assert test_file.exists()

    def test_write_json_non_serializable(self, tmp_path):
        """Test writing non-serializable data raises JSONParseError."""
        test_file = tmp_path / "test.json"
        
        class NonSerializable:
            pass
        
        with pytest.raises(JSONParseError) as exc_info:
            FileOperations.write_json(str(test_file), {"obj": NonSerializable()})
        assert "Cannot serialize" in str(exc_info.value)

    def test_get_file_size_success(self, tmp_path):
        """Test getting file size."""
        test_file = tmp_path / "test.txt"
        test_content = "Hello, World!"
        test_file.write_text(test_content, encoding='utf-8')
        
        size = FileOperations.get_file_size(str(test_file))
        
        assert size == len(test_content.encode('utf-8'))

    def test_get_file_size_not_found(self):
        """Test getting size of non-existent file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            FileOperations.get_file_size("/nonexistent/file.txt")

    def test_delete_file_success(self, tmp_path):
        """Test deleting a file successfully."""
        test_file = tmp_path / "test.txt"
        test_file.write_text("content", encoding='utf-8')
        
        FileOperations.delete_file(str(test_file))
        
        assert not test_file.exists()

    def test_delete_file_not_found(self):
        """Test deleting non-existent file raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError):
            FileOperations.delete_file("/nonexistent/file.txt")

    def test_delete_file_is_directory(self, tmp_path):
        """Test deleting a directory raises FileWriteError."""
        with pytest.raises(FileWriteError) as exc_info:
            FileOperations.delete_file(str(tmp_path))
        assert "not a file" in str(exc_info.value)

    def test_read_write_round_trip(self, tmp_path):
        """Test that writing then reading returns the same content."""
        test_file = tmp_path / "test.txt"
        test_content = "Test content with unicode: 你好世界 🌍"
        
        FileOperations.write_file(str(test_file), test_content)
        result = FileOperations.read_file(str(test_file))
        
        assert result == test_content

    def test_json_round_trip(self, tmp_path):
        """Test that writing then reading JSON returns the same data."""
        test_file = tmp_path / "test.json"
        test_data = {
            "string": "value",
            "number": 42,
            "float": 3.14,
            "boolean": True,
            "null": None,
            "array": [1, 2, 3],
            "nested": {"key": "value"}
        }
        
        FileOperations.write_json(str(test_file), test_data)
        result = FileOperations.read_json(str(test_file))
        
        assert result == test_data
