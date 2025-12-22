import subprocess
import json
from flask import jsonify


class docker_help:
    def run_command(cmd):
        return subprocess.run(cmd, capture_output=True, text=True, check=True)


class loader:
    def load_json(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)


class service:
    command = loader.load_json("./command.config.json")

    def load_containers():
        containers = []
        final = []

        result = docker_help.run_command(service.command["get_containers"])

        for line in result.stdout.strip().splitlines():
            containers.append(json.loads(line))

        for c in containers:
            final.append(
                {
                    "container_id": c["ID"],
                    "image": c["Image"],
                    "status": c["Status"],
                    "ports": c["Ports"],
                    "name": c["Names"],
                }
            )

        return final

    def load_images():
        images = []
        final = []

        result = docker_help.run_command(service.command["get_images"])

        for line in result.stdout.strip().splitlines():
            images.append(json.loads(line))

        for c in images:
            final.append(
                {
                    "Containers": c["Containers"],
                    "Created At": c["CreatedAt"],
                    "Created Since": c["CreatedSince"],
                    "Digest": c["Digest"],
                    "ID": c["ID"],
                    "Shared Size": c["SharedSize"],
                    "Size": c["Size"],
                    "Tag": c["Tag"],
                    "UniqueSize": c["UniqueSize"],
                }
            )

        return final

    def container_logs(container_id, timestamps, tail):
        cmd = ["docker", "logs"]

        if timestamps:
            cmd.append("--timestamps")

        cmd.extend(["--tail", str(tail), container_id])

        try:
            result = docker_help.run_command(cmd)

            return jsonify({"containerId": container_id, "logs": result.stdout}), 200

        except subprocess.CalledProcessError as e:
            return (
                jsonify(
                    {
                        "error": "Failed to fetch container logs",
                        "details": e.stderr.strip(),
                    }
                ),
                500,
            )

    def stop_container(containerId):
        result = docker_help.run_command(["docker", "stop", f"{containerId}"])

        return (
            jsonify(
                {
                    "message": "Container stopped successfully",
                    "containerId": containerId,
                    "output": result.stdout.strip(),
                }
            ),
            200,
        )
        
    def remove_container(containerId):
        result = docker_help.run_command(["docker", "rm", f"{containerId}"])

        return (
            jsonify(
                {
                    "message": "Container stopped successfully",
                    "containerId": containerId,
                    "output": result.stdout.strip(),
                }
            ),
            200,
        )