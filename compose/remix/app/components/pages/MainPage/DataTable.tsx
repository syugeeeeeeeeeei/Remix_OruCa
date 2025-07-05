import {
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Badge } from "~/components/Badge";
import { TableEmptyState } from "~/components/TableEmptyState";
import { useWebSocket } from "~/contexts/WebSocketProvider";

// --- 修正点: @ShardTypesからインポート ---
import type { Log, User } from '@ShardTypes/PrismaClient';
import type { TWsMessage } from '@ShardTypes/UserDefTypes/api/types';

// APIが返すデータの構造に合わせた型を定義
type LogWithUser = Log & { user: User | null };

interface DataTableProps {
	initialData: LogWithUser[];
}

export function DataTable({ initialData }: DataTableProps) {
	const [logs, setLogs] = useState<LogWithUser[]>(initialData);
	const { lastMessage } = useWebSocket();
	const isInitialMount = useRef(true); // マウント直後かどうかを判定するフラグ

	useEffect(() => {
		if (lastMessage !== null) {
			const message: TWsMessage = JSON.parse(lastMessage.data);
			if (message.type === "log/fetch" && message.payload.content) {
				setLogs(message.payload.content as LogWithUser[]);

				// --- 音声再生ロジックの修正 ---
				if (isInitialMount.current) {
					// 最初のデータロードでは音を鳴らさない
					isInitialMount.current = false;
				} else {
					// 2回目以降のデータ更新時に音を鳴らす
					playBeep(1200, 0.1, 0.2).catch(err => console.warn(err.message));
				}
			}
		}
	}, [lastMessage]);

	const thStyles = {
		color: "gray.100",
		bg: "rgb(43, 37, 108)",
		textAlign: "center" as const,
		fontWeight: "bold",
		textTransform: "uppercase" as const,
		fontSize: ["xs", null, "lg"],
		p: [1, null, 3],
	};

	const tdStyles = {
		textAlign: "center" as const,
		fontWeight: "semibold",
		fontSize: ["sm", "md", "lg"],
		py: [2, null, 3],
	};

	if (logs.length === 0) {
		return <TableEmptyState />;
	}

	return (
		<TableContainer borderWidth="2px" rounded="md" shadow="md">
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th {...thStyles}>学籍番号</Th>
						<Th {...thStyles}>氏名</Th>
						<Th {...thStyles}>在室状況</Th>
						<Th {...thStyles}>最終更新</Th>
					</Tr>
				</Thead>
				<Tbody>
					{logs.map((log) => (
						<Tr key={log.student_ID} _hover={{ bg: "gray.50" }}>
							<Td {...tdStyles}>{log.student_ID}</Td>
							<Td {...tdStyles} color={log.user?.student_Name ? "inherit" : "gray.400"}>
								{log.user?.student_Name || "未登録"}
							</Td>
							<Td {...tdStyles}>
								<Badge isTrue={log.isInRoom} text={{ true: "在室", false: "不在" }} />
							</Td>
							<Td {...tdStyles}>{format(new Date(log.updated_at), "HH:mm:ss")}</Td>
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