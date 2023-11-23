// import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
export default {
	input: [ 'src/facebook.js', "src/twitter.js" ],
	output: {
		dir: "cjs",
		format: "commonjs",
		entryFileNames: "[name].cjs"
	},
	plugins: [ json() ],
	external: [ "puppeteer", "node:crypto", "node:timers/promises" ]
};