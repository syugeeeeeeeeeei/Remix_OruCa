import { IconButton } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { BsArrowReturnLeft } from "react-icons/bs";

interface ReturnButtonProps {
	address: string;
}

export const ReturnButton: React.FC<ReturnButtonProps> = ({ address }) => {
	return (
		<IconButton
			as={Link}
			to={address}
			aria-label="Return to Previous Page"
			icon={<BsArrowReturnLeft />}
			size={["md", null, "lg"]}
			isRound
			colorScheme="gray"
			variant="solid"
			shadow="md"
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(-360deg)',
			}}
		/>
	);
};