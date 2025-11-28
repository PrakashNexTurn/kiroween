"""Data models for the Kiro Project Orchestrator."""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class Phase(str, Enum):
    """Project lifecycle phases."""
    INIT = "INIT"
    SPEC = "SPEC"
    BUILD = "BUILD"
    TEST = "TEST"
    FIX = "FIX"
    COMPLETE = "COMPLETE"


class SpecGenerated(BaseModel):
    """Timestamps for spec file generation."""
    requirements: Optional[datetime] = None
    design: Optional[datetime] = None
    tasks: Optional[datetime] = None


class TaskStats(BaseModel):
    """Statistics about task completion."""
    total: int = 0
    completed: int = 0
    in_progress: int = 0
    pending: int = 0
    failed: int = 0


class BuildConfig(BaseModel):
    """Build and test configuration."""
    model_config = ConfigDict(populate_by_name=True)
    
    build_command: Optional[str] = Field(None, alias="buildCommand")
    test_command: Optional[str] = Field(None, alias="testCommand")
    language: Optional[str] = None


class ProjectMetadata(BaseModel):
    """Project metadata stored in project.json."""
    model_config = ConfigDict(populate_by_name=True)
    
    project_id: str = Field(..., alias="projectId")
    name: str
    description: str
    phase: Phase
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")
    spec_generated: SpecGenerated = Field(default_factory=SpecGenerated, alias="specGenerated")
    task_stats: TaskStats = Field(default_factory=TaskStats, alias="taskStats")
    build_config: BuildConfig = Field(default_factory=BuildConfig, alias="buildConfig")
    completion_percentage: float = Field(0.0, alias="completionPercentage")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON serialization."""
        return self.model_dump(by_alias=True, mode='json')

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProjectMetadata":
        """Create from dictionary with camelCase keys."""
        return cls.model_validate(data)


class Project(BaseModel):
    """Complete project representation including metadata and file paths."""
    metadata: ProjectMetadata
    project_root: str  # <base_path>/<project_id>/
    spec_dir: str  # <base_path>/<project_id>/.kiro/specs/
    project_path: str  # Deprecated: kept for backward compatibility
    requirements_path: str
    design_path: str
    tasks_path: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "metadata": self.metadata.to_dict(),
            "project_root": self.project_root,
            "spec_dir": self.spec_dir,
            "project_path": self.project_path,
            "requirements_path": self.requirements_path,
            "design_path": self.design_path,
            "tasks_path": self.tasks_path,
        }


class Task(BaseModel):
    """Individual task from tasks.md."""
    number: str
    description: str
    status: str  # "pending", "in_progress", "completed", "failed"
    is_optional: bool
    requirements_refs: List[str] = Field(default_factory=list)
    parent: Optional[str] = None
    subtasks: List[str] = Field(default_factory=list)


class ExecutionResult(BaseModel):
    """Result of task execution."""
    task_number: str
    status: str  # "success", "failure"
    duration_seconds: float
    logs: str
    files_modified: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class CLIResult(BaseModel):
    """Result from kiro-cli execution."""
    status: str  # "success", "failure"
    stdout: str
    stderr: str
    exit_code: int
    files_modified: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class OrchestratorResponse(BaseModel):
    """Standard API response format."""
    model_config = ConfigDict(populate_by_name=True)
    
    status: str  # "success" | "failure"
    action: str
    project_id: str = Field(..., alias="projectId")
    output: Dict[str, Any]
    logs: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON serialization."""
        return self.model_dump(by_alias=True, mode='json')

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OrchestratorResponse":
        """Create from dictionary with camelCase keys."""
        return cls.model_validate(data)


class ProjectSummary(BaseModel):
    """Summary information for project listing."""
    model_config = ConfigDict(populate_by_name=True)
    
    project_id: str = Field(..., alias="projectId")
    name: str
    description: str
    phase: Phase
    completion_percentage: float = Field(..., alias="completionPercentage")
    updated_at: datetime = Field(..., alias="updatedAt")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with camelCase keys for JSON serialization."""
        return self.model_dump(by_alias=True, mode='json')
