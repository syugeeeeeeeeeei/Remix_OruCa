import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import React from "react";
import { FaEdit } from "react-icons/fa";

export const EditButton: React.FC<IconButtonProps> = ({ ...props }) => {
	return (
		<IconButton
			icon={<FaEdit />}
			size="sm"
			variant="ghost"
			colorScheme="gray"
			_hover={{ transform: "scale(1.1)" }}
			{...props}
		/>
	);
};