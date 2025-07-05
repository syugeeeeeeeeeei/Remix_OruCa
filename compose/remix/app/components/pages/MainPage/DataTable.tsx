import {
	Badge,
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
import { useWebSocketContext } from "~/contexts/WebSocketProvider";

export type LogWithUser = Log & { user: User | null };

interface DataTableProps {
	initialData: LogWithUser[];
}

export function DataTable({ initialData }: DataTableProps) {
	const [logs, setLogs] = useState<LogWithUser[]>(initialData);
	// ★★★ 修正点: lastMessage の代わりに lastJsonMessage を使用 ★★★
	const { lastJsonMessage } = useWebSocketContext();

	// ★★★ 修正点: useEffect のロジックを簡素化 ★★★
	useEffect(() => {
		// lastJsonMessage が存在し、その型が 'log/fetch' の場合にのみ処理
		if (lastJsonMessage && lastJsonMessage.type === "log/fetch") {
			// `payload.content` にデータ本体が入っているので、それで state を更新
			setLogs(lastJsonMessage.payload.content);
			playBeep(1200, 0.1, 0.2).catch(err => console.warn(err.message));
		}
	}, [lastJsonMessage]); // 依存配列を lastJsonMessage に変更

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
								{item.user ? item.user.student_Name || "（未登録）" : "（未登録）"}
							</Td>
							<Td {...tdStyles}>
								<Badge colorScheme={item.isInRoom ? "green" : "red"} variant="solid">
									{item.isInRoom ? "在室" : "退室"}
								</Badge>
							</Td>
							<Td {...tdStyles}>{format(new Date(item.updated_at), "HH:mm")}</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</TableContainer>
	);
}

// playBeep関数をPromiseを返すように修正
async function playBeep(hz: number, volume: number, length: number) {
	// AudioContextがユーザー操作によって有効化されるのを待つ
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