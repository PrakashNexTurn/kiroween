"""File operations module for the Kiro Project Orchestrator."""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


class FileOperationError(Exception):
    """Base exception for file operation errors."""
    pass


class FileNotFoundError(FileOperationError):
    """Exception raised when a file is not found."""
    pass


class FileWriteError(FileOperationError):
    """Exception raised when a file write operation fails."""
    pass


class FileReadError(FileOperationError):
    """Exception raised when a file read operation fails."""
    pass


class DirectoryCreationError(FileOperationError):
    """Exception raised when directory creation fails."""
    pass


class JSONParseError(FileOperationError):
    """Exception raised when JSON parsing fails."""
    pass


class FileOperations:
    """Handles all file system operations for the orchestrator."""

    @staticmethod
    def read_file(path: str) -> str:
        """
        Read the contents of a file.

        Args:
            path: Path to the file to read

        Returns:
            File contents as a string

        Raises:
            FileNotFoundError: If the file does not exist
            FileReadError: If the file cannot be read
        """
        file_path = Path(path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        if not file_path.is_file():
            raise FileReadError(f"Path is not a file: {path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except PermissionError as e:
            raise FileReadError(f"Permission denied reading file: {path}") from e
        except OSError as e:
            raise FileReadError(f"Error reading file {path}: {str(e)}") from e

    @staticmethod
    def write_file(path: str, content: str) -> None:
        """
        Write content to a file. Creates parent directories if needed.

        Args:
            path: Path to the file to write
            content: Content to write to the file

        Raises:
            FileWriteError: If the file cannot be written
        """
        file_path = Path(path)
        
        try:
            # Create parent directories if they don't exist
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Write to a temporary file first for atomic operation
            temp_path = file_path.with_suffix(file_path.suffix + '.tmp')
            with open(temp_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # Rename temp file to target file (atomic on most systems)
            temp_path.replace(file_path)
            
        except PermissionError as e:
            raise FileWriteError(f"Permission denied writing file: {path}") from e
        except OSError as e:
            raise FileWriteError(f"Error writing file {path}: {str(e)}") from e
        finally:
            # Clean up temp file if it still exists
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except OSError:
                    pass  # Best effort cleanup

    @staticmethod
    def create_directory(path: str) -> None:
        """
        Create a directory and all parent directories.

        Args:
            path: Path to the directory to create

        Raises:
            DirectoryCreationError: If the directory cannot be created
        """
        dir_path = Path(path)
        
        try:
            dir_path.mkdir(parents=True, exist_ok=True)
        except PermissionError as e:
            raise DirectoryCreationError(
                f"Permission denied creating directory: {path}"
            ) from e
        except OSError as e:
            raise DirectoryCreationError(
                f"Error creating directory {path}: {str(e)}"
            ) from e

    @staticmethod
    def file_exists(path: str) -> bool:
        """
        Check if a file exists.

        Args:
            path: Path to check

        Returns:
            True if the file exists, False otherwise
        """
        return Path(path).is_file()

    @staticmethod
    def directory_exists(path: str) -> bool:
        """
        Check if a directory exists.

        Args:
            path: Path to check

        Returns:
            True if the directory exists, False otherwise
        """
        return Path(path).is_dir()

    @staticmethod
    def list_directory(path: str) -> List[str]:
        """
        List all files and directories in a directory.

        Args:
            path: Path to the directory to list

        Returns:
            List of file and directory names (not full paths)

        Raises:
            FileNotFoundError: If the directory does not exist
            FileReadError: If the directory cannot be read
        """
        dir_path = Path(path)
        
        if not dir_path.exists():
            raise FileNotFoundError(f"Directory not found: {path}")
        
        if not dir_path.is_dir():
            raise FileReadError(f"Path is not a directory: {path}")
        
        try:
            return [item.name for item in dir_path.iterdir()]
        except PermissionError as e:
            raise FileReadError(f"Permission denied reading directory: {path}") from e
        except OSError as e:
            raise FileReadError(f"Error reading directory {path}: {str(e)}") from e

    @staticmethod
    def read_json(path: str) -> Dict[str, Any]:
        """
        Read and parse a JSON file.

        Args:
            path: Path to the JSON file

        Returns:
            Parsed JSON data as a dictionary

        Raises:
            FileNotFoundError: If the file does not exist
            FileReadError: If the file cannot be read
            JSONParseError: If the JSON is invalid
        """
        try:
            content = FileOperations.read_file(path)
        except FileOperationError:
            raise  # Re-raise file operation errors as-is
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            raise JSONParseError(
                f"Invalid JSON in file {path}: {str(e)}"
            ) from e

    @staticmethod
    def write_json(path: str, data: Dict[str, Any], indent: int = 2) -> None:
        """
        Write data to a JSON file with formatting.

        Args:
            path: Path to the JSON file
            data: Data to write (must be JSON-serializable)
            indent: Number of spaces for indentation (default: 2)

        Raises:
            FileWriteError: If the file cannot be written
            JSONParseError: If the data cannot be serialized to JSON
        """
        try:
            content = json.dumps(data, indent=indent, ensure_ascii=False)
        except (TypeError, ValueError) as e:
            raise JSONParseError(
                f"Cannot serialize data to JSON: {str(e)}"
            ) from e
        
        try:
            FileOperations.write_file(path, content)
        except FileOperationError:
            raise  # Re-raise file operation errors as-is

    @staticmethod
    def get_file_size(path: str) -> int:
        """
        Get the size of a file in bytes.

        Args:
            path: Path to the file

        Returns:
            File size in bytes

        Raises:
            FileNotFoundError: If the file does not exist
            FileReadError: If the file size cannot be determined
        """
        file_path = Path(path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        try:
            return file_path.stat().st_size
        except OSError as e:
            raise FileReadError(f"Error getting file size for {path}: {str(e)}") from e

    @staticmethod
    def delete_file(path: str) -> None:
        """
        Delete a file.

        Args:
            path: Path to the file to delete

        Raises:
            FileNotFoundError: If the file does not exist
            FileWriteError: If the file cannot be deleted
        """
        file_path = Path(path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {path}")
        
        if not file_path.is_file():
            raise FileWriteError(f"Path is not a file: {path}")
        
        try:
            file_path.unlink()
        except PermissionError as e:
            raise FileWriteError(f"Permission denied deleting file: {path}") from e
        except OSError as e:
            raise FileWriteError(f"Error deleting file {path}: {str(e)}") from e
