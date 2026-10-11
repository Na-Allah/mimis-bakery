from channels.generic.websocket import AsyncJsonWebsocketConsumer


class RealtimeConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated or not user.is_active:
            await self.close(code=4401)
            return

        self.groups_to_join = ["authenticated-users", f"user-{user.pk}"]
        if user.is_admin:
            self.groups_to_join.append("admin-users")
        if user.is_courier:
            self.groups_to_join.append("courier-users")

        for group in self.groups_to_join:
            await self.channel_layer.group_add(group, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        for group in getattr(self, "groups_to_join", []):
            await self.channel_layer.group_discard(group, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content.get("type") == "PING":
            await self.send_json({"type": "PONG", "id": None, "data": {}})

    async def realtime_event(self, event):
        await self.send_json(event["payload"])