import { Box, Button, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { z } from "zod";
import { HomeButton } from "~/components/Buttons/HomeButton";
import { ReturnButton } from "~/components/Buttons/ReturnButton";
import { HeadBar } from "~/components/HeadBar";
import { EditableDataTable } from "~/components/pages/Admin/EditableDataTable";
import { getApiClient } from "~/lib/api.server";
import { commitSession, destroySession, getSession, requireAuth } from "~/lib/auth.server";

// Zodスキーマ定義 (変更なし)
const updateNameSchema = z.object({
	intent: z.literal("updateName"),
	student_ID: z.string().min(1),
	student_Name: z.string().min(1, "名前を入力してください"),
});
const deleteUserSchema = z.object({
	intent: z.literal("deleteUser"),
	student_ID: z.string().min(1),
});
const logoutSchema = z.object({
	intent: z.literal("logout"),
});
const actionSchema = z.discriminatedUnion("intent", [
	updateNameSchema,
	deleteUserSchema,
	logoutSchema,
]);

export async function loader({ request }: LoaderFunctionArgs) {
	const token = await requireAuth(request);
	const session = await getSession(request.headers.get("Cookie"));
	const api = getApiClient(token);

	// ★★★ セッションからフラッシュメッセージを取得 ★★★
	const successMessage = session.get("success") || null;

	try {
		const { users } = await api.getUsers();

		// ★★★ メッセージとユーザーデータを返し、セッションをコミットしてフラッシュをクリア ★★★
		return json({ users, successMessage }, {
			headers: {
				"Set-Cookie": await commitSession(session),
			}
		});
	} catch (error) {
		if (error instanceof Response && (error.status === 401 || error.status === 403)) {
			return redirect("/admin", {
				headers: { "Set-Cookie": await destroySession(session) }
			});
		}
		throw error;
	}
}

// Action関数 (変更なし)
export async function action({ request }: ActionFunctionArgs) {
	const token = await requireAuth(request);
	const api = getApiClient(token);
	const formData = await request.formData();
	const fields = Object.fromEntries(formData.entries());
	const validationResult = actionSchema.safeParse(fields);
	if (!validationResult.success) {
		return Response.json({ error: "無効なリクエストです。", details: validationResult.error.flatten() }, { status: 400 });
	}
	const { intent } = validationResult.data;
	try {
		if (intent === "logout") {
			const session = await getSession(request.headers.get("Cookie"));
			return redirect("/admin", {
				headers: { "Set-Cookie": await destroySession(session) },
			});
		}
		if (intent === "updateName") {
			const { student_ID, student_Name } = validationResult.data;
			await api.updateUserName(student_ID, student_Name);
		} else if (intent === "deleteUser") {
			const { student_ID } = validationResult.data;
			await api.deleteUser(student_ID);
		}
		return Response.json({ success: true });
	} catch (error) {
		if (error instanceof Response) {
			const errorData = await error.json().catch(() => ({ message: "An unexpected error occurred" }));
			return Response.json({ error: errorData.message }, { status: error.status });
		}
		console.error("Action Error:", error);
		return Response.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
	}
}

export default function SettingsPage() {
	const { users, successMessage } = useLoaderData<typeof loader>();
	const toast = useToast();

	// ★★★ loaderから渡されたメッセージを元にトーストを表示 ★★★
	useEffect(() => {
		if (successMessage) {
			toast({
				title: successMessage,
				status: "success",
				duration: 2000,
				isClosable: true,
				position: "top",
			});
		}
	}, [successMessage, toast]);

	return (
		<HeadBar
			otherElements={[
				<ReturnButton address="/admin" />,
				<HomeButton address="/" />,
				<Form method="post">
					<Button type="submit" name="intent" value="logout" colorScheme="red">
						ログアウト
					</Button>
				</Form>,
			]}
		>
			<Box w="100%" h="100%" px="5%" py={["10%", null, "5%"]}>
				<VStack align="start" spacing={4}>
					<Heading size="2xl">管理者用ページ</Heading>
					<Text>ユーザー情報の編集や削除ができます。</Text>
					<EditableDataTable data={users || []} />
				</VStack>
			</Box>
		</HeadBar>
	);
}