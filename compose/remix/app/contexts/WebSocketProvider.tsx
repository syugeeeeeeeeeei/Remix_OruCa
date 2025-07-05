import { apiRoutes } from "@ShardTypes/UserDefTypes/api/routes";
import React, { createContext, useContext, useMemo, useState } from "react";
import useWebSocket, { type ReadyState } from "react-use-websocket";

interface WebSocketContextProps {
	lastMessage: MessageEvent | null;
	lastJsonMessage: any | null; // ★★★ 修正点: lastJsonMessage を追加 ★★★
	readyState: ReadyState;
	sendJsonMessage: (jsonMessage: any, keep?: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const useWebSocketContext = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocketContext must be used within a WebSocketProvider");
	}
	return context;
};

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);

	const getSocketUrl = () => {
		if (typeof window === 'undefined') {
			return null;
		}
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const host = window.location.host;
		return `${protocol}//${host}${apiRoutes.webSocket}`;
	};

	const socketUrl = getSocketUrl();

	const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
		onOpen: () => console.log('WebSocket connection opened'),
		onClose: () => console.log('WebSocket connection closed'),
		shouldReconnect: (closeEvent) => true,
		onMessage: (event: WebSocketEventMap['message']) => {
			setLastMessage(event);
		}
	});

	const contextValue = useMemo(
		() => ({
			lastMessage,
			lastJsonMessage, // ★★★ 修正点: context value に含める ★★★
			readyState,
			sendJsonMessage
		}),
		// ★★★ 修正点: 依存配列に lastJsonMessage を追加 ★★★
		[lastMessage, lastJsonMessage, readyState, sendJsonMessage]
	);

	return (
		<WebSocketContext.Provider value={contextValue}>
			{children}
		</WebSocketContext.Provider>
	);
}