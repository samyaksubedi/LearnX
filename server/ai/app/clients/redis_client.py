import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    password="qwertyuiop",
    decode_responses=True,
    socket_timeout=None,
    retry_on_timeout=True,
)


def get_redis():
    return redis_client
