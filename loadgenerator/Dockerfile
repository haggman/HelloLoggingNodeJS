
FROM python:3.12.3-slim@sha256:2be8daddbb82756f7d1f2c7ece706aadcb284bf6ab6d769ea695cc3ed6016743 as base

FROM base as builder

COPY requirements.txt .

RUN pip install --prefix="/install" -r requirements.txt

FROM base

WORKDIR /loadgen

COPY --from=builder /install /usr/local

# Add application code.
COPY locustfile.py .

# enable gevent support in debugger
ENV GEVENT_SUPPORT=True

ENTRYPOINT locust --headless --users "${USERS:-10}" -H "${FRONTEND_ADDR}" 2>&1