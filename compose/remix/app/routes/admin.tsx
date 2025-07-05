import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";

// このloaderが/admin配下のすべてのルートで最初に実行される
export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);

	// ★★★ 修正点 ★★★
	// アクセス先のパスがログインページ('/admin')そのものである場合は、
	// 認証チェックを行わずに処理を通過させる。
	if (url.pathname === '/admin') {
		return null;
	}

	// それ以外の/admin配下のすべてのルート（/admin/settings など）では、
	// 従来通り認証を要求する。
	await requireAuth(request);
	return null;
}

export default function AdminLayout() {
	// 認証済みのユーザーのみがこのOutlet（子ルート）を表示できる
	return <Outlet />;
}