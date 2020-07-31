import React from 'react';

import { useTranslation } from 'react-i18next';

import { GameStudioGuide } from "./pages/guides/game-studio";

import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useParams,
} from "react-router-dom";

import { CapConfig } from "./cap-config";

import { Navigator } from "./ui/navigator";
import { NavigatorBack } from "./ui/navigator-back";

import { Landing } from "./pages/landing";
import { GameStudio } from "./pages/game-studio";
import { My } from "./pages/my";
import { Player } from "./player/player";

function PlayerWrapper() {
    const { url } = useParams();
    return <Player bundleUrl={decodeURIComponent(url)}></Player>;
}


function App() {
    const { i18n } = useTranslation();
    const lang = i18n.language;

    return <Router>
        <CapConfig lang={lang}></CapConfig>
        <Switch>
            <Route exact path="/">
                <Redirect to={"/" + lang} />
            </Route>
            <Route exact path="/:lang/">
                <Navigator />
                <Landing />
            </Route>
            <Route path="/:lang/studio">
                <Navigator />
                <GameStudio />
            </Route>
            <Route path="/:lang/guide/studio">
                <Navigator />
                <GameStudioGuide />
            </Route>
            <Route path={["/:lang/my/:url", "/:lang/my"]}>
                <Navigator />
                <My />
            </Route>
            <Route path="/:lang/eplayer/:url">
                <div className="eplayer-root">
                    <NavigatorBack />
                    <div className="eplayer-container">
                        <PlayerWrapper />
                    </div>
                </div>
            </Route>
            <Route path="/:lang/player/:url">
                <PlayerWrapper />
            </Route>
        </Switch>
    </Router>;
}

export default App;
