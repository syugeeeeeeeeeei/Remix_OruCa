import { Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { TbTableOff } from "react-icons/tb";

export const TableEmptyState = () => {
	return (
		<VStack spacing={4} p={10}>
			<Icon as={TbTableOff} boxSize={12} color="gray.400" />
			<Heading size="md">データがありません</Heading>
			<Text>FeliCaに学生証をかざしてユーザーを登録してください。</Text>
		</VStack>
	)
}