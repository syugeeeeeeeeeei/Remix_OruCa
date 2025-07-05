// src/config.ts
import dotenv from "dotenv";
dotenv.config();

function getEnv(name: string, fallback?: string): string {
	const value = process.env[name];
	if (value) return value;
	if (fallback || fallback?.length === 0) return fallback;
	throw new Error(`環境変数 ${name} が設定されていません。`);
}

export const SERVER_CONFIG = {
	port: parseInt(getEnv("API_PORT", "3000"), 10),
};

export const SLACK_BOT_TOKEN = getEnv("SLACK_BOT_TOKEN", "");
export const SLACK_CHANNEL_ID = getEnv("SLACK_CHANNEL_ID", "");