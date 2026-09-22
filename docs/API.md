# Docker Dashboard API

## Overview

The Docker Dashboard API is a Node.js and Express-based REST API for managing Docker containers and images.

The API provides endpoints to:

* List Docker containers
* List Docker images
* Fetch container logs
* Start containers
* Stop containers
* Restart containers
* Remove containers
* Remove Docker images
* Remove multiple Docker images
* Serve the Docker Dashboard frontend and assets

## Base URL

```text
http://localhost:3000
```

The host and port are configured through:

```text
application.config.json
```

Example:

```json
{
  "host": "0.0.0.0",
  "port": 3000
}
```

---

# Endpoints

## 1. Get Dashboard

### `GET /`

Returns the configured frontend application.

### Response

The configured frontend file is returned.

The frontend configuration is loaded from:

```text
file.config.json
```

---

## 2. Get All Containers

### `GET /get/all/containers`

Returns all Docker containers.

### Response

```json
[
  {
    "container_id": "abc123",
    "image": "nginx:latest",
    "status": "Up 2 hours",
    "ports": "0.0.0.0:8080->80/tcp",
    "name": "nginx"
  }
]
```

### Empty Response

If there are no containers:

```json
[]
```

---

# 3. Get All Images

### `GET /get/all/images`

Returns Docker images available on the Docker host.

### Response

```json
[
  {
    "Containers": 2,
    "Created_At": "2026-09-20 10:30:00",
    "Created_Since": "2 days ago",
    "Digest": "sha256:...",
    "ID": "abc123",
    "Shared_Size": "0B",
    "Size": "187MB",
    "Tag": "nginx:latest",
    "UniqueSize": "187MB"
  }
]
```

### Empty Response

```json
[]
```

---

# 4. Get Container Logs

### `POST /logs/container`

Returns logs for a Docker container.

### Request Body

```json
{
  "containerId": "abc123",
  "timestamps": false,
  "tail": 200
}
```

### Parameters

| Parameter     | Type    | Required | Default | Description                   |
| ------------- | ------- | -------: | ------: | ----------------------------- |
| `containerId` | string  |      Yes |       — | Docker container ID or name   |
| `timestamps`  | boolean |       No | `false` | Include timestamps in logs    |
| `tail`        | number  |       No |   `200` | Number of log lines to return |

### Response

```json
{
  "containerId": "abc123",
  "logs": "Application started...\nServer listening on port 3000\n"
}
```

### Validation Error

```json
{
  "error": "containerId is required"
}
```

HTTP status:

```text
400 Bad Request
```

### Docker Error

```json
{
  "error": "Failed to fetch container logs",
  "details": "No such container: abc123"
}
```

HTTP status:

```text
500 Internal Server Error
```

---

# 5. Stop Container

### `POST /stop/container`

Stops a running Docker container.

### Request Body

```json
{
  "containerId": "abc123"
}
```

### Response

```json
{
  "message": "Container stopped successfully",
  "containerId": "abc123",
  "output": "abc123"
}
```

---

# 6. Start Container

### `POST /start/container`

Starts a stopped Docker container.

### Request Body

```json
{
  "containerId": "abc123"
}
```

### Response

```json
{
  "message": "Container started successfully",
  "containerId": "abc123",
  "output": "abc123"
}
```

---

# 7. Restart Container

### `POST /restart/container`

Restarts a Docker container.

### Request Body

```json
{
  "containerId": "abc123"
}
```

### Response

```json
{
  "message": "Container restarted successfully",
  "containerId": "abc123",
  "output": "abc123"
}
```

---

# 8. Remove Container

### `POST /remove/container`

Removes a Docker container.

### Request Body

```json
{
  "containerId": "abc123"
}
```

### Response

```json
{
  "message": "Container stopped successfully",
  "containerId": "abc123",
  "output": "abc123"
}
```

> Note: The current implementation uses `docker rm`, so the container must satisfy Docker's normal removal requirements.

---

# 9. Remove Image

### `POST /remove/image`

Removes a Docker image.

### Request Body

```json
{
  "imageId": "abc123"
}
```

### Response

```json
{
  "message": "Container stopped successfully",
  "imageId": "abc123",
  "output": "Untagged: nginx:latest"
}
```

### Validation Error

```json
{
  "error": "imageId is required and must be a string"
}
```

HTTP status:

```text
400 Bad Request
```

---

# 10. Remove Multiple Images

### `POST /remove/images`

Removes multiple Docker images in one request.

### Request Body

```json
{
  "imageIds": [
    "abc123",
    "def456"
  ]
}
```

### Response

```json
{
  "message": "Images removed successfully",
  "imageIds": [
    "abc123",
    "def456"
  ],
  "output": "Untagged: image-one\nUntagged: image-two"
}
```

### Validation Error

```json
{
  "error": "imageIds is required and must be a list"
}
```

HTTP status:

```text
400 Bad Request
```

---

# Error Handling

Common HTTP statuses:

| Status | Meaning                         |
| ------ | ------------------------------- |
| `200`  | Request completed successfully  |
| `400`  | Invalid or missing request data |
| `500`  | Docker command or server error  |

Example:

```json
{
  "error": "containerId is required"
}
```

---

# Docker Commands Used

The API executes Docker CLI commands through Node.js.

| API              | Docker command                              |
| ---------------- | ------------------------------------------- |
| Get containers   | Configured Docker container listing command |
| Get images       | Configured Docker image listing command     |
| Logs             | `docker logs`                               |
| Stop             | `docker stop`                               |
| Start            | `docker start`                              |
| Restart          | `docker restart`                            |
| Remove container | `docker rm`                                 |
| Remove image     | `docker rmi`                                |

---

# Configuration Files

The server expects these configuration files:

```text
command.config.json
application.config.json
file.config.json
```

### `application.config.json`

Controls server host and port.

```json
{
  "host": "0.0.0.0",
  "port": 3000
}
```

### `file.config.json`

Controls the frontend directory and entry file.

Example:

```json
{
  "directory": "../frontend",
  "file": "index.html"
}
```

### `command.config.json`

Contains the Docker commands used to retrieve container and image information.

---

# Running the API

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Example:

```text
Server running at http://0.0.0.0:3000
```
