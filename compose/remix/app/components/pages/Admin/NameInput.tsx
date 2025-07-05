import { HStack, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { CheckButton } from "~/components/Buttons/CheckButton";
import { CrossButton } from "~/components/Buttons/CrossButton";
import { EditButton } from "~/components/Buttons/EditButton";

interface NameInputProps {
	initialName: string;
	isEditing: boolean;
	onEdit: () => void;
	onCancel: () => void;
}

export const NameInput: React.FC<NameInputProps> = ({ initialName, isEditing, onEdit, onCancel }) => {
	const [name, setName] = useState(initialName);

	if (isEditing) {
		return (
			<HStack as="div" w="100%">
				<Input
					name="student_Name"
					defaultValue={name}
					onChange={(e) => setName(e.target.value)}
					size="sm"
					w="80%"
				/>
				<CheckButton
					aria-label="変更を保存"
					type="submit"
					name="intent"
					value="updateName"
				/>
				<CrossButton
					aria-label="キャンセル"
					onClick={onCancel}
				/>
			</HStack>
		);
	}

	return (
		<HStack w="100%" justify="space-between">
			<Text color={initialName ? "inherit" : "gray.400"}>
				{initialName || "未登録"}
			</Text>
			<EditButton aria-label="名前を編集" onClick={onEdit} />
		</HStack>
	);
};