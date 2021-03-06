import React, { useEffect, useState } from "react";
import { isSuperUser, User } from "../../core/auth";

import {
    Popover,
    Position,
    Button,
    ButtonGroup,
    Spinner,
    Classes,
    Icon,
    HTMLSelect,
    Intent
} from "@blueprintjs/core";

import { useTranslation } from "react-i18next";
import { IconNames } from "@blueprintjs/icons";
import { getTurboSession } from "../../core/turbo";
import { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { Storage, storage } from "../../core/storage/storage";
import { RunOptions } from "../my";
import { turboRegions } from "../../core/config";



export function TurboOptions(props: {
    user: User | null,
    onRun: (options: RunOptions) => void,
    intent: Intent
}) {
    const { t, i18n } = useTranslation("my");
    const [turboTime, setTurboTime] = useState<number | null>(null);
    const [userStorage, setUserStorage] = useState<Storage | null>(null);
    const [region, setRegion] = useState<string|null>(null);
    const [updating, setUpdating] = useState<boolean>(false);

    const user = props.user;
    const onRun = props.onRun;
    const lang = i18n.language;

    useEffect(() => {
        setUserStorage(storage(user));
    }, [user]);

    useEffect(() => {
        if (user !== null && userStorage !== null) {
            getTurboSession(user).then((session) => {
                if (session === null) {
                    setTurboTime(0);
                    return;
                }

                setTurboTime(session.restTime);
            });
            userStorage.get("turbo.region").then(setRegion);
        }
    }, [userStorage, user]);

    if (user === null) {
        return <div>
            <div className="sup-text">
                {t("streaming_service")}
            </div>
            <div className="turbo-options turbo-border">
                <Popover content={<div className="popover-inner-card">{t("please_login_for_turbo_mode")}, <Link to={"/" + i18n.language + "/guide/features"}>{t("more")}</Link></div>} position={Position.BOTTOM} isOpen={true}>
                    <Button disabled={true}  icon={IconNames.FAST_FORWARD}>{t("play_turbo")}</Button>
                </Popover>
            </div>
        </div>;
    }

    if (turboTime === null) {
        return <div>
            <div className="sup-text">
                {t("streaming_service")}
            </div>
            <div className="turbo-options turbo-border">
                <Button disabled={true}  icon={IconNames.FAST_FORWARD}>{t("play_turbo")}</Button>
              &nbsp;&nbsp;<Spinner size={16} />
            </div>
        </div>;
    }

    if (turboTime < 60) {
        const popoeverInner = <div className="popover-inner-card">{t("no_time_for_turbo_mode")}, <Link to={"/" + i18n.language + "/profile"}>{t("settings")}</Link></div>;
        return <div>
            <div className="sup-text">
                {t("streaming_service")}
            </div>
            <div className="turbo-options turbo-border">
            <Popover content={<div className="popover-inner-card">{popoeverInner}</div>} position={Position.BOTTOM} isOpen={true}>
                <div>
                    <Button disabled={true}  icon={IconNames.FAST_FORWARD}>{t("play_turbo")}</Button>
                    &nbsp;&nbsp;{timeInfo(turboTime, t)}
                </div>
            </Popover>
            </div>
        </div>;
    }


    const onChangeRegion = (event: any) => {
        setUpdating(true);
        const newRegion = event.currentTarget.value;
        if (userStorage !== null) {
            userStorage.set("turbo.region", newRegion).then((success) => {
                if (success) {
                    setRegion(newRegion);
                }
                setUpdating(false);
            });
        }
    };

    return <div>
        <div className="sup-text">
            {t("streaming_service")}
        </div>
        <div className="turbo-border">
            <div className="turbo-options">
                <ButtonGroup>
                <Button className={props.intent === Intent.PRIMARY ? "heartbeat" : "" } intent={props.intent} icon={IconNames.FAST_FORWARD} onClick={() => onRun({ turbo: true, turboRegion: region || "auto" })}>{t("play_turbo")}</Button>
                <Link className={Classes.BUTTON} to={"/" + lang + "/profile"}>
                    <Icon icon={IconNames.COG} iconSize={16} />
                </Link>
                </ButtonGroup>
                &nbsp;&nbsp;{timeInfo(turboTime, t)}&nbsp;&nbsp;
                <Button intent={props.intent} icon={IconNames.CONSOLE} minimal={true} onClick={() => onRun({ turbo: true, logVisual: true, turboRegion: region || "auto"  })}></Button>
                {
                    isSuperUser(user) ?
                    <Button intent={props.intent} icon={IconNames.LAB_TEST} minimal={true} onClick={() => onRun({ turbo: true, logVisual: true, local: true, turboRegion: region || "auto" })}></Button> :
                    null
                }
            </div>
            <div className="my-region-selector">{t("region")}&nbsp;
                <HTMLSelect minimal={true}
                            options={turboRegions}
                            onChange={onChangeRegion}
                            disabled={updating}
                            value={ region === null ? undefined : region } />
          &nbsp;{ updating ? <Spinner  className="spinner-inline" size={12} /> : null }
            </div>
        </div>
    </div>;
}

function timeInfo(time: number, t: TFunction) {
    if (time < 60) {
        return "0 " + t("min");
    }

    return Math.round(time / 60 * 10) / 10 + " "+ t("min");
};
