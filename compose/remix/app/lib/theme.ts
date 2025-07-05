import { extendTheme } from "@chakra-ui/react";
import '@fontsource/biz-udpgothic/400.css';

export const theme = extendTheme({
	colors: {
		default: {
			50: "#e8e5f1",
			100: "#c3bcd6",
			200: "#9e92bb",
			300: "#7969a1",
			400: "#554087",
			500: "#3d286d",
			600: "#1E0E51", // primary color
			700: "#170b3e",
			800: "#10072b",
			900: "#080418",
		},
	},
	fonts: {
		heading: `'BIZ UDPGothic', sans-serif`,
		body: `'BIZ UDPGothic', sans-serif`,
	},
});