"""File system service for browsing project files."""

import os
import mimetypes
from pathlib import Path
from typing import Dict, Any, List, Optional, Set
from datetime import datetime, timedelta

from src.logger import get_logger

logger = get_logger()


class FileSystemError(Exception):
    """Base exception for file system errors."""
    pass


class PathValidationError(FileSystemError):
    """Exception raised when path validation fails."""
    pass


class FileSystemService:
    """Service for browsing and reading project files."""
    
    # Directories and files to exclude from tree
    EXCLUDED_DIRS: Set[str] = {
        'node_modules',
        '.git',
        '.venv',
        'venv',
        '__pycache__',
        '.pytest_cache',
        'dist',
        'build',
        '.next',
        '.nuxt',
        'coverage',
        '.coverage',
        '.mypy_cache',
        '.ruff_cache',
        '.tox',
        'eggs',
        '.eggs',
        'target',  # Rust/Java
        'bin',  # Compiled binaries
        'obj',  # C#
    }
    
    EXCLUDED_FILES: Set[str] = {
        '.DS_Store',
        'Thumbs.db',
        '.gitignore',
        '.env',
        '.env.local',
        '.env.production',
    }
    
    # Binary file extensions
    BINARY_EXTENSIONS: Set[str] = {
        '.pyc', '.pyo', '.so', '.dll', '.dylib', '.exe',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
        '.pdf', '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
        '.mp3', '.mp4', '.avi', '.mov', '.wav',
        '.ttf', '.otf', '.woff', '.woff2', '.eot',
        '.db', '.sqlite', '.sqlite3',
    }
    
    # Maximum file size to read (1MB)
    MAX_FILE_SIZE: int = 1048576
    
    # Cache settings
    CACHE_TTL_SECONDS: int = 300  # 5 minutes
    
    def __init__(self):
        """Initialize the file system service."""
        self._tree_cache: Dict[str, Dict[str, Any]] = {}
        self._cache_timestamps: Dict[str, datetime] = {}
    
    def validate_path(self, project_root: str, file_path: str) -> str:
        """
        Validate that a file path is within the project root.
        
        Args:
            project_root: The project root directory
            file_path: The file path to validate (relative or absolute)
        
        Returns:
            Absolute path if valid
        
        Raises:
            PathValidationError: If the path is outside project root
        """
        try:
            # Convert to absolute paths
            root = Path(project_root).resolve()
            
            # If file_path is relative, join with root
            if not Path(file_path).is_absolute():
                target = (root / file_path).resolve()
            else:
                target = Path(file_path).resolve()
            
            # Check if target is within root
            try:
                target.relative_to(root)
            except ValueError:
                raise PathValidationError(
                    f"Path '{file_path}' is outside project root"
                )
            
            return str(target)
            
        except Exception as e:
            if isinstance(e, PathValidationError):
                raise
            raise PathValidationError(f"Invalid path: {str(e)}")
    
    def is_binary_file(self, file_path: str) -> bool:
        """
        Check if a file is binary.
        
        Args:
            file_path: Path to the file
        
        Returns:
            True if the file is binary, False otherwise
        """
        # Check extension first
        ext = Path(file_path).suffix.lower()
        if ext in self.BINARY_EXTENSIONS:
            return True
        
        # Check MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type:
            if not mime_type.startswith('text/'):
                # Allow some common text-based types
                if mime_type not in [
                    'application/json',
                    'application/javascript',
                    'application/xml',
                    'application/x-yaml',
                ]:
                    return True
        
        # Try reading first few bytes
        try:
            with open(file_path, 'rb') as f:
                chunk = f.read(1024)
                # Check for null bytes (common in binary files)
                if b'\x00' in chunk:
                    return True
        except Exception:
            # If we can't read it, assume it's binary
            return True
        
        return False
    
    def _should_exclude(self, name: str, is_dir: bool) -> bool:
        """
        Check if a file or directory should be excluded from the tree.
        
        Args:
            name: Name of the file or directory
            is_dir: Whether this is a directory
        
        Returns:
            True if should be excluded, False otherwise
        """
        if is_dir:
            return name in self.EXCLUDED_DIRS
        else:
            return name in self.EXCLUDED_FILES
    
    def _is_cache_valid(self, project_root: str) -> bool:
        """
        Check if cached tree is still valid.
        
        Args:
            project_root: The project root directory
        
        Returns:
            True if cache is valid, False otherwise
        """
        if project_root not in self._cache_timestamps:
            return False
        
        cache_time = self._cache_timestamps[project_root]
        age = datetime.now() - cache_time
        
        return age.total_seconds() < self.CACHE_TTL_SECONDS
    
    def _build_tree_node(
        self, 
        path: Path, 
        current_depth: int, 
        max_depth: int
    ) -> Optional[Dict[str, Any]]:
        """
        Build a tree node for a file or directory.
        
        Args:
            path: Path to the file or directory
            current_depth: Current depth in the tree
            max_depth: Maximum depth to traverse
        
        Returns:
            Dictionary representing the tree node, or None if excluded
        """
        try:
            name = path.name
            is_dir = path.is_dir()
            
            # Check if should be excluded
            if self._should_exclude(name, is_dir):
                return None
            
            # Build base node
            node: Dict[str, Any] = {
                'name': name,
                'path': str(path),
                'type': 'folder' if is_dir else 'file',
            }
            
            # Add file-specific info
            if not is_dir:
                try:
                    stat = path.stat()
                    node['size'] = stat.st_size
                    node['extension'] = path.suffix.lower() if path.suffix else None
                except Exception as e:
                    logger.warning(f"Failed to get file stats for {path}: {str(e)}")
                    node['size'] = 0
            
            # Recursively build children for directories
            if is_dir and current_depth < max_depth:
                children = []
                try:
                    for child_path in sorted(path.iterdir()):
                        child_node = self._build_tree_node(
                            child_path, 
                            current_depth + 1, 
                            max_depth
                        )
                        if child_node:
                            children.append(child_node)
                    
                    node['children'] = children
                except PermissionError:
                    logger.warning(f"Permission denied accessing directory: {path}")
                    node['children'] = []
                except Exception as e:
                    logger.error(f"Error reading directory {path}: {str(e)}")
                    node['children'] = []
            
            return node
            
        except Exception as e:
            logger.error(f"Error building tree node for {path}: {str(e)}")
            return None
    
    def get_directory_tree(
        self, 
        project_root: str, 
        max_depth: int = 10
    ) -> Dict[str, Any]:
        """
        Get the directory tree for a project.
        
        Args:
            project_root: The project root directory
            max_depth: Maximum depth to traverse (default: 10)
        
        Returns:
            Dictionary representing the directory tree
        
        Raises:
            FileSystemError: If directory cannot be read
        """
        try:
            # Check cache first
            if self._is_cache_valid(project_root):
                logger.debug(f"Returning cached tree for {project_root}")
                return self._tree_cache[project_root]
            
            # Validate project root exists
            root_path = Path(project_root)
            if not root_path.exists():
                raise FileSystemError(f"Project root does not exist: {project_root}")
            
            if not root_path.is_dir():
                raise FileSystemError(f"Project root is not a directory: {project_root}")
            
            # Build the tree
            logger.info(f"Building directory tree for {project_root} (max_depth={max_depth})")
            tree = self._build_tree_node(root_path, 0, max_depth)
            
            if not tree:
                raise FileSystemError(f"Failed to build tree for {project_root}")
            
            # Cache the result
            self._tree_cache[project_root] = tree
            self._cache_timestamps[project_root] = datetime.now()
            
            return tree
            
        except FileSystemError:
            raise
        except Exception as e:
            logger.error(f"Error getting directory tree: {str(e)}", exc_info=True)
            raise FileSystemError(f"Failed to get directory tree: {str(e)}")
    
    def read_file_content(
        self, 
        project_root: str, 
        file_path: str, 
        max_size: int = None
    ) -> Dict[str, Any]:
        """
        Read the content of a file.
        
        Args:
            project_root: The project root directory
            file_path: Path to the file (relative to project root or absolute)
            max_size: Maximum file size to read (default: MAX_FILE_SIZE)
        
        Returns:
            Dictionary with file content and metadata
        
        Raises:
            PathValidationError: If path is invalid or outside project root
            FileSystemError: If file cannot be read
        """
        try:
            # Use default max size if not provided
            if max_size is None:
                max_size = self.MAX_FILE_SIZE
            
            # Validate the path
            validated_path = self.validate_path(project_root, file_path)
            path = Path(validated_path)
            
            # Check if file exists
            if not path.exists():
                raise FileSystemError(f"File does not exist: {file_path}")
            
            if not path.is_file():
                raise FileSystemError(f"Path is not a file: {file_path}")
            
            # Get file stats
            stat = path.stat()
            file_size = stat.st_size
            
            # Check if binary
            is_binary = self.is_binary_file(str(path))
            
            if is_binary:
                return {
                    'filePath': file_path,
                    'content': '',
                    'isBinary': True,
                    'isTruncated': False,
                    'size': file_size,
                    'encoding': 'binary',
                    'language': None,
                }
            
            # Check file size
            is_truncated = file_size > max_size
            
            # Read file content
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    if is_truncated:
                        content = f.read(max_size)
                    else:
                        content = f.read()
            except UnicodeDecodeError:
                # Try with different encoding
                try:
                    with open(path, 'r', encoding='latin-1') as f:
                        if is_truncated:
                            content = f.read(max_size)
                        else:
                            content = f.read()
                except Exception as e:
                    raise FileSystemError(f"Failed to read file with encoding: {str(e)}")
            
            # Determine language from extension
            extension = path.suffix.lower()
            language_map = {
                '.py': 'python',
                '.js': 'javascript',
                '.ts': 'typescript',
                '.tsx': 'typescript',
                '.jsx': 'javascript',
                '.java': 'java',
                '.c': 'c',
                '.cpp': 'cpp',
                '.h': 'c',
                '.hpp': 'cpp',
                '.cs': 'csharp',
                '.go': 'go',
                '.rs': 'rust',
                '.rb': 'ruby',
                '.php': 'php',
                '.swift': 'swift',
                '.kt': 'kotlin',
                '.scala': 'scala',
                '.html': 'html',
                '.css': 'css',
                '.scss': 'scss',
                '.sass': 'sass',
                '.less': 'less',
                '.json': 'json',
                '.xml': 'xml',
                '.yaml': 'yaml',
                '.yml': 'yaml',
                '.md': 'markdown',
                '.sql': 'sql',
                '.sh': 'shell',
                '.bash': 'shell',
                '.zsh': 'shell',
                '.ps1': 'powershell',
                '.r': 'r',
                '.m': 'matlab',
                '.lua': 'lua',
                '.pl': 'perl',
            }
            
            language = language_map.get(extension, None)
            
            return {
                'filePath': file_path,
                'content': content,
                'isBinary': False,
                'isTruncated': is_truncated,
                'size': file_size,
                'encoding': 'utf-8',
                'language': language,
            }
            
        except (PathValidationError, FileSystemError):
            raise
        except Exception as e:
            logger.error(f"Error reading file content: {str(e)}", exc_info=True)
            raise FileSystemError(f"Failed to read file: {str(e)}")
    
    def clear_cache(self, project_root: str = None) -> None:
        """
        Clear the directory tree cache.
        
        Args:
            project_root: Optional specific project root to clear. If None, clears all cache.
        """
        if project_root:
            self._tree_cache.pop(project_root, None)
            self._cache_timestamps.pop(project_root, None)
            logger.debug(f"Cleared cache for {project_root}")
        else:
            self._tree_cache.clear()
            self._cache_timestamps.clear()
            logger.debug("Cleared all cache")