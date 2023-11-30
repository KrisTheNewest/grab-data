import { userFeed as userFeedESM } from "../index.js";
import { userFeed } from "../index.cjs";
import allCookies from '../cookies.json' assert { type: 'json' };
import time from '../time.json' assert { type: 'json' };

userFeedESM("ArknightsEN", allCookies, time, new Map())
	.then(arr => {
		console.log("ESM", arr);
	})
	.then(() => console.log("ESM index: green light!"))
	.then(() => userFeed("ArknightsEN", allCookies, time, new Map()))
	.then(arr => {
		console.log("CJS", arr);
	})
	.then(() => console.log("CJS index: green light!"))
	.then(() => console.log("index tests complete!"))
	.catch(err => console.error(err));
