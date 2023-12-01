import { twitterFeed as twitterFeedESM } from "../index.js";
import { twitterFeed } from "../index.cjs";
import allCookies from '../cookies.json' assert { type: 'json' };
import time from '../time.json' assert { type: 'json' };

twitterFeedESM("ArknightsEN", allCookies, time, new Map())
	.then(arr => {
		console.log("ESM", arr);
	})
	.then(() => console.log("ESM index: green light!"))
	.then(() => twitterFeed("ArknightsEN", allCookies, time, new Map()))
	.then(arr => {
		console.log("CJS", arr);
	})
	.then(() => console.log("CJS index: green light!"))
	.then(() => console.log("index tests complete!"))
	.catch(err => console.error(err));
