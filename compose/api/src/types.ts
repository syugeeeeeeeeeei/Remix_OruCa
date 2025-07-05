// src/types.ts
export type TWsProcessType = "ack" | "log/fetch" | "log/write" | "user/auth" | "user/update_name" | "user/fetchToken" | "user/delete" | "slackBot/post";

export type TWsPayLoad = {
	result: boolean,
	content: Record<string, any>[],
	message: string,
};

export type TWsMessage = {
	type: TWsProcessType,
	payload: TWsPayLoad
};

// Honoのコンテキストに型情報を追加
export type AppContext = {
	Variables: {
		broadcast: () => Promise<void>;
	}
};