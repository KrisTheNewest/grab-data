
// interface TwitterData 

export function twitterFeed(handle: string, token: object[], date?: Date, dateMap?: Map<string, Date>) : Promise<{
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
