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
			backgroundColor="rgb(30, 14, 81)"
			color="white"
			variant="solid"
			shadow="md"
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(360deg)',
				backgroundColor: "rgb(50, 34, 111)"
			}}
		/>
	);
};