# Kubernetes Manifests

These manifests deploy the full stack into the `taskforge` namespace:

- `backend`
- `frontend`
- `worker`
- `mongo`
- `redis`

## 1. Push images

Tag and push your images first:

```powershell
docker tag root-backend piyushsachdv/backend:latest
docker tag root-frontend piyushsachdv/frontend:latest
docker tag root-worker piyushsachdv/worker:latest

docker push piyushsachdv/backend:latest
docker push piyushsachdv/frontend:latest
docker push piyushsachdv/worker:latest
```

The manifests in this repo already use `piyushsachdv`.

## 2. Create the secret

Copy `secret.example.yaml` to a real secret file or apply an inline secret with your real JWT secret.

## 3. Apply manifests

```powershell
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.example.yaml
kubectl apply -f mongo.yaml
kubectl apply -f redis.yaml
kubectl apply -f backend.yaml
kubectl apply -f worker.yaml
kubectl apply -f frontend.yaml
kubectl apply -f ingress.yaml
```

## 4. Verify

```powershell
kubectl get all -n taskforge
kubectl get ingress -n taskforge
```

## Notes

- The worker deployment starts with `2` replicas to demonstrate scaling.
- The backend uses `/api/health` for readiness and liveness probes.
- Resource requests and limits are defined for every deployment.
- `mongo` and `redis` are configured as in-cluster services.
- Mongo currently uses an `emptyDir` volume at `/data/db` for assignment-level persistence wiring.
- For real production use, replace the Mongo `emptyDir` with a PersistentVolumeClaim and use a managed ingress controller.
