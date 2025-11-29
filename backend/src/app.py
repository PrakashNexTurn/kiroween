"""FastAPI application for the Kiro Project Orchestrator."""

import json
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

from src.project_manager import (
    ProjectManager,
    ProjectAlreadyExistsError,
    ProjectNotFoundError,
    InvalidProjectNameError,
    ProjectManagerError,
)
from src.models import OrchestratorResponse, ProjectSummary, Phase, ProjectMetadata
from src.instruction_generator import InstructionGenerator
from src.cli_executor import CLIExecutor, CLIExecutionError
from src.response_formatter import ResponseFormatter
from src.steering_generator import SteeringGenerator, SteeringGeneratorError
from src.file_system_service import FileSystemService, FileSystemError, PathValidationError
from src.config import settings
from src.logger import get_logger, log_api_request, log_startup_info, log_shutdown_info


# Custom exception classes for better error handling
class InvalidStateTransitionError(Exception):
    """Exception raised when an invalid state transition is attempted."""
    pass


class ValidationError(Exception):
    """Exception raised when validation fails."""
    pass


# Request models
class CreateProjectRequest(BaseModel):
    """Request model for creating a new project."""
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    description: str = Field(..., min_length=1, max_length=2000, description="Project description")
    generate_steering: bool = Field(default=False, alias="generateSteering", description="If True, generate steering files after project creation")
    
    class Config:
        populate_by_name = True
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate that name is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Project name cannot be empty or whitespace only")
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        """Validate that description is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Project description cannot be empty or whitespace only")
        return v.strip()


class GenerateSpecRequest(BaseModel):
    """Request model for generating spec files."""
    spec_type: str = Field(..., alias="specType", description="Type of spec to generate: requirements, design, or tasks")
    description: str = Field(default="", max_length=5000, description="Project description or context for generation")
    
    class Config:
        populate_by_name = True
    
    @field_validator('spec_type')
    @classmethod
    def validate_spec_type(cls, v: str) -> str:
        """Validate that spec_type is one of the allowed values."""
        valid_types = ["requirements", "design", "tasks"]
        if v not in valid_types:
            raise ValueError(f"spec_type must be one of: {', '.join(valid_types)}")
        return v


class ProjectStatusResponse(BaseModel):
    """Response model for project status."""
    project_id: str = Field(..., alias="projectId")
    name: str
    phase: Phase
    completion_percentage: float = Field(..., alias="completionPercentage")
    task_stats: Dict[str, int] = Field(..., alias="taskStats")
    next_action: str = Field(..., alias="nextAction")
    
    class Config:
        populate_by_name = True


class ExecuteTaskRequest(BaseModel):
    """Request model for task execution."""
    task_number: Optional[str] = Field(None, alias="taskNumber", description="Optional task number to execute (e.g., '2.3'). If not provided, executes all tasks.")
    
    class Config:
        populate_by_name = True
    
    @field_validator('task_number')
    @classmethod
    def validate_task_number(cls, v: Optional[str]) -> Optional[str]:
        """Validate task number format if provided."""
        if v is not None:
            import re
            if not re.match(r'^\d+(\.\d+)?$', v):
                raise ValueError("task_number must be in format 'N' or 'N.M' (e.g., '1' or '2.3')")
        return v


class GenerateSteeringRequest(BaseModel):
    """Request model for generating steering files."""
    force: bool = Field(default=False, description="If True, overwrite existing files. If False, skip existing files.")
    
    class Config:
        populate_by_name = True


class UpdateSteeringFileRequest(BaseModel):
    """Request model for updating a steering file."""
    content: str = Field(..., description="New content for the steering file")
    
    class Config:
        populate_by_name = True


# Initialize components (will be used in lifespan)
project_manager = ProjectManager(base_path=str(settings.base_path))
instruction_generator = InstructionGenerator()
cli_executor = CLIExecutor()
response_formatter = ResponseFormatter()
steering_generator = SteeringGenerator()
file_system_service = FileSystemService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    On startup: Loads all existing projects from disk.
    On shutdown: Performs cleanup if needed.
    """
    # Startup: Load existing projects
    logger = get_logger()
    
    # Log startup information
    log_startup_info(
        app_name="Kiro Project Orchestrator",
        version="1.0.0",
        base_path=str(project_manager.base_path)
    )
    
    # Check if the base directory exists
    if not project_manager.file_ops.directory_exists(str(project_manager.base_path)):
        logger.info(f"Base directory {project_manager.base_path} does not exist. Creating it...")
        try:
            project_manager.file_ops.create_directory(str(project_manager.base_path))
            logger.info(f"Created base directory: {project_manager.base_path}")
        except Exception as e:
            logger.error(f"Failed to create base directory: {str(e)}")
        yield
        return
    
    logger.info(f"Scanning for existing projects in {project_manager.base_path}...")
    
    loaded_count = 0
    skipped_count = 0
    
    try:
        # List all items in the base directory
        items = project_manager.file_ops.list_directory(str(project_manager.base_path))
        
        for item in items:
            item_path = project_manager.base_path / item
            
            # Skip if not a directory
            if not project_manager.file_ops.directory_exists(str(item_path)):
                logger.debug(f"Skipping non-directory item: {item}")
                continue
            
            # Check if project.json exists
            metadata_path = item_path / "project.json"
            if not project_manager.file_ops.file_exists(str(metadata_path)):
                logger.warning(f"Skipping directory without project.json: {item}")
                skipped_count += 1
                continue
            
            # Try to load and validate the project
            try:
                # Load the project metadata
                metadata_dict = project_manager.file_ops.read_json(str(metadata_path))
                
                # Validate metadata schema by attempting to parse it
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                # Validate that required fields are present and valid
                if not metadata.project_id:
                    raise ValueError("Missing or empty project_id")
                if not metadata.name:
                    raise ValueError("Missing or empty name")
                if not metadata.description:
                    raise ValueError("Missing or empty description")
                
                # Successfully loaded and validated
                logger.info(f"Loaded project: {metadata.project_id} (phase: {metadata.phase.value})")
                loaded_count += 1
                
            except json.JSONDecodeError as e:
                logger.error(f"Corrupted JSON in {item}/project.json: {str(e)}")
                logger.error(f"Skipping corrupted project: {item}")
                skipped_count += 1
                continue
                
            except ValueError as e:
                logger.error(f"Invalid metadata schema in {item}/project.json: {str(e)}")
                logger.error(f"Skipping invalid project: {item}")
                skipped_count += 1
                continue
                
            except Exception as e:
                logger.error(f"Unexpected error loading project {item}: {str(e)}")
                logger.error(f"Skipping project: {item}")
                skipped_count += 1
                continue
        
        logger.info(f"Project loading complete: {loaded_count} loaded, {skipped_count} skipped")
        
    except Exception as e:
        logger.error(f"Error scanning projects directory: {str(e)}")
        logger.error("Continuing with startup despite scan error")
    
    # Yield control to the application
    yield
    
    # Shutdown: Cleanup if needed
    log_shutdown_info("Kiro Project Orchestrator")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="Kiro Project Orchestrator",
    description="Backend system for automating software project lifecycles",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS middleware
if settings.cors_enabled:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The validation error
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    
    # Extract project_id from path if available
    project_id = request.path_params.get("project_id", "unknown")
    
    # Format validation errors
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    error_message = "; ".join(errors)
    
    logger.warning(f"Validation error for {request.method} {request.url.path}: {error_message}")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": errors,
            }
        },
        logs=f"Validation error: {error_message}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=response.to_dict()
    )


@app.exception_handler(ProjectNotFoundError)
async def project_not_found_handler(request: Request, exc: ProjectNotFoundError) -> JSONResponse:
    """
    Handle ProjectNotFoundError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    # Include expected path in error message
    expected_path = project_manager.base_path / project_id
    logger.warning(f"Project not found: {str(exc)} (expected at: {expected_path.resolve()})")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "PROJECT_NOT_FOUND",
                "message": str(exc),
                "details": {
                    "project_id": project_id,
                    "expected_path": str(expected_path.resolve()),
                }
            }
        },
        logs=f"Project not found: {str(exc)} (expected at: {expected_path.resolve()})"
    )
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=response.to_dict()
    )


@app.exception_handler(ProjectAlreadyExistsError)
async def project_already_exists_handler(request: Request, exc: ProjectAlreadyExistsError) -> JSONResponse:
    """
    Handle ProjectAlreadyExistsError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    
    logger.warning(f"Project already exists: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action="create-project",
        project_id="unknown",
        output={
            "error": {
                "code": "PROJECT_ALREADY_EXISTS",
                "message": str(exc),
                "details": {}
            }
        },
        logs=f"Project already exists: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=response.to_dict()
    )


@app.exception_handler(InvalidProjectNameError)
async def invalid_project_name_handler(request: Request, exc: InvalidProjectNameError) -> JSONResponse:
    """
    Handle InvalidProjectNameError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    
    logger.warning(f"Invalid project name: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action="create-project",
        project_id="unknown",
        output={
            "error": {
                "code": "INVALID_PROJECT_NAME",
                "message": str(exc),
                "details": {}
            }
        },
        logs=f"Invalid project name: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=response.to_dict()
    )


@app.exception_handler(InvalidStateTransitionError)
async def invalid_state_transition_handler(request: Request, exc: InvalidStateTransitionError) -> JSONResponse:
    """
    Handle InvalidStateTransitionError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    logger.warning(f"Invalid state transition: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "INVALID_STATE_TRANSITION",
                "message": str(exc),
                "details": {
                    "project_id": project_id,
                }
            }
        },
        logs=f"Invalid state transition: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=response.to_dict()
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle ValidationError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    logger.warning(f"Validation error: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": str(exc),
                "details": {}
            }
        },
        logs=f"Validation error: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=response.to_dict()
    )


@app.exception_handler(PathValidationError)
async def path_validation_error_handler(request: Request, exc: PathValidationError) -> JSONResponse:
    """
    Handle PathValidationError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    logger.warning(f"Path validation error: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "PATH_VALIDATION_ERROR",
                "message": str(exc),
                "details": {
                    "project_id": project_id,
                }
            }
        },
        logs=f"Path validation error: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content=response.to_dict()
    )


@app.exception_handler(FileSystemError)
async def file_system_error_handler(request: Request, exc: FileSystemError) -> JSONResponse:
    """
    Handle FileSystemError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    logger.error(f"File system error: {str(exc)}")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "FILE_SYSTEM_ERROR",
                "message": str(exc),
                "details": {
                    "project_id": project_id,
                }
            }
        },
        logs=f"File system error: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response.to_dict()
    )


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request: Request, exc: FileNotFoundError) -> JSONResponse:
    """
    Handle FileNotFoundError and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    # Try to get the project path for better error messages
    try:
        project = project_manager.load_project(project_id)
        spec_dir = str(project.spec_dir)
    except:
        spec_dir = str((project_manager.base_path / project_id / ".kiro" / "specs").resolve())
    
    logger.warning(f"File not found: {str(exc)} (project spec dir: {spec_dir})")
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "FILE_NOT_FOUND",
                "message": str(exc),
                "details": {
                    "project_id": project_id,
                    "spec_dir": spec_dir,
                }
            }
        },
        logs=f"File not found: {str(exc)} (project spec dir: {spec_dir})"
    )
    
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=response.to_dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions and return proper OrchestratorResponse format.
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSONResponse with OrchestratorResponse format
    """
    logger = get_logger()
    project_id = request.path_params.get("project_id", "unknown")
    
    # Log the full exception with stack trace
    logger.error(f"Unhandled exception in {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    
    response = OrchestratorResponse(
        status="failure",
        action=f"{request.method.lower()}-{request.url.path.split('/')[-1]}",
        project_id=project_id,
        output={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": {
                    "error_type": type(exc).__name__,
                    "error_message": str(exc),
                }
            }
        },
        logs=f"Internal server error: {str(exc)}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response.to_dict()
    )


@app.post(
    "/projects/create",
    response_model=OrchestratorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
    description="Creates a new project with directory structure and metadata files",
)
@log_api_request("/projects/create", "POST")
async def create_project(request: CreateProjectRequest) -> OrchestratorResponse:
    """
    Create a new project.
    
    Args:
        request: CreateProjectRequest with name, description, and optional generate_steering flag
        
    Returns:
        OrchestratorResponse with project creation details
        
    Raises:
        InvalidProjectNameError: If project name is invalid
        ProjectAlreadyExistsError: If project already exists
        ProjectManagerError: If project creation fails
    """
    logger = get_logger()
    
    project = project_manager.create_project(
        name=request.name,
        description=request.description
    )
    
    # Prepare response output
    output = {
        "project": project.metadata.to_dict(),
        "project_root": project.project_root,
        "spec_dir": project.spec_dir,
        "project_path": project.project_path,  # Deprecated: kept for backward compatibility
        "files_created": [
            project.requirements_path,
            project.design_path,
            project.tasks_path,
        ]
    }
    
    logs = [f"Project '{project.metadata.project_id}' created successfully"]
    
    # Generate steering files if requested
    if request.generate_steering:
        try:
            logger.info(f"Generating steering files for project '{project.metadata.project_id}'")
            generated_files = steering_generator.generate_all(project, force=False)
            
            if generated_files:
                output["steering_files_created"] = list(generated_files.values())
                logs.append(f"Generated {len(generated_files)} steering files: {', '.join(generated_files.keys())}")
            else:
                logs.append("No steering files generated (files may already exist)")
                
        except SteeringGeneratorError as e:
            # Log the error but don't fail the project creation
            logger.error(f"Failed to generate steering files: {str(e)}")
            output["steering_generation_error"] = str(e)
            logs.append(f"Warning: Failed to generate steering files: {str(e)}")
    
    return OrchestratorResponse(
        status="success",
        action="create-project",
        project_id=project.metadata.project_id,
        output=output,
        logs="\n".join(logs)
    )


@app.get(
    "/projects",
    response_model=List[Dict[str, Any]],
    summary="List all projects",
    description="Returns a list of all projects with summary information",
)
@log_api_request("/projects", "GET")
async def list_projects() -> List[Dict[str, Any]]:
    """
    List all projects.
    
    Returns:
        List of project summaries with basic information
        
    Raises:
        ProjectManagerError: If listing projects fails
    """
    projects = project_manager.list_projects()
    return [project.to_dict() for project in projects]


@app.get(
    "/projects/{project_id}/status",
    response_model=Dict[str, Any],
    summary="Get project status",
    description="Returns detailed status information for a specific project",
)
@log_api_request("/projects/{project_id}/status", "GET")
async def get_project_status(project_id: str) -> Dict[str, Any]:
    """
    Get project status.
    
    Args:
        project_id: The project identifier
        
    Returns:
        Project status with phase, completion, and next action
        
    Raises:
        ProjectNotFoundError: If project not found
        ProjectManagerError: If status retrieval fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    project = project_manager.load_project(project_id)
    completion = project_manager.calculate_completion(project_id)
    
    # Determine next recommended action based on phase
    next_action = _determine_next_action(project.metadata.phase)
    
    return {
        "projectId": project.metadata.project_id,
        "name": project.metadata.name,
        "phase": project.metadata.phase.value,
        "completionPercentage": completion,
        "taskStats": {
            "total": project.metadata.task_stats.total,
            "completed": project.metadata.task_stats.completed,
            "inProgress": project.metadata.task_stats.in_progress,
            "pending": project.metadata.task_stats.pending,
            "failed": project.metadata.task_stats.failed,
        },
        "nextAction": next_action,
    }


@app.post(
    "/projects/{project_id}/spec/generate",
    response_model=OrchestratorResponse,
    summary="Generate spec files",
    description="Generates requirements, design, or tasks files via kiro-cli",
)
@log_api_request("/projects/{project_id}/spec/generate", "POST")
async def generate_spec(
    project_id: str,
    request: GenerateSpecRequest
) -> OrchestratorResponse:
    """
    Generate spec files (requirements, design, or tasks) for a project.
    
    Args:
        project_id: The project identifier
        request: GenerateSpecRequest with spec_type and description
        
    Returns:
        OrchestratorResponse with generation results
        
    Raises:
        ProjectNotFoundError: If project not found
        InvalidStateTransitionError: If prerequisites not met
        ValidationError: If spec_type invalid
        CLIExecutionError: If generation fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # For design and tasks, check prerequisites exist
    if request.spec_type == "design":
            # Check if requirements.md exists and is not empty
        # Check if requirements.md exists and is not empty
        try:
            requirements_content = project_manager.file_ops.read_file(project.requirements_path)
            if not requirements_content.strip():
                raise InvalidStateTransitionError(
                    f"Cannot generate design: requirements.md does not exist or is empty at {project.requirements_path}. Generate requirements first."
                )
        except Exception:
            raise InvalidStateTransitionError(
                f"Cannot generate design: requirements.md does not exist or is empty at {project.requirements_path}. Generate requirements first."
            )
    
    if request.spec_type == "tasks":
        # Check if design.md exists and is not empty
        try:
            design_content = project_manager.file_ops.read_file(project.design_path)
            if not design_content.strip():
                raise InvalidStateTransitionError(
                    f"Cannot generate tasks: design.md does not exist or is empty at {project.design_path}. Generate design first."
                )
        except Exception:
            raise InvalidStateTransitionError(
                f"Cannot generate tasks: design.md does not exist or is empty at {project.design_path}. Generate design first."
            )
    
    # Generate instruction
    instruction = instruction_generator.generate_spec_instruction(
        project_id=project_id,
        spec_dir=project.spec_dir,
        spec_type=request.spec_type,
        description=request.description or project.metadata.description
    )
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        return response_formatter.format_failure(
            action=f"generate-{request.spec_type}",
            project_id=project_id,
            error=cli_result.error or "Spec generation failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr)
        )
    
    # Update project metadata after successful generation
    now = datetime.utcnow()
    if request.spec_type == "requirements":
        project.metadata.spec_generated.requirements = now
        # Update phase to SPEC if still in INIT
        if project.metadata.phase == Phase.INIT:
            project.metadata.phase = Phase.SPEC
    elif request.spec_type == "design":
        project.metadata.spec_generated.design = now
    elif request.spec_type == "tasks":
        project.metadata.spec_generated.tasks = now
    
    # Save updated metadata
    project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response
    return response_formatter.format_success(
        action=f"generate-{request.spec_type}",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "spec_type": request.spec_type,
            "generated_at": now.isoformat(),
            "phase": project.metadata.phase.value,
        }
    )


def _determine_next_action(phase: Phase) -> str:
    """
    Determine the next recommended action based on project phase.
    
    Args:
        phase: Current project phase
        
    Returns:
        Recommended next action as a string
    """
    action_map = {
        Phase.INIT: "Generate project specifications (requirements, design, tasks)",
        Phase.SPEC: "Review specifications and begin task execution",
        Phase.BUILD: "Continue executing tasks or run build",
        Phase.TEST: "Run tests to verify implementation",
        Phase.FIX: "Fix failing tests or build issues",
        Phase.COMPLETE: "Project complete - ready for deployment",
    }
    
    return action_map.get(phase, "Unknown phase")


# File explorer endpoints (must come before /files/{file_name} to avoid route conflicts)
@app.get(
    "/projects/{project_id}/files/tree",
    response_model=Dict[str, Any],
    summary="Get project file tree",
    description="Returns the complete directory structure for a project",
)
@log_api_request("/projects/{project_id}/files/tree", "GET")
async def get_file_tree(project_id: str) -> Dict[str, Any]:
    """
    Get the file tree for a project.
    
    Args:
        project_id: The project identifier
        
    Returns:
        Dictionary with the complete directory tree
        
    Raises:
        ProjectNotFoundError: If project not found
        FileSystemError: If file system access fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists and get the project root
    project = project_manager.load_project(project_id)
    
    # Get the directory tree
    try:
        tree = file_system_service.get_directory_tree(project.project_root, max_depth=10)
        
        return {
            "projectId": project_id,
            "projectRoot": project.project_root,
            "tree": tree,
        }
    except FileSystemError as e:
        logger.error(f"Failed to get file tree for project {project_id}: {str(e)}")
        raise


@app.get(
    "/projects/{project_id}/files/content",
    response_model=Dict[str, Any],
    summary="Get file content",
    description="Returns the content of a specific file in the project",
)
@log_api_request("/projects/{project_id}/files/content", "GET")
async def get_file_content(project_id: str, file_path: str) -> Dict[str, Any]:
    """
    Get the content of a file in a project.
    
    Args:
        project_id: The project identifier
        file_path: Path to the file (relative to project root)
        
    Returns:
        Dictionary with file content and metadata
        
    Raises:
        ProjectNotFoundError: If project not found
        PathValidationError: If file path is outside project root
        FileSystemError: If file cannot be read
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Validate file_path parameter
    if not file_path or not file_path.strip():
        raise ValidationError("file_path query parameter is required")
    
    # Load the project to ensure it exists and get the project root
    project = project_manager.load_project(project_id)
    
    # Read the file content
    try:
        file_data = file_system_service.read_file_content(
            project.project_root, 
            file_path
        )
        
        # Add project context to response
        file_data["projectId"] = project_id
        
        return file_data
    except (PathValidationError, FileSystemError) as e:
        logger.error(f"Failed to read file {file_path} for project {project_id}: {str(e)}")
        raise


# Spec file endpoints
@app.get(
    "/projects/{project_id}/files/{file_name}",
    response_model=Dict[str, Any],
    summary="Read a spec file",
    description="Returns the content of a spec file with metadata",
)
@log_api_request("/projects/{project_id}/files/{file_name}", "GET")
async def read_file(project_id: str, file_name: str) -> Dict[str, Any]:
    """
    Read a spec file from a project.
    
    Args:
        project_id: The project identifier
        file_name: Name of the file to read (requirements.md, design.md, or tasks.md)
        
    Returns:
        Dictionary with file content and metadata
        
    Raises:
        ValidationError: If file name is invalid
        ProjectNotFoundError: If project not found
        FileNotFoundError: If file not found
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Validate file name
    valid_files = {
        "requirements.md": project.requirements_path,
        "design.md": project.design_path,
        "tasks.md": project.tasks_path,
    }
    
    if file_name not in valid_files:
        raise ValidationError(
            f"Invalid file name '{file_name}'. Must be one of: {', '.join(valid_files.keys())}"
        )
    
    file_path = valid_files[file_name]
    
    # Read the file content
    try:
        content = project_manager.file_ops.read_file(file_path)
    except Exception as e:
        raise FileNotFoundError(f"File '{file_name}' not found at path: {file_path}. Error: {str(e)}")
    
    # Return content with metadata
    return {
        "projectId": project_id,
        "fileName": file_name,
        "content": content,
        "metadata": {
            "projectName": project.metadata.name,
            "phase": project.metadata.phase.value,
            "updatedAt": project.metadata.updated_at.isoformat(),
        }
    }


@app.put(
    "/projects/{project_id}/files/{file_name}",
    response_model=OrchestratorResponse,
    summary="Update a spec file",
    description="Updates a spec file via kiro-cli and updates metadata",
)
@log_api_request("/projects/{project_id}/files/{file_name}", "PUT")
async def update_file(
    project_id: str,
    file_name: str,
    request: Dict[str, Any]
) -> OrchestratorResponse:
    """
    Update a spec file in a project.
    
    Args:
        project_id: The project identifier
        file_name: Name of the file to update (requirements.md, design.md, or tasks.md)
        request: Dictionary with 'content' field containing the new file content
        
    Returns:
        OrchestratorResponse with update results
        
    Raises:
        ProjectNotFoundError: If project not found
        ValidationError: If file name or content invalid
        CLIExecutionError: If update fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Validate file name
    valid_files = {
        "requirements.md": project.requirements_path,
        "design.md": project.design_path,
        "tasks.md": project.tasks_path,
    }
    
    if file_name not in valid_files:
        raise ValidationError(
            f"Invalid file name '{file_name}'. Must be one of: {', '.join(valid_files.keys())}"
        )
    
    # Extract content from request
    if "content" not in request:
        raise ValidationError("Request must include 'content' field")
    
    content = request["content"]
    if not isinstance(content, str):
        raise ValidationError("Content must be a string")
    
    file_path = valid_files[file_name]
    
    # Generate instruction for kiro-cli to update the file
    instruction = f"/tools trust-all\nUpdate the file {file_path} with the following content:\n\n{content}"
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        return response_formatter.format_failure(
            action=f"update-file-{file_name}",
            project_id=project_id,
            error=cli_result.error or "File update failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr)
        )
    
    # Update lastModified timestamp in metadata
    project.metadata.updated_at = datetime.utcnow()
    project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response
    return response_formatter.format_success(
        action=f"update-file-{file_name}",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "file_name": file_name,
            "file_path": file_path,
            "updated_at": project.metadata.updated_at.isoformat(),
        }
    )


@app.post(
    "/projects/{project_id}/tasks/execute",
    response_model=OrchestratorResponse,
    summary="Execute project tasks",
    description="Executes a specific task or all tasks in sequence via kiro-cli",
)
@log_api_request("/projects/{project_id}/tasks/execute", "POST")
async def execute_tasks(
    project_id: str,
    request: ExecuteTaskRequest
) -> OrchestratorResponse:
    """
    Execute tasks for a project.
    
    Args:
        project_id: The project identifier
        request: ExecuteTaskRequest with optional task_number
        
    Returns:
        OrchestratorResponse with execution results
        
    Raises:
        ProjectNotFoundError: If project not found
        InvalidStateTransitionError: If tasks.md not ready
        ValidationError: If task_number invalid
        CLIExecutionError: If execution fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Check if tasks.md exists and is not empty
    try:
        tasks_content = project_manager.file_ops.read_file(project.tasks_path)
        if not tasks_content.strip():
            raise InvalidStateTransitionError(
                f"Cannot execute tasks: tasks.md does not exist or is empty at {project.tasks_path}. Generate tasks first."
            )
    except Exception:
        raise InvalidStateTransitionError(
            f"Cannot execute tasks: tasks.md does not exist or is empty at {project.tasks_path}. Generate tasks first."
        )
    
    # Parse tasks.md to validate task_number if provided
    if request.task_number:
        tasks = _parse_tasks_md(tasks_content)
        if request.task_number not in tasks:
            raise ValidationError(
                f"Task '{request.task_number}' not found in tasks.md"
            )
        
        # Generate instruction for task execution
        instruction = instruction_generator.generate_task_instruction(
            project_id=project_id,
            spec_dir=project.spec_dir,
            project_root=project.project_root,
            task_number=request.task_number
        )
        
        # Execute via kiro-cli
        cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
        
        # Check if execution was successful
        if cli_result.status == "failure":
            return response_formatter.format_failure(
                action="execute-tasks",
                project_id=project_id,
                error=cli_result.error or "Task execution failed",
                logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr)
            )
        
        # Parse updated tasks.md to get task statistics
        try:
            updated_tasks_content = project_manager.file_ops.read_file(project.tasks_path)
            tasks = _parse_tasks_md(updated_tasks_content)
            
            # Calculate task statistics
            task_stats = _calculate_task_stats(tasks)
            
            # Update project metadata with task statistics
            project.metadata.task_stats.total = task_stats["total"]
            project.metadata.task_stats.completed = task_stats["completed"]
            project.metadata.task_stats.in_progress = task_stats["in_progress"]
            project.metadata.task_stats.pending = task_stats["pending"]
            project.metadata.task_stats.failed = task_stats["failed"]
            
            # Update completion percentage
            project.metadata.completion_percentage = project_manager.calculate_completion(project_id)
            
            # Update phase if all tasks are complete
            if task_stats["completed"] == task_stats["total"] and task_stats["total"] > 0:
                project.metadata.phase = Phase.COMPLETE
            elif task_stats["completed"] > 0 or task_stats["in_progress"] > 0:
                # If we have started tasks, move to BUILD phase
                if project.metadata.phase == Phase.SPEC:
                    project.metadata.phase = Phase.BUILD
            
            # Save updated metadata
            project_manager.save_metadata(project_id, project.metadata)
            
        except Exception as e:
            # Log error but don't fail the request
            print(f"Warning: Failed to update task statistics: {str(e)}")
        
        # Format success response
        return response_formatter.format_success(
            action="execute-tasks",
            project_id=project_id,
            cli_output=cli_result,
            additional_output={
                "task_number": request.task_number or "all",
                "phase": project.metadata.phase.value,
                "completion_percentage": project.metadata.completion_percentage,
                "task_stats": {
                    "total": project.metadata.task_stats.total,
                    "completed": project.metadata.task_stats.completed,
                    "inProgress": project.metadata.task_stats.in_progress,
                    "pending": project.metadata.task_stats.pending,
                    "failed": project.metadata.task_stats.failed,
                }
            }
        )
    else:
        # Execute all tasks
        instruction = instruction_generator.generate_task_instruction(
            project_id=project_id,
            spec_dir=project.spec_dir,
            project_root=project.project_root,
            task_number=None  # None means execute all
        )
        
        # Execute via kiro-cli
        cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
        
        # Check if execution was successful
        if cli_result.status == "failure":
            return response_formatter.format_failure(
                action="execute-tasks",
                project_id=project_id,
                error=cli_result.error or "Task execution failed",
                logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr)
            )
        
        # Parse updated tasks.md to get task statistics
        try:
            updated_tasks_content = project_manager.file_ops.read_file(project.tasks_path)
            tasks = _parse_tasks_md(updated_tasks_content)
            
            # Calculate task statistics
            task_stats = _calculate_task_stats(tasks)
            
            # Update project metadata with task statistics
            project.metadata.task_stats.total = task_stats["total"]
            project.metadata.task_stats.completed = task_stats["completed"]
            project.metadata.task_stats.in_progress = task_stats["in_progress"]
            project.metadata.task_stats.pending = task_stats["pending"]
            project.metadata.task_stats.failed = task_stats["failed"]
            
            # Update completion percentage
            project.metadata.completion_percentage = project_manager.calculate_completion(project_id)
            
            # Update phase if all tasks are complete
            if task_stats["completed"] == task_stats["total"] and task_stats["total"] > 0:
                project.metadata.phase = Phase.COMPLETE
            elif task_stats["completed"] > 0 or task_stats["in_progress"] > 0:
                # If we have started tasks, move to BUILD phase
                if project.metadata.phase == Phase.SPEC:
                    project.metadata.phase = Phase.BUILD
            
            # Save updated metadata
            project_manager.save_metadata(project_id, project.metadata)
            
        except Exception as e:
            # Log error but don't fail the request
            print(f"Warning: Failed to update task statistics: {str(e)}")
        
        # Format success response
        return response_formatter.format_success(
            action="execute-tasks",
            project_id=project_id,
            cli_output=cli_result,
            additional_output={
                "task_number": "all",
                "phase": project.metadata.phase.value,
                "completion_percentage": project.metadata.completion_percentage,
                "task_stats": {
                    "total": project.metadata.task_stats.total,
                    "completed": project.metadata.task_stats.completed,
                    "inProgress": project.metadata.task_stats.in_progress,
                    "pending": project.metadata.task_stats.pending,
                    "failed": project.metadata.task_stats.failed,
                }
            }
        )


def _parse_tasks_md(content: str) -> Dict[str, Dict[str, Any]]:
    """
    Parse tasks.md content to extract task information.
    
    Args:
        content: Content of tasks.md file
        
    Returns:
        Dictionary mapping task numbers to task information
    """
    import re
    
    tasks = {}
    lines = content.split('\n')
    
    for line in lines:
        # Match task lines like: - [x] 1. Task description
        # or: - [ ] 2.3 Sub-task description (note: no period after 2.3)
        # or: - [-] 3.1 Task description (in progress)
        # Pattern matches: - [ ] 1. or - [ ] 1.1 (with optional period after number)
        match = re.match(r'^-\s*\[([ x\-])\]\*?\s+(\d+(?:\.\d+)?)\.?\s+(.+)$', line.strip())
        if match:
            status_char = match.group(1)
            task_number = match.group(2)
            description = match.group(3)
            
            # Determine status from checkbox
            if status_char == 'x':
                task_status = 'completed'
            elif status_char == '-':
                task_status = 'in_progress'
            else:
                task_status = 'pending'
            
            # Check if task is optional (has * suffix in the line)
            is_optional = '*' in line and line.index('*') < line.index(task_number)
            
            tasks[task_number] = {
                'number': task_number,
                'description': description,
                'status': task_status,
                'is_optional': is_optional,
            }
    
    return tasks


def _calculate_task_stats(tasks: Dict[str, Dict[str, Any]]) -> Dict[str, int]:
    """
    Calculate task statistics from parsed tasks.
    
    Args:
        tasks: Dictionary of parsed tasks
        
    Returns:
        Dictionary with task statistics
    """
    stats = {
        'total': 0,
        'completed': 0,
        'in_progress': 0,
        'pending': 0,
        'failed': 0,
    }
    
    for task in tasks.values():
        # Count all tasks (including optional ones)
        stats['total'] += 1
        
        # Count by status
        task_status = task['status']
        if task_status == 'completed':
            stats['completed'] += 1
        elif task_status == 'in_progress':
            stats['in_progress'] += 1
        elif task_status == 'pending':
            stats['pending'] += 1
        elif task_status == 'failed':
            stats['failed'] += 1
    
    return stats


@app.post(
    "/projects/{project_id}/build",
    response_model=OrchestratorResponse,
    summary="Build project",
    description="Executes build commands for the project via kiro-cli",
)
@log_api_request("/projects/{project_id}/build", "POST")
async def build_project(project_id: str) -> OrchestratorResponse:
    """
    Build a project.
    
    Args:
        project_id: The project identifier
        
    Returns:
        OrchestratorResponse with build results and logs
        
    Raises:
        ProjectNotFoundError: If project not found
        CLIExecutionError: If build fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Generate build instruction
    instruction = instruction_generator.generate_build_instruction(project_id, project.project_root)
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        # Update phase to FIX if build fails
        project.metadata.phase = Phase.FIX
        project_manager.save_metadata(project_id, project.metadata)
        
        return response_formatter.format_failure(
            action="build",
            project_id=project_id,
            error=cli_result.error or "Build failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr),
            additional_output={
                "phase": project.metadata.phase.value,
            }
        )
    
    # Update phase to TEST after successful build
    if project.metadata.phase == Phase.BUILD:
        project.metadata.phase = Phase.TEST
        project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response
    return response_formatter.format_success(
        action="build",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "phase": project.metadata.phase.value,
        }
    )


@app.post(
    "/projects/{project_id}/test",
    response_model=OrchestratorResponse,
    summary="Run project tests",
    description="Executes all tests for the project via kiro-cli",
)
@log_api_request("/projects/{project_id}/test", "POST")
async def test_project(project_id: str) -> OrchestratorResponse:
    """
    Run tests for a project.
    
    Args:
        project_id: The project identifier
        
    Returns:
        OrchestratorResponse with test results
        
    Raises:
        ProjectNotFoundError: If project not found
        CLIExecutionError: If test execution fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Generate test instruction
    instruction = instruction_generator.generate_test_instruction(project_id, project.project_root)
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        # Update phase to FIX if tests fail
        project.metadata.phase = Phase.FIX
        project_manager.save_metadata(project_id, project.metadata)
        
        return response_formatter.format_failure(
            action="test",
            project_id=project_id,
            error=cli_result.error or "Tests failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr),
            additional_output={
                "phase": project.metadata.phase.value,
                "test_failures": _extract_test_failures(cli_result.stdout, cli_result.stderr),
            }
        )
    
    # Update phase to COMPLETE after successful tests
    if project.metadata.phase == Phase.TEST:
        project.metadata.phase = Phase.COMPLETE
        project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response
    return response_formatter.format_success(
        action="test",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "phase": project.metadata.phase.value,
        }
    )


class FixRequest(BaseModel):
    """Request model for auto-fix operations."""
    failure_details: str = Field(..., alias="failureDetails", min_length=1, max_length=10000, description="Details about the failures to fix")
    
    class Config:
        populate_by_name = True
    
    @field_validator('failure_details')
    @classmethod
    def validate_failure_details(cls, v: str) -> str:
        """Validate that failure_details is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("failure_details cannot be empty or whitespace only")
        return v.strip()


@app.post(
    "/projects/{project_id}/fix",
    response_model=OrchestratorResponse,
    summary="Auto-fix project issues",
    description="Analyzes and fixes failing tests or build issues via kiro-cli",
)
@log_api_request("/projects/{project_id}/fix", "POST")
async def fix_project(project_id: str, request: FixRequest) -> OrchestratorResponse:
    """
    Auto-fix issues in a project.
    
    Args:
        project_id: The project identifier
        request: FixRequest with failure details
        
    Returns:
        OrchestratorResponse with fix results
        
    Raises:
        ProjectNotFoundError: If project not found
        CLIExecutionError: If fix fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Generate fix instruction with failure details
    instruction = instruction_generator.generate_fix_instruction(
        project_id=project_id,
        project_root=project.project_root,
        failure_details=request.failure_details
    )
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        return response_formatter.format_failure(
            action="fix",
            project_id=project_id,
            error=cli_result.error or "Auto-fix failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr),
            additional_output={
                "phase": project.metadata.phase.value,
            }
        )
    
    # After successful fix, run tests again to verify
    test_instruction = instruction_generator.generate_test_instruction(project_id, project.project_root)
    test_result = cli_executor.execute_instruction(test_instruction, project.spec_dir, project.project_root)
    
    # Update phase based on test results
    if test_result.status == "success":
        project.metadata.phase = Phase.COMPLETE
    else:
        project.metadata.phase = Phase.FIX
    
    project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response with test results
    return response_formatter.format_success(
        action="fix",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "phase": project.metadata.phase.value,
            "retest_status": test_result.status,
            "retest_logs": response_formatter._combine_logs(test_result.stdout, test_result.stderr),
        }
    )


def _extract_test_failures(stdout: str, stderr: str) -> List[Dict[str, str]]:
    """
    Extract test failure information from test output.
    
    Args:
        stdout: Standard output from test execution
        stderr: Standard error from test execution
        
    Returns:
        List of test failures with details
    """
    import re
    
    failures = []
    combined_output = stdout + "\n" + stderr
    
    # Pattern for pytest failures
    pytest_pattern = r"FAILED\s+(.+?)\s+-\s+(.+)"
    for match in re.finditer(pytest_pattern, combined_output):
        failures.append({
            "test": match.group(1).strip(),
            "reason": match.group(2).strip(),
        })
    
    # Pattern for generic test failures
    generic_pattern = r"(?:Error|Failed|Failure):\s*(.+)"
    if not failures:
        for match in re.finditer(generic_pattern, combined_output, re.IGNORECASE):
            failures.append({
                "test": "unknown",
                "reason": match.group(1).strip(),
            })
    
    return failures


class CustomInstructionRequest(BaseModel):
    """Request model for custom instruction execution."""
    instruction: str = Field(..., min_length=1, max_length=50000, description="Custom instruction to execute via kiro-cli")
    
    @field_validator('instruction')
    @classmethod
    def validate_instruction(cls, v: str) -> str:
        """Validate that instruction is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("instruction cannot be empty or whitespace only")
        return v.strip()


@app.post(
    "/projects/{project_id}/custom",
    response_model=OrchestratorResponse,
    summary="Execute custom instruction",
    description="Executes a custom user-provided instruction via kiro-cli",
)
@log_api_request("/projects/{project_id}/custom", "POST")
async def execute_custom_instruction(
    project_id: str,
    request: CustomInstructionRequest
) -> OrchestratorResponse:
    """
    Execute a custom instruction for a project.
    
    This endpoint allows users to provide their own instructions directly
    instead of using the pre-defined instruction templates.
    
    Args:
        project_id: The project identifier
        request: CustomInstructionRequest with the instruction text
        
    Returns:
        OrchestratorResponse with execution results
        
    Raises:
        ProjectNotFoundError: If project not found
        ValidationError: If instruction is invalid
        CLIExecutionError: If execution fails
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Prepend /tools trust-all if not already present
    instruction = request.instruction
    if not instruction.startswith("/tools trust-all"):
        instruction = "/tools trust-all\n" + instruction
    
    # Execute via kiro-cli
    cli_result = cli_executor.execute_instruction(instruction, project.spec_dir, project.project_root)
    
    # Check if execution was successful
    if cli_result.status == "failure":
        return response_formatter.format_failure(
            action="custom-instruction",
            project_id=project_id,
            error=cli_result.error or "Custom instruction execution failed",
            logs=response_formatter._combine_logs(cli_result.stdout, cli_result.stderr)
        )
    
    # Update project metadata timestamp
    project.metadata.updated_at = datetime.utcnow()
    project_manager.save_metadata(project_id, project.metadata)
    
    # Format success response
    return response_formatter.format_success(
        action="custom-instruction",
        project_id=project_id,
        cli_output=cli_result,
        additional_output={
            "instruction_length": len(request.instruction),
            "updated_at": project.metadata.updated_at.isoformat(),
        }
    )


# Steering file endpoints
@app.post(
    "/projects/{project_id}/steering/generate",
    response_model=OrchestratorResponse,
    summary="Generate steering files",
    description="Generates steering files (product.md, tech.md, structure.md) for a project",
)
@log_api_request("/projects/{project_id}/steering/generate", "POST")
async def generate_steering(
    project_id: str,
    request: GenerateSteeringRequest
) -> OrchestratorResponse:
    """
    Generate steering files for a project.
    
    Args:
        project_id: The project identifier
        request: GenerateSteeringRequest with force flag
        
    Returns:
        OrchestratorResponse with generation results
        
    Raises:
        ProjectNotFoundError: If project not found
        SteeringGeneratorError: If generation fails
    """
    logger = get_logger()
    
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    try:
        # Generate steering files
        result = steering_generator.generate_all(project, force=request.force)
        
        # Handle skipped files
        if result.get("status") == "skipped":
            return OrchestratorResponse(
                status="success",
                action="generate-steering",
                project_id=project_id,
                output={
                    "message": result.get("message", "All steering files already exist. Use force=true to overwrite."),
                    "files_generated": [],
                    "files_skipped": list(result.get("files", {}).keys())
                },
                logs=result.get("logs", "Steering files already exist. No files generated.")
            )
        
        # Handle successful generation
        generated_files = result.get("files", {})
        if not generated_files:
            # No files were generated
            return OrchestratorResponse(
                status="failure",
                action="generate-steering",
                project_id=project_id,
                output={
                    "error": {
                        "code": "NO_FILES_GENERATED",
                        "message": result.get("error", "No steering files were generated"),
                        "details": {}
                    }
                },
                logs=result.get("logs", "")
            )
        
        logger.info(f"Generated {len(generated_files)} steering files for project '{project_id}'")
        
        return OrchestratorResponse(
            status="success",
            action="generate-steering",
            project_id=project_id,
            output={
                "message": f"Successfully generated {len(generated_files)} steering file(s)",
                "files_generated": list(generated_files.keys()),
                "file_paths": generated_files
            },
            logs=result.get("logs", f"Generated steering files: {', '.join(generated_files.keys())}")
        )
        
    except SteeringGeneratorError as e:
        logger.error(f"Failed to generate steering files for project '{project_id}': {str(e)}")
        return OrchestratorResponse(
            status="failure",
            action="generate-steering",
            project_id=project_id,
            output={
                "error": {
                    "code": "STEERING_GENERATION_ERROR",
                    "message": str(e),
                    "details": {}
                }
            },
            logs=f"Steering generation failed: {str(e)}"
        )


@app.get(
    "/projects/{project_id}/steering/files",
    response_model=Dict[str, Any],
    summary="List steering files",
    description="Returns a list of all steering files for a project",
)
@log_api_request("/projects/{project_id}/steering/files", "GET")
async def list_steering_files(project_id: str) -> Dict[str, Any]:
    """
    List all steering files for a project.
    
    Args:
        project_id: The project identifier
        
    Returns:
        Dictionary with list of steering files and their metadata
        
    Raises:
        ProjectNotFoundError: If project not found
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Get steering directory
    steering_dir = steering_generator._get_steering_dir(project.project_root)
    
    # Check if steering directory exists
    if not project_manager.file_ops.directory_exists(str(steering_dir)):
        return {
            "projectId": project_id,
            "files": [],
            "message": "No steering files found. Generate them first."
        }
    
    # List all markdown files in steering directory
    try:
        all_files = project_manager.file_ops.list_directory(str(steering_dir))
        steering_files = [f for f in all_files if f.endswith('.md')]
        
        # Get metadata for each file
        files_info = []
        for file_name in steering_files:
            file_path = steering_dir / file_name
            try:
                size = project_manager.file_ops.get_file_size(str(file_path))
                files_info.append({
                    "fileName": file_name,
                    "filePath": str(file_path),
                    "exists": True,
                    "size": size
                })
            except Exception as e:
                files_info.append({
                    "fileName": file_name,
                    "filePath": str(file_path),
                    "exists": False,
                    "error": str(e)
                })
        
        return {
            "projectId": project_id,
            "files": files_info,
            "count": len(files_info)
        }
        
    except Exception as e:
        return {
            "projectId": project_id,
            "files": [],
            "error": str(e)
        }


@app.get(
    "/projects/{project_id}/steering/files/{file_name}",
    response_model=Dict[str, Any],
    summary="Read a steering file",
    description="Returns the content of a steering file",
)
@log_api_request("/projects/{project_id}/steering/files/{file_name}", "GET")
async def read_steering_file(project_id: str, file_name: str) -> Dict[str, Any]:
    """
    Read a steering file from a project.
    
    Args:
        project_id: The project identifier
        file_name: Name of the steering file to read (e.g., product.md, tech.md, structure.md)
        
    Returns:
        Dictionary with file content and metadata
        
    Raises:
        ValidationError: If file name is invalid
        ProjectNotFoundError: If project not found
        FileNotFoundError: If file not found
    """
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Validate file name (must be .md file)
    if not file_name.endswith('.md'):
        raise ValidationError(f"Invalid file name '{file_name}'. Must be a markdown file (.md)")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Get steering directory and file path
    steering_dir = steering_generator._get_steering_dir(project.project_root)
    file_path = steering_dir / file_name
    
    # Read the file content
    try:
        content = project_manager.file_ops.read_file(str(file_path))
        size = project_manager.file_ops.get_file_size(str(file_path))
    except Exception as e:
        raise FileNotFoundError(
            f"Steering file '{file_name}' not found at path: {file_path}. Error: {str(e)}"
        )
    
    # Return content with metadata
    return {
        "projectId": project_id,
        "fileName": file_name,
        "content": content,
        "metadata": {
            "projectName": project.metadata.name,
            "size": size,
            "filePath": str(file_path)
        }
    }


@app.put(
    "/projects/{project_id}/steering/files/{file_name}",
    response_model=OrchestratorResponse,
    summary="Update a steering file",
    description="Updates the content of a steering file",
)
@log_api_request("/projects/{project_id}/steering/files/{file_name}", "PUT")
async def update_steering_file(
    project_id: str,
    file_name: str,
    request: UpdateSteeringFileRequest
) -> OrchestratorResponse:
    """
    Update a steering file for a project.
    
    Args:
        project_id: The project identifier
        file_name: Name of the steering file to update
        request: UpdateSteeringFileRequest with new content
        
    Returns:
        OrchestratorResponse with update results
        
    Raises:
        ValidationError: If file name is invalid
        ProjectNotFoundError: If project not found
        FileNotFoundError: If file not found
    """
    logger = get_logger()
    
    # Validate project_id
    if not project_id or not project_id.strip():
        raise ValidationError("project_id cannot be empty")
    
    # Validate file name (must be .md file)
    if not file_name.endswith('.md'):
        raise ValidationError(f"Invalid file name '{file_name}'. Must be a markdown file (.md)")
    
    # Load the project to ensure it exists
    project = project_manager.load_project(project_id)
    
    # Get steering directory and file path
    steering_dir = steering_generator._get_steering_dir(project.project_root)
    file_path = steering_dir / file_name
    
    # Check if file exists
    if not project_manager.file_ops.file_exists(str(file_path)):
        raise FileNotFoundError(
            f"Steering file '{file_name}' not found at path: {file_path}. Generate steering files first."
        )
    
    try:
        # Write the updated content
        project_manager.file_ops.write_file(str(file_path), request.content)
        
        logger.info(f"Updated steering file '{file_name}' for project '{project_id}'")
        
        return OrchestratorResponse(
            status="success",
            action="update-steering-file",
            project_id=project_id,
            output={
                "message": f"Successfully updated {file_name}",
                "fileName": file_name,
                "filePath": str(file_path),
                "size": len(request.content)
            },
            logs=f"Updated steering file: {file_name}"
        )
        
    except Exception as e:
        logger.error(f"Failed to update steering file '{file_name}' for project '{project_id}': {str(e)}")
        return OrchestratorResponse(
            status="failure",
            action="update-steering-file",
            project_id=project_id,
            output={
                "error": {
                    "code": "FILE_UPDATE_ERROR",
                    "message": str(e),
                    "details": {
                        "fileName": file_name,
                        "filePath": str(file_path)
                    }
                }
            },
            logs=f"Failed to update steering file: {str(e)}"
        )


# Health check endpoint
@app.get(
    "/health",
    summary="Health check",
    description="Returns the health status of the orchestrator",
)
@log_api_request("/health", "GET")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns:
        Health status
    """
    return {"status": "healthy", "service": "kiro-project-orchestrator"}
