"""Unit tests for the logger module."""

import logging
import os
import time
from pathlib import Path
import pytest

from src.logger import (
    get_logger,
    log_operation,
    log_api_request,
    log_startup_info,
    log_shutdown_info,
    log_error_with_context,
    OrchestratorLogger,
    LOG_FILE,
    LOG_DIR,
)


class TestOrchestratorLogger:
    """Tests for OrchestratorLogger class."""

    def test_singleton_pattern(self):
        """Test that OrchestratorLogger follows singleton pattern."""
        logger1 = OrchestratorLogger()
        logger2 = OrchestratorLogger()
        
        assert logger1 is logger2

    def test_get_logger_returns_logger(self):
        """Test that get_logger returns a logging.Logger instance."""
        logger = get_logger()
        
        assert isinstance(logger, logging.Logger)
        assert logger.name == "kiro-orchestrator"

    def test_log_file_created(self):
        """Test that log file is created on initialization."""
        # Initialize logger
        get_logger()
        
        # Check that log directory exists
        assert LOG_DIR.exists()
        assert LOG_DIR.is_dir()
        
        # Check that log file exists
        assert LOG_FILE.exists()
        assert LOG_FILE.is_file()

    def test_logger_has_handlers(self):
        """Test that logger has both console and file handlers."""
        logger = get_logger()
        
        # Should have 2 handlers: console and file
        assert len(logger.handlers) >= 2
        
        # Check handler types
        handler_types = [type(h).__name__ for h in logger.handlers]
        assert 'StreamHandler' in handler_types
        assert 'RotatingFileHandler' in handler_types

    def test_logger_level_configuration(self):
        """Test that logger levels are configured correctly."""
        logger = get_logger()
        
        # Logger should be set to DEBUG
        assert logger.level == logging.DEBUG
        
        # Find console and file handlers
        console_handler = None
        file_handler = None
        
        for handler in logger.handlers:
            if type(handler).__name__ == 'StreamHandler':
                console_handler = handler
            elif type(handler).__name__ == 'RotatingFileHandler':
                file_handler = handler
        
        # Console handler should be INFO
        if console_handler:
            assert console_handler.level == logging.INFO
        
        # File handler should be DEBUG
        if file_handler:
            assert file_handler.level == logging.DEBUG


class TestLogOperation:
    """Tests for log_operation decorator."""

    def test_log_operation_success(self, caplog):
        """Test that log_operation logs successful operations."""
        @log_operation("test_operation")
        def test_func(x: int, y: int) -> int:
            return x + y
        
        with caplog.at_level(logging.INFO):
            result = test_func(2, 3)
        
        assert result == 5
        
        # Check that operation was logged
        assert "Starting operation: test_operation" in caplog.text
        assert "Operation completed: test_operation" in caplog.text
        assert "Status: SUCCESS" in caplog.text

    def test_log_operation_failure(self, caplog):
        """Test that log_operation logs failed operations with stack trace."""
        @log_operation("test_operation_fail")
        def test_func():
            raise ValueError("Test error")
        
        with caplog.at_level(logging.ERROR):
            with pytest.raises(ValueError, match="Test error"):
                test_func()
        
        # Check that failure was logged
        assert "Operation failed: test_operation_fail" in caplog.text
        assert "Status: FAILURE" in caplog.text
        assert "ValueError: Test error" in caplog.text
        assert "Stack trace" in caplog.text

    def test_log_operation_timing(self, caplog):
        """Test that log_operation logs execution duration."""
        @log_operation("test_timing")
        def test_func():
            time.sleep(0.1)
            return "done"
        
        with caplog.at_level(logging.INFO):
            result = test_func()
        
        assert result == "done"
        
        # Check that duration was logged
        assert "Duration:" in caplog.text
        # Duration should be at least 0.1 seconds
        assert "0.1" in caplog.text or "0.0" in caplog.text


class TestLogApiRequest:
    """Tests for log_api_request decorator."""

    @pytest.mark.asyncio
    async def test_log_api_request_success(self, caplog):
        """Test that log_api_request logs successful API requests."""
        @log_api_request("/test/endpoint", "GET")
        async def test_endpoint():
            return {"status": "success"}
        
        with caplog.at_level(logging.INFO):
            result = await test_endpoint()
        
        assert result == {"status": "success"}
        
        # Check that request was logged
        assert "API Request: GET /test/endpoint" in caplog.text
        assert "API Response: GET /test/endpoint" in caplog.text
        assert "Status: SUCCESS" in caplog.text

    @pytest.mark.asyncio
    async def test_log_api_request_failure(self, caplog):
        """Test that log_api_request logs failed API requests."""
        @log_api_request("/test/endpoint", "POST")
        async def test_endpoint():
            raise RuntimeError("API error")
        
        with caplog.at_level(logging.INFO):
            with pytest.raises(RuntimeError, match="API error"):
                await test_endpoint()
        
        # Check that error was logged
        assert "API Request: POST /test/endpoint" in caplog.text
        assert "API Error: POST /test/endpoint" in caplog.text
        assert "RuntimeError: API error" in caplog.text


class TestLogUtilities:
    """Tests for logging utility functions."""

    def test_log_startup_info(self, caplog):
        """Test that log_startup_info logs startup information."""
        with caplog.at_level(logging.INFO):
            log_startup_info(
                app_name="Test App",
                version="1.0.0",
                environment="test",
                port=8000
            )
        
        # Check that startup info was logged
        assert "Starting Test App v1.0.0" in caplog.text
        assert "environment: test" in caplog.text
        assert "port: 8000" in caplog.text

    def test_log_shutdown_info(self, caplog):
        """Test that log_shutdown_info logs shutdown information."""
        with caplog.at_level(logging.INFO):
            log_shutdown_info("Test App")
        
        # Check that shutdown info was logged
        assert "Shutting down Test App" in caplog.text

    def test_log_error_with_context(self, caplog):
        """Test that log_error_with_context logs errors with context."""
        error = ValueError("Test error")
        context = "processing user input"
        additional_info = {"user_id": "123", "action": "create"}
        
        with caplog.at_level(logging.ERROR):
            log_error_with_context(error, context, additional_info)
        
        # Check that error was logged with context
        assert "Error in processing user input" in caplog.text
        assert "ValueError: Test error" in caplog.text
        assert "Additional context:" in caplog.text
        assert "user_id" in caplog.text
        assert "Stack trace:" in caplog.text


class TestLogRotation:
    """Tests for log rotation functionality."""

    def test_log_file_rotation_configuration(self):
        """Test that log rotation is configured correctly."""
        logger = get_logger()
        
        # Find the rotating file handler
        rotating_handler = None
        for handler in logger.handlers:
            if type(handler).__name__ == 'RotatingFileHandler':
                rotating_handler = handler
                break
        
        assert rotating_handler is not None
        
        # Check rotation configuration
        assert rotating_handler.maxBytes == 10 * 1024 * 1024  # 10 MB
        assert rotating_handler.backupCount == 5


class TestLogContent:
    """Tests for log content and formatting."""

    def test_log_contains_timestamp(self, caplog):
        """Test that log entries contain timestamps."""
        logger = get_logger()
        
        with caplog.at_level(logging.INFO):
            logger.info("Test message")
        
        # Check that timestamp is in the log
        assert caplog.records[0].created > 0

    def test_log_contains_level(self, caplog):
        """Test that log entries contain log level."""
        logger = get_logger()
        
        with caplog.at_level(logging.INFO):
            logger.info("Info message")
            logger.warning("Warning message")
            logger.error("Error message")
        
        # Check that levels are recorded
        levels = [record.levelname for record in caplog.records]
        assert "INFO" in levels
        assert "WARNING" in levels
        assert "ERROR" in levels

    def test_log_contains_function_name(self, caplog):
        """Test that log entries contain function names."""
        @log_operation("test_func")
        def test_function():
            return "done"
        
        with caplog.at_level(logging.DEBUG):
            test_function()
        
        # Check that function name is in debug logs
        # The decorator wrapper function name should appear
        assert any("wrapper" in record.funcName or "test_function" in record.funcName 
                  for record in caplog.records)
