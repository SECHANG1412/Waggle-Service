from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest


http_requests_total = Counter(
    "waggle_http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status"],
)

http_request_duration_seconds = Histogram(
    "waggle_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "path"],
)


def render_metrics() -> tuple[bytes, str]:
    return generate_latest(), CONTENT_TYPE_LATEST
