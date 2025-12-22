import subprocess
import json

class docker_help:
    def run_command(cmd):
        return subprocess.run(cmd, capture_output=True, text=True, check=True)
    
    
class loader:
    def load_json(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)