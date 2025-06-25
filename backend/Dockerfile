# syntax=docker/dockerfile:1

# Base image with dependencies
FROM python:3.13-slim as base
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml ./
RUN uv pip install --system --requirement pyproject.toml

# Production image
FROM base as prod
COPY . ./
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD curl --fail http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Test image
FROM base as test
COPY . ./
RUN uv pip install --system pytest httpx
CMD ["pytest"]
