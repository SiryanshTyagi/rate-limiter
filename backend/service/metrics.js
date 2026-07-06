const serverStartTime = Date.now();

let totalRequests = 0;
let allowedRequests = 0;
let blockedRequests = 0;

export function incrementTotal() {
  totalRequests += 1;
}

export function incrementAllowed() {
  allowedRequests += 1;
}

export function incrementBlocked() {
  blockedRequests += 1;
}

export function getUptime() {
  return Math.floor((Date.now() - serverStartTime) / 1000);
}

export function getMetrics(redisStatus = "DISCONNECTED") {
  return {
    totalRequests,
    allowedRequests,
    blockedRequests,
    uptime: getUptime(),
    redis: redisStatus,
  };
}
