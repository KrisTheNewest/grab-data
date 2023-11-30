const twitterFeed = require("../cjs/twitter.cjs");
const allCookies = require ('../cookies.json');
const time = require ('../time.json');

twitterFeed("ArknightsEN", allCookies, time, new Map())
	.then(arr => {
		console.log(arr);
	})
	.then(() => console.log("CJS module: green light!"))
	.then(() => console.log("CJS module tests complete!"))
	.catch(err => console.error(err));
