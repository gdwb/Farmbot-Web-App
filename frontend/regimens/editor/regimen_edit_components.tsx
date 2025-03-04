import React from "react";
import { RegimenProps } from "../interfaces";
import { ColorPicker, SaveBtn } from "../../ui";
import { editRegimen } from "../actions";
import { t } from "../../i18next_wrapper";
import { VariableNode } from "../../sequences/locals_list/locals_list_support";
import { ScopeDeclarationBodyItem } from "farmbot";
import { defensiveClone } from "../../util";
import {
  addOrEditBodyVariables,
} from "../../sequences/locals_list/handle_select";
import { overwrite, save, destroy } from "../../api/crud";
import { CopyButton } from "./copy_button";
import { push } from "../../history";

export const RegimenColorPicker = ({ regimen, dispatch }: RegimenProps) =>
  <ColorPicker
    current={regimen.body.color || "gray"}
    onChange={color => dispatch(editRegimen(regimen, { color }))} />;

export const editRegimenVariables = (props: RegimenProps) =>
  (bodyVariables: VariableNode[]) =>
    (variable: ScopeDeclarationBodyItem) => {
      const copy = defensiveClone(props.regimen);
      copy.body.body = addOrEditBodyVariables(bodyVariables, variable);
      props.dispatch(overwrite(props.regimen, copy.body));
    };

export const RegimenButtonGroup = (props: RegimenProps) => {
  const { regimen, dispatch } = props;
  return <div className="button-group">
    <SaveBtn
      status={regimen.specialStatus}
      onClick={() => dispatch(save(regimen.uuid))} />
    <RegimenColorPicker regimen={regimen} dispatch={dispatch} />
    <CopyButton regimen={regimen} dispatch={dispatch} />
    <i className={"fa fa-trash"}
      title={t("delete regimen")}
      onClick={() => dispatch(destroy(regimen.uuid))
        .then(() => push("/app/designer/regimens/"))} />
  </div>;
};

export const OpenSchedulerButton = () =>
  <div className={"open-bulk-scheduler-btn-wrapper"}>
    <button className={"fb-button gray"}
      title={t("open scheduler panel")}
      onClick={() => push("/app/designer/regimens/scheduler")}>
      {t("Schedule item")}
    </button>
  </div>;
