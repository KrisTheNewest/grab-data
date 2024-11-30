
import puppeteer from 'puppeteer';
import { setTimeout as wait } from "node:timers/promises";

//TODO: CLEAN UP!!!
//TODO: ACCOMODATE FOR TEXTLESS POSTS

export default async function twitterFeed(handle, token, startUpDate = "00:00:00 UTC 1 January 1970", handleDateMap) {
	const cookies = token;
    const browser = await puppeteer.launch({ headless: "new" });
    const page    = await browser.newPage();
	page.setDefaultTimeout(60 * 1000);

    // you cannot set the cookies without having the page open
    // instead of visitng the profile its the account page to save
    // number of tweeets you can visit per day
    // which can be a problem when pinging the page too often

    // i decided to look for particular posts instead of the node
    // since twitter is generous enough to use article for tweets only
    // its relatively easy
	return page.goto('https://x.com/settings/account')
	.then(() => page.setCookie(...cookies[handle]))
	.then(() => page.goto('https://x.com/' + handle))
	.then(() => wait(3000))
    .then(() => page.$$('::-p-xpath(/html/body//article)')
        .then((articles) => Promise.all(
            // reverse = oldest tweets first
            articles.reverse().map(async (tweet) => {
                // check the date first to save on processing time
                // and opening tweets
                // check the map with saved times:
                // if a date wasn't saved yet it is added with a handle as the key
                // this way we don't need to keep handles in this file
                const postDateJson  = await tweet.$eval("::-p-xpath(.//time)", link => link.getAttribute("datetime"));
                const postDateEpoch = Date.parse(postDateJson);
                const lastDate = handleDateMap
					? handleDateMap.has(handle) ? handleDateMap.get(handle) : Date.parse(startUpDate)
					: 0 ;
                if (postDateEpoch <= lastDate) return 0;
                handleDateMap?.set(handle, postDateEpoch);
                // profile
                // certain parts of tweets are "tagged" data-testid attribute
                // i dunno how reliable it is in a long run
                // but it seems to be the easiest way to grab specific elements
                const names = await tweet.$("::-p-xpath(.//*[@data-testid='User-Name']/div)"); //data-testid="User-Name"
                // all of plain text within the node
                // innerHtml parses every tag in the node
                const profileName = await names.evaluate(e => e.textContent);

                // the avatar next to the tweet on the left
                // retweets don't share the same avatar/handle as the ak twitter
                // so it needs to be scrapped too
				//.//*[not(ancestor:://*[@data-testid='testCondensedMedia')]]//img .//*[not(ancestor::time]
                // cannot use exact match - the value includes the handle/name
                const avatarContainer = await tweet.$("::-p-xpath(.//*[contains(@data-testid, 'UserAvatar-Container')])"); //data-testid="UserAvatar-Container-ArknightsEN"
                const profileLink     = await avatarContainer.$eval("::-p-xpath(.//a)", link => link.href);
                const avatarLink      = await avatarContainer.$eval("::-p-xpath(.//img)", link => link.getAttribute("src").replace("normal", "bigger"));
                // regex: match all alphanumeric values starting from the end of a string (ends at a "/" in this case)
                const postHandle      = profileLink.match(/\w+$/).at(0); //TODO: add a fallback?

                const fullProfile = {
                    name: profileName,
                    handle: postHandle,
                    url: profileLink,
                    avatar: avatarLink,
                };
                // profile

                // cannot use exact match - theres only one URL with status, simpler
                const postUrl  = await tweet.$eval("::-p-xpath(.//a[contains(@href, 'status')])", link => link.href);
				// .//*[not(ancestor::*[@data-testid='testCondensedMedia'])]//*[@data-testid='tweetPhoto']//img
				// any element within the node => any type of element group[not an ancestor of NODE (NOT axis) of any type with []]
				//
                const images   = await tweet.$$eval("::-p-xpath(.//*[not(ancestor::*[@data-testid='testCondensedMedia'])]/*[@data-testid='tweetPhoto']//img)",
                    // orig is the biggest available version, bascially same as 4096x4096
                    // seems like twitter resizes all uploads to 4096
                    // regex: match all alphanumeric values after "name=" ("if they are followed by "name="")
                    imgs => imgs.map(i => i.getAttribute("src").replace(/(?<=name=)\w*/, "orig"))
                );
                // vidoes usually arent rendered at all, gotta check the placeholder text
                // cannot use exact match - better to keep it as is for strings just in caseTM
                const video    = await tweet.$("::-p-xpath(.//*[contains(text(),\"The media could not be played\")])") 
                              || await tweet.$("::-p-xpath(.//video)");
                let postText   = await parseText(tweet);
                let videoUrl   = null;
                const textBtn  = await tweet.$("::-p-xpath(.//span[contains(text(),\"Show more\")])");

                // only open a tweet in the new tab if it includes a point of interest 
                if (textBtn || video) {
                    // open a tweet in a new tab => get video => get full text => close the tab
                    // you can technically get a video on the same page
                    // but its impossible to match it with a specific tweet
                    // and full text is available only if you open the tweet
                    const tweetPage = await goToFullTweet(browser, postUrl);
                    if (video)   videoUrl = await tweetPage.getVideoUrl();
                    if (textBtn) postText = await tweetPage.getFullText();
                    await tweetPage.closeTweet();
                }

                return ({ fullProfile, postUrl, postDate: postDateJson, postText, images, videoUrl, });
            })
        ))
		.then(posts => posts.filter(p => p !== 0))
        .finally(() => browser.close())
	)
}

async function goToFullTweet(browser, url) {

    const tweetPage = await goTo();

    // technically you can get the links in the main page
    // but there is no way to tie them to a post
    async function getVideoUrl() {
        return new Promise((resolve) => {
            // instead of rejecting fallback to a thumbnail
            const fallback = setTimeout(() => {
                console.error("Twitter video didn't arrive in time!");
                const meta = tweetPage.$eval("::-p-xpath(//meta[@property=\"og:image\"])", meta => meta.content);
                resolve(meta);
            }, 20 * 1000);

            tweetPage.on('response', (response) => {
                const reponseUrl = response.url();
				if (reponseUrl.includes("ext_tw_video") && reponseUrl.includes("mp4")) {
                    resolve(reponseUrl);
                    clearTimeout(fallback);
                }
            });
        });
    }
    // full text is available only in the full tweet
    async function getFullText() {
        const tweet = await tweetPage.waitForSelector('::-p-xpath(/html/body//article)');

        return parseText(tweet);
    }
    async function goTo() {
        const tweetPage = await browser.newPage();
        await tweetPage.goto(url);

        return tweetPage;
    }
    async function closeTweet() {
        return tweetPage.close();
    }

    return ({
        getVideoUrl, getFullText, closeTweet,
    });
}

async function parseText(tweet) {
    const textNode = await tweet.$("::-p-xpath(.//*[@data-testid='tweetText'])"); // data-testid="tweetText"
    const fullText = await textNode?.evaluate((e) => e.textContent);

    return fullText;
}
