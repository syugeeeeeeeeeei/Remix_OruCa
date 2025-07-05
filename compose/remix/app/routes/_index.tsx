import { Box } from "@chakra-ui/react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SettingButton } from "~/components/Buttons/SettingButton";
import { HeadBar } from "~/components/HeadBar";
import { DataTable } from "~/components/pages/MainPage/DataTable";

// loaderはAPIを叩かず、空のデータを返すだけにする
export async function loader({ }: LoaderFunctionArgs) {
  return Response.json({ initialData: [] });
}

export default function MainPage() {
  const { initialData } = useLoaderData<typeof loader>();
  return (
    <HeadBar
      otherElements={[<SettingButton address="/admin" />]}
    >
      <Box w="100%" h="100%" px="5%" py={["10%", null, "5%"]}>
        {/* DataTableは空のデータで初期化され、WebSocketからのメッセージで更新される */}
        <DataTable initialData={initialData} />
      </Box>
    </HeadBar>
  );
}