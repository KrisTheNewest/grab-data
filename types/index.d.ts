
// interface TwitterData 

export function twitterFeed(handle: string, cookies: object[], date?: Date) : Promise<{
    fullProfile: {
        name: string;
        handle: string;
        url: string;
        avatar: string;
    };
    postUrl: string;
    postDate: string;
    postText: string | null;
    images: string[];
    videoUrl: string | null;
}[]>;
