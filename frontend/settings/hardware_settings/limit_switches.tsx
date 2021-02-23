import React from "react";
import { BooleanMCUInputGroup } from "./boolean_mcu_input_group";
import { ToolTips, DeviceSetting, Content } from "../../constants";
import { LimitSwitchesProps } from "./interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { Highlight } from "../maybe_highlight";
import { SpacePanelHeader } from "./space_panel_header";
import { settingRequiredLabel } from "./encoders_or_stall_detection";
import { t } from "../../i18next_wrapper";

export function LimitSwitches(props: LimitSwitchesProps) {

  const { limit_switches } = props.controlPanelState;
  const { dispatch, sourceFwConfig, arduinoBusy, firmwareHardware } = props;

  const commonProps = {
    dispatch,
    sourceFwConfig,
    disabled: arduinoBusy,
    firmwareHardware,
  };


  return <Highlight className={"section advanced"}
    settingName={DeviceSetting.limitSwitchSettings}
    hidden={!props.showAdvanced}>
    <Header
      expanded={limit_switches}
      title={DeviceSetting.limitSwitchSettings}
      panel={"limit_switches"}
      dispatch={dispatch} />
    <Collapse isOpen={!!limit_switches}>
      <Highlight settingName={DeviceSetting.limitSwitchesWarning}>
        <div className="limit-switch-warning">
          <p>{t(Content.LIMIT_SWITCH_WARNING)}</p>
        </div>
      </Highlight>
      <SpacePanelHeader />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.enableLimitSwitches}
        tooltip={ToolTips.ENABLE_LIMIT_SWITCHES}
        x={"movement_enable_endpoints_x"}
        y={"movement_enable_endpoints_y"}
        z={"movement_enable_endpoints_z"} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.swapLimitSwitches}
        tooltip={ToolTips.SWAP_LIMIT_SWITCHES}
        x={"movement_invert_endpoints_x"}
        y={"movement_invert_endpoints_y"}
        z={"movement_invert_endpoints_z"}
        grayscale={{
          x: !sourceFwConfig("movement_enable_endpoints_x").value,
          y: !sourceFwConfig("movement_enable_endpoints_y").value,
          z: !sourceFwConfig("movement_enable_endpoints_z").value
        }}
        disabledBy={settingRequiredLabel([DeviceSetting.enableLimitSwitches])} />
      <BooleanMCUInputGroup {...commonProps}
        label={DeviceSetting.invertLimitSwitches}
        tooltip={ToolTips.INVERT_LIMIT_SWITCHES}
        x={"movement_invert_2_endpoints_x"}
        y={"movement_invert_2_endpoints_y"}
        z={"movement_invert_2_endpoints_z"}
        grayscale={{
          x: !sourceFwConfig("movement_enable_endpoints_x").value,
          y: !sourceFwConfig("movement_enable_endpoints_y").value,
          z: !sourceFwConfig("movement_enable_endpoints_z").value
        }}
        disabledBy={settingRequiredLabel([DeviceSetting.enableLimitSwitches])} />
    </Collapse>
  </Highlight>;
}
