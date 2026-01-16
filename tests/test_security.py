"""
Security Hook Tests
===================

Tests for the bash command security validation logic.
Converted to pytest format for CI integration.
"""

import sys
from pathlib import Path

import pytest

# Add the parent directory to the path so we can import security module
sys.path.insert(0, str(Path(__file__).parent.parent))

from security import (
    bash_security_hook,
    extract_commands,
    validate_chmod_command,
    validate_init_script,
)


class TestExtractCommands:
    """Test the command extraction logic."""

    @pytest.mark.parametrize(
        "cmd,expected",
        [
            ("ls -la", ["ls"]),
            ("npm install && npm run build", ["npm", "npm"]),
            ("cat file.txt | grep pattern", ["cat", "grep"]),
            ("/usr/bin/node script.js", ["node"]),
            ("VAR=value ls", ["ls"]),
            ("git status || git init", ["git", "git"]),
        ],
    )
    def test_extract_commands(self, cmd, expected):
        """Test command extraction for various shell patterns."""
        result = extract_commands(cmd)
        assert result == expected, f"Expected {expected}, got {result}"


class TestValidateChmod:
    """Test chmod command validation."""

    @pytest.mark.parametrize(
        "cmd,should_allow,description",
        [
            # Allowed cases
            ("chmod +x init.sh", True, "basic +x"),
            ("chmod +x script.sh", True, "+x on any script"),
            ("chmod u+x init.sh", True, "user +x"),
            ("chmod a+x init.sh", True, "all +x"),
            ("chmod ug+x init.sh", True, "user+group +x"),
            ("chmod +x file1.sh file2.sh", True, "multiple files"),
            # Blocked cases
            ("chmod 777 init.sh", False, "numeric mode"),
            ("chmod 755 init.sh", False, "numeric mode 755"),
            ("chmod +w init.sh", False, "write permission"),
            ("chmod +r init.sh", False, "read permission"),
            ("chmod -x init.sh", False, "remove execute"),
            ("chmod -R +x dir/", False, "recursive flag"),
            ("chmod --recursive +x dir/", False, "long recursive flag"),
            ("chmod +x", False, "missing file"),
        ],
    )
    def test_validate_chmod(self, cmd, should_allow, description):
        """Test chmod command validation for various patterns."""
        allowed, reason = validate_chmod_command(cmd)
        assert (
            allowed == should_allow
        ), f"{description}: expected {'allowed' if should_allow else 'blocked'}, got {'allowed' if allowed else 'blocked'}. Reason: {reason}"


class TestValidateInitScript:
    """Test init.sh script execution validation."""

    @pytest.mark.parametrize(
        "cmd,should_allow,description",
        [
            # Allowed cases
            ("./init.sh", True, "basic ./init.sh"),
            ("./init.sh arg1 arg2", True, "with arguments"),
            ("/path/to/init.sh", True, "absolute path"),
            ("../dir/init.sh", True, "relative path with init.sh"),
            # Blocked cases
            ("./setup.sh", False, "different script name"),
            ("./init.py", False, "python script"),
            ("bash init.sh", False, "bash invocation"),
            ("sh init.sh", False, "sh invocation"),
            ("./malicious.sh", False, "malicious script"),
            ("./init.sh; rm -rf /", False, "command injection attempt"),
        ],
    )
    def test_validate_init_script(self, cmd, should_allow, description):
        """Test init.sh script validation for various patterns."""
        allowed, reason = validate_init_script(cmd)
        assert (
            allowed == should_allow
        ), f"{description}: expected {'allowed' if should_allow else 'blocked'}, got {'allowed' if allowed else 'blocked'}. Reason: {reason}"


class TestSecurityHook:
    """Test the main security hook integration."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "command",
        [
            # Dangerous system commands not in allowlist
            "shutdown now",
            "reboot",
            "dd if=/dev/zero of=/dev/sda",
            # Commands not in allowlist
            "wget https://example.com",
            "python app.py",
            "killall node",
            # pkill with non-dev processes
            "pkill bash",
            "pkill chrome",
            "pkill python",
            # Shell injection attempts
            "$(echo pkill) node",
            'eval "pkill node"',
            # chmod with disallowed modes
            "chmod 777 file.sh",
            "chmod 755 file.sh",
            "chmod +w file.sh",
            "chmod -R +x dir/",
            # Non-init.sh scripts
            "./setup.sh",
            "./malicious.sh",
        ],
    )
    async def test_blocked_commands(self, command):
        """Test that dangerous commands are blocked."""
        input_data = {"tool_name": "Bash", "tool_input": {"command": command}}
        result = await bash_security_hook(input_data)
        assert result.get("decision") == "block", f"Expected command to be blocked: {command}"

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "command",
        [
            # File inspection
            "ls -la",
            "cat README.md",
            "head -100 file.txt",
            "tail -20 log.txt",
            "wc -l file.txt",
            "grep -r pattern src/",
            # File operations
            "cp file1.txt file2.txt",
            "mkdir newdir",
            "mkdir -p path/to/dir",
            "touch file.txt",
            "rm file.txt",
            # Directory
            "pwd",
            # Output
            "echo hello",
            # Node.js development
            "npm install",
            "npm run build",
            "node server.js",
            # Version control
            "git status",
            "git commit -m 'test'",
            "git add . && git commit -m 'msg'",
            # Process management
            "ps aux",
            "lsof -i :3000",
            "sleep 2",
            "kill 12345",
            # Allowed pkill patterns for dev servers
            "pkill node",
            "pkill npm",
            "pkill -f node",
            "pkill -f 'node server.js'",
            "pkill vite",
            # Network/API testing
            "curl https://example.com",
            # Shell scripts
            "bash script.sh",
            'bash -c "echo hello"',
            # Chained commands
            "npm install && npm run build",
            "ls | grep test",
            # Full paths
            "/usr/local/bin/node app.js",
            # chmod +x (allowed)
            "chmod +x init.sh",
            "chmod +x script.sh",
            "chmod u+x init.sh",
            "chmod a+x init.sh",
            # init.sh execution (allowed)
            "./init.sh",
            "./init.sh --production",
            "/path/to/init.sh",
            # Combined chmod and init.sh
            "chmod +x init.sh && ./init.sh",
        ],
    )
    async def test_allowed_commands(self, command):
        """Test that safe commands are allowed."""
        input_data = {"tool_name": "Bash", "tool_input": {"command": command}}
        result = await bash_security_hook(input_data)
        was_blocked = result.get("decision") == "block"
        assert (
            not was_blocked
        ), f"Expected command to be allowed: {command}. Reason: {result.get('reason', '')}"
