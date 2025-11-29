# Bug Fixes Needed - Project Enhancements

## Priority 1: Critical Bugs
None identified.

## Priority 2: High Priority Bugs

### Bug #1: Steering Generation Tests Failing
**Status**: Known Limitation
**Component**: Backend - Steering Generator
**Description**: Tests fail because kiro-cli is not installed in test environment
**Impact**: 6 test failures
**Root Cause**: Tests expect actual kiro-cli execution

**Solution Options**:
1. **Mock kiro-cli in tests** (Recommended)
   - Create mock CLIExecutor for tests
   - Return fake steering file content
   - Update tests to use mocked version

2. **Fallback generation without kiro-cli**
   - Implement template-based generation
   - Use when kiro-cli is not available
   - Less sophisticated but functional

3. **Mark as integration tests**
   - Require kiro-cli for these tests
   - Skip in unit test runs
   - Run separately in CI/CD with kiro-cli installed

**Recommendation**: Option 1 (Mock kiro-cli in tests)

### Bug #2: File Explorer Response Validation Errors
**Status**: Needs Investigation
**Component**: Backend - File Explorer Endpoints
**Description**: Pydantic validation errors when returning file tree and content
**Impact**: 2 test failures
**Error**: "4 validation errors"

**Investigation Needed**:
1. Check response model definitions
2. Verify endpoint return types match models
3. Ensure all required fields are present
4. Check field types match expectations

**Files to Review**:
- `backend/src/app.py` (file explorer endpoints)
- `backend/src/models.py` (response models)
- `backend/tests/unit/test_file_explorer_endpoints.py`

## Priority 3: Medium Priority Bugs

### Bug #3: Missing taskStatus Tool Reference
**Status**: Minor Issue
**Component**: Backend - Instruction Generator
**Description**: Generated instructions don't include taskStatus tool reference
**Impact**: 1 test failure
**Test**: `test_generate_task_instruction_specific_task`

**Fix**: Update instruction template in `backend/src/instruction_generator.py`
```python
# Add to instruction template:
"Use the taskStatus tool to update task status as you work."
```

### Bug #4: Response Format Mismatch in Project Creation
**Status**: Partially Fixed
**Component**: Backend - Project Creation with Steering
**Description**: Test expects 3 items in files_generated but gets 4 keys (status, files, logs, error)
**Impact**: 1 test failure

**Status**: Already fixed in `backend/src/app.py` - test may need update or rerun

## Priority 4: Low Priority Issues

### Issue #1: Pydantic Deprecation Warnings
**Status**: Technical Debt
**Component**: Backend - Models
**Description**: Using deprecated class-based config instead of ConfigDict
**Impact**: 7 warnings

**Fix**: Update all Pydantic models to use ConfigDict
```python
# Old style:
class Config:
    populate_by_name = True

# New style:
model_config = ConfigDict(populate_by_name=True)
```

### Issue #2: HTTPX Deprecation Warnings
**Status**: Technical Debt
**Component**: Backend - Tests
**Description**: Using deprecated 'app' shortcut in test client
**Impact**: 67 warnings

**Fix**: Update test client creation
```python
# Old style:
client = TestClient(app)

# New style:
from httpx import WSGITransport
client = TestClient(transport=WSGITransport(app=app))
```

## Testing Gaps

### Gap #1: Browser Compatibility
**Status**: Not Tested
**Browsers Needed**:
- Firefox
- Safari
- Mobile browsers (iOS Safari, Android Chrome)

### Gap #2: Mobile Device Testing
**Status**: Not Tested
**Devices Needed**:
- iPhone (various sizes)
- iPad
- Android phones
- Android tablets

### Gap #3: Performance Testing
**Status**: Limited Testing
**Scenarios Needed**:
- Projects with 1000+ files
- Files larger than 1MB
- Deep directory structures (>10 levels)
- Concurrent user operations

### Gap #4: Security Testing
**Status**: Not Tested
**Tests Needed**:
- Path traversal attacks
- XSS in user inputs
- CSRF protection
- Input validation
- File upload security

### Gap #5: Accessibility Testing
**Status**: Partial
**Tests Needed**:
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode
- Color blindness simulation

## Recommended Fix Order

1. **Mock kiro-cli in tests** (Bug #1) - Unblocks test suite
2. **Investigate file explorer validation** (Bug #2) - Affects core functionality
3. **Add taskStatus tool reference** (Bug #3) - Quick fix
4. **Update Pydantic models** (Issue #1) - Remove warnings
5. **Update test client** (Issue #2) - Remove warnings
6. **Browser testing** (Gap #1) - Before production
7. **Mobile testing** (Gap #2) - Before production
8. **Security audit** (Gap #4) - Before production

## Estimated Effort

- **Bug #1**: 2-4 hours (create mocks, update tests)
- **Bug #2**: 1-3 hours (investigation + fix)
- **Bug #3**: 30 minutes (simple template update)
- **Issue #1**: 1-2 hours (update all models)
- **Issue #2**: 30 minutes (update test setup)
- **Browser testing**: 2-4 hours (manual testing)
- **Mobile testing**: 2-4 hours (manual testing)
- **Security audit**: 4-8 hours (comprehensive review)

**Total Estimated Effort**: 13-26 hours

## Notes

- Most issues are test-related, not production bugs
- Core functionality works correctly in manual testing
- No critical bugs blocking deployment to staging
- Recommended to fix test issues before production deployment
