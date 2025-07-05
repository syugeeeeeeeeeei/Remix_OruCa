import { IconButton } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { LuSettings } from "react-icons/lu";

interface SettingButtonProps {
	address: string;
}

export const SettingButton: React.FC<SettingButtonProps> = ({ address }) => {
	return (
		<IconButton
			as={Link}
			to={address}
			aria-label="Open Settings Page"
			icon={<LuSettings />}
			size={["md", null, "lg"]}
			isRound
			colorScheme="purple"
			variant="solid"
			shadow="md"
			transition="transform 0.6s ease-in-out"
			_hover={{
				transform: 'rotate(180deg)',
			}}
		/>
	);
};