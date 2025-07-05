import {
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import type { Log, User } from '@ShardTypes/PrismaClient';
import { useState } from "react";
import { DeleteDialog } from "./DeleteDialog";
import { NameInput } from "./NameInput";

type LogWithUser = Log & { user: User };

interface EditableDataTableProps {
	data: LogWithUser[];
}

export function EditableDataTable({ data }: EditableDataTableProps) {
	const [editingRow, setEditingRow] = useState<string | null>(null);

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
		<TableContainer borderWidth="2px" rounded="md" shadow="md" mt={8}>
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th {...thStyles}>学籍番号</Th>
						<Th {...thStyles}>氏名 (編集可)</Th>
						<Th {...thStyles}>操作</Th>
					</Tr>
				</Thead>
				<Tbody>
					{data.map((item) => (
						<Tr key={item.student_ID}>
							<Td {...tdStyles}>{item.student_ID}</Td>
							<Td {...tdStyles}>
								<Form method="post">
									<input type="hidden" name="student_ID" value={item.student_ID} />
									<NameInput
										initialName={item.user.student_Name || ""}
										isEditing={editingRow === item.student_ID}
										onEdit={() => setEditingRow(item.student_ID)}
										onCancel={() => setEditingRow(null)}
									/>
								</Form>
							</Td>
							<Td {...tdStyles}>
								<DeleteDialog
									student_ID={item.student_ID}
									student_Name={item.user.student_Name || '未登録'}
								/>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</TableContainer>
	);
  }