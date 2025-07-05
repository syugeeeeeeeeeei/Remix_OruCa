import {
	Box,
	Button,
	Card,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Text,
	VStack
} from "@chakra-ui/react";
import {
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { HomeButton } from "~/components/Buttons/HomeButton";
import { HeadBar } from "~/components/HeadBar";
import { commitSession, getSession } from "~/lib/auth.server";

const loginSchema = z.object({
	student_ID: z.string().min(1, "学籍番号は必須です"),
	password: z.string().min(1, "パスワードは必須です"),
});

export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	if (session.has("token")) {
		return redirect("/admin/settings");
	}
	return Response.json({});
}

export async function action({ request }: ActionFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const formData = await request.formData();
	const fields = Object.fromEntries(formData.entries());

	const validationResult = loginSchema.safeParse(fields);

	if (!validationResult.success) {
		return Response.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
	}

	const { student_ID, password } = validationResult.data;
	const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

	try {
		const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ student_ID, password }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return Response.json({ errors: { form: errorData.message || "ログインに失敗しました" } }, { status: response.status });
		}

		const { token } = await response.json();
		session.set("token", token);

		return redirect("/admin/settings", {
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		});
	} catch (error) {
		return Response.json({ errors: { form: "サーバーとの通信に失敗しました" } }, { status: 500 });
	}
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<HeadBar otherElements={[<HomeButton address="/" />]}>
			<Box w="100%" h="100%" display="flex" alignItems="center" justifyContent="center">
				<Card p={[4, null, 10]} borderWidth={1} shadow="md" w="fit-content">
					<Form method="post">
						<VStack spacing={6}>
							<Heading size="lg">管理者ログイン</Heading>
							{actionData?.errors?.form && (
								<Text color="red.500">{actionData.errors.form}</Text>
							)}
							<FormControl isInvalid={!!actionData?.errors?.student_ID}>
								<FormLabel>学籍番号</FormLabel>
								<Input name="student_ID" type="text" />
								<FormErrorMessage>{actionData?.errors?.student_ID}</FormErrorMessage>
							</FormControl>
							<FormControl isInvalid={!!actionData?.errors?.password}>
								<FormLabel>パスワード</FormLabel>
								<Input name="password" type="password" />
								<FormErrorMessage>{actionData?.errors?.password}</FormErrorMessage>
							</FormControl>
							<Button
								type="submit"
								colorScheme="purple"
								isLoading={isSubmitting}
								loadingText="認証中..."
								w="100%"
							>
								ログイン
							</Button>
						</VStack>
					</Form>
				</Card>
			</Box>
		</HeadBar>
	);
  }