import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import {
    H1, H2, Classes, FileInput, Intent, Spinner,
    Tree, ITreeNode, Button, AnchorButton, ButtonGroup
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import { JsDosZipData, ZipExecutables } from "../core/zip-explorer";
import { TFunction } from "i18next";
import { Emulators } from "emulators";

import { DosConfigUi } from "./dos-config-ui";
import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";

import ReactMardown from "react-markdown/with-html";
import { renderers } from "../core/renderers";

import { Player } from "../player/player";
import { GET_BUFFER } from "../core/xhr/GET";
import { getCachedGameData } from "../core/game-query";

import { Capacitor, FilesystemDirectory, Plugins } from "@capacitor/core";
import i18n from "../i18n";

const { Filesystem } = Plugins;
declare const emulators: Emulators;

interface State {
    slug?: string,
    name?: string,
    zip?: Uint8Array,
    executables?: string[],
    executable?: string,
    config?: DosConfig,
    bundle?: Uint8Array,
    canSkipArchiveCreation: boolean,
}

interface StepProps {
    t: TFunction,
    lang: string,
    state: State,
    nextStep: (state: State) => void;
    back: () => void;
    restart: () => void;
}

async function restoreConfig(jsdosZipData: JsDosZipData): Promise<DosConfig | undefined> {
    if (jsdosZipData.config !== undefined) {
        return jsdosZipData.config;
    }

    if (jsdosZipData.dosboxConf !== undefined && jsdosZipData.dosboxConf.length > 0) {
        const content = jsdosZipData.dosboxConf.split("\n");
        const index = content.indexOf("type jsdos~1/readme.txt");
        if (index < 0 || index + 3 >= content.length) {
            return undefined;
        }

        const dosBundle = await emulators.dosBundle();
        const config = dosBundle.config;
        config.autoexec.options.script.value = content[index + 3];
        return config;
    }

    return undefined;
}


function InitFromFileStep(props: StepProps) {
    const {t, state, nextStep} = props;
    const [error, setError] = useState<string>("");
    const [loadProgress, setLoadProgress] = useState<number>(0);
    const [reader, setReader] = useState<FileReader|null>(null);

    function onInputChange(e: any) {
        const files = e.currentTarget.files as FileList;
        if (files.length === 0) {
            setReader(null);
            return;
        }

        setError("");

        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            const zip = new Uint8Array(reader.result as ArrayBuffer);
            const blob = new Blob([zip]);
            setLoadProgress(100);

            try {
                const jsdosZipData = await ZipExecutables(blob);
                const name = file.name.substr(0, file.name.lastIndexOf("."));
                nextStep({
                    ...state,
                    name,
                    zip,
                    executables: jsdosZipData.executables,
                    config: await restoreConfig(jsdosZipData),
                });
            } catch (e) {
                setError(t("zip_error") + e);
                setReader(null);
                setLoadProgress(0);
            }
        });
        reader.addEventListener("progress", (e) => setLoadProgress(e.loaded / e.total));
        reader.readAsArrayBuffer(file);
        setReader(reader);
    }

    return <div>
        <p>{t("upload")}&nbsp;
            <span style={{color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737"}}>ZIP</span>&nbsp;or&nbsp;
    <span style={{color: "#D9822B", fontWeight: "bold", borderBottom: "2px solid #DB3737"}}>JsDos</span>&nbsp;{t("archive")} ({t("try")} <a href="https://caiiiycuk.github.io/dosify/digger.zip">digger.zip</a>)</p>
    <div style={{display: "flex"}}><FileInput disabled={reader !== null} text={t("choose_file")} onInputChange={onInputChange} />&nbsp;&nbsp;<Spinner size={16} intent={Intent.PRIMARY} value={loadProgress} /></div>
    <p><span style={{color: "#DB3737", display: (error.length === 0 ? "none" : "block") }}>*&nbsp;{error}</span></p>
    </div>;
};

function initFromUrl(url: string) {
    return function InitFromUrlSteps(props: StepProps) {
        const { state } = props;
        const [error, setError] = useState<string>("");

        useEffect(() => {
            if (url === undefined) {
                return;
            }

            let cancel = false;
            GET_BUFFER(url)
                .then(async (data) => {
                    if (cancel) {
                        return;
                    }

                    const zip = new Uint8Array(data);
                    const blob = new Blob([zip]);
                    try {
                        const jsdosZipData = await ZipExecutables(blob);
                        if (cancel) {
                            return;
                        }

                        const gameData = getCachedGameData(url);
                        const slug = gameData?.slug[props.lang] || gameData?.slug.en;
                        props.nextStep({
                            ...state,
                            name: slug,
                            slug,
                            zip,
                            executables: jsdosZipData.executables,
                            config: await restoreConfig(jsdosZipData),
                        });
                    } catch (e) {
                        setError(props.t("zip_error") + e);
                    }
                })
                .catch((e) => {
                    if (cancel) {
                        return;
                    }

                    setError(e);
                });

            return () => {
                cancel = true;
            }
        }, []);

        if (error.length > 0) {
            return <div>
                <p><span style={{color: "#DB3737", display: (error.length === 0 ? "none" : "block") }}>*&nbsp;{error}</span></p>
            </div>;
        }

        return <div>
            {props.t("loading")}
            <div style={{display: "flex", marginTop: "12px"}}><Spinner/></div>
        </div>;
    }
}

const commonSteps = [
    (props: StepProps) => {
        const {t, state, nextStep} = props;
        const [executable, setExecutable] = useState<string | null>(null);

        const executables: string[] = state.executables || [];

        if (executable !== null) {
            const next = () => {
                nextStep({
                    ...state,
                    executable: executable as string,
                });
            };

            return <div>
                <p>{t("selected_executable")}</p>
                <div style={{
                    background: "#394B59",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    width: "max-content",
                }}>
                    <span style={{
                        color: "#D9822B",
                        fontWeight: "bold",
                        marginRight: "20px",
                    }}>{executable}</span>
                    <Button disabled={executables.length === 1} className={Classes.MINIMAL} onClick={() => setExecutable(null)}>{t("select_other")}</Button>
                </div>
                <br/>
                <div>
                    <Button intent={Intent.PRIMARY} onClick={next}>{t("use_this")}</Button>
                </div>
            </div>;
        }

        if (executables.length === 0) {
            return <div>
                <p>
                    <span style={{color: "#DB3737", fontWeight: "bold"}}>{t("executable_not_found")}</span>
                </p>
                <Button icon={IconNames.RESET} intent={Intent.PRIMARY} onClick={() => props.restart()}>{t("try_other")}</Button>
            </div>
        }

        if (executables.length === 1) {
            setExecutable(executables[0]);
            return <Spinner></Spinner>;
        }

        const nodes: ITreeNode[] = [];
        for (const next of executables) {
            nodes.push({
                id: next,
                label: next,
                icon: IconNames.CIRCLE,
            });
        }
        return <div>
            <p>{t("select_executable")}</p>
            <div style={{
                background: "#394B59",
                padding: "10px 0px",
            }}>
                <Tree contents={nodes} onNodeClick={(node) => setExecutable(node.id + "")} />
            </div>
        </div>
    },

    (props: StepProps) => {
        const {t, state, nextStep} = props;
        const [error, _setError] = useState<string>("");
        const [loading, setLoading] = useState<boolean>(false);
        const [config, setConfig] = useState<DosConfig | null>(() => {
            if (state.config) {
                return state.config;
            }

            setTimeout(() => {
                emulators.dosBundle()
                         .then((bundle) => {
                             bundle.autoexec(state.executable + "");
                             state.config = bundle.config;
                             setConfig(state.config);
                         })
                         .catch(() => setError(new Error("Can't crate dos bundle")));
            }, 1);
            return null;
        });

        const setError = (error: Error) => {
            _setError(error.message + "\n\n" + JSON.stringify(error.stack));
        };

        const createArchive = async () => {
            setLoading(true);
            const dosBundle = await emulators.dosBundle();
            dosBundle.config = config as DosConfig;

            const blob = new Blob([state.zip as Uint8Array]);
            const url = URL.createObjectURL(blob);

            dosBundle
                .extract(url);

            const archive = await dosBundle.toUint8Array(true);
            URL.revokeObjectURL(url);

            nextStep({
                ...state,
                bundle: archive,
            });
        };

        const startArchive = async () => {
            nextStep({
                ...state,
                bundle: state.zip as Uint8Array,
            })
        };

        if (loading || config === null) {
            return <div>
                <Spinner/>
            </div>;
        }


        return <div>
            {error}
            <DosConfigUi config={config as DosConfig} t={t}></DosConfigUi>
            <ButtonGroup>
                <Button onClick={() => createArchive().catch(setError)} intent={Intent.PRIMARY}>{t("create")}</Button>
                { state.canSkipArchiveCreation ? <Button onClick={() => startArchive()}>{t("skip_create")}</Button> : null }
            </ButtonGroup>
        </div>;
    },

    (props: StepProps) => {
        const {t, state, back} = props;
        const [url] = useState<string>(() => {
            const blob = new Blob([state.bundle as Uint8Array], {
                type: "application/zip"
            });
            return URL.createObjectURL(blob);
        });
        const [bundleUrl, setBundleUrl] = useState<string|undefined>(url);
        const [platformUri, setPlatformUri] = useState<string|undefined>(undefined);

        useEffect(() => {
            window.scrollTo(0, 0);
        }, []);

        const onDownload = () => {
            const fileName = state.name + ".jsdos";
            if (Capacitor.isNative) {
                const reader = new FileReader();
                reader.readAsDataURL(new Blob([state.bundle as Uint8Array]));
                reader.onloadend = async () => {
                    const result = await Filesystem.writeFile({
                        path: fileName,
                        data: reader.result as string,
                        directory: FilesystemDirectory.Documents,
                    });

                    setPlatformUri(result.uri);
                }
                return;
            }

            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.style.display = "none";
            document.body.appendChild(a);

            a.click();
            a.remove();
        }

        const onStopStart = () => {
            if (bundleUrl) {
                setBundleUrl(undefined);
            } else {
                setBundleUrl(url);
            }
        }

        function openTopic() {
            if (state.slug === undefined) {
                return;
            }

            window.open("https://talks.dos.zone/t/" + state.slug, "_target");
        }

        const gameTopicComponent =  (state.slug !== undefined ?
                                     <Button onClick={openTopic} icon={IconNames.COMMENT} intent={Intent.NONE}>{t("open_topic")}</Button> :
                                     <AnchorButton
            href={"https://talks.dos.zone/search?expanded=true&q=" + encodeURIComponent((state.name || "") + " #" + i18n.language)}
            target="_blank"
            icon={IconNames.COMMENT}>{t("open_topic")}</AnchorButton>);

        const markdownRenderers = {...renderers};
        markdownRenderers.link = (props: any) => {
            return gameTopicComponent;
        }

        return <div>
            <div style={{
                position: "relative",
                width: "64vw",
                height: "40vw",
                background: "black",
            }}>
                <Player bundleUrl={bundleUrl as string} user={null} embedded={true} turbo={false} />
            </div>
            <br/>
            <ButtonGroup>
            <Button onClick={back} icon={IconNames.ARROW_LEFT}>{t("back")}</Button>
        { platformUri === undefined ?
          <Button onClick={onDownload} icon={IconNames.ARCHIVE} intent={Intent.PRIMARY}>{t("download")}</Button> :
          null
        }
        { gameTopicComponent }
            <Button onClick={onStopStart} icon={IconNames.STOP} intent={Intent.WARNING}>{bundleUrl ? t("stop") : t("start")}</Button>
            </ButtonGroup>
            <br/>
            { platformUri !== undefined ? <div className="platformUri"><br/><strong>{t("downloded_to")}:</strong>&nbsp;{platformUri}</div> : null }
            <br/>
            <ReactMardown renderers={markdownRenderers}
                          source={t("help", {lang: props.lang, game: state.name})}
                          escapeHtml={false}></ReactMardown>
        </div>;
    },
];

export function GameStudio() {
    const { t, i18n } = useTranslation("studio");
    const { url } = useParams<{ url?: string }>();
    const [step, setStep] = useState<number>(1);
    const [state, setState] = useState<State>({
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
                  [InitFromFileStep, ...commonSteps] :
                  [initFromUrl(decodeURIComponent(url)), ...commonSteps];
    const stepComponent = React.createElement(steps[step - 1], props);

    return <div className={Classes.TEXT_LARGE}
                style={{padding: "40px"}}>
        <H1>{t("welcome")}</H1>
        <p>
            {t("description")}&nbsp;
            (<Link to={"/" + i18n.language + "/guide/studio"}>
                {t("read_guide")}
            </Link>)
        </p>

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
                <iframe
                    width="560"
                    height="315"
                    style={{maxWidth: "100%"}}
                    src="https://www.youtube.com/embed/KPetnv4atXg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen>
                </iframe>
            </div>) :
            null
        }
    </div>;
}


