import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:8000";
const VUS = Number(__ENV.VUS || 1);
const ITERATIONS = Number(__ENV.ITERATIONS || 6);
const TEST_IP = __ENV.TEST_IP || `198.51.100.${(Date.now() % 250) + 1}`;

export const rateLimitBlocked = new Counter("rate_limit_blocked");

export const options = {
  scenarios: {
    login_rate_limit: {
      executor: "shared-iterations",
      vus: VUS,
      iterations: ITERATIONS,
      maxDuration: "30s",
    },
  },
  thresholds: {
    checks: ["rate >= 0.95"],
    rate_limit_blocked: ["count >= 1"],
  },
};

export default function () {
  const payload = JSON.stringify({
    email: "rate-limit-missing@example.com",
    password: "wrong-password",
  });

  const res = http.post(`${BASE_URL}/users/login`, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": TEST_IP,
    },
  });

  const blocked = res.status === 429;
  if (blocked) {
    rateLimitBlocked.add(1);
  }

  check(res, {
    "login is rejected or rate-limited": (r) => r.status === 401 || r.status === 429,
    "429 response has Retry-After": (r) => r.status !== 429 || Boolean(r.headers["Retry-After"]),
  });

  sleep(0.2);
}
