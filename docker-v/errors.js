class AppError extends Error {
  constructor(code, message, statusCode = 500, details = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function validationError(message, details = {}) {
  return new AppError("VALIDATION_ERROR", message, 400, details);
}

function normalizeDockerError(error, operation) {
  const message = error?.message || "";
  const normalized = message.toLowerCase();

  if (normalized.includes("no such container")) {
    return new AppError("CONTAINER_NOT_FOUND", "Container was not found", 404, {
      operation,
    });
  }

  if (normalized.includes("no such image")) {
    return new AppError("IMAGE_NOT_FOUND", "Image was not found", 404, {
      operation,
    });
  }

  if (
    normalized.includes("cannot connect to the docker daemon") ||
    normalized.includes("docker daemon") ||
    error?.code === "ENOENT"
  ) {
    return new AppError(
      "DOCKER_UNAVAILABLE",
      "Docker is unavailable",
      503,
      { operation },
    );
  }

  return new AppError("DOCKER_ERROR", "Docker operation failed", 502, {
    operation,
  });
}

function errorResponse(error, requestId, isProduction) {
  const appError =
    error instanceof AppError
      ? error
      : new AppError("INTERNAL_ERROR", "An unexpected server error occurred");

  const response = {
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details,
    },
  };

  if (!isProduction && requestId) {
    response.error.details = {
      ...response.error.details,
      requestId,
    };
  }

  return response;
}

module.exports = {
  AppError,
  errorResponse,
  normalizeDockerError,
  validationError,
};
