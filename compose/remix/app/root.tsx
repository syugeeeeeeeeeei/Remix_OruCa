import { ChakraProvider } from "@chakra-ui/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useOutletContext,
} from "@remix-run/react";
import { WebSocketProvider } from "~/contexts/WebSocketProvider";
import { theme } from "~/lib/theme";

// 型定義
type OutletContextType = {
  ENV: {
    WS_URL: string;
  }
};

// useOutletContext用のカスタムフック
export function useEnvironment() {
  return useOutletContext<OutletContextType>();
}


// --- サーバーサイドで環境変数を読み込むloader ---
export async function loader({ }: LoaderFunctionArgs) {
  return Response.json({
    ENV: {
      WS_URL: process.env.WS_URL || 'ws://localhost:3000',
    },
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          {/* OutletにENVを渡す */}
          <WebSocketProvider ENV={ENV}>
            {children}
          </WebSocketProvider>
        </ChakraProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}