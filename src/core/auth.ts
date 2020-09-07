import { GET } from "../core/xhr/GET";

const endpointBase = "https://i2sunu2gs9.execute-api.eu-central-1.amazonaws.com/dev";

const ssoUrl = endpointBase + "/sso/url";
const ssoLogin = endpointBase + "/sso/login";
const ssoLogout = endpointBase + "/sso/logout";

const userKey = "zone.dos.user";

export async function requestLogin() {
    const response = JSON.parse(await GET(ssoUrl + "?url=" + window.location.href));
    const url = response.url;
    console.log(url);
    window.open(url, "_self");
}

export interface User {
    avatarUrl: string,
    email: string,
    nonce: string,
    username: string,
    sso: string,
    sig: string,
    time: number,
}
export function getCachedUser() {
    const cachedValue: string | null = localStorage.getItem(userKey);
    return cachedValue === null ? null : JSON.parse(cachedValue);
}

export async function authenticate(user: User | null): Promise<User | null> {
    const { sso, sig } = parseQuery(window.location.search);
    if (sso) {
        const payload = parseQuery(atob(sso));
        user = {
            avatarUrl: payload.avatar_url,
            email: payload.email,
            username: payload.username,
            nonce: payload.nonce,
            sso,
            sig,
            time: Date.now(),
        };
    }

    if (user !== null) {
        user = await validateUser(user);
    }

    if (user !== null) {
        localStorage.setItem(userKey, JSON.stringify(user));
    } else {
        localStorage.removeItem(userKey);
    }

    if (sso) {
        window.history.replaceState({}, "", window.location.pathname);
    }

    return user;
}

async function validateUser(user: User): Promise<User | null> {
    const payload = JSON.parse(await GET(ssoLogin + "?sso=" + user.sso +
        "&sig=" + user.sig + "&ua=" + btoa(window.navigator.userAgent)));
    return Promise.resolve(payload.user);
}

export async function requestLogout() {
    const user = getCachedUser();
    if (user !== null) {
        const payload = JSON.parse(await GET(ssoLogout + "?sso=" + user.sso +
            "&sig=" + user.sig));
        if (payload.success) {
            localStorage.removeItem(userKey);
            window.location.reload();
        }
    }
}

function parseQuery(queryString: string) {
    let query: {[key: string]: string} = {};
    let pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i].split("=");
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
}
