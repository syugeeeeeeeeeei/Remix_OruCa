import { IconButton, IconButtonProps, Text } from "@chakra-ui/react";
import React from "react";

export const DeleteButton: React.FC<IconButtonProps> = ({ ...props }) => {
	return (
		<IconButton
			backgroundColor={"red.500"}
			color={"white"}
			shadow={"md"}
			size="sm"
			_hover={{
				transform: "scale(1.1)",
				backgroundColor: "red.600"
			}}
			px={2}
			w={"fit-content"}
			{...props}
		>
			<Text fontSize="sm">DELETE</Text>
		</IconButton>
	);
};