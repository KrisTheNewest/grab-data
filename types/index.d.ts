export function twitterFeed(handle: string, cookies: object[], date?: date) : {
    fullProfile: {
        name: string;
        handle: string;
        url: string;
        avatar: string;
    };
    postUrl: string;
    postDate: string;
    postText: string;
    images: string[];
    videoUrl: string | null;
}