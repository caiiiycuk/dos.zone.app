import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { GameStudioGuide } from "./pages/guides/game-studio";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useParams,
} from "react-router-dom";

import { Deeplink } from "./core/deeplink";
import { CapConfig } from "./cap-config";

import { Navigator } from "./ui/navigator";
import { NavigatorPlayer } from "./ui/navigator-player";
import { NavigatorHidden } from "./ui/navigator-hidden";

import { Landing } from "./pages/landing/landing-v2";
import { GameStudio } from "./pages/studio/game-studio";
import { FeaturesGuide } from "./pages/guides/features";
import { My } from "./pages/my";
import { Profile } from "./pages/profile";
import { Player } from "./player/player";
import { User, refresh, getCachedUser } from "./core/auth";

import { parseQuery, QueryParams } from "./core/query-string";
import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { getGameData } from "./core/game-query";

import  { LayersEditor } from "./pages/studio/layers/layers-editor";

declare const realtime: any;

const redirects: {[bundle: string]: string} = {
    "80c8fbe524842580537590f14c3b6b370d5198ca.zip": "https://play.google.com/store/apps/details?id=playerforsoftware.wwwplayer",
    "ad8184c54a28a7f89542fa0b136a2c86adc9379d.zip": "https://play.google.com/store/apps/details?id=playerforsoftware.wwwplayer",
}

function App() {
    const { i18n } = useTranslation();
    const [user, setUser] = useState<User|null>(getCachedUser());
    const [dos, setDosInsatnce] = useState<DosInstance | null>(null);

    const lang = i18n.language;
    const queryParams = () => parseQuery(window.location.search);

    useEffect(() => {
        let cancel = false;
        refresh(user).then((newUser) => {
            if (cancel) {
                return;
            }

            if (user === null || newUser === null) {
                if (user !== newUser) {
                    setUser(newUser);
                }
            } else if (user.sso !== newUser.sso ||
                       user.sig !== newUser.sig ||
                       user.email !== newUser.email ||
                       user.nonce !== newUser.nonce ||
                       user.avatarUrl !== newUser.avatarUrl ||
                       user.username !== newUser.username) {
                setUser(newUser);
            } else {
                // do nothing
            }
        });

        return () => {
            cancel = true;
        };
        //  eslint-disable-next-line
    }, []);

    function resetUser() {
        setUser(null);
    }

    if (typeof realtime !== "undefined" && realtime.startFromMyPage() === true) {
        window.location.pathname = "/" + lang + "/my";
        return null;
    }

    for (const next of Object.keys(redirects)) {
        if (window.location.pathname.indexOf(next) >= 0) {
            window.location.href = redirects[next];
            return null;
        }
    }

    return <Router>
        <Route path={["/:lang/play/:url", "/:lang/player/:url", "/"]} render={({location}) => {
            return <GoogleAnalytics location={location} />;
        }} />
        <CapConfig lang={lang} queryParams={queryParams}></CapConfig>
        <Switch>
            <Route exact path="/">
                <Redirect to={"/" + lang} />
            </Route>
            <Route exact path="/:lang/">
                <Navigator user={user} resetUser={resetUser} showTalksLink={true} />
                <Landing user={user} />
            </Route>
            <Route path={["/:lang/studio/:url", "/:lang/studio"]}>
                <Navigator user={user} resetUser={resetUser} />
                <GameStudio />
            </Route>
            <Route path="/:lang/guide/studio">
                <Navigator user={user} resetUser={resetUser} />
                <GameStudioGuide />
            </Route>
            <Route path="/:lang/guide/features">
                <Navigator user={user} resetUser={resetUser} />
                <FeaturesGuide />
            </Route>
            <Route path={["/:lang/my/list/:listUrl", "/:lang/my/:url", "/:lang/my"]}>
                <Navigator user={user} resetUser={resetUser} />
                <My user={user} />
            </Route>
            <Route path={["/:lang/profile"]}>
                <Navigator user={user} resetUser={resetUser} />
                <Profile user={user} />
            </Route>
            <Route path="/:lang/play/:url">
                <div className="play-player-root">
                    <NavigatorPlayerWrapper user={user} dos={dos} />
                    <div className="play-player-container">
                        <PlayerWrapper user={user} embedded={false} queryParams={queryParams} onDosInstance={setDosInsatnce} />
                    </div>
                </div>
            </Route>
            <Route path="/:lang/player/:url">
                <NavigatorHidden dos={dos} />
                <PlayerWrapper user={user} embedded={true} queryParams={queryParams} onDosInstance={setDosInsatnce} />
            </Route>
            <Route path="/:lang/layers/editor">
                <LayersEditor onClose={() => {}} onApply={() => {}} />
            </Route>
            <Route path="/:lang/dl/:url">
                <Deeplink setUser={setUser} />
            </Route>
        </Switch>
    </Router>;
}

function GoogleAnalytics(props: { location: any }) {
    const { url } = useParams<{url: string}>();
    const location = props.location;
    const pagePath = location.pathname + location.search;

    function reportPageEvent(pagePath: string, pageTitle: string) {
        if (typeof (window as any).gtag === "function") {
            (window as any).gtag("config", "G-5L33M3K6MQ", {
                "page_path": pagePath,
                "page_title": pageTitle,
            });
        }
    }

    if (props.location.pathname.indexOf("/player/") > 0) {
        try {
            reportPageEvent(pagePath, document.referrer || "iframe|" + location.pathname);
            return null;
        } catch {
            // do nothing
        }
    }

    if (url === undefined) {
        reportPageEvent(pagePath, location.pathname);
    } else {
        getGameData(decodeURIComponent(url)).then((gameData) => {
            reportPageEvent(pagePath, gameData.game + "." + gameData.title + " @" + gameData.author);
        }).catch(() => {
            reportPageEvent(pagePath, location.pathname);
        });
    }

    return null;
}

function NavigatorPlayerWrapper(props: {
    user: User | null,
    dos: DosInstance | null,
}) {
    const { url } = useParams<{url: string}>();
    const { user, dos } = props;
    return <NavigatorPlayer dos={dos} user={user} bundleUrl={decodeURIComponent(url)} />
};

function PlayerWrapper(props: {
    user: User | null,
    embedded: boolean,
    queryParams: () => QueryParams,
    onDosInstance: (dos: DosInstance | null) => void;
}) {
    const { url } = useParams<{url: string}>();
    const queryParams = props.queryParams();
    const turbo = (queryParams.turbo || "0") === "1";
    const turboRegion = queryParams.turboRegion || "auto";
    const local = (queryParams.local || "0") === "1";
    const logVisual = (queryParams.logVisual || "0") === "1";
    const logLayers = (queryParams.logLayers || "0") === "1";
    return <Player
               user={props.user}
               bundleUrl={decodeURIComponent(url)}
               embedded={props.embedded}
               turbo={turbo}
               turboRegion={turboRegion}
               local={local}
               logVisual={logVisual}
               logLayers={logLayers}
               onDosInstance={props.onDosInstance}
           ></Player>;
}

export default App;