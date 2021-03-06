import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app";
import * as serviceWorker from "./serviceWorker";

import "./i18n";

import "normalize.css";
// only needed for icon fonts (we not used them)
// import "@blueprintjs/icons/lib/css/blueprint-icons.css"
import "@blueprintjs/core/lib/css/blueprint.css"


const fullUrl = window.location.href;
if (fullUrl.startsWith("https://") && fullUrl.indexOf("?turbo=1") > 0) {
    const newUrl = "http://" + fullUrl.substr("https://".length);
    window.location.href = newUrl;
} else {
    ReactDOM.render(
        <App />,
        document.getElementById("root")
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
