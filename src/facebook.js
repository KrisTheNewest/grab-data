
import { createHash, } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import { writeFile } from "fs/promises";

import puppeteer from "puppeteer";

// TODO: add visibility for buttons?
// TODO: limit checking for video in the content
// TODO: check for scrolling
// TODO: add a separate tab for vids (its the first reponse with mp4)

(async function facebookFeed() {

	const browser = await puppeteer.launch({ headless: "new" });
    const page    = await browser.newPage();
	await page.goto('https://www.facebook.com/arknightstw');
	const cookieBtn = await page.waitForSelector('::-p-xpath(/html/body/div[2]/div[1]/div/div[2]/div/div/div/div[2]/div/div[1])', { timeout: 0 });
	await cookieBtn.click();
	const btn2 = await page.waitForSelector('::-p-xpath(/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[1]/div/div[2]/div/div/div/div[1])', { timeout: 0 });
	await btn2.click();
    await wait(2000);
    let encodedString = await page.screenshot({ encoding: "base64" });
        writeFile(`./image1.png`, encodedString, 'base64');
    await page.evaluate(() => Promise.resolve(window.scrollBy(0, 500)));
    await wait(5000);
    let encodedString2 = await page.screenshot({ encoding: "base64" });
        writeFile(`./image2.png`, encodedString2, 'base64');
    await page.evaluate(() => Promise.resolve(window.scrollBy(0, 1000)));
    let encodedString3 = await page.screenshot({ encoding: "base64" });
        writeFile(`./image3.png`, encodedString3, 'base64');
    await wait(5000);
	// this technically includes two nodes: the header and the posts, you could just check for the posts
	// but it just worksTM so i guess its better to keep it this way
	//           the correct node:
	//                           /html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[2]/div[2]
    page.$x("/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[2]/div/child::*")
		.then((posts) => Promise.all(
			posts.reverse().map(async (post, index) => {
		// content node, ie text and images, skips comments
		// this is the entire post basically
		const postContent = await post.$("::-p-xpath(./div/div/div/div/div/div/div/div/div/div/div[2]/div/div/div[3])")
		// this is the text field, some post might not have it so we skip them
		const postText    = await post.$("::-p-xpath(.//*[@data-ad-preview=\"message\"])");

		if (postContent && postText) {
			const postObj = {};

			const shortText = await postText.evaluate((e) => e.textContent); // ".//*[@data-ad-preview=\"message\"]"
			const cleanText = shortText.replaceAll("… See more", "");

			// fb no longer includes dates
			// so to avoid reposts we hash the text to compare
			let ogHash = createHash('sha256');
				ogHash.update(cleanText);

			const readableHash = ogHash.digest('hex');
			// if (!oldPosts.includes(readableHash)) {
			// 	oldPosts.push(readableHash);

				postObj["text"] = cleanText;

				// pics in comments sometimes are identical to the ones in the post
				// so its better to get them from the content node
				// the sooner media is scrapped the better chance to grab thubs
				// before the videos play cause for some reason its impossible to stop them

				// const images = await postContent.$$eval("::-p-xpath(.//img)",
				// 	links => links
				// 		.map((url) => url.src)
				// 		.filter((url) =>
				// 			!url.endsWith(".png") &&
				// 			!url.includes("data:image") &&
				// 			!url.includes("emoji")
				// 		)
				// );
				//TODO: FIX FINDING VIDEO
				// NOT POST!!!!!!!???????
				const englishText = "Przepraszamy, wystąpiły problemy z odtworzeniem tego filmu";
				const polishText  = "Sorry, we're having trouble with playing this video";

				const videoError   = await postContent.$(`::-p-xpath(.//*[contains(text(),"${polishText}") or contains(text(),"${englishText}")])`);
				const videoElement = await postContent.$("::-p-xpath(.//video)"); // Sorry, we're having trouble with playing this video.
				const videoPlayBtn = await postContent.$("::-p-xpath(.//div[3]/div[1]/div/div/div[1]/div[2]/div/div[2]/div/i/div/i)");
					// .then(video => video)  ???????????????????????????
					// .catch(() => null)

				// postObj["media"] = mediaArr;

				// its easier to get the link from the full post 
				// instead of looking for another node
				// first 3 items are the name date and a separator
				const fullLink  = await post.$$eval("::-p-xpath(.//a)", l => l[3].href);
				const shortLink = fullLink.substring(0, fullLink.indexOf("?"));
				let videoLink = null;
				if (videoError || videoElement) {
					const videoPage = await browser.newPage();
					await videoPage.goto(fullLink);
					await new Promise((resolve) => {
						const fallback = setTimeout(() => {
							resolve("Twitter video didn't arrive in time!");
							// const meta = tweetPage.$eval("::-p-xpath(//meta[@property=\"og:image\"])", meta => meta.content);
							// resolve(meta);
							//TODO: ADD retrying
						}, 60 * 1000);
			
						videoPage.on('response', (response) => {
							const reponseUrl = response.url();
							if (reponseUrl.includes("mp4")) {
								resolve(reponseUrl);
								clearTimeout(fallback);
							}
						});
					})
					.then(response => {
						videoLink = response;
					})
					// .then(() => wait(5000))
					.finally(() => videoPage.close());
				}

				postObj["link"] = shortLink;
				postObj["video"] = videoLink;
				// const seeMoreBtn = await postText.$("::-p-xpath(.//*[text()=\"See more\" or text()=\"Zobacz więcej\"])");

				console.log({
				    // shortText,
				    // fullLink,
				    shortLink,
				    // cleanText,
				    // images,
				    videoError,
				    videoElement,
					videoPlayBtn,
					videoLink,
				    readableHash,
				    // seeMoreBtn,
				});

				// if (seeMoreBtn) {
				// // 	// bunch of waits to make sure
				// // 	// everything scrolls and loads in time
				// 	await wait(index * 10 * 1000);

				// // 	//TODO: skip scorlling? keep it because it works?
				// // 	// location of the buttons on the page
				// // 	// cannot click outside the window
				// // 	// const { y } = await post.getRect(); //x y

				// // 	//probably not necessary since we're clicking with js anyway
				// // 	// await seeMoreBtn.scrollIntoView();
				// // 	// await wait(2000);
					
				// // 	// clicking with the driver is unreliable since the UI covers the button
				// // 	// await faceBookDriver.actions().click(seeMore).perform();
				// 	await seeMoreBtn.click();
				// 	await wait(2000);

				// 	const fullTextNode = await post.$("::-p-xpath(.//*[@data-ad-preview=\"message\"])"); 
				//     const fullText = await fullTextNode.evaluate((e) => e.textContent); // ".//*[@data-ad-preview=\"message\"]"

				// 	console.log(fullText);
				// }
				return postObj;
			// }
			// else {
			// 	return (0);
			// }
		}
		// else {
		// 	console.log({
		// 		postContent, postText
		// 	});
		// }
		})
	))
	// .then(posts => {
	// 	console.log(posts);
	// })
	.finally(() => {
		browser.close();
	});
})();
