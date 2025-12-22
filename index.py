import subprocess
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from docker_help import docker_help, loader

app = Flask(__name__)

frontend = loader.load_json("./file.config.json")
command = loader.load_json("./command.config.json")
config = loader.load_json("./application.config.json")

CORS(app)


@app.route("/")
def ui():
    return send_from_directory(frontend["directory"], frontend["file"])


@app.route("/logs/container", methods=["POST"])
def container_logs():
    data = request.get_json()

    if not data or "containerId" not in data:
        return jsonify({"error": "containerId is required"}), 400

    container_id = data["containerId"]
    tail = data.get("tail", 200)
    timestamps = data.get("timestamps", False)

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
                {"error": "Failed to fetch container logs", "details": e.stderr.strip()}
            ),
            500,
        )


@app.route("/get/all/containers")
def load_containers():
    containers = []
    final = []

    result = docker_help.run_command(command["get_containers"])

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


@app.route("/get/all/images")
def load_images():
    images = []
    final = []

    result = docker_help.run_command(command["get_images"])

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


@app.route("/stop/container", methods=["POST"])
def stop_container():
    data = request.get_json()

    if not data or "containerId" not in data:
        return jsonify({"error": "containerId is required"}), 400

    containerId = data["containerId"]

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


@app.route("/remove/container", methods=["POST"])
def remove_container():
    data = request.get_json()

    if not data or "containerId" not in data:
        return jsonify({"error": "containerId is required"}), 400

    containerId = data["containerId"]

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


if __name__ == "__main__":
    app.run(host=config["host"], port=config["port"], debug=True)
