import React, { useEffect, useState } from "react";

import { LayerControl } from "emulators-ui/dist/types/controls/layers-config";

import { EditorStackProps } from "../layers-editor";
import { getControl } from "./controls";
import { HTMLSelect, FormGroup } from "@blueprintjs/core";

export const KeyboardControl: React.FC<EditorStackProps> = props => {
    const { t } = props;
    const [control, setControl] = useState<LayerControl | null>(null);

    useEffect(() => {
        setControl(initDefault(getControl(props)));
    }, [props.config.layers, props.breadCrumbs.layer, props.breadCrumbs.layerControl]);


    if (control === null) {
        return null;
    }

    return <div>
        <FormGroup
            label={t("symbol")}
            inline={true}>
            <HTMLSelect disabled={true} options={[control.symbol]} value={control.symbol}>
            </HTMLSelect>
        </FormGroup>
    </div>;
}

function initDefault(control: LayerControl): LayerControl {
    control.symbol = "⌨";
    return control;
}
