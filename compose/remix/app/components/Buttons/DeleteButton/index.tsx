import { Button, type ButtonProps } from "@chakra-ui/react";
import React from "react";

export const DeleteButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<Button
			aria-label="Delete user"
			colorScheme="red"
			size="sm"
			_hover={{ transform: "scale(1.1)" }}
			{...props}
		>
			DELETE
		</Button>
	);
};