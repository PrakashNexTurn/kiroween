"""Steering file generator for Kiro projects."""

from pathlib import Path
from typing import Dict
from datetime import datetime

from src.models import Project, ProjectMetadata
from src.file_ops import FileOperations, FileOperationError
from src.logger import get_logger, log_operation


class SteeringGeneratorError(Exception):
    """Base exception for steering generator errors."""
    pass


class SteeringGenerator:
    """Generates steering files for AI assistants with project-specific context."""

    def __init__(self):
        """Initialize the SteeringGenerator."""
        self.file_ops = FileOperations()
        self.logger = get_logger()

    def _get_steering_dir(self, project_root: str) -> Path:
        """
        Get the steering directory path for a project.

        Args:
            project_root: The project root directory

        Returns:
            Path to steering directory: <project_root>/.kiro/steering/
        """
        return Path(project_root) / ".kiro" / "steering"

    def generate_product_md(self, project: Project) -> str:
        """
        Generate product.md content with project overview and purpose.

        Args:
            project: The project object containing metadata

        Returns:
            Generated markdown content for product.md
        """
        metadata = project.metadata
        
        content = f"""# Product Overview

**{metadata.name}** is a software project managed through Kiro's Ghost orchestrator.

## Project Information

- **Project ID**: {metadata.project_id}
- **Description**: {metadata.description}
- **Phase**: {metadata.phase.value}
- **Created**: {metadata.created_at.strftime('%Y-%m-%d')}
- **Last Updated**: {metadata.updated_at.strftime('%Y-%m-%d')}

## Purpose

{metadata.description}

## Current Status

- **Completion**: {metadata.completion_percentage}%
- **Phase**: {metadata.phase.value}
- **Total Tasks**: {metadata.task_stats.total}
- **Completed Tasks**: {metadata.task_stats.completed}

## Project Goals

[Add your project goals and objectives here]

## Target Audience

[Define your target users and stakeholders here]

## Success Criteria

[Define what success looks like for this project]
"""
        return content

    def generate_tech_md(self, project: Project) -> str:
        """
        Generate tech.md content with technology stack and common commands.

        Args:
            project: The project object containing metadata

        Returns:
            Generated markdown content for tech.md
        """
        metadata = project.metadata
        build_config = metadata.build_config
        
        # Determine language if available
        language_section = ""
        if build_config.language:
            language_section = f"\n- **Primary Language**: {build_config.language}"
        
        # Build commands section
        build_commands = ""
        if build_config.build_command:
            build_commands += f"\n```bash\n# Build\n{build_config.build_command}\n```\n"
        
        if build_config.test_command:
            build_commands += f"\n```bash\n# Test\n{build_config.test_command}\n```\n"
        
        if not build_commands:
            build_commands = "\n[Add your build and test commands here]\n"
        
        content = f"""# Technology Stack

## Core Technologies
{language_section}

[Add your technology stack details here]

## Dependencies

[List major dependencies and frameworks]

## Development Tools

[List development tools, linters, formatters, etc.]

## Common Commands
{build_commands}

## Environment Setup

[Document environment variables and configuration]

## Architecture Patterns

[Document architectural patterns and conventions used in this project]

## Testing Strategy

[Document testing approach and frameworks]
"""
        return content

    def generate_structure_md(self, project: Project) -> str:
        """
        Generate structure.md content with project directory structure and conventions.

        Args:
            project: The project object containing metadata

        Returns:
            Generated markdown content for structure.md
        """
        metadata = project.metadata
        
        content = f"""# Project Structure

## Directory Organization

```
{metadata.project_id}/
├── .kiro/
│   ├── specs/
│   │   ├── project.json       # Project metadata
│   │   ├── requirements.md    # Requirements specification
│   │   ├── design.md          # Design document
│   │   └── tasks.md           # Task list
│   └── steering/
│       ├── product.md         # Product overview
│       ├── tech.md            # Technology stack
│       └── structure.md       # This file
└── [Your project files]
```

## Naming Conventions

### Files
- Use descriptive names that reflect the file's purpose
- Follow language-specific conventions

### Directories
- Use lowercase with hyphens for multi-word names
- Group related files together

### Code
- Follow language-specific style guides
- Use consistent naming patterns throughout the project

## Code Organization

[Document how code is organized in your project]

## Configuration Files

[List and explain configuration files]

## Documentation

- Project documentation is in the `.kiro/specs/` directory
- Steering files provide AI context in `.kiro/steering/`
- [Add additional documentation locations]

## Build Artifacts

[Document where build outputs are stored]

## Best Practices

[Document project-specific best practices and conventions]
"""
        return content

    @log_operation("generate_all_steering_files")
    def generate_all(self, project: Project, force: bool = False) -> Dict[str, str]:
        """
        Generate all steering files for a project.

        Args:
            project: The project object containing metadata
            force: If True, overwrite existing files. If False, skip existing files.

        Returns:
            Dictionary mapping file names to their paths

        Raises:
            SteeringGeneratorError: If generation fails
        """
        steering_dir = self._get_steering_dir(project.project_root)
        
        try:
            # Create steering directory if it doesn't exist
            self.file_ops.create_directory(str(steering_dir))
            
            # Define files to generate
            files_to_generate = {
                "product.md": self.generate_product_md(project),
                "tech.md": self.generate_tech_md(project),
                "structure.md": self.generate_structure_md(project),
            }
            
            generated_files = {}
            skipped_files = []
            
            for filename, content in files_to_generate.items():
                file_path = steering_dir / filename
                
                # Check if file exists and force is False
                if not force and self.file_ops.file_exists(str(file_path)):
                    skipped_files.append(filename)
                    self.logger.info(f"Skipping existing file: {filename}")
                    continue
                
                # Write the file
                self.file_ops.write_file(str(file_path), content)
                generated_files[filename] = str(file_path)
                self.logger.info(f"Generated steering file: {filename}")
            
            if skipped_files:
                self.logger.info(
                    f"Skipped {len(skipped_files)} existing files. "
                    f"Use force=True to overwrite: {', '.join(skipped_files)}"
                )
            
            return generated_files
            
        except FileOperationError as e:
            raise SteeringGeneratorError(
                f"Failed to generate steering files for project '{project.metadata.project_id}': {str(e)}"
            ) from e
        except Exception as e:
            raise SteeringGeneratorError(
                f"Unexpected error generating steering files: {str(e)}"
            ) from e
