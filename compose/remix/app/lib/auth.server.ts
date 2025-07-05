import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "DEFAULT_SESSION_SECRET_CHANGE_ME";
if (sessionSecret === "DEFAULT_SESSION_SECRET_CHANGE_ME") {
	console.warn(
		"SESSION_SECRET is not set, using default. This is not secure for production."
	);
}

export const { getSession, commitSession, destroySession } =
	createCookieSessionStorage({
		cookie: {
			name: "__session",
			secrets: [sessionSecret],
			sameSite: "lax",
			path: "/",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 60 * 60 * 24, // 1 day
		},
	});

/**
 * リクエストに有効なセッションがあるか確認し、なければログインページにリダイレクトする。
 * @param request 
 * @returns ユーザーの認証トークン
 */
export async function requireAuth(request: Request): Promise<string> {
	const session = await getSession(request.headers.get("Cookie"));
	const token = session.get("token");

	if (!token || typeof token !== "string") {
		// トークンがなければ、セッションを破棄してリダイレクト
		throw redirect("/admin", {
			headers: {
				"Set-Cookie": await destroySession(session),
			}
		});
	}
	return token;
}