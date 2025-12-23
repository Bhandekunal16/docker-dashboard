import subprocess
import json
from flask import jsonify, Response


class docker_help:
    def run_command(cmd: list) -> subprocess.CompletedProcess[str]:
        return subprocess.run(cmd, capture_output=True, text=True, check=True)


class loader:
    def load_json(path: str):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
        
    def default_Bad_Request(error: str):
        return loader.json_response({"error": error}, 400)

    def json_response(obj: object, res_code: int) -> tuple[Response, int]:
        return (jsonify(obj), res_code)


class service:
    __command = loader.load_json("./command.config.json")

    def load_containers() -> list:
        result = docker_help.run_command(service.__command["get_containers"])

        if not result.stdout:
            return []

        return [
            {
                "container_id": c["ID"],
                "image": c["Image"],
                "status": c["Status"],
                "ports": c["Ports"],
                "name": c["Names"],
            }
            for c in map(json.loads, result.stdout.splitlines())
        ]


    def load_images() -> list:
        result = docker_help.run_command(service.__command["get_images"])

        if not result.stdout:
            return []

        return [
            {
                "Containers": img["Containers"],
                "Created At": img["CreatedAt"],
                "Created Since": img["CreatedSince"],
                "Digest": img["Digest"],
                "ID": img["ID"],
                "Shared Size": img["SharedSize"],
                "Size": img["Size"],
                "Tag": img["Tag"],
                "UniqueSize": img["UniqueSize"],
            }
            for img in map(json.loads, result.stdout.splitlines())
        ]


    def container_logs(container_id: str, timestamps: bool, tail: int):
        cmd = ["docker", "logs"]

        if timestamps:
            cmd.append("--timestamps")

        cmd.extend(["--tail", str(tail), container_id])

        try:
            result = docker_help.run_command(cmd)
            return loader.json_response(
                {"containerId": container_id, "logs": result.stdout}, 200
            )

        except subprocess.CalledProcessError as e:
            return loader.json_response(
                {
                    "error": "Failed to fetch container logs",
                    "details": e.stderr.strip(),
                },
                500,
            )

    def stop_container(containerId: str):
        result = docker_help.run_command(["docker", "stop", f"{containerId}"])
        return loader.json_response(
            {
                "message": "Container stopped successfully",
                "containerId": containerId,
                "output": result.stdout.strip(),
            },
            200,
        )
        
    def restart_container(containerId: str):
        result = docker_help.run_command(["docker", "restart", f"{containerId}"])
        return loader.json_response(
            {
                "message": "Container restarted successfully",
                "containerId": containerId,
                "output": result.stdout.strip(),
            },
            200,
        )
        
    def start_container(containerId: str):
        result = docker_help.run_command(["docker", "start", f"{containerId}"])
        return loader.json_response(
            {
                "message": "Container started successfully",
                "containerId": containerId,
                "output": result.stdout.strip(),
            },
            200,
        )


    def remove_container(containerId: str):
        result = docker_help.run_command(["docker", "rm", f"{containerId}"])
        return loader.json_response(
            {
                "message": "Container stopped successfully",
                "containerId": containerId,
                "output": result.stdout.strip(),
            },
            200,
        )