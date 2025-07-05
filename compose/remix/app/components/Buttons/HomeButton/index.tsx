import { IconButton } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { AiOutlineHome } from "react-icons/ai";

interface HomeButtonProps {
	address: string;
}

export const HomeButton: React.FC<HomeButtonProps> = ({ address }) => {
	return (
		<IconButton
			as={Link}
			to={address}
			aria-label="Return to Main Page"
			icon={<AiOutlineHome />}
			size={["md", null, "lg"]}
			isRound
			colorScheme="purple"
			variant="solid"
			shadow="md"
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(360deg)',
			}}
		/>
	);
};