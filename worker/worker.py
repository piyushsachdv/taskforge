import os
import json
import time
from urllib.parse import urlparse
import redis
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

redis_client = None


def get_redis_client():
    global redis_client
    if redis_client is None:
        redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST"),
            port=int(os.getenv("REDIS_PORT")),
            decode_responses=True
        )
    return redis_client


mongo_uri = os.getenv("MONGO_URI")
mongo_client = MongoClient(mongo_uri)
default_database = mongo_client.get_default_database()

if default_database is not None:
    db = default_database
else:
    parsed_uri = urlparse(mongo_uri)
    database_name = parsed_uri.path.lstrip("/") or "taskforge"
    db = mongo_client[database_name]

tasks_collection = db["tasks"]

QUEUE_NAME = "task-queue"


def process_task(task):
    operation = task["operation"]
    text = task["input"]

    if operation == "uppercase":
        return text.upper()
    if operation == "lowercase":
        return text.lower()
    if operation == "reverse":
        return text[::-1]
    if operation == "wordcount":
        return str(len(text.split()))
    raise Exception("Invalid operation")


def update_task(task_id, status=None, result=None, log=None):
    update = {}
    set_fields = {}
    push_fields = {}

    if status:
        set_fields["status"] = status

    if result is not None:
        set_fields["result"] = result

    if log:
        push_fields["logs"] = log

    if set_fields:
        update["$set"] = set_fields

    if push_fields:
        update["$push"] = push_fields

    if not update:
        return

    tasks_collection.update_one({"_id": ObjectId(task_id)}, update)


def worker_loop():
    print("Worker started...")

    while True:
        try:
            redis_connection = get_redis_client()
            job = redis_connection.lpop(QUEUE_NAME)

            if job:
                task_id = None

                try:
                    print(f"Raw job data: {job}")
                    job_data = json.loads(job)
                    print(f"Parsed job data: {job_data}")

                    task_id = job_data["taskId"]
                    print(f"Processing task {task_id}")

                    update_task(task_id, status="running", log="Task started")
                    print(f"Task {task_id} marked as running")

                    result = process_task(job_data)
                    print(f"Task {task_id} produced result: {result}")

                    update_task(
                        task_id,
                        status="success",
                        result=result,
                        log="Task completed successfully"
                    )
                    print(f"Task {task_id} marked as success")
                except Exception as e:
                    print(f"Error processing job: {str(e)}")
                    import traceback
                    traceback.print_exc()

                    if task_id:
                        tasks_collection.update_one(
                            {"_id": ObjectId(task_id)},
                            {
                                "$set": {
                                    "status": "failed",
                                    "result": None
                                },
                                "$push": {
                                    "logs": f"Error: {str(e)}"
                                }
                            }
                        )

            time.sleep(1)
        except Exception as e:
            print(f"Redis connection error: {str(e)}")
            print("Retrying in 5 seconds...")
            time.sleep(5)


if __name__ == "__main__":
    worker_loop()
