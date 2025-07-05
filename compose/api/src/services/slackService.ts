// src/services/slackService.ts
import { SLACK_BOT_TOKEN, SLACK_CHANNEL_ID } from '@/config.js';
import { prisma } from '@/db.js';

export const notifySlackBot = async (student_ID: string): Promise<void> => {
	try {
		const log = await prisma.log.findUnique({
			where: { student_ID },
			include: { user: { select: { student_Name: true } } }
		});

		if (!log || !log.user) return;

		const inRoomCount = await prisma.log.count({ where: { isInRoom: true } });
		const name = log.user.student_Name ? `(${log.user.student_Name})` : "";
		const action = log.isInRoom ? "来た" : "帰った";
		const postMsg = `${student_ID}${name}が${action}よ～ (今の人数：${inRoomCount}人)`;

		await fetch('https://slack.com/api/chat.postMessage', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				channel: SLACK_CHANNEL_ID,
				text: postMsg
			})
		});
	} catch (error) {
		console.error("Slack通知処理でエラー:", error);
	}
};