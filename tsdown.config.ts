import { defineConfig } from "tsdown";

export default defineConfig({
	entry: "src/index.ts",
	format: ["cjs", "esm"],
	platform: "neutral",
	dts: true,
	// Keep `require()` returning `{ default }`, as earlier releases did
	cjsDefault: false,
});
