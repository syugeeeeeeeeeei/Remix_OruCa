import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { DeleteButton } from "~/components/Buttons/DeleteButton";

interface DeleteDialogProps {
	student_ID: string;
	student_Name: string;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ student_ID, student_Name }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			<DeleteButton aria-label="Delete user" onClick={onOpen} />
			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>ユーザー削除の確認</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack align="start">
							<Text>以下のユーザーを削除します。よろしいですか？</Text>
							<Text fontWeight="bold">ID: {student_ID}</Text>
							<Text fontWeight="bold">氏名: {student_Name}</Text>
							<Text color="red.500" pt={2}>この操作は取り消せません。</Text>
						</VStack>
					</ModalBody>
					<ModalFooter>
						<Button variant="ghost" mr={3} onClick={onClose}>
							キャンセル
						</Button>
						<Form method="post">
							<input type="hidden" name="student_ID" value={student_ID} />
							<Button
								type="submit"
								name="intent"
								value="deleteUser"
								colorScheme="red"
								onClick={onClose}
							>
								削除
							</Button>
						</Form>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
  };