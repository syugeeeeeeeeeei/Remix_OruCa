import { prisma } from '@/db.js';
import { updateUserNameSchema } from '@/validators.js';
import type { AppContext } from '@ShardTypes/UserDefTypes/api/types.js';
import type { Context } from 'hono';

// ユーザー一覧取得ハンドラ
export const handleGetUsers = async (c: Context<AppContext>) => {
	try {
		// ★★★ 修正点 ★★★
		// Logテーブルを主軸にして、関連するUser情報を取得するように変更。
		// これにより、フロントエンドが期待する `{...log, user: {...user}}` の形式になる。
		const logsWithUser = await prisma.log.findMany({
			include: {
				user: true, // Userの全フィールドをネストして取得
			},
			orderBy: {
				updated_at: 'desc',
			},
		});

		// フロントエンドが期待する `users` というキーでデータを返す
		return c.json({ users: logsWithUser });
	} catch (error) {
		console.error("ユーザー一覧取得エラー:", error);
		return c.json({ message: 'ユーザー一覧の取得に失敗しました' }, 500);
	}
};

// ユーザー名更新ハンドラ
export const handleUpdateUserName = async (c: Context<AppContext>) => {
	const userId = c.req.param('id');
	const body = await c.req.json();
	const validationResult = updateUserNameSchema.safeParse(body);

	if (!validationResult.success) {
		return c.json({ message: '入力データが不正です', errors: validationResult.error.errors }, 400);
	}

	const { student_Name } = validationResult.data;

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