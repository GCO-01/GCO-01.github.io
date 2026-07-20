# Imagen de la API VAGGO (FastAPI + Supabase). Contexto de build = backend/.
#   docker build -t vaggo-api backend/
# En Cloud Run el puerto llega por la env PORT (default 8080).
FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app

ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
