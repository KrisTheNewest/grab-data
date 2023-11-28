export function twitterFeed(handle: String, cookies: Object[], date?: Date) : {
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