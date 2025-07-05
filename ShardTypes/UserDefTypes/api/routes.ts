// パスパラメータが必要ないルートは単純な文字列として定義
const staticRoutes = {
	login: '/api/auth/login',
	logWrite: '/api/log/write',
	echo: '/api/echo',
	webSocket: '/socket',
} as const;

// パスパラメータが必要なルートは、引数を受け取る関数として定義
const dynamicRoutes = {
	updateUserName: (id: string) => `/api/admin/users/${id}/name`,
	deleteUser: (id: string) => `/api/admin/users/${id}`,
} as const;

/**
 * APIルート定義オブジェクト。
 * フロントエンドからのfetchやWebSocket接続時にこのオブジェクトを経由してパスを指定することで、
 * 型安全性を担保し、URLの打ち間違いを防ぎます。
 */
export const apiRoutes = {
	...staticRoutes,
	...dynamicRoutes,
};

// オブジェクトの型もエクスポートしておく（必要に応じて）
export type ApiRoutes = typeof apiRoutes;