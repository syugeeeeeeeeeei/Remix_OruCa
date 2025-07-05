import type { Log, User } from '@ShardTypes/PrismaClient';
import { apiRoutes } from "@ShardTypes/UserDefTypes/api/routes";

// APIのレスポンスに合わせた型を定義
export type LogWithUser = Log & { user: User | null };

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

/**
 * APIクライアントを生成するファクトリ関数。
 * 認証トークンをヘッダーに含めることができます。
 * @param token - (オプション) JWT認証トークン
 * @returns 型安全なAPIクライアントオブジェクト
 */
export const getApiClient = (token?: string) => {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
	};
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const handleResponse = async (response: Response) => {
		if (!response.ok) {
			// エラー時はレスポンス自体をスローする
			throw response;
		}
		return response.json();
	};


	return {
		// getLogs関数を削除

		/** ログイン処理 */
		login: async (body: { student_ID: string, password: any }) => {
			const response = await fetch(`${API_BASE_URL}${apiRoutes.login}`, {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});
			return handleResponse(response);
		},

		/** 管理者ページ用のユーザー一覧を取得 */
		getUsers: async (): Promise<{ users: LogWithUser[] }> => {
			const response = await fetch(`${API_BASE_URL}${apiRoutes.users}`, { headers });
			return handleResponse(response);
		},

		/** ユーザー名を更新 */
		updateUserName: async (id: string, name: string) => {
			const response = await fetch(`${API_BASE_URL}${apiRoutes.updateUserName(id)}`, {
				method: "PUT",
				headers,
				body: JSON.stringify({ student_Name: name }),
			});
			return handleResponse(response);
		},

		/** ユーザーを削除 */
		deleteUser: async (id: string) => {
			const response = await fetch(`${API_BASE_URL}${apiRoutes.deleteUser(id)}`, {
				method: "DELETE",
				headers,
			});
			return handleResponse(response);
		},
	};
};