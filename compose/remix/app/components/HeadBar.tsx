import { Grid, GridItem, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import React from "react";
import { FaAnchor } from "react-icons/fa";

type THeadBar = {
	otherElements?: React.ReactNode[];
	children?: React.ReactNode;
};

export const HeadBar: React.FC<THeadBar> = ({ otherElements, children }) => {
	return (
		<Grid h={"100vh"} templateRows={"auto 1fr"} gap={0} color={"#1E0E51"}>
			<GridItem>
				<HStack
					w={"100%"}
					px={4}
					py={[2, null, 5]}
					justifyContent={"space-between"}
					borderBottomWidth={1}
					shadow={"xs"}
				>
					<Link to="/">
						<VStack gap={0} align="start" cursor={"pointer"}>
							<HStack w={"100%"} gap={2}>
								<Icon as={FaAnchor} boxSize={[6, null, 8]} />
								<Heading size={["lg", null, "2xl"]}>OruCa</Heading>
							</HStack>
							<Text fontFamily={"monospace"} fontSize={["xs", null, "md"]} fontWeight={"semibold"}>
								FeliCa 在室管理システム
							</Text>
						</VStack>
					</Link>
					<HStack gap={4} justify={"center"}>
						{otherElements?.map((e, index) => (
							<React.Fragment key={`HeadBarOtherElements-${index}`}>{e}</React.Fragment>
						))}
					</HStack>
				</HStack>
			</GridItem>
			<GridItem overflowY="auto">
				{children}
			</GridItem>
		</Grid>
	);
};