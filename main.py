"""Main entry point for the Kiro Project Orchestrator."""

import argparse
import sys
import uvicorn
from pathlib import Path

from src.config import get_settings, Environment


def parse_args() -> argparse.Namespace:
    """
    Parse command-line arguments.
    
    Returns:
        Parsed arguments
    """
    parser = argparse.ArgumentParser(
        description="Kiro Project Orchestrator - Backend system for automating software project lifecycles",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    
    # Server configuration
    parser.add_argument(
        "--host",
        type=str,
        default=None,
        help="Server host address (default: 0.0.0.0)",
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="Server port number (default: 8000)",
    )
    
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help="Number of worker processes (default: 1 for dev, 4 for prod)",
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        default=None,
        help="Enable auto-reload on code changes (development only)",
    )
    
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reload (overrides --reload)",
    )
    
    # Environment configuration
    parser.add_argument(
        "--env",
        "--environment",
        type=str,
        choices=["development", "production", "testing"],
        default=None,
        help="Application environment",
    )
    
    # Logging configuration
    parser.add_argument(
        "--log-level",
        type=str,
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
        default=None,
        help="Logging level",
    )
    
    parser.add_argument(
        "--log-file",
        type=str,
        default=None,
        help="Path to log file (relative to base path or absolute)",
    )
    
    # Project storage configuration
    parser.add_argument(
        "--base-path",
        type=str,
        default=None,
        help="Base directory for project storage (default: .kiro/specs)",
    )
    
    # Debug mode
    parser.add_argument(
        "--debug",
        action="store_true",
        default=None,
        help="Enable debug mode",
    )
    
    return parser.parse_args()


def main() -> int:
    """
    Main entry point for the application.
    
    Returns:
        Exit code (0 for success, non-zero for failure)
    """
    # Parse command-line arguments
    args = parse_args()
    
    # Load settings based on environment
    settings = get_settings(environment=args.env)
    
    # Override settings with command-line arguments
    if args.host is not None:
        settings.host = args.host
    
    if args.port is not None:
        settings.port = args.port
    
    if args.workers is not None:
        settings.workers = args.workers
    
    if args.no_reload:
        settings.reload = False
    elif args.reload:
        settings.reload = True
    
    if args.log_level is not None:
        settings.log_level = args.log_level
    
    if args.log_file is not None:
        settings.log_file = args.log_file
    
    if args.base_path is not None:
        settings.base_path = Path(args.base_path)
    
    if args.debug:
        settings.debug = True
    
    # Validate configuration
    if settings.reload and settings.workers > 1:
        print("Warning: Auto-reload is not compatible with multiple workers. Setting workers to 1.")
        settings.workers = 1
    
    if settings.is_production() and settings.reload:
        print("Warning: Auto-reload should not be enabled in production. Disabling reload.")
        settings.reload = False
    
    # Ensure base path exists
    try:
        settings.base_path.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"Error: Failed to create base directory {settings.base_path}: {e}", file=sys.stderr)
        return 1
    
    # Print startup information
    print("=" * 70)
    print("Kiro Project Orchestrator")
    print("=" * 70)
    print(f"Environment:  {settings.environment.value}")
    print(f"Host:         {settings.host}")
    print(f"Port:         {settings.port}")
    print(f"Workers:      {settings.workers}")
    print(f"Reload:       {settings.reload}")
    print(f"Debug:        {settings.debug}")
    print(f"Log Level:    {settings.log_level}")
    print(f"Base Path:    {settings.base_path.absolute()}")
    
    log_file_path = settings.get_log_file_path()
    if log_file_path:
        print(f"Log File:     {log_file_path.absolute()}")
    
    print("=" * 70)
    print(f"\nStarting server at http://{settings.host}:{settings.port}")
    print("Press CTRL+C to stop the server\n")
    
    # Configure uvicorn
    uvicorn_config = {
        "app": "src.app:app",
        "host": settings.host,
        "port": settings.port,
        "workers": settings.workers,
        "reload": settings.reload,
        "log_level": settings.log_level.lower(),
        "access_log": True,
    }
    
    # Add SSL configuration if needed (for production)
    # This can be extended with SSL cert paths from settings
    
    try:
        # Run the server
        uvicorn.run(**uvicorn_config)
        return 0
    except KeyboardInterrupt:
        print("\n\nShutting down gracefully...")
        return 0
    except Exception as e:
        print(f"\nError: Failed to start server: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
