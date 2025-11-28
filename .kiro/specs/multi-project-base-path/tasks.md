# Implementation Plan

- [x] 1. Update configuration to support base path





  - Modify `src/config.py` to handle `KIRO_BASE_PATH` as the root for all projects
  - Update `.env.example` with new `KIRO_BASE_PATH` configuration and documentation
  - Add validation for base path existence and permissions
  - Update `get_log_file_path()` to use base path correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_


- [x] 2. Modify ProjectManager path construction





  - Add `_get_project_root()` method to return `<base_path>/<project_id>/`
  - Add `_get_spec_dir()` method to return `<base_path>/<project_id>/.kiro/specs/`
  - Update `create_project()` to create new directory structure
  - Update `load_project()` to use new path construction
  - Update `list_projects()` to scan base path for project directories
  - Update `save_metadata()` to use new path structure
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 4.5_

- [ ]* 2.1 Write property test for path construction
  - **Property 2: Path construction consistency**
  - **Validates: Requirements 1.5, 4.4**

- [ ]* 2.2 Write property test for project creation
  - **Property 3: Project directory structure creation**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ]* 2.3 Write property test for project discovery
  - **Property 4: Project discovery completeness**
  - **Validates: Requirements 2.5**


- [x] 3. Update Project model





  - Add `project_root` field to `Project` dataclass
  - Add `spec_dir` field to `Project` dataclass
  - Update all references to use new fields
  - Ensure backward compatibility with existing code
  - _Requirements: 2.1, 2.2, 2.3_

-

- [x] 4. Update InstructionGenerator for new paths




  - Modify `generate_spec_instruction()` to use `<base_path>/<project_id>/.kiro/specs/` in instructions
  - Modify `generate_task_instruction()` to reference project root as working directory
  - Update `generate_build_instruction()` to reference project root
  - Update `generate_test_instruction()` to reference project root
  - Update `generate_fix_instruction()` to reference project root
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.1 Write property test for instruction generation
  - **Property 5: Instruction path correctness**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**


- [x] 5. Update CLI executor working directory



  - Modify `cli_executor.py` to set working directory to project root
  - Ensure kiro-cli executes in `<base_path>/<project_id>/` context
  - Update any path references in CLI execution
  - _Requirements: 2.4, 3.2_



- [x] 6. Update logging to include full paths




  - Review all log statements in `project_manager.py`
  - Ensure path-related logs include full resolved paths
  - Update error messages to include expected paths
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 6.1 Write property test for logging paths
  - **Property 7: Logging path completeness**
  - **Validates: Requirements 5.5**


- [x] 7. Update API endpoints for path handling





  - Review all endpoints in `src/app.py` that reference paths
  - Ensure error responses include correct path information
  - Update file read/write operations to use new structure
  - Test backward compatibility with base path set to "."
  - _Requirements: 4.1, 4.2, 4.3, 5.2, 5.3_


- [x] 8. Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.


- [ ]* 9. Write integration tests
  - Test end-to-end project creation with custom base path
  - Test project listing across multiple projects
  - Test backward compatibility with base path "."
  - Test error handling for invalid paths
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.5, 4.1, 4.2_


- [x] 10. Update documentation





  - Update README.md with new base path configuration
  - Update USAGE.md with examples of multi-project structure
  - Document migration steps for existing projects
  - Add examples to `.env.example` with comments
  - _Requirements: 1.1, 1.2, 4.2, 4.3_
