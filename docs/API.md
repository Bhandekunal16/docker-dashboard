# Docker Dashboard API

The Docker Dashboard API is implemented by Node.js and Express in
`server/`. It serves the compiled React frontend and exposes Docker
container/image operations through a service layer and Docker adapter.

## Running locally

The default bind address is `0.0.0.0:5000`, configured in
`application.config.json`.

```bash
cd server
npm install
npm start
```

The Docker CLI must be installed and available to the server process.

## Response and error contracts

Successful legacy and modern endpoints preserve the existing response shapes.
Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "containerId is required",
    "details": {
      "field": "containerId"
    }
  }
}
```

Error codes include `VALIDATION_ERROR`, `CONTAINER_NOT_FOUND`,
`IMAGE_NOT_FOUND`, `DOCKER_ERROR`, `DOCKER_UNAVAILABLE`, `FORBIDDEN`,
`RATE_LIMITED`, and `INTERNAL_ERROR`.

Production responses do not include stack traces or raw Docker command output.
Each response includes an `x-request-id` header for log correlation.

## Health and readiness

### `GET /health`

Checks that the Node.js process is alive.

```json
{ "status": "ok" }
```

### `GET /ready`

Checks Docker availability using a Docker adapter ping.

```json
{ "status": "ready", "docker": "available" }
```

Docker failures return a structured `DOCKER_UNAVAILABLE` or `DOCKER_ERROR`
response.

## Host resources

These endpoints provide live host telemetry for the React dashboard. The
frontend polls them every four seconds for the Host Resources Overview.

### `GET /api/host/cpu`

Returns the host CPU utilization since the previous sample:

```json
{
  "usagePercent": 24.8,
  "cores": 8
}
```

### `GET /api/host/memory`

Returns host memory totals in bytes and the percentage currently in use:

```json
{
  "totalBytes": 24931823616,
  "usedBytes": 13022199808,
  "freeBytes": 11909623808,
  "usagePercent": 52.2
}
```

### `GET /api/host/disk`

Returns usage for the server's root filesystem (`/`):

```json
{
  "mount": "/",
  "totalBytes": 502392610816,
  "usedBytes": 243969134592,
  "freeBytes": 232828104704,
  "usagePercent": 52
}
```

CPU and memory are read from the Node.js host process. Disk usage is read from
the host filesystem using `df`. These endpoints report host-level values, not
per-container Docker statistics.

## Backward-compatible endpoints

These endpoints are used by the current React frontend and remain supported.

### `GET /get/all/containers`

Returns:

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

### `GET /get/all/images`

Returns normalized Docker image records:

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

### `POST /logs/container`

Request:

```json
{
  "containerId": "abc123",
  "timestamps": false,
  "tail": 200
}
```

`containerId` is required. `timestamps` must be boolean. `tail` must be an
integer from 1 through 10000.

### Container actions

The following endpoints accept `{ "containerId": "abc123" }`:

```text
POST /start/container
POST /stop/container
POST /restart/container
POST /remove/container
```

### Image actions

```text
POST /remove/image       body: { "imageId": "abc123" }
POST /remove/images      body: { "imageIds": ["abc123", "def456"] }
```

Image batches are limited to 100 identifiers.

## Resource-oriented aliases

The following routes provide a clearer API for new consumers without breaking
the legacy frontend:

```text
GET    /api/containers
GET    /api/images
GET    /api/containers/:id/logs
POST   /api/containers/:id/start
POST   /api/containers/:id/stop
POST   /api/containers/:id/restart
DELETE /api/containers/:id
DELETE /api/images/:id
```

The logs alias accepts `timestamps=true|false` and `tail` as query parameters.
Identifiers are strictly validated before reaching the Docker adapter.

## Static frontend

```text
GET /
GET /assets/*
```

The frontend directory and entry file are configured by `file.config.json`.

## Configuration

Deployment-specific values may be supplied with environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `HOST` | API bind host | `application.config.json` |
| `PORT` | API bind port | `application.config.json` |
| `JSON_LIMIT` | Maximum JSON request body | `100kb` |
| `DOCKER_TIMEOUT_MS` | Docker command timeout | `30000` |
| `DOCKER_MAX_BUFFER` | Maximum command output buffer | `1048576` |
| `CORS_ORIGINS` | Comma-separated allowed origins; empty allows local compatibility | empty |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window | `60000` |
| `RATE_LIMIT_MAX` | Requests per window and IP | `120` |

`command.config.json` contains the trusted Docker listing commands. User
input is never passed through a shell; Docker commands use argument arrays.

## Security and deployment

The API is a privileged Docker control plane. Production deployments should
place it behind an HTTPS reverse proxy with authentication and authorization,
restrict network exposure, configure an explicit `CORS_ORIGINS` allowlist, and
run the process with least-privilege Docker access.

Authentication, RBAC, and audit persistence are architecture targets but are
not enabled by default so local development remains simple. Do not expose the
Docker socket or this API directly to untrusted networks.
