from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from docker_help import loader, service

app = Flask(__name__)

frontend = loader.load_json("./file.config.json")
config = loader.load_json("./application.config.json")

CORS(app)


@app.route("/")
def ui():
    return send_from_directory(frontend["directory"], frontend["file"])


@app.route("/logs/container", methods=["POST"])
def container_logs():
    data = request.get_json(silent=True) or {}
    container_id = data.get("containerId")
    if not container_id:
        return jsonify({"error": "containerId is required"}), 400

    return service.container_logs(
        container_id,
        data.get("timestamps", False),
        data.get("tail", 200),
    )


@app.route("/get/all/containers")
def load_containers():
    return service.load_containers()


@app.route("/get/all/images")
def load_images():
    return service.load_images()


@app.route("/stop/container", methods=["POST"])
def stop_container():
    data = request.get_json(silent=True) or {}
    container_id = data.get("containerId")

    if not container_id:
        return jsonify({"error": "containerId is required"}), 400

    return service.stop_container(container_id)


@app.route("/remove/container", methods=["POST"])
def remove_container():
    data = request.get_json(silent=True)

    container_id = data.get("containerId") if data else None
    if not container_id:
        return jsonify({"error": "containerId is required"}), 400

    return service.remove_container(container_id)


if __name__ == "__main__":
    app.run(host=config["host"], port=config["port"], debug=True)
