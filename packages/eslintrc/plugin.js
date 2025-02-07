import { noMixedExport } from "./no-mixed-export.js";
import { noUncalledIIFEInPromiseAll } from "./no-uncalled-iife-in-promise-all.js";
/** @typedef {import("eslint").ESLint.Plugin} Plugin */

/** @type {Plugin} */
const plugin = {
	rules: {
		"no-mixed-export": noMixedExport,
		"no-uncalled-iife-in-promise-all": noUncalledIIFEInPromiseAll,
	},
};
export default plugin;
