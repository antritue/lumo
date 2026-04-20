import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: "happy-dom",
		globals: true,
		setupFiles: ["./test/setup.ts"],
	},
});
