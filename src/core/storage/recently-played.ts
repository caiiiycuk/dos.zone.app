import { storage } from "./storage";
import { User } from "../auth";

const recentlyPlayedKey = "recentlyPlayed";

export const a1Bundle = "/b46a42839934a8710efc5a40139be6ee239204fb.jsdos";
export const dhry2Bundle = "/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos";
const dhry2Url = "https://doszone-uploads.s3.dualstack.eu-central-1.amazonaws.com/original/2X/b" + dhry2Bundle;

export type RecentlyPlayed = {[url: string]: {
    visitedAtMs: number,
}};

export async function getRecentlyPlayed(user: User | null): Promise<RecentlyPlayed> {
    const played: RecentlyPlayed = JSON.parse(await storage(user).getDefault(recentlyPlayedKey, "{}"));

    if (Object.keys(played).length === 0) {
        played[dhry2Url] = {
            visitedAtMs: Date.now() - 30 * 1000,
        };
    }

    return played;
}

export function setRecentlyPlayed(user: User | null, recentlyPlayed: RecentlyPlayed): Promise<boolean> {
    return storage(user).set(recentlyPlayedKey, JSON.stringify(recentlyPlayed));
}

