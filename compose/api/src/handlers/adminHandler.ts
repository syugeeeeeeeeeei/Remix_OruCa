import { prisma } from '@/db.js';
import type { AppContext } from '@ShardTypes/UserDefTypes/api/types.js';
import type { Context } from 'hono';

// ユーザー名更新ハンドラ
export const handleUpdateUserName = async (c: Context<AppContext>) => {
	const userId = c.req.param('id');
	const { student_Name } = await c.req.json();

	if (!student_Name) {
		return c.json({ message: '氏名は必須です' }, 400);
	}

	try {
		await prisma.user.update({
			where: { student_ID: userId },
			data: { student_Name },
		});

		// 全クライアントに更新を通知
		const broadcast = c.get('broadcast');
		if (broadcast) await broadcast();

		return c.json({ message: 'ユーザー名を更新しました' });
	} catch (error) {
		console.error("ユーザー名更新エラー:", error);
		return c.json({ message: '更新に失敗しました' }, 500);
	}
};

// ユーザー削除ハンドラ
export const handleDeleteUser = async (c: Context<AppContext>) => {
	const userId = c.req.param('id');

	try {
		await prisma.user.delete({
			where: { student_ID: userId },
		});

		// 全クライアントに更新を通知
		const broadcast = c.get('broadcast');
		if (broadcast) await broadcast();

		return c.json({ message: 'ユーザーを削除しました' });
	} catch (error) {
		console.error("ユーザー削除エラー:", error);
		return c.json({ message: '削除に失敗しました' }, 500);
	}
};