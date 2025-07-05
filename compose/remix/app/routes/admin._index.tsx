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
import { getApiClient } from "~/lib/api.server";
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

	const api = getApiClient();

	try {
		const { token } = await api.login(validationResult.data);
		session.set("token", token);

		// ★★★ セッションにフラッシュメッセージを設定 ★★★
		session.flash("success", "ログインに成功しました");

		return redirect("/admin/settings", {
			headers: {
				// ★★★ フラッシュメッセージを保存するためにセッションをコミット ★★★
				"Set-Cookie": await commitSession(session),
			},
		});
	} catch (error) {
		const status = error instanceof Response ? error.status : 500;
		const errorData = error instanceof Response ? await error.json().catch(() => ({ message: "ログインに失敗しました" })) : { message: "サーバーとの通信に失敗しました" };

		return Response.json({ errors: { form: errorData.message } }, { status });
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
					{/* ★★★ 標準のFormコンポーネントを使用 ★★★ */}
					<Form method="post">
						<VStack spacing={6}>
							<Heading size="lg">管理者ログイン</Heading>
							{actionData?.errors?.form && (
								<Text color="red.500" w="100%" textAlign="center">{actionData.errors.form}</Text>
							)}
							<FormControl isInvalid={!!actionData?.errors?.student_ID}>
								<FormLabel>学籍番号</FormLabel>
								<Input name="student_ID" type="text" />
								<FormErrorMessage>{actionData?.errors?.student_ID?.[0]}</FormErrorMessage>
							</FormControl>
							<FormControl isInvalid={!!actionData?.errors?.password}>
								<FormLabel>パスワード</FormLabel>
								<Input name="password" type="password" />
								<FormErrorMessage>{actionData?.errors?.password?.[0]}</FormErrorMessage>
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