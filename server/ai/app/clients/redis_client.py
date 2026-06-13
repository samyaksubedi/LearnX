import redis
# import os


# REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    password="qwertyuiop",
    decode_responses=True,
    socket_timeout=None,
    retry_on_timeout=False,
)


def get_redis():
    try:
        redis_client.ping()
        print("Redis Connected")  # TODO Use Logging
        return redis_client
    except Exception as e:
        print("Redis connection failed:", repr(e))  # TODO Use Logging
        raise RuntimeError(f"Redis connection failed: {e}") from e
