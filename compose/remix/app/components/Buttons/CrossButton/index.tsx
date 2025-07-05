import { IconButton, type IconButtonProps } from "@chakra-ui/react";
import React from "react";
import { RxCross2 } from "react-icons/rx";

export const CrossButton: React.FC<IconButtonProps> = ({ ...props }) => {
	return (
		<IconButton
			icon={<RxCross2 />}
			size="sm"
			colorScheme="red"
			variant="ghost"
			shadow="md"
			_hover={{ transform: "scale(1.1)" }}
			{...props}
		/>
	);
};