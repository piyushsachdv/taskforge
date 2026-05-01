# TaskForge Architecture

## Overview

TaskForge is a distributed full-stack system for asynchronous text-processing workflows. The frontend handles authentication and task interaction, the backend owns task persistence and queue submission, Redis decouples request intake from execution, Python workers process jobs independently, and MongoDB stores task state, logs, and results.

## Component Responsibilities

- Frontend: Next.js dashboard for authentication, task creation, execution, and live task monitoring
- Backend: Express API for auth, task CRUD-style access, queue submission, and user-scoped task reads
- Redis: job queue for asynchronous execution
- Worker: Python consumer that processes tasks and updates task status and logs
- MongoDB: persistent storage for users, tasks, execution state, and results
- Kubernetes: runs all services in the `taskforge` namespace
- Argo CD: reconciles cluster state from Git
- GitHub Actions: builds and publishes images, then updates Git-tracked manifests

## Request And Processing Flow

1. A user authenticates through the frontend and receives a JWT.
2. The frontend calls the backend using authenticated API requests.
3. The backend creates a task document in MongoDB.
4. When a task is executed, the backend sets the task to `pending`, clears prior logs/results, and pushes the job to Redis.
5. A worker consumes the queued job, marks it `running`, processes the requested operation, then updates the document to `success` or `failed`.
6. The frontend polls the backend and displays task state, logs, and output.

## Worker Scaling Strategy

Workers are stateless queue consumers, so they scale horizontally with very little coordination cost. Each worker replica independently pops jobs from Redis and processes them. Because the work items are independent text-processing jobs, increasing worker replicas increases concurrency directly.

In Kubernetes, the worker deployment starts with 2 replicas to demonstrate horizontal scaling. For larger workloads, replica count can be increased manually or via an HPA if CPU or custom queue metrics are introduced.

## Handling 100k Tasks Per Day

The main design choice that supports high task volume is asynchronous decoupling:

- The API does not perform task processing inline
- Redis absorbs burst traffic and smooths worker consumption
- Workers can be scaled separately from the frontend and backend
- MongoDB stores durable task state for reads, retries, and audit visibility

To support 100k tasks per day in a productionized version:

- increase worker replicas based on queue depth and CPU usage
- run Redis with persistence enabled
- move MongoDB to persistent storage
- introduce queue monitoring, alerting, and autoscaling triggers
- partition heavy operations if individual task complexity grows

## Database Indexing Strategy

The task model defines the following indexes in [backend/src/models/Task.js](C:\Users\Piyush\Desktop\root\backend\src\models\Task.js):

- `userId`
- `createdAt`
- `status`

Why they matter:

- `userId` supports user-scoped dashboard queries efficiently
- `createdAt` supports reverse chronological task listing
- `status` supports operational filtering, retries, and future admin dashboards

These indexes reduce scan cost and keep task retrieval responsive as volume grows.

## Redis Failure Handling

Redis is the transient execution layer, not the system of record. Task metadata already exists in MongoDB before execution begins, which gives the system a recovery path.

Current recovery posture:

- if queue submission fails, the backend can return an error and the task remains visible in MongoDB
- if worker processing fails, the worker records failure state and logs back into MongoDB
- if Redis becomes unavailable, workers retry the connection loop

Recommended production improvements:

- enable Redis persistence with RDB or AOF
- add dead-letter or retry queue handling
- requeue stale `pending` tasks by scanning MongoDB
- add alerting for queue depth and connection failures

## Environment Strategy

A clean promotion model should separate environments by namespace and config:

- `staging`
- `production`

Each environment should have:

- separate namespaces
- separate ingress hosts
- separate ConfigMaps and Secrets
- immutable image tags
- Argo CD application definitions per environment

This allows the same application to be promoted safely without cross-environment drift.

## Kubernetes Design

The Kubernetes deployment includes:

- `backend` Deployment and Service
- `frontend` Deployment and Service
- `worker` Deployment
- `mongo` Deployment and Service
- `redis` Deployment and Service
- ingress for application access

Operational characteristics:

- namespace isolation through `taskforge`
- readiness and liveness probes on key services
- resource requests and limits for scheduling control
- multiple worker replicas to demonstrate distributed processing

MongoDB currently uses assignment-level wiring rather than production-grade storage management. In a production environment it should use a PersistentVolumeClaim and backup policy.

## GitOps And CI/CD Design

The delivery path is fully Git-driven:

1. A push to `main` triggers GitHub Actions
2. The workflow builds backend, frontend, and worker images
3. Images are pushed to Docker Hub with the commit SHA as the image tag
4. The workflow updates Kubernetes manifests in `infra/k8s`
5. The workflow commits the new image tags back to Git
6. Argo CD detects the updated manifests and syncs the cluster automatically

This approach gives:

- traceable deployments
- immutable image references
- versioned infrastructure history
- fewer manual kubectl rollout steps

## Tradeoffs And Future Improvements

- Polling is simple and effective here, but websockets or SSE would reduce repeated dashboard requests
- Redis `lpop` is enough for the current assignment, but more advanced queue semantics could improve reliability
- MongoDB and Redis should use persistent storage in a production setup
- Autoscaling based on queue depth would strengthen the system for larger workloads
- Observability with Prometheus, Grafana, and centralized logs would improve operations readiness
