# Docker Dashboard — Node.js

A lightweight Docker management dashboard built with **React**, **Node.js**, and **Express**.

The server provides REST APIs for viewing and managing Docker containers and images and also serves the Docker Dashboard frontend.

## Features

* Docker container listing
* Docker image listing
* Container logs
* Start container
* Stop container
* Restart container
* Remove container
* Remove single image
* Remove multiple images
* Frontend static-file serving
* CORS support
* JSON request handling
* Configurable host and port

## Technology Stack

* Node.js
* Express
* CORS
* Docker CLI

## Project Structure

```text
server/
├── index.js
├── app.js
├── config.js
├── docker/adapter.js
├── services/dashboard.js
├── middleware.js
├── errors.js
├── test/
└── package.json
```

## Installation

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

## Configuration

The application uses three configuration files.

### application.config.json

```json
{
  "host": "0.0.0.0",
  "port": 3000
}
```

### file.config.json

Example:

```json
{
  "directory": "../frontend",
  "file": "index.html"
}
```

### command.config.json

This file contains the Docker commands used by the application.

For example, the container and image listing commands can be configured to return Docker's JSON output.

## Docker Requirement

Docker must be installed and available on the server.

Verify Docker:

```bash
docker --version
```

Verify that the current user can access Docker:

```bash
docker ps
```

If Docker requires elevated permissions on your system, configure the Docker socket/user permissions appropriately rather than running the Node.js application with unnecessary privileges.

## Start the Server

Production/start mode:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

The default server address is:

```text
http://localhost:5000
```

## API Endpoints

### Containers

```text
GET  /get/all/containers
POST /logs/container
POST /start/container
POST /stop/container
POST /restart/container
POST /remove/container
```

### Images

```text
GET  /get/all/images
POST /remove/image
POST /remove/images
```

### Frontend

```text
GET /
```

Static assets:

```text
/assets/*
```

## Example API Requests

### Get containers

```bash
curl http://localhost:5000/get/all/containers
```

### Get images

```bash
curl http://localhost:5000/get/all/images
```

### Start container

```bash
curl -X POST http://localhost:5000/start/container \
  -H "Content-Type: application/json" \
  -d '{"containerId":"abc123"}'
```

### Stop container

```bash
curl -X POST http://localhost:5000/stop/container \
  -H "Content-Type: application/json" \
  -d '{"containerId":"abc123"}'
```

### Restart container

```bash
curl -X POST http://localhost:5000/restart/container \
  -H "Content-Type: application/json" \
  -d '{"containerId":"abc123"}'
```

### Container logs

```bash
curl -X POST http://localhost:5000/logs/container \
  -H "Content-Type: application/json" \
  -d '{
    "containerId": "abc123",
    "timestamps": true,
    "tail": 100
  }'
```

### Remove container

```bash
curl -X POST http://localhost:5000/remove/container \
  -H "Content-Type: application/json" \
  -d '{"containerId":"abc123"}'
```

### Remove image

```bash
curl -X POST http://localhost:5000/remove/image \
  -H "Content-Type: application/json" \
  -d '{"imageId":"abc123"}'
```

### Remove multiple images

```bash
curl -X POST http://localhost:5000/remove/images \
  -H "Content-Type: application/json" \
  -d '{
    "imageIds": [
      "abc123",
      "def456"
    ]
  }'
```

## Architecture

The application is separated into two main responsibilities.

### `server/index.js` and `server/app.js`

Responsible for:

* Express startup and application composition
* Middleware and route registration
* Health/readiness endpoints
* Backward-compatible and resource-oriented API routes
* Frontend serving

### `server/services/dashboard.js`

Responsible for:

* Container and image domain operations
* Input validation
* Mapping Docker records to API response shapes

### `server/docker/adapter.js`

Responsible for:

* Executing Docker commands with argument arrays
* Command timeouts and bounded output
* Docker error normalization
* Keeping Docker CLI details out of routes and services

The Docker CLI is executed using Node.js `child_process`.

## Express 5 Compatibility

This project uses Express 5.

For static assets, use:

```js
app.use(
  "/assets",
  express.static(path.join(frontendDir, "assets"))
);
```

Avoid Express 4-style wildcard patterns such as:

```js
app.get("/assets/:filename(*)", ...);
```

because newer `path-to-regexp` versions used by Express 5 reject that syntax.

For the frontend fallback, use middleware at the end of the route definitions:

```js
app.use((req, res) => {
  return res.sendFile(path.join(frontendDir, frontend.file));
});
```

## Security Considerations

This API directly executes Docker commands. Therefore, access to the API should be restricted to trusted users or networks.

Recommended production controls:

* Add authentication and authorization.
* Restrict network access to the API.
* Validate container and image identifiers.
* Avoid exposing the Docker management API directly to the public internet.
* Run the Node.js process with only the permissions required to access Docker.
* Add request logging and audit logging.
* Add rate limiting where appropriate.

## Troubleshooting

### Docker command not found

Check:

```bash
docker --version
```

If Docker is installed but Node.js cannot find it, verify the service user's `PATH`.

### Permission denied when accessing Docker

Check:

```bash
docker ps
```

The user running Node.js must have permission to communicate with the Docker daemon.

### Port already in use

Check which process is using port `3000`:

```bash
sudo lsof -i :3000
```

Then either stop the conflicting process or change the port in:

```text
application.config.json
```

### Express path-to-regexp error

If you see an error such as:

```text
PathError [TypeError]: Unexpected (
```

check for old wildcard routes such as:

```js
"/assets/:filename(*)"
```

Use:

```js
app.use("/assets", express.static(path.join(frontendDir, "assets")));
```

instead.

## License

Add the project's applicable license here.
