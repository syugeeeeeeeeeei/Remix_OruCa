import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import type { Log, User } from '@ShardTypes/PrismaClient';
import { z } from "zod";
import { HomeButton } from "~/components/Buttons/HomeButton";
import { ReturnButton } from "~/components/Buttons/ReturnButton";
import { HeadBar } from "~/components/HeadBar";
import { EditableDataTable } from "~/components/pages/Admin/EditableDataTable";
import { getSession } from "~/lib/auth.server"; // requireAuthは不要

// Zodスキーマ定義
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

// 型定義
type LogWithUser = Log & { user: User };

// Loader関数 (変更なし)
export async function loader({ request }: LoaderFunctionArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const token = session.get("token"); // requireAuthを通っているので、ここでは必ずトークンが取れる
	const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

	try {
		const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		if (!response.ok) {
			// APIサーバー側でトークンが無効と判断された場合もログインへ
			if (response.status === 401 || response.status === 403) {
				return redirect("/admin");
			}
			throw new Error(`API Error: ${response.statusText}`);
		}
		const data = await response.json();
		const users: LogWithUser[] = data.users || [];
		return json({ users });
	} catch (error) {
		console.error("Failed to fetch user data:", error);
		return json({ users: [] });
	}
  }

// Action関数 (Zodバリデーションを追加)
export async function action({ request }: ActionFunctionArgs) {
	const token = await requireAuth(request);
	const formData = await request.formData();
	const fields = Object.fromEntries(formData.entries());

	// Zodでバリデーション
	const validationResult = actionSchema.safeParse(fields);
	if (!validationResult.success) {
		// バリデーション失敗
		return json({ error: "無効なリクエストです。", details: validationResult.error.flatten() }, { status: 400 });
	}

	const { intent } = validationResult.data;
	const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

	// ログアウト処理
	if (intent === "logout") {
		return redirect("/admin", {
			headers: { "Set-Cookie": await destroySession(await getSession(request.headers.get("Cookie"))) },
		});
	}

	// APIリクエストの準備
	let apiPath = '';
	let method = 'PUT';
	let body: Record<string, string> | null = null;

	if (intent === "updateName") {
		const { student_ID, student_Name } = validationResult.data;
		apiPath = `/api/admin/users/${student_ID}/name`;
		body = { student_Name };
	} else if (intent === "deleteUser") {
		const { student_ID } = validationResult.data;
		apiPath = `/api/admin/users/${student_ID}`;
		method = 'DELETE';
	}

	try {
		const response = await fetch(`${API_BASE_URL}${apiPath}`, {
			method,
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: body ? JSON.stringify(body) : null,
		});

		if (!response.ok) {
			const error = await response.json();
			return json({ error: error.message || "操作に失敗しました" }, { status: response.status });
		}
		return json({ success: true });
	} catch (error) {
		return json({ error: "サーバーエラーが発生しました" }, { status: 500 });
	}
}

// コンポーネント (変更なし)
export default function SettingsPage() {
	const { users } = useLoaderData<typeof loader>();
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