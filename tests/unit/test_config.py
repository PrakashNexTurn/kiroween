"""Unit tests for configuration management."""

import os
import pytest
from pathlib import Path

from src.config import (
    Settings,
    DevelopmentSettings,
    ProductionSettings,
    TestingSettings,
    Environment,
    get_settings,
)


class TestSettings:
    """Test Settings class."""
    
    def test_default_settings(self):
        """Test default settings values."""
        settings = Settings()
        
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000
        assert settings.reload is False
        assert settings.workers == 1
        assert settings.environment == Environment.DEVELOPMENT
        assert settings.debug is False
        assert settings.log_level == "INFO"
        assert settings.base_path == Path(".kiro/specs")
        assert settings.kiro_cli_command == "kiro-cli"
        assert settings.cors_enabled is True
    
    def test_get_log_file_path_default(self):
        """Test get_log_file_path with default settings."""
        settings = Settings()
        log_path = settings.get_log_file_path()
        
        assert log_path == Path(".kiro/specs/orchestrator.log")
    
    def test_get_log_file_path_custom_relative(self):
        """Test get_log_file_path with custom relative path."""
        settings = Settings(log_file="custom.log")
        log_path = settings.get_log_file_path()
        
        assert log_path == Path(".kiro/specs/custom.log")
    
    def test_get_log_file_path_custom_absolute(self):
        """Test get_log_file_path with custom absolute path."""
        absolute_path = Path("/tmp/orchestrator.log").absolute()
        settings = Settings(log_file=str(absolute_path))
        log_path = settings.get_log_file_path()
        
        assert log_path == absolute_path
    
    def test_is_development(self):
        """Test is_development method."""
        settings = Settings(environment=Environment.DEVELOPMENT)
        assert settings.is_development() is True
        assert settings.is_production() is False
        assert settings.is_testing() is False
    
    def test_is_production(self):
        """Test is_production method."""
        settings = Settings(environment=Environment.PRODUCTION)
        assert settings.is_development() is False
        assert settings.is_production() is True
        assert settings.is_testing() is False
    
    def test_is_testing(self):
        """Test is_testing method."""
        settings = Settings(environment=Environment.TESTING)
        assert settings.is_development() is False
        assert settings.is_production() is False
        assert settings.is_testing() is True


class TestDevelopmentSettings:
    """Test DevelopmentSettings class."""
    
    def test_development_defaults(self):
        """Test development settings defaults."""
        settings = DevelopmentSettings()
        
        assert settings.environment == Environment.DEVELOPMENT
        assert settings.debug is True
        assert settings.reload is True
        assert settings.log_level == "DEBUG"
        assert settings.workers == 1


class TestProductionSettings:
    """Test ProductionSettings class."""
    
    def test_production_defaults(self):
        """Test production settings defaults."""
        settings = ProductionSettings()
        
        assert settings.environment == Environment.PRODUCTION
        assert settings.debug is False
        assert settings.reload is False
        assert settings.log_level == "INFO"
        assert settings.workers == 4
        assert settings.cors_origins == []


class TestTestingSettings:
    """Test TestingSettings class."""
    
    def test_testing_defaults(self):
        """Test testing settings defaults."""
        settings = TestingSettings()
        
        assert settings.environment == Environment.TESTING
        assert settings.debug is True
        assert settings.log_level == "DEBUG"
        assert settings.base_path == Path(".kiro/specs/test")


class TestGetSettings:
    """Test get_settings function."""
    
    def test_get_settings_development(self):
        """Test get_settings with development environment."""
        settings = get_settings("development")
        
        assert isinstance(settings, DevelopmentSettings)
        assert settings.environment == Environment.DEVELOPMENT
    
    def test_get_settings_production(self):
        """Test get_settings with production environment."""
        settings = get_settings("production")
        
        assert isinstance(settings, ProductionSettings)
        assert settings.environment == Environment.PRODUCTION
    
    def test_get_settings_testing(self):
        """Test get_settings with testing environment."""
        settings = get_settings("testing")
        
        assert isinstance(settings, TestingSettings)
        assert settings.environment == Environment.TESTING
    
    def test_get_settings_default(self):
        """Test get_settings with no environment specified."""
        # Clear environment variable if set
        old_env = os.environ.get("KIRO_ENVIRONMENT")
        if old_env:
            del os.environ["KIRO_ENVIRONMENT"]
        
        try:
            settings = get_settings()
            assert isinstance(settings, DevelopmentSettings)
        finally:
            # Restore environment variable
            if old_env:
                os.environ["KIRO_ENVIRONMENT"] = old_env
    
    def test_get_settings_from_env_var(self):
        """Test get_settings reads from KIRO_ENVIRONMENT env var."""
        old_env = os.environ.get("KIRO_ENVIRONMENT")
        
        try:
            os.environ["KIRO_ENVIRONMENT"] = "production"
            settings = get_settings()
            assert isinstance(settings, ProductionSettings)
        finally:
            # Restore environment variable
            if old_env:
                os.environ["KIRO_ENVIRONMENT"] = old_env
            else:
                del os.environ["KIRO_ENVIRONMENT"]
    
    def test_get_settings_case_insensitive(self):
        """Test get_settings is case insensitive."""
        settings = get_settings("PRODUCTION")
        assert isinstance(settings, ProductionSettings)
        
        settings = get_settings("Development")
        assert isinstance(settings, DevelopmentSettings)


class TestEnvironmentVariables:
    """Test environment variable loading."""
    
    def test_env_var_override_host(self):
        """Test that KIRO_HOST environment variable overrides default."""
        old_host = os.environ.get("KIRO_HOST")
        
        try:
            os.environ["KIRO_HOST"] = "127.0.0.1"
            settings = Settings()
            assert settings.host == "127.0.0.1"
        finally:
            if old_host:
                os.environ["KIRO_HOST"] = old_host
            else:
                if "KIRO_HOST" in os.environ:
                    del os.environ["KIRO_HOST"]
    
    def test_env_var_override_port(self):
        """Test that KIRO_PORT environment variable overrides default."""
        old_port = os.environ.get("KIRO_PORT")
        
        try:
            os.environ["KIRO_PORT"] = "9000"
            settings = Settings()
            assert settings.port == 9000
        finally:
            if old_port:
                os.environ["KIRO_PORT"] = old_port
            else:
                if "KIRO_PORT" in os.environ:
                    del os.environ["KIRO_PORT"]
    
    def test_env_var_override_log_level(self):
        """Test that KIRO_LOG_LEVEL environment variable overrides default."""
        old_log_level = os.environ.get("KIRO_LOG_LEVEL")
        
        try:
            os.environ["KIRO_LOG_LEVEL"] = "DEBUG"
            settings = Settings()
            assert settings.log_level == "DEBUG"
        finally:
            if old_log_level:
                os.environ["KIRO_LOG_LEVEL"] = old_log_level
            else:
                if "KIRO_LOG_LEVEL" in os.environ:
                    del os.environ["KIRO_LOG_LEVEL"]
