import { Box, HStack, Text } from "@chakra-ui/react";
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
		<HStack
			border="1px solid"
			borderColor={`${colorScheme}.500`}
			backgroundColor={`${colorScheme}.100`}
			color={`${colorScheme}.700`}
			px={2}
			py={1}
			borderRadius="md"
			fontWeight="bold"
			spacing={2}
			display="inline-flex"
			alignItems="center"
		>
			<Box w="8px" h="8px" borderRadius="full" bg={`${colorScheme}.500`} />
			<Text>{message}</Text>
		</HStack>
	);
}