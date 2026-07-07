# Token Bucket Rate Limiter

A production-oriented **Token Bucket Rate Limiter** built with **Node.js, Express, Redis, and Lua Scripts**.

The project started with an in-memory implementation to understand the algorithm and gradually evolved into a Redis-backed, atomic, production-ready implementation using Lua scripts and `EVALSHA`.

A lightweight React dashboard is included to visualize the rate limiter, monitor metrics, and interact with the deployed backend.

---

## Live Demo

### Frontend

https://rate-limiter-dun.vercel.app

### Backend

https://rate-limiter-nta2.onrender.com

---

## Features

- Token Bucket Rate Limiting
- Redis-backed bucket storage
- Atomic Lua Script execution
- `SCRIPT LOAD` + `EVALSHA`
- Automatic `NOSCRIPT` recovery
- Health endpoint
- Metrics endpoint
- React dashboard
- Live token bucket visualization
- Docker Compose for local development
- Redis Cloud support
- Production deployment

---

# Tech Stack

### Backend

- Node.js
- Express.js
- Redis
- Lua
- Docker
- Render

### Frontend

- React
- Vite
- Fetch API
- Vercel

---

# Project Evolution

This project was intentionally built in multiple stages to understand how production rate limiters are designed.

---

## Phase 1 — In-Memory Map

The first implementation stored buckets inside a JavaScript `Map`.

```
Client
      ↓
Express
      ↓
Map
```

Each user had:

```
{
    tokens,
    lastRefill
}
```

This version was simple and useful for learning but had several limitations.

### Problems

- Data lost when server restarted
- Doesn't work with multiple server instances
- Cannot scale horizontally

---

## Phase 2 — Redis

The next step moved bucket storage into Redis.

```
Client
      ↓
Express
      ↓
Redis
```

Each bucket is stored as a Redis Hash.

```
bucket:<userId>

tokens
lastRefill
```

Redis solved:

- Persistence
- Shared storage
- Horizontal scaling

However, another problem appeared.

---

## Phase 3 — Race Condition

The initial Redis implementation followed this flow:

```
Read bucket

↓

Calculate refill

↓

Consume token

↓

Save bucket
```

These were multiple independent Redis commands.

When many requests arrived simultaneously, several requests could read the same bucket before any of them updated it.

Example:

```
Bucket = 1 token

Request A reads 1

Request B reads 1

Both consume

Both succeed
```

More requests were allowed than expected.

---

## Phase 4 — Lua Script

To eliminate race conditions, the entire token bucket algorithm was moved into a Lua script.

```
Read

↓

Refill

↓

Consume

↓

Save
```

became

```
One Lua Script
```

Redis executes Lua scripts atomically.

---

# Why Lua?

Without Lua:

```
GET

↓

Calculate

↓

SET
```

These are separate operations.

Another request may modify the bucket in between.

With Lua:

```
Read

↓

Refill

↓

Consume

↓

Save
```

runs as a single atomic operation.

No other Redis command can interrupt execution.

This guarantees consistency even under heavy concurrent traffic.

---

# Atomicity

Redis executes Lua scripts atomically.

Think of it as:

```
Lock

↓

Execute everything

↓

Unlock
```

While the script is running, no other client can modify the same data.

This completely removes race conditions without requiring application-level locks.

---

# SCRIPT LOAD + EVALSHA

Executing the entire Lua script every request is inefficient.

Instead:

```
SCRIPT LOAD
```

loads the script once into Redis.

Redis returns a SHA hash.

Subsequent requests execute:

```
EVALSHA
```

instead of sending the entire Lua script repeatedly.

Benefits:

- Smaller network payload
- Faster execution
- Reduced bandwidth

---

# Automatic NOSCRIPT Recovery

Redis may lose cached Lua scripts after a restart.

When Redis returns:

```
NOSCRIPT
```

the application automatically:

1. Reloads the Lua script
2. Stores the new SHA
3. Retries the request

No manual intervention is required.

---

# Dashboard

The React dashboard includes:

- Backend Health
- Redis Health
- Live Metrics
- Token Bucket Visualization
- API Testing
- Recent Request History

The dashboard polls backend metrics periodically to visualize token refill in real time.

---

# API Endpoints

## Health

```
GET /health
```

Response

```json
{
  "status": "UP",
  "redis": "CONNECTED",
  "uptime": 120
}
```

---

## Metrics

```
GET /metrics
```

Response

```json
{
  "totalRequests": 120,
  "allowedRequests": 85,
  "blockedRequests": 35,
  "uptime": 120,
  "redis": "CONNECTED",
  "remainingTokens": 8
}
```

---

## Protected Route

```
GET /
```

Returns

```json
{
  "success": true,
  "remainingTokens": 7
}
```

or

```json
{
  "success": false,
  "remainingTokens": 0
}
```

---

# Running Locally

Clone the repository

```bash
git clone https://github.com/SiryanshTyagi/rate-limiter.git
```

Install dependencies

```bash
npm install
```

Create `.env`

```
REDIS_URL=
PORT=
BUCKET_SIZE=10
BUCKET_REFILL_RATE=1
```

Run Redis

```bash
docker compose up
```

Start backend

```bash
npm start
```

Start frontend

```bash
npm run dev
```

---

# Stress Testing

A browser is **not** an accurate stress-testing tool.

The dashboard buttons use JavaScript `fetch()` calls.

Browsers limit how many network requests can execute simultaneously to the same origin.

As a result:

- Requests are queued
- Execution becomes partially sequential
- Tokens refill while queued requests are waiting

For example:

Bucket Size = 10

Refill Rate = 1 token/sec

100 browser requests may produce approximately

```
Allowed : 30

Blocked : 70
```

instead of

```
Allowed : 10

Blocked : 90
```

because the browser takes several seconds to dispatch all requests, allowing the bucket to refill during execution.

For accurate concurrent testing, use the included stress testing script.

Example:

```bash
node stressTest.js
```

The stress test sends requests concurrently without browser scheduling limitations and provides a much more accurate representation of the rate limiter's behavior.

---

# Future Improvements

- Sliding Window algorithm
- Distributed Redis Cluster
- Prometheus metrics
- Grafana dashboard
- Authentication
- Per-route rate limiting
- Configurable user limits

---

# What I Learned

Building this project provided practical experience with:

- Token Bucket algorithm
- Redis data modeling
- Lua scripting
- Atomic operations
- Race conditions
- Concurrent systems
- Docker
- React dashboard development
- Production deployment
- API design

---

## License

MIT
