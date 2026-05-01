# TaskForge Architecture

## Overview

The platform is a distributed full-stack system for asynchronous text-processing tasks. Users authenticate through a Next.js frontend, submit tasks to a Node.js backend, and the backend persists task metadata in MongoDB while pushing runnable jobs into Redis. Python workers consume jobs from Redis, update task status in MongoDB, and write final results back for the dashboard to poll and display.

## Request Flow

1. A user logs in from the frontend and receives a JWT.
2. The frontend sends authenticated task requests to the backend API.
3. The backend stores the task in MongoDB with an initial status and pushes the runnable payload into Redis.
4. Python workers consume queued jobs asynchronously and update status from `pending` to `running` to `success` or `failed`.
5. The frontend polls the backend and renders live status, logs, and results.

## Worker Scaling Strategy

Workers are horizontally scalable as stateless consumers of a Redis queue. Multiple replicas can process jobs in parallel, enabling near-linear scalability for independent tasks. Kubernetes manages scaling through replica count, and because workers do not hold session state, additional replicas can be added without coordination overhead.

## Handling 100k Tasks Per Day

Redis decouples ingestion from processing, which keeps the API responsive even under burst traffic. Tasks are buffered in the queue and processed asynchronously, so the system can absorb spikes without blocking users. Horizontal scaling of workers increases throughput, while MongoDB stores task state durably for query and recovery workflows. With enough worker replicas and proper Redis persistence, the architecture can scale predictably for high daily task volume.

## Database Indexing Strategy

The task collection uses these indexes:

- `userId`: speeds up dashboard queries scoped to the logged-in user
- `createdAt`: supports reverse chronological sorting for recent tasks
- `status`: supports filtering by lifecycle state for operations and admin views

These indexes reduce scan overhead and keep task listing responsive as task volume grows.

## Redis Failure Handling

If Redis fails, tasks remain persisted in MongoDB, so the platform does not lose task metadata. The backend can retry queue insertion, and workers can be restarted once Redis recovers. In production, Redis persistence modes such as RDB or AOF should be enabled. A fallback strategy is to scan MongoDB for `pending` tasks and requeue them after Redis becomes healthy again.

## Staging vs Production

A clean promotion model uses separate namespaces such as `staging` and `production`. Each environment should have isolated ConfigMaps, Secrets, ingress hosts, and image tags. CI/CD builds images once, pushes them to a registry, and GitOps promotion updates the target namespace configuration.

## Kubernetes Design

The Kubernetes layer includes:

- Deployments for `backend`, `frontend`, `worker`, `mongo`, and `redis`
- ClusterIP Services for internal service discovery
- An ingress resource for frontend routing
- Health probes for backend, frontend, Redis, and Mongo
- Resource requests and limits for baseline scheduling safety
- Two worker replicas to demonstrate horizontal queue consumers

MongoDB currently mounts an `emptyDir` volume for assignment-level persistence wiring. In production, it should use a PersistentVolumeClaim.

## GitOps with Argo CD

Argo CD points to the Kubernetes manifest folder and continuously reconciles desired state. Automated sync with `prune` and `selfHeal` ensures drift correction and declarative delivery. This removes manual kubectl dependency after bootstrap and makes environment changes auditable through Git history.
