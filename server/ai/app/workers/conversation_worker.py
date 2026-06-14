import json
import time
from app.clients.redis_client import get_redis
from app.services.job.conversation_job_router import process_conversation_job


QUEUE_NAME = "learnx:conversation-processing"


def start_worker():
    r = get_redis()

    print("Worker started... waiting for jobs")

    while True:
        # job = (queue_name, data)

        job = r.blpop(QUEUE_NAME)[1]
        data = json.loads(job)

        print("\n Job received:", data)

        try:
            process_conversation_job(data)

        except Exception as e:
            print("❌ Failed:", e)
            time.sleep(2)
