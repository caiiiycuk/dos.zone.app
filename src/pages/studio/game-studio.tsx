import React, { useState } from "react";

import { Link, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import {
    H1, H2, Classes, Intent, AnchorButton
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { State } from "./state";

import { InitFromFile } from "./steps/init-from-file";
import { InitFromUrl } from "./steps/init-from-url";
import { SelectExecutable } from "./steps/select-executable";
import { ConfigureDosbox } from "./steps/configure-dosbox";
import { DownloadArchive } from "./steps/download-archive";

import { Youtube } from "../components/youtube";

const commonSteps = [
    SelectExecutable,
    ConfigureDosbox,
    DownloadArchive,
];

export function GameStudio() {
    const { t, i18n } = useTranslation("studio");
    const { url } = useParams<{ url?: string }>();
    const [step, setStep] = useState<number>(1);
    const [state, setState] = useState<State>({
        url,
        canSkipArchiveCreation: false,
    });

    const props = {
        t,
        lang: i18n.language,
        state,
        nextStep: (state: State) => {
            if (step === 1 && state.config !== undefined) {
                setState({ ...state, canSkipArchiveCreation: true });
                setStep(3);
            } else {
                setState(state);
                setStep(step + 1);
            }
        },
        back: () => {
            setStep(step - 1);
        },
        restart: () => {
            setState({canSkipArchiveCreation: false});
            setStep(1);
        },
    };

    const steps = url === undefined ?
                  [InitFromFile, ...commonSteps] :
                  [InitFromUrl(decodeURIComponent(url)), ...commonSteps];
    const stepComponent = React.createElement(steps[step - 1], props);

    return <div style={{padding: "20px", width: "100%"}}>
        { step === 1 ? <H1>{t("welcome")}</H1> : null }
        { step === 1 ?
        <p>
            {t("description")}&nbsp;
            (<Link to={"/" + i18n.language + "/guide/studio"}>
                {t("read_guide")}
            </Link>)
        </p> : null }

        <div style={{display: "flex", alignItems: "center"}}>
            <H2>{t("step")} {step}/{steps.length}</H2>
            <AnchorButton
                style={{
                    marginLeft: "10px",
                    marginTop: "-20px",
                    visibility: (step > 1 ? "visible" : "hidden")
                }}
                className={Classes.MINIMAL}
                icon={IconNames.CROSS}
                intent={Intent.DANGER}
                onClick={() => props.restart()}></AnchorButton>
        </div>
        <div>
            {stepComponent}
        </div>
        <br/>
        {
            step === 1 ?
            (<div>
                <H2>{t("quick_tour")}</H2>
                <Youtube url="https://www.youtube.com/embed/KPetnv4atXg" />
            </div>) :
            null
        }
    </div>;
}


