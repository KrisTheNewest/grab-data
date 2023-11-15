import twitterFeed from "../src/twitter.js";
import allCookies from './../cookies.json' assert { type: 'json' }; 

twitterFeed("ArknightsEN", allCookies)
	.then(arr => {
		console.log(arr);
	})
	.catch(err => console.error(err));