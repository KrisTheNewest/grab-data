## Getting posts from certain webpages
F module is incomplete (WIP)

You have to provide your own token

Import:
```js
const { twitterFeed } = require("@kristhenewest/grab-data");
// OR
import { twitterFeed } from "@kristhenewest/grab-data";
```

Example code:
```js
twitterFeed(
    "X", // string - handle of a twitter account
    token,

    // params below are optional: save on website hits
    // display posts since a certain date
    new Date(), // optional: a parseable date, string or object

    // a map to store the timestamp of the latest post
    MapOfHandlesAndDates, // optional: a Map object
)
.then(posts => { // an array of objects (possibly empty)
    // an example of a single post:
    const {
        fullProfile: {
            name,   // display name of the account
            handle, // handle of the account
            url,    // full url to the account
            avatar, // full url of the current avatar of the account
        },
        postUrl,
        postDate,
        postText, // possibly null if the post was textless
        images,   // an array of image URLs
        videoUrl, // possibly null if the post includes no video
    } = posts.at(0);

    // do something...

})
.catch(err => console.error(err));
```