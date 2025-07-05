import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { TWsMessage } from '@ShardTypes/UserDefTypes/api/types';

/**
 * ブラウザの現在のURLに基づいてWebSocketの接続先URLを生成する関数。
 * Viteのプロキシを経由してAPIサーバーに接続する。
 */
const getWsUrl = () => {
	// サーバーサイドレンダリング中はWebSocketに接続しない
	if (typeof window === 'undefined') {
		return null;
	}
	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const host = window.location.host; // "localhost:5173" などを取得
	return `${protocol}//${host}/socket`; // 正しい接続先
};

interface WebSocketContextType {
	lastMessage: MessageEvent | null;
	sendMessage: (jsonMsg: TWsMessage) => void;
	readyState: number;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error('useWebSocket must be used within a WebSocketProvider');
	}
	return context;
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
	const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
	const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
	const ws = useRef<WebSocket | null>(null);

	useEffect(() => {
		const WS_URL = getWsUrl();
		if (!WS_URL) return; // サーバーサイドでは接続を開始しない

		let reconnectTimeout: NodeJS.Timeout;

		const connect = () => {
			const socket = new WebSocket(WS_URL);
			ws.current = socket;

			socket.onopen = () => {
				console.log("WebSocket connected to:", WS_URL);
				setReadyState(socket.readyState);
				if (reconnectTimeout) clearTimeout(reconnectTimeout);
			};

			socket.onclose = (event) => {
				// 意図しない切断の場合のみ再接続
				if (!event.wasClean) {
					console.log("WebSocket disconnected. Reconnecting in 5 seconds...");
					setReadyState(socket.readyState);
					clearTimeout(reconnectTimeout);
					reconnectTimeout = setTimeout(connect, 5000);
				} else {
					console.log("WebSocket connection closed cleanly.");
				}
			};

			socket.onmessage = (event) => setLastMessage(event);
			socket.onerror = (error) => console.error("WebSocket Error:", error);
		};

		connect();

		return () => {
			console.log("Closing WebSocket connection.");
			clearTimeout(reconnectTimeout);
			ws.current?.close(1000, "Component unmounting"); // クリーンクローズ
		};
	}, []); // クライアントでのマウント時に一度だけ実行

	const sendMessage = (jsonMsg: TWsMessage) => {
		if (ws.current?.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(jsonMsg));
		}
	};

	const value = {
		lastMessage,
		sendMessage,
		readyState,
	};

	return (
		<WebSocketContext.Provider value={value}>
			{children}
		</WebSocketContext.Provider>
	);
};