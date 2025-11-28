"""Comprehensive logging module for the Kiro Project Orchestrator."""

import logging
import sys
import time
import traceback
from datetime import datetime
from functools import wraps
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Any, Callable, Optional


# Log file configuration
LOG_DIR = Path(".kiro/specs")
LOG_FILE = LOG_DIR / "orchestrator.log"
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10 MB
BACKUP_COUNT = 5  # Keep 5 backup files


class OrchestratorLogger:
    """Manages logging for the Kiro Project Orchestrator."""

    _instance: Optional['OrchestratorLogger'] = None
    _initialized: bool = False

    def __new__(cls) -> 'OrchestratorLogger':
        """Ensure singleton pattern for logger."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the logger (only once)."""
        if not OrchestratorLogger._initialized:
            self._setup_logging()
            OrchestratorLogger._initialized = True

    def _setup_logging(self) -> None:
        """Set up logging with console and file handlers."""
        # Create logger
        self.logger = logging.getLogger("kiro-orchestrator")
        self.logger.setLevel(logging.DEBUG)
        
        # Remove any existing handlers to avoid duplicates
        self.logger.handlers.clear()

        # Create log directory if it doesn't exist
        LOG_DIR.mkdir(parents=True, exist_ok=True)

        # Create formatters
        detailed_formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)-8s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        console_formatter = logging.Formatter(
            fmt='%(asctime)s | %(levelname)-8s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

        # Console handler (INFO and above)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

        # File handler with rotation (DEBUG and above)
        file_handler = RotatingFileHandler(
            filename=str(LOG_FILE),
            maxBytes=MAX_LOG_SIZE,
            backupCount=BACKUP_COUNT,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(detailed_formatter)
        self.logger.addHandler(file_handler)

        # Log initialization
        self.logger.info("=" * 80)
        self.logger.info("Kiro Project Orchestrator Logger Initialized")
        self.logger.info(f"Log file: {LOG_FILE}")
        self.logger.info(f"Max log size: {MAX_LOG_SIZE / (1024 * 1024):.1f} MB")
        self.logger.info(f"Backup count: {BACKUP_COUNT}")
        self.logger.info("=" * 80)

    def get_logger(self) -> logging.Logger:
        """
        Get the configured logger instance.

        Returns:
            Configured logger instance
        """
        return self.logger


# Global logger instance
_orchestrator_logger = OrchestratorLogger()


def get_logger() -> logging.Logger:
    """
    Get the orchestrator logger.

    Returns:
        Configured logger instance
    """
    return _orchestrator_logger.get_logger()


def log_operation(operation_name: str):
    """
    Decorator to log operation execution with timing and error handling.

    This decorator:
    - Logs operation start with parameters
    - Tracks execution duration
    - Logs successful completion with duration
    - Logs failures with full stack traces
    - Re-raises exceptions after logging

    Args:
        operation_name: Name of the operation being performed

    Returns:
        Decorated function

    Example:
        @log_operation("create_project")
        def create_project(name: str, description: str):
            # implementation
            pass
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            logger = get_logger()
            
            # Extract function parameters for logging
            params = _format_parameters(func, args, kwargs)
            
            # Log operation start
            logger.info(f"Starting operation: {operation_name}")
            logger.debug(f"Operation: {operation_name} | Parameters: {params}")
            
            start_time = time.time()
            
            try:
                # Execute the function
                result = func(*args, **kwargs)
                
                # Calculate duration
                duration = time.time() - start_time
                
                # Log successful completion
                logger.info(
                    f"Operation completed: {operation_name} | "
                    f"Duration: {duration:.3f}s | "
                    f"Status: SUCCESS"
                )
                logger.debug(f"Operation: {operation_name} | Result type: {type(result).__name__}")
                
                return result
                
            except Exception as e:
                # Calculate duration
                duration = time.time() - start_time
                
                # Log failure with full details
                logger.error(
                    f"Operation failed: {operation_name} | "
                    f"Duration: {duration:.3f}s | "
                    f"Status: FAILURE | "
                    f"Error: {type(e).__name__}: {str(e)}"
                )
                
                # Log full stack trace
                logger.error(f"Stack trace for {operation_name}:")
                logger.error(traceback.format_exc())
                
                # Re-raise the exception
                raise
        
        return wrapper
    return decorator


def log_api_request(endpoint: str, method: str):
    """
    Decorator to log API requests with timing and response status.

    Args:
        endpoint: API endpoint path
        method: HTTP method (GET, POST, etc.)

    Returns:
        Decorated function

    Example:
        @log_api_request("/projects/create", "POST")
        async def create_project(request: CreateProjectRequest):
            # implementation
            pass
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            logger = get_logger()
            
            # Extract request parameters
            params = _format_parameters(func, args, kwargs)
            
            # Log request start
            logger.info(f"API Request: {method} {endpoint}")
            logger.debug(f"API Request: {method} {endpoint} | Parameters: {params}")
            
            start_time = time.time()
            
            try:
                # Execute the function
                result = await func(*args, **kwargs)
                
                # Calculate duration
                duration = time.time() - start_time
                
                # Determine status from result
                status = "SUCCESS"
                if hasattr(result, 'status'):
                    status = result.status.upper()
                
                # Log successful response
                logger.info(
                    f"API Response: {method} {endpoint} | "
                    f"Duration: {duration:.3f}s | "
                    f"Status: {status}"
                )
                
                return result
                
            except Exception as e:
                # Calculate duration
                duration = time.time() - start_time
                
                # Log failure
                logger.error(
                    f"API Error: {method} {endpoint} | "
                    f"Duration: {duration:.3f}s | "
                    f"Error: {type(e).__name__}: {str(e)}"
                )
                
                # Log stack trace
                logger.error(f"Stack trace for {method} {endpoint}:")
                logger.error(traceback.format_exc())
                
                # Re-raise the exception
                raise
        
        return wrapper
    return decorator


def _format_parameters(func: Callable, args: tuple, kwargs: dict) -> str:
    """
    Format function parameters for logging.

    Args:
        func: The function being called
        args: Positional arguments
        kwargs: Keyword arguments

    Returns:
        Formatted parameter string
    """
    import inspect
    
    try:
        # Get function signature
        sig = inspect.signature(func)
        bound_args = sig.bind_partial(*args, **kwargs)
        bound_args.apply_defaults()
        
        # Format parameters
        params = []
        for name, value in bound_args.arguments.items():
            # Skip 'self' and 'cls' parameters
            if name in ('self', 'cls'):
                continue
            
            # Truncate long values
            value_str = str(value)
            if len(value_str) > 100:
                value_str = value_str[:97] + "..."
            
            params.append(f"{name}={value_str}")
        
        return ", ".join(params) if params else "no parameters"
        
    except Exception:
        # Fallback if parameter extraction fails
        return f"args={args}, kwargs={kwargs}"


def log_startup_info(app_name: str, version: str, **kwargs) -> None:
    """
    Log application startup information.

    Args:
        app_name: Name of the application
        version: Application version
        **kwargs: Additional startup information to log
    """
    logger = get_logger()
    
    logger.info("=" * 80)
    logger.info(f"Starting {app_name} v{version}")
    logger.info(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    
    for key, value in kwargs.items():
        logger.info(f"{key}: {value}")
    
    logger.info("=" * 80)


def log_shutdown_info(app_name: str) -> None:
    """
    Log application shutdown information.

    Args:
        app_name: Name of the application
    """
    logger = get_logger()
    
    logger.info("=" * 80)
    logger.info(f"Shutting down {app_name}")
    logger.info(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    logger.info("=" * 80)


def log_error_with_context(
    error: Exception,
    context: str,
    additional_info: Optional[dict] = None
) -> None:
    """
    Log an error with contextual information and stack trace.

    Args:
        error: The exception that occurred
        context: Description of what was being done when the error occurred
        additional_info: Optional dictionary of additional context information
    """
    logger = get_logger()
    
    logger.error(f"Error in {context}: {type(error).__name__}: {str(error)}")
    
    if additional_info:
        logger.error(f"Additional context: {additional_info}")
    
    logger.error("Stack trace:")
    logger.error(traceback.format_exc())
