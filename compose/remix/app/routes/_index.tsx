import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { Log, User } from '@ShardTypes/PrismaClient'; // 修正
import { SettingButton } from "~/components/Buttons/SettingButton";
import { HeadBar } from "~/components/HeadBar";
import { DataTable } from "~/components/pages/MainPage/DataTable";

// APIのレスポンスに合わせた型を定義
export type LogWithUser = Log & { user: User | null };

export async function loader({ }: LoaderFunctionArgs) {
  const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
  try {
    // バックエンドに /api/logs のようなエンドポイントを実装する必要がある
    const response = await fetch(`${API_BASE_URL}/api`);
    if (!response.ok) {
      console.error(`API fetch failed with status: ${response.status}`);
      return Response.json({ initialData: [] as LogWithUser[], error: "初期データの読み込みに失敗しました。" });
    }
    // APIのレスポンスが { logs: [...] } という形式であると仮定
    const data = await response.json();
    const initialData: LogWithUser[] = data.logs || [];
    return Response.json({ initialData });
  } catch (error) {
    console.error("Failed to fetch initial logs:", error);
    return Response.json({ initialData: [] as LogWithUser[], error: "サーバーとの通信に失敗しました。" }, { status: 500 });
  }
}

export default function MainPage() {
  const { initialData, error } = useLoaderData<typeof loader>();

  return (
    <HeadBar
      otherElements={[<SettingButton address="/admin" />]}
    >
      <Box w="100%" h="100%" px="5%" py={["10%", null, "5%"]}>
        {error && (
          <VStack>
            <Heading color="red.500">Error</Heading>
            <Text>{error}</Text>
          </VStack>
        )}
        <DataTable initialData={initialData} />
      </Box>
    </HeadBar>
  );
}