// src/routes/websocket.ts
import { createNodeWebSocket } from '@hono/node-ws';
import { Hono } from 'hono';
import { onClose, onError, onMessage, onOpen } from '../handlers/webSocketHandler.js';

const webSocketRoutes = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({app:webSocketRoutes})


webSocketRoutes.get(
	'/',
	upgradeWebSocket((c) => {
		return {
			onOpen: (evt, ws) => onOpen(evt, ws),
			onMessage: (evt, ws) => onMessage(evt, ws),
			onClose: (evt, ws) => onClose(evt, ws),
			onError: (evt, ws) => onError(evt, ws),
		};
	})
);

export { webSocketRoutes };
