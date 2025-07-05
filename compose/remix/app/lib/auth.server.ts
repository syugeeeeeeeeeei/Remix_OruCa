import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "DEFAULT_SESSION_SECRET";
if (sessionSecret === "DEFAULT_SESSION_SECRET") {
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
		},
	});

export async function requireAuth(request: Request) {
	const session = await getSession(request.headers.get("Cookie"));
	const token = session.get("token");
	if (!token || typeof token !== "string") {
		throw redirect("/admin", {
			headers: {
				"Set-Cookie": await destroySession(session),
			}
		});
	}
	return token;
}