import type { AppContext } from '@/api/types.js';
import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (c: Context<AppContext>, next: Next) => {
	const authHeader = c.req.header('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ message: '認証ヘッダーがありません' }, 401);
	}

	const token = authHeader.split(' ')[1];
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error("JWT_SECRET is not set.");
		return c.json({ message: 'サーバー設定エラー' }, 500);
	}

	try {
		const decoded = jwt.verify(token, secret);
		c.set('user', decoded); // 検証済みのユーザー情報をコンテキストにセット
		await next(); // 次の処理（本来のハンドラ）へ進む
	} catch (err) {
		return c.json({ message: '無効なトークンです' }, 401);
	}
};