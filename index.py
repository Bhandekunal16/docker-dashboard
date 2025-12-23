from typing import Any
from flask import Flask, request, send_from_directory, Response
from flask_cors import CORS
from docker_help import loader, service

app = Flask(__name__)

frontend = loader.load_json("./file.config.json")
config = loader.load_json("./application.config.json")
post = ["POST"]

CORS(app)


@app.route("/")
def ui():
    return send_from_directory(frontend["directory"], frontend["file"])


@app.route("/logs/container", methods=post)
def container_logs() -> tuple[Response, int]:
    data = request.get_json(silent=True) or {}
    container_id = data.get("containerId")
    if not container_id:
        return loader.default_Bad_Request("containerId is required")

    return service.container_logs(
        container_id,
        data.get("timestamps", False),
        data.get("tail", 200),
    )


@app.route("/get/all/containers")
def load_containers() -> list:
    return service.load_containers()


@app.route("/get/all/images")
def load_images() -> list:
    return service.load_images()


@app.route("/stop/container", methods=post)
def stop_container() -> tuple[Response, int]:
    data = request.get_json(silent=True) or {}
    container_id = data.get("containerId")

    if not container_id:
        return loader.default_Bad_Request("containerId is required")

    return service.stop_container(container_id)


@app.route("/remove/container", methods=post)
def remove_container() -> tuple[Response, int]:
    data = request.get_json(silent=True)

    container_id = data.get("containerId") if data else None
    if not container_id:
        return loader.default_Bad_Request("containerId is required")

    return service.remove_container(container_id)


@app.route("/restart/container", methods=post)
def restart_container() -> tuple[Response, int]:
    data = request.get_json(silent=True)

    container_id = data.get("containerId") if data else None
    if not container_id:
        return loader.default_Bad_Request("containerId is required")

    return service.restart_container(container_id)


@app.route("/start/container", methods=post)
def start_container() -> tuple[Response, int]:
    data = request.get_json(silent=True)

    container_id = data.get("containerId") if data else None
    if not container_id:
        return loader.default_Bad_Request("containerId is required")

    return service.start_container(container_id)


if __name__ == "__main__":
    app.run(host=config["host"], port=config["port"], debug=True)
