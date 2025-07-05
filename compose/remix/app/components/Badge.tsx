import { Badge as ChakraBadge, Text, HStack } from "@chakra-ui/react";
import React from 'react';

interface BadgeProps {
	isTrue: boolean;
	text: {
		true: string;
		false: string;
	};
}

export const Badge: React.FC<BadgeProps> = ({ isTrue, text }) => {
	const colorScheme = isTrue ? "green" : "red";
	const message = isTrue ? text.true : text.false;

	return (
		<ChakraBadge
			colorScheme={colorScheme}
			variant="subtle"
			p={2}
			borderRadius="md"
			fontWeight="bold"
		>
			{message}
		</ChakraBadge>
	);
}