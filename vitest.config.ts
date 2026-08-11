import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		globals: true,
		setupFiles: ["./test/setup.ts"],
		pool: "vmThreads",
		projects: [
			{
				extends: true,
				test: {
					name: "dom",
					environment: "happy-dom",
					include: ["**/*.test.tsx", "**/use-auth.test.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "node",
					environment: "node",
					include: [
						"app/api/**/*.test.ts",
						"components/**/*.test.ts",
						"lib/**/*.test.ts",
					],
					exclude: ["**/use-auth.test.ts"],
				},
			},
		],
	},
});
