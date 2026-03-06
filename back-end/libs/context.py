import types

# Simple namespace replacing Flask's removed _app_ctx_stack.
# Used to store shared objects (conn, redis_client) at module level.
ctx_stack = types.SimpleNamespace()
