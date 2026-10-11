# Realtime deployment

## Development

Install backend dependencies with `python -m pip install -r requirements.txt` from `backend/`. Leave `DJANGO_DEBUG=True` to use the in-memory Channels layer, which is suitable only for a single development process. The Vite `/ws/` proxy forwards WebSocket upgrades to the same Django target as `/api/`.

## Production

Set `DJANGO_DEBUG=False` and provide a private Redis endpoint through `REDIS_URL`, for example `redis://redis.internal:6379/0`. Do not expose Redis to the public network. Production settings refuse to start without Redis because the in-memory layer cannot deliver events between workers.

Run Django as an ASGI application, for example from `backend/`:

```sh
daphne -b 0.0.0.0 -p 8000 backend.asgi:application
```

The existing repository does not contain an Nginx or deployment configuration. The production reverse proxy must forward WebSocket upgrades for `/ws/` to the ASGI server and retain long-lived connections. An Nginx location can use:

```nginx
location /ws/ {
    proxy_pass http://django_asgi;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 75s;
    proxy_send_timeout 75s;
}
```

Define `django_asgi` in the existing server's upstream configuration. Continue proxying `/api/` to Django REST as before. Serve the React app and API/WebSocket endpoint from the same HTTPS origin so the existing HttpOnly Django session cookie is sent on the WebSocket handshake. Set `ALLOWED_HOSTS` to the public host; `AllowedHostsOriginValidator` uses it to restrict WebSocket origins. The application sends an application-level ping every 25 seconds to keep idle proxy connections active.

Scale ASGI workers normally; Channels Redis shares group membership and events between them. Ensure Redis has authentication/TLS where required by the hosting environment, is network-restricted to application workers, and is monitored independently. No order/customer payloads are sent over WebSockets; clients refetch authorized data through REST.
