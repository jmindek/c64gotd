# syntax=docker/dockerfile:1

# syntax=docker/dockerfile:1

# Builder image for dependencies
FROM python:3.13-slim as builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml ./
RUN uv pip install --system --requirement pyproject.toml

# Production image: slim, only runtime files
FROM python:3.13-slim as prod
WORKDIR /app
# Copy installed dependencies from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
# Copy app source (exclude tests and __pycache__)
COPY . .
RUN rm -rf tests test* __pycache__ *.pyc *.pyo */__pycache__
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD curl --fail http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Test image (not slim, for dev only)
FROM builder as test
COPY . ./
RUN uv pip install --system pytest httpx
CMD ["pytest"]
