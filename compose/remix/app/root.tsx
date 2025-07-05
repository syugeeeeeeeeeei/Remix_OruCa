import { ChakraProvider } from "@chakra-ui/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import { WebSocketProvider } from "~/contexts/WebSocketProvider";
import { theme } from "~/lib/theme";

// ローディング中に表示するフォールバックコンポーネント
function AppFallback() {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <title>Loading...</title>
        <Meta />
        <Links />
      </head>
      <body>
        <p>Loading application...</p>
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <ClientOnly fallback={<p>Loading WebSocket...</p>}>
        {() => (
          <WebSocketProvider>
            <Outlet />
          </WebSocketProvider>
        )}
      </ClientOnly>
    </ChakraProvider>
  );
}

// エラーが発生した場合の境界コンポーネント
export function ErrorBoundary() {
  // Remixがデフォルトでエラーを処理
  return <Outlet />;
}