import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setPublicDir(path.join(process.cwd(), "remotion/public"));

Config.overrideWebpackConfig((config) => {
	return {
		...config,
		resolve: {
			...config.resolve,
			alias: {
				...config.resolve?.alias,
				"@": path.join(process.cwd()),
			},
		},
	};
});
