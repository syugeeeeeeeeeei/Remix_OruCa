import {
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr
} from "@chakra-ui/react";
import type { Log, User } from '@ShardTypes/PrismaClient';
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { Badge } from "~/components/Badge";
import { useWebSocketContext } from "~/contexts/WebSocketProvider";

// サーバーサイドの元の型
export type LogWithUser = Log & { user: User | null };
// クライアントサイドで受け取る際の型
type ClientLogWithUser = Omit<LogWithUser, 'updated_at' | 'user'> & {
	updated_at: string;
	// ★★★ userプロパティがnullになる可能性を型定義に反映 ★★★
	user: (Omit<User, 'updated_at'> & { updated_at?: string }) | null;
};

interface DataTableProps {
	initialData: ClientLogWithUser[];
}

export function DataTable({ initialData }: DataTableProps) {
	const [logs, setLogs] = useState<ClientLogWithUser[]>(initialData);
	const { lastJsonMessage } = useWebSocketContext();

	useEffect(() => {
		if (lastJsonMessage && lastJsonMessage.type === "log/fetch") {
			setLogs(lastJsonMessage.payload.content);
			playBeep(1200, 0.1, 0.2).catch(err => console.warn(err.message));
		}
	}, [lastJsonMessage]);

	const thStyles = {
		color: "gray.100",
		bg: "rgb(43, 37, 108)",
		textAlign: "center" as const,
		p: 3,
	};

	const tdStyles = {
		textAlign: "center" as const,
		py: 2,
	};

	return (
		<TableContainer borderWidth="2px" rounded="md" shadow="md">
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th {...thStyles}>学籍番号</Th>
						<Th {...thStyles}>氏名</Th>
						<Th {...thStyles}>状態</Th>
						<Th {...thStyles}>最終更新</Th>
					</Tr>
				</Thead>
				<Tbody>
					{logs.map((item) => (
						<Tr key={item.student_ID}>
							<Td {...tdStyles}>{item.student_ID}</Td>
							<Td {...tdStyles}>
								{/* ★★★ userがnullの場合を考慮 ★★★ */}
								{item.user ? item.user.student_Name || "（未登録）" : "（ユーザー情報なし）"}
							</Td>
							<Td {...tdStyles} textAlign="center">
								<Badge isTrue={item.isInRoom} text={{ true: '在室', false: '不在' }} />
							</Td>
							<Td {...tdStyles}>{format(new Date(item.updated_at), "HH:mm")}</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</TableContainer>
	);
}

async function playBeep(hz: number, volume: number, length: number) {
	const audioCtx = new (window.AudioContext)();
	await audioCtx.resume();

	const oscillator = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();

	oscillator.type = "square";
	oscillator.frequency.setValueAtTime(hz, audioCtx.currentTime);
	gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	oscillator.start();
	oscillator.stop(audioCtx.currentTime + length);
}