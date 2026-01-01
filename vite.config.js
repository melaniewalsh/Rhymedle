import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			$actions: path.resolve("./src/actions"),
			$components: path.resolve("./src/components"),
			$data: path.resolve("./src/data"),
			$routes: path.resolve("./src/routes"),
			$runes: path.resolve("./src/runes"),
			$styles: path.resolve("./src/styles"),
			$svg: path.resolve("./src/svg"),
			$utils: path.resolve("./src/utils")
		}
	}
});
