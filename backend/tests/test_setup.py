"""Basic test to verify project setup."""


def test_imports():
    """Verify core dependencies can be imported."""
    import fastapi
    import pydantic
    import pytest
    import hypothesis
    
    assert fastapi is not None
    assert pydantic is not None
    assert pytest is not None
    assert hypothesis is not None


def test_project_structure():
    """Verify project structure exists."""
    import os
    
    assert os.path.exists("src")
    assert os.path.exists("tests")
    assert os.path.exists("tests/unit")
    assert os.path.exists("tests/property")
    assert os.path.exists("tests/integration")
    assert os.path.exists("pyproject.toml")
    assert os.path.exists("requirements.txt")
