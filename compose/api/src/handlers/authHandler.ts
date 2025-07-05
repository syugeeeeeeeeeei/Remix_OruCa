import { prisma } from '@/db.js';
import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';

export const handleLogin = async (c: Context) => {
	const { student_ID, password } = await c.req.json();

	if (!student_ID || !password) {
		return c.json({ message: 'IDとパスワードは必須です' }, 400);
	}

	const user = await prisma.user.findUnique({ where: { student_ID } });
	if (!user) {
		return c.json({ message: '認証に失敗しました' }, 401);
	}

	// パスワードを検証 (既存のロジック)
	const generateSHA256Hash = (input: string): string => createHash("sha256").update(input).digest("hex");
	const salt = generateSHA256Hash(student_ID);
	const expectedToken = generateSHA256Hash(`${student_ID}${password}${salt}`);

	if (user.student_token !== expectedToken) {
		return c.json({ message: '認証に失敗しました' }, 401);
	}

	// 検証成功後、JWTを生成
	const jwtPayload = {
		sub: user.student_ID, // Subject: ユーザーID
		iat: Math.floor(Date.now() / 1000), // Issued At: 発行日時
		exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Expiration Time: 有効期限24時間
	};

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error("JWT_SECRET is not set.");
		return c.json({ message: 'サーバー設定エラー' }, 500);
	}

	const token = jwt.sign(jwtPayload, secret);

	return c.json({ token });
};