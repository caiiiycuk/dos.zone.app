import React, { useEffect, useState } from "react";
import { DosConfigCategory, DosConfigOption, DosConfigValue, DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";
import { EventMapping } from "emulators-ui/dist/types/controls/nipple";
import { Button as ButtonType, ActionType } from "emulators-ui/dist/types/controls/button";
import { Mapper } from "emulators-ui/dist/types/controls/keyboard";

import { EmulatorsUi } from "emulators-ui";
import { TFunction } from "i18next";

import {
    H3,
    Button,
    Collapse,
    Intent,
    Callout,
    Blockquote,
    RadioGroup,
    Radio,
    EditableText,
    NumericInput,
    HTMLSelect,
    TextArea,
    Checkbox,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { layers } from "emulators-ui/dist/types/dom/layers";

declare const emulatorsUi: EmulatorsUi;

const namedKeyCodes = emulatorsUi.controls.namedKeyCodes;
const keyOptions = Object.keys(emulatorsUi.controls.namedKeyCodes);

interface LayerType {
    name: string,
    buttons: ButtonType[],
    gestures: EventMapping[],
    mapper: Mapper,
    image?: string,
};

type LayersType = {[index: string]: LayerType};

const layersDef: LayersType = {
    "keyboard": {
        name: "keyboard",
        buttons: [],
        gestures: [],
        mapper: {},
    },
    "stick-button": {
        name: "stick-button",
        image: "stick-button.jpg",
        buttons: [
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_1"],
                style: ({
                    left: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
        ],
        mapper: {},
        gestures: [
            { joystickId: 0, event: "dir:up", mapTo: namedKeyCodes["KBD_up"], },
            { joystickId: 0, event: "dir:down", mapTo: namedKeyCodes["KBD_down"], },
            { joystickId: 0, event: "dir:left", mapTo: namedKeyCodes["KBD_left"] },
            { joystickId: 0, event: "dir:right", mapTo: namedKeyCodes["KBD_right"] },
            { joystickId: 0, event: "tap", mapTo: 0 },
            { joystickId: 0, event: "end:release", mapTo: 0 },
        ],
    },
    "stick-3-buttons": {
        name: "stick-3-buttons",
        image: "stick-3-buttons.jpg",
        buttons: [
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_1"],
                style: ({
                    left: "16px",
                    bottom: "112px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_2"],
                style: ({
                    left: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_3"],
                style: ({
                    left: "96px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
        ],
        mapper: {},
        gestures: [
            { joystickId: 0, event: "dir:up", mapTo: namedKeyCodes["KBD_up"], },
            { joystickId: 0, event: "dir:down", mapTo: namedKeyCodes["KBD_down"], },
            { joystickId: 0, event: "dir:left", mapTo: namedKeyCodes["KBD_left"] },
            { joystickId: 0, event: "dir:right", mapTo: namedKeyCodes["KBD_right"] },
            { joystickId: 0, event: "tap", mapTo: 0 },
            { joystickId: 0, event: "end:release", mapTo: 0 },
        ],
    },
    "3-buttons": {
        name: "3-buttons",
        image: "3-buttons.jpg",
        buttons: [
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_1"],
                style: ({
                    right: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_2"],
                style: ({
                    right: "96px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_3"],
                style: ({
                    left: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
        ],
        mapper: {},
        gestures: [],
    },
    "4-buttons": {
        name: "4-buttons",
        image: "4-buttons.jpg",
        buttons: [
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_1"],
                style: ({
                    right: "16px",
                    bottom: "112px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_2"],
                style: ({
                    right: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_3"],
                style: ({
                    left: "16px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
            {
                action: "click",
                mapTo: namedKeyCodes["KBD_4"],
                style: ({
                    left: "96px",
                    bottom: "32px",
                } as unknown) as ElementCSSInlineStyle,
            },
        ],
        mapper: {},
        gestures: [],
    },
};


const layersDefNames = Object.keys(layersDef);
const defaultLayer = "keyboard";

export function Layers(props: {
    config: DosConfig,
    t: TFunction
}) {
    const t = props.t;
    const config = props.config;
    const [layers, setLayers] = useState<LayersType>({
        default: {...layersDef[defaultLayer]},
    });

    const [selectedLayer, setSelectedLayer] = useState<string>("default");
    const [version, setVersion] = useState<number>(0);
    const names = Object.keys(layers);

    useEffect(() => {
        (config as any).layers = layers;
    }, []);

    function addLayer() {
        layers["newLayer." + version] = {...layersDef[defaultLayer]};
        setVersion(version + 1);
    }

    function renameLayer(e: any, name: string) {
        const newName = e.currentTarget.value;
        if (newName.length === 0) {
            return;
        }
        layers[newName] = layers[name];
        delete layers[name];
        if (selectedLayer === name) {
            setSelectedLayer(newName);
        } else {
            setVersion(version + 1);
        }
    }

    function removeLayer(name: string) {
        delete layers[name];
        setVersion(version + 1);
    }

    return (<Callout style={ { position: "relative" } }>
        <H3>{t("touch_controls")}</H3>
        <Button 
                minimal={true}
                onClick={addLayer}
                icon={IconNames.ADD}
                style={ { position: "absolute", top: "10px", right: "12px" } }>
        </Button>
        <br/>
        {names.map((name, index) => {
            const selected = name === selectedLayer;
            return <React.Fragment key={index}>
                <div className="layer-container">
                    <Button minimal={true} icon={selected ? IconNames.CHEVRON_DOWN : IconNames.CHEVRON_RIGHT} onClick={() => setSelectedLayer(selected ? "" : name) } />{t("layer")}: &nbsp;&nbsp;
                    { selected ? <input className="bp3-input" value={name} onChange={(e) => renameLayer(e, name)} /> : name }
                    <Button minimal={true} icon={IconNames.TRASH} onClick={() => removeLayer(name)} />
                    <Collapse className="layer-collapse" isOpen={ name === selectedLayer }>
                        <Layer t={t} layer={layers[name]} />
                    </Collapse>
                </div>
            </React.Fragment>
        })}
    </Callout>);
}

function Layer(props: {
    layer: LayerType,
    t: TFunction,
}) {
    const [version, setVersion] = useState<number>(0);
    const t = props.t;
    const layer = props.layer;
    const buttons = layer.buttons || [];
    const gestures = layer.gestures || [];
    const mapper = layer.mapper || {};

    function eventToKeyCode(event: any) {
        const key = event.currentTarget.value;
        return emulatorsUi.controls.namedKeyCodes[key];
    }

    function symbolOfButton(button: ButtonType) {
        if (button.symbol !== undefined) {
            return button.symbol;
        }

        return getKeyCodeName(button.mapTo).substr(4, 2).toUpperCase();
    }

    function onButtonMapToChanged(event: any, button: ButtonType) {
        button.mapTo = eventToKeyCode(event);
        setVersion(version + 1);
    }

    function onButtonActionChanged(event: any, button: ButtonType) {
        const action = event.currentTarget.value;
        button.action = action;
        setVersion(version + 1);
    }

    function onButtonSymbolChanged(event: any, button: ButtonType) {
        const symbol = event.currentTarget.value;
        button.symbol = symbol;
        setVersion(version + 1);
    }

    function onGestureMapToChanged(event: any, gesture: EventMapping) {
        gesture.mapTo = eventToKeyCode(event);
        setVersion(version + 1);
    }

    function onGestureChangeReleaseOnEnd(event: any, finger: 0 | 1) {
        const enabled = event.currentTarget.checked;
        if (enabled) {
            gestures.push({
                joystickId: finger,
                mapTo: 0,
                event: "end:release",
            });
        } else {
            const index = gestures.findIndex((g) => g.joystickId === finger && g.event === "end:release");
            if (index >= 0) {
                gestures.splice(index, 1);
            }
        }
        setVersion(version + 1);
    }

    function onMapperChanged(keyCode: number,
                             newKeyCode: number,
                             mapTo: number) {
        delete mapper[keyCode];
        mapper[newKeyCode] = mapTo;
        setVersion(version + 1);
    }

    function onAddMapping() {
        mapper[0] = 0;
        setVersion(version + 1);
    }

    function onRemoveMapping(keyCode: number) {
        delete mapper[keyCode];
        setVersion(version + 1);
    }

    let thumbComponent = null;
    if (layer.image !== undefined) {
        thumbComponent = (<div>
            {t("thumb_description")}&nbsp;&nbsp;
            <div>
                <img className="layout-thumb" src={ "/layers/" + layer.image } />
            </div>
        </div>);
    }
    let buttonComponent = null;
    if (buttons.length > 0) {
        buttonComponent = (<div>
            {t("buttons_description")}&nbsp;&nbsp;
            {buttons.map((button, index) => {
                return <React.Fragment key={index}>
                    <div className="touch-options">
                        <p>{t("button_symbol")}&nbsp;&nbsp;</p>
                        <input
                            className="bp3-input"
                            style={{width: "6ch"}}
                            value={symbolOfButton(button)}
                            onChange={(e) => onButtonSymbolChanged(e, button)}
                        />
                        <p>&nbsp;&nbsp;{t("key")}&nbsp;&nbsp;</p>
                        <HTMLSelect minimal={false}
                                    options={keyOptions}
                                    onChange={(e) => onButtonMapToChanged(e, button)}
                                    value={getKeyCodeName(button.mapTo)} />&nbsp;&nbsp;&nbsp;&nbsp;
                        <p>&nbsp;&nbsp;{t("action")}&nbsp;&nbsp;</p>
                        <HTMLSelect minimal={false}
                                    options={["click", "hold"]}
                                    onChange={(e) => onButtonActionChanged(e, button)}
                                    value={button.action} />&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </React.Fragment>
            })}
        </div>);
    }

    let gesturesComponent = null;
    if (gestures.length > 0) {
        const releaseOnEnd: {[finger: number]: boolean} = {};
        for (const next of gestures) {
            releaseOnEnd[next.joystickId] = releaseOnEnd[next.joystickId] || next.event === "end:release";
        }
        gesturesComponent = (<div>
            {t("touch_description")}&nbsp;&nbsp;
            {gestures.filter((g) => g.event !== "end:release").map((gesture, index) => {
                return <React.Fragment key={index}>
                    <div className="touch-options">
                        <p>{t("finger")}&nbsp;&nbsp;<code className="bp3-code fake-input"style={{width: "3ch"}}>{gesture.joystickId}</code>&nbsp;&nbsp;</p>
                        <p>{t("gesture")}&nbsp;&nbsp;<code className="bp3-code fake-input" style={{width: "11ch"}}>{gesture.event}</code>&nbsp;&nbsp;</p>
                        <p>{t("key")}</p>&nbsp;&nbsp;
                        <HTMLSelect minimal={false}
                            options={keyOptions}
                            onChange={(e) => onGestureMapToChanged(e, gesture)}
                            disabled={gesture.event === "end:release"}
                            value={getKeyCodeName(gesture.mapTo)} />&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                </React.Fragment>
            })}
            {Object.keys(releaseOnEnd).sort().map((finger, index) => {
                const id  = Number.parseInt(finger, 10);
                return <React.Fragment key={"finger-" + id}>
                    <div className="touch-options">
                        <Checkbox checked={releaseOnEnd[id]} onChange={(e) => onGestureChangeReleaseOnEnd(e, id as any)}>
                            {t("finger")}&nbsp;&nbsp;<code className="bp3-code fake-input"style={{width: "3ch"}}>{finger}</code>&nbsp;&nbsp;
                            {t("release_on_end")}
                        </Checkbox>
                    </div>
                </React.Fragment>
            })}
        </div>);
    }

    const mapperComponent = (<div>
        {t("mapper_description")}&nbsp;&nbsp;
        {Object.keys(mapper).sort().map((key, index) => {
            const keyCode = Number.parseInt(key, 10);
            const mapTo = mapper[keyCode];
            return <React.Fragment key={key}>
                <div className="touch-options">
                    <p>{t("key")}&nbsp;&nbsp;</p>
                    <HTMLSelect minimal={false}
                                options={keyOptions}
                                onChange={(e) => onMapperChanged(keyCode, eventToKeyCode(e), mapTo)}
                                value={getKeyCodeName(keyCode)} />&nbsp;&nbsp;&nbsp;&nbsp;
            <p>&nbsp;&nbsp;{t("key")}&nbsp;&nbsp;</p>
            <HTMLSelect minimal={false}
                        options={keyOptions}
                        onChange={(e) => onMapperChanged(keyCode, keyCode, eventToKeyCode(e))}
                        value={getKeyCodeName(mapTo)} />&nbsp;&nbsp;&nbsp;&nbsp;
            <Button icon={IconNames.TRASH} minimal={true} onClick={() => onRemoveMapping(keyCode)} style={{alignSelf: "flex-start"}}></Button>
                </div>
            </React.Fragment>
        })}
        <div className="touch-options">
            <Button onClick={onAddMapping}>{t("add")}</Button>
        </div>
    </div>);

    function onChangeLayerDef(event: any) {
        const name = event.currentTarget.value;
        const other = layersDef[name];
        layer.name = other.name;
        layer.image = other.image;
        layer.buttons = [...other.buttons];
        layer.gestures = [...other.gestures];
        layer.mapper = {...other.mapper};
        setVersion(version + 1);
    }

    return <div>
        <div style={{display: "flex", alignItems: "baseline", marginBottom: "5px"}}>
            <p>
                {t("control_type")}&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
            <HTMLSelect minimal={false}
                        options={layersDefNames}
                        onChange={onChangeLayerDef}
                        value={layer.name} />
        </div>
        {thumbComponent}
        {buttonComponent}
        {gesturesComponent}
        {mapperComponent}
    </div>;
}

function getKeyCodeName(keyCode: number) {
    for (const next of keyOptions) {
        if (emulatorsUi.controls.namedKeyCodes[next] === keyCode) {
            return next;
        }
    }

    return "KBD_none";
}
