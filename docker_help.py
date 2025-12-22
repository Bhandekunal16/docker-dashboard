import subprocess

class docker_help:
    def run_command(cmd):
        return subprocess.run(cmd, capture_output=True, text=True, check=True)