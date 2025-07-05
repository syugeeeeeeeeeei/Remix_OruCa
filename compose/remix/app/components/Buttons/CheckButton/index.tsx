import { IconButton, type IconButtonProps } from '@chakra-ui/react';
import { FaCheck } from "react-icons/fa";

export const CheckButton: React.FC<IconButtonProps> = ({ ...props }) => {
	return (
		<IconButton
			icon={<FaCheck />}
			size="sm"
			colorScheme="green"
			shadow="md"
			_hover={{ transform: "scale(1.1)" }}
			{...props}
		/>
	);
};