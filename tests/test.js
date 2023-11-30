import twitterFeed from "../src/twitter.js";
import allCookies from './../cookies.json' assert { type: 'json' };
import time from './../time.json' assert { type: 'json' };

twitterFeed("ArknightsEN", allCookies, time, new Map())
	.then(arr => {
		console.log(arr);
	})
	.catch(err => console.error(err));
