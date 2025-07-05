import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";

// このloaderが/admin配下のすべてのルートで最初に実行される
export async function loader({ request }: LoaderFunctionArgs) {
	// 認証されていなければ、この時点で/admin (ログインページ) にリダイレクトされる
	await requireAuth(request);
	return null;
}

export default function AdminLayout() {
	// 認証済みのユーザーのみがこのOutlet（子ルート）を表示できる
	return <Outlet />;
}