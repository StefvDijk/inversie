"""
Pytest fixtures for the autonomous coding agent tests.
"""

import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def temp_project_dir():
    """Create a temporary project directory for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        project_dir = Path(tmpdir)
        yield project_dir


@pytest.fixture
def mock_prompts_dir(temp_project_dir):
    """Create a mock prompts directory with test files."""
    prompts_dir = temp_project_dir / "prompts"
    prompts_dir.mkdir(parents=True, exist_ok=True)

    # Create a mock app_spec.txt
    app_spec = prompts_dir / "app_spec.txt"
    app_spec.write_text("<project_specification>\nTest spec content\n</project_specification>")

    return prompts_dir
