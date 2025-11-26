"""Demo script to demonstrate comprehensive logging functionality."""

import sys
import time
from src.logger import get_logger, log_operation, log_startup_info, log_shutdown_info, log_error_with_context


@log_operation("demo_successful_operation")
def successful_operation(name: str, value: int) -> str:
    """Simulate a successful operation."""
    logger = get_logger()
    logger.info(f"Processing {name} with value {value}")
    time.sleep(0.1)  # Simulate some work
    result = f"Processed {name}: {value * 2}"
    logger.debug(f"Result: {result}")
    return result


@log_operation("demo_failing_operation")
def failing_operation(data: dict) -> None:
    """Simulate a failing operation."""
    logger = get_logger()
    logger.info(f"Attempting to process data: {data}")
    
    # Simulate an error
    if "error" in data:
        raise ValueError(f"Invalid data: {data['error']}")
    
    logger.info("Operation completed successfully")


def main():
    """Main demo function."""
    # Log startup
    log_startup_info(
        app_name="Logging Demo",
        version="1.0.0",
        environment="development",
        log_file=".kiro/specs/orchestrator.log"
    )
    
    logger = get_logger()
    
    # Demo 1: Successful operation
    logger.info("=" * 60)
    logger.info("Demo 1: Successful Operation")
    logger.info("=" * 60)
    result = successful_operation("test-item", 42)
    logger.info(f"Operation result: {result}")
    
    # Demo 2: Multiple log levels
    logger.info("=" * 60)
    logger.info("Demo 2: Multiple Log Levels")
    logger.info("=" * 60)
    logger.debug("This is a DEBUG message (only in file)")
    logger.info("This is an INFO message (console and file)")
    logger.warning("This is a WARNING message")
    logger.error("This is an ERROR message")
    
    # Demo 3: Failed operation with error handling
    logger.info("=" * 60)
    logger.info("Demo 3: Failed Operation with Error Handling")
    logger.info("=" * 60)
    try:
        failing_operation({"error": "test error"})
    except ValueError as e:
        log_error_with_context(
            error=e,
            context="demo_failing_operation",
            additional_info={
                "operation": "failing_operation",
                "input": {"error": "test error"}
            }
        )
        logger.info("Error was caught and logged")
    
    # Demo 4: Log file information
    logger.info("=" * 60)
    logger.info("Demo 4: Log File Information")
    logger.info("=" * 60)
    logger.info("Log file location: .kiro/specs/orchestrator.log")
    logger.info("Max log size: 10 MB")
    logger.info("Backup count: 5")
    logger.info("Log rotation: Automatic when size limit reached")
    
    # Log shutdown
    log_shutdown_info("Logging Demo")
    
    print("\n" + "=" * 60)
    print("Demo completed successfully!")
    print("Check the log file at: .kiro/specs/orchestrator.log")
    print("=" * 60)


if __name__ == "__main__":
    main()
