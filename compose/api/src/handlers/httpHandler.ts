// src/handlers/httpHandler.ts
import type { AppContext } from '@/api/types.js';
import { prisma } from '@/db.js';
import { notifySlackBot } from '@/services/slackService.js';
import { logWriteSchema } from '@/validators.js';
import type { Context } from 'hono';
import { createHash } from 'node:crypto';

export const handleLogWrite = async (c: Context<AppContext>) => {
	const body = await c.req.json();
	const validationResult = logWriteSchema.safeParse(body);

	if (!validationResult.success) {
		return c.json({ message: 'データの構造が不正です', errors: validationResult.error.errors }, 400);
	}

	const { student_ID } = validationResult.data.payload.content;
	const admin_pass = process.env.ADMIN_DEFAULT_PASSWORD || 'fukaya_lab';

	try {
		const generateSHA256Hash = (input: string): string => createHash("sha256").update(input).digest("hex");
		const salt = generateSHA256Hash(student_ID);
		const student_token = generateSHA256Hash(`${student_ID}${admin_pass}${salt}`);

		// ユーザーが存在しない場合は作成
		await prisma.user.upsert({
			where: { student_ID },
			update: {},
			create: {
				student_ID: student_ID,
				student_Name: null,
				student_token: student_token,
			},
		});

		// ログの挿入または更新
		const existingLog = await prisma.log.findUnique({ where: { student_ID } });
		if (existingLog) {
			await prisma.log.update({
				where: { student_ID },
				data: { isInRoom: !existingLog.isInRoom },
			});
		} else {
			await prisma.log.create({
				data: { student_ID, isInRoom: true },
			});
		}

		// データ更新を全クライアントに通知
		const broadcast = c.get('broadcast');
		if (broadcast) await broadcast();

		// Slack通知 (非同期)
		setTimeout(() => notifySlackBot(student_ID), 0);

		return c.json({ message: 'データが更新されました' }, 200);

	} catch (error) {
		console.error("データ挿入エラー:", error);
		return c.json({ message: 'データの挿入に失敗しました' }, 500);
	}
};