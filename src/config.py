"""Configuration management for the Kiro Project Orchestrator."""

import os
from enum import Enum
from pathlib import Path
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    PRODUCTION = "production"
    TESTING = "testing"


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    Settings can be configured via:
    1. Environment variables (prefixed with KIRO_)
    2. .env file
    3. Default values
    """
    
    # Server configuration
    host: str = Field(
        default="0.0.0.0",
        description="Server host address"
    )
    port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port number"
    )
    reload: bool = Field(
        default=False,
        description="Enable auto-reload on code changes (development only)"
    )
    workers: int = Field(
        default=1,
        ge=1,
        description="Number of worker processes"
    )
    
    # Application configuration
    environment: Environment = Field(
        default=Environment.DEVELOPMENT,
        description="Application environment"
    )
    debug: bool = Field(
        default=False,
        description="Enable debug mode"
    )
    
    # Logging configuration
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )
    log_file: Optional[str] = Field(
        default=None,
        description="Path to log file (relative to base_path or absolute)"
    )
    log_max_bytes: int = Field(
        default=10 * 1024 * 1024,  # 10 MB
        ge=1024,
        description="Maximum log file size in bytes before rotation"
    )
    log_backup_count: int = Field(
        default=5,
        ge=0,
        description="Number of backup log files to keep"
    )
    
    # Project storage configuration
    base_path: Path = Field(
        default=Path(".kiro/specs"),
        description="Base directory for project storage"
    )
    
    # CLI configuration
    kiro_cli_command: str = Field(
        default="kiro-cli",
        description="Command to execute kiro-cli"
    )
    cli_timeout: Optional[int] = Field(
        default=None,
        ge=1,
        description="Timeout for CLI commands in seconds (None for no timeout)"
    )
    
    # API configuration
    api_title: str = Field(
        default="Kiro Project Orchestrator",
        description="API title"
    )
    api_version: str = Field(
        default="1.0.0",
        description="API version"
    )
    api_description: str = Field(
        default="Backend system for automating software project lifecycles",
        description="API description"
    )
    
    # CORS configuration
    cors_enabled: bool = Field(
        default=True,
        description="Enable CORS middleware"
    )
    cors_origins: list[str] = Field(
        default=["*"],
        description="Allowed CORS origins"
    )
    
    model_config = SettingsConfigDict(
        env_prefix="KIRO_",
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    def get_log_file_path(self) -> Optional[Path]:
        """
        Get the absolute path to the log file.
        
        Returns:
            Absolute path to log file, or None if not configured
        """
        if not self.log_file:
            # Default log file location
            return self.base_path / "orchestrator.log"
        
        log_path = Path(self.log_file)
        
        # If relative path, make it relative to base_path
        if not log_path.is_absolute():
            return self.base_path / log_path
        
        return log_path
    
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment == Environment.DEVELOPMENT
    
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment == Environment.PRODUCTION
    
    def is_testing(self) -> bool:
        """Check if running in testing environment."""
        return self.environment == Environment.TESTING


# Development configuration
class DevelopmentSettings(Settings):
    """Settings for development environment."""
    
    environment: Environment = Environment.DEVELOPMENT
    debug: bool = True
    reload: bool = True
    log_level: str = "DEBUG"
    workers: int = 1


# Production configuration
class ProductionSettings(Settings):
    """Settings for production environment."""
    
    environment: Environment = Environment.PRODUCTION
    debug: bool = False
    reload: bool = False
    log_level: str = "INFO"
    workers: int = 4
    cors_origins: list[str] = []  # Must be explicitly configured in production


# Testing configuration
class TestingSettings(Settings):
    """Settings for testing environment."""
    
    environment: Environment = Environment.TESTING
    debug: bool = True
    log_level: str = "DEBUG"
    base_path: Path = Path(".kiro/specs/test")


def get_settings(environment: Optional[str] = None) -> Settings:
    """
    Get application settings based on environment.
    
    Args:
        environment: Environment name (development, production, testing).
                    If None, uses KIRO_ENVIRONMENT env var or defaults to development.
    
    Returns:
        Settings instance for the specified environment
    """
    if environment is None:
        environment = os.getenv("KIRO_ENVIRONMENT", "development")
    
    env = environment.lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()


# Global settings instance
settings = get_settings()
