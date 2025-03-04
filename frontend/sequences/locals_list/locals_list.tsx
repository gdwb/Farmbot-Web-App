import React from "react";
import { t } from "../../i18next_wrapper";
import {
  addOrEditDeclarationLocals, NOTHING_SELECTED,
} from "../locals_list/handle_select";
import {
  AllowedVariableNodes, LocalsListProps, VariableNode,
} from "../locals_list/locals_list_support";
import { defensiveClone, betterCompact } from "../../util/util";
import {
  TaggedSequence,
  ParameterDeclaration,
  ScopeDeclarationBodyItem,
  ParameterApplication,
} from "farmbot";
import { overwrite } from "../../api/crud";
import { LocationForm } from "./location_form";
import {
  SequenceMeta, determineDropdown, determineVector,
} from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";
import { error } from "../../toast/toast";
import { variableIsInUse } from "./sanitize_nodes";
import { shouldDisplayFeature } from "../../farmware/state_to_props";
import { Feature } from "../../devices/interfaces";

export interface LocalListCbProps {
  dispatch: Function;
  sequence: TaggedSequence;
}

/** Overwrite sequence locals (scope declaration). */
export const localListCallback =
  ({ dispatch, sequence }: LocalListCbProps) =>
    (declarations: ScopeDeclarationBodyItem[]) =>
      (declaration: ScopeDeclarationBodyItem) => {
        const clone = defensiveClone(sequence.body); // unfortunate
        clone.args.locals = addOrEditDeclarationLocals(declarations, declaration);
        dispatch(overwrite(sequence, clone));
      };

export const removeVariable = ({ dispatch, sequence }: LocalListCbProps) =>
  (label: string) => {
    if (variableIsInUse(sequence.body, label)) {
      error(t("This variable is currently being used and cannot be deleted."));
    } else {
      const updatedSequence = defensiveClone(sequence.body);
      updatedSequence.args.locals.body =
        updatedSequence.args.locals.body?.filter(item => item.args.label != label);
      dispatch(overwrite(sequence, updatedSequence));
    }
  };

export const isParameterDeclaration =
  (x: VariableNode): x is ParameterDeclaration =>
    x.kind === "parameter_declaration";

/**
 * List of local variables for a sequence.
 * If none are found, shows nothing.
 */
export const LocalsList = (props: LocalsListProps) => {
  const variableData = Object.values(props.variableData || {});
  const { bodyVariables } = props;
  return <div className="locals-list">
    {betterCompact(variableData
      // Show variables if in Sequence header or not already defined
      .filter(v => v && (!bodyVariables || isParameterDeclaration(v.celeryNode)))
      // Show default values for parameters as a fallback if not in Sequence header
      .map(v => v && bodyVariables && isParameterDeclaration(v.celeryNode)
        ? convertFormVariable(v.celeryNode, props.resources)
        : v))
      .map(variable => <LocationForm
        key={variable.celeryNode.args.label}
        locationDropdownKey={props.locationDropdownKey}
        bodyVariables={bodyVariables}
        variable={variable}
        sequenceUuid={props.sequenceUuid}
        resources={props.resources}
        allowedVariableNodes={props.allowedVariableNodes}
        collapsible={props.collapsible}
        collapsed={props.collapsed}
        toggleVarShow={props.toggleVarShow}
        removeVariable={props.removeVariable}
        onChange={props.onChange}
        hideGroups={props.hideGroups}
        customFilterRule={props.customFilterRule} />)}
    {props.allowedVariableNodes == AllowedVariableNodes.parameter &&
      props.hideGroups && (shouldDisplayFeature(Feature.multiple_variables)
        || variableData.length < 1) &&
      <div className={"add-variable visible"} onClick={() =>
        props.onChange({
          kind: "variable_declaration",
          args: {
            label: generateNewVariableLabel(
              variableData.map(data => data?.celeryNode)),
            data_value: NOTHING_SELECTED,
          }
        })}>
        <p>{t("Add Variable")}</p>
      </div>}
  </div>;
};

export const generateNewVariableLabel =
  (variableData: (VariableNode | undefined)[]) => {
    const existingLabels = betterCompact(variableData)
      .map(variable => variable.args.label);
    if (!existingLabels.includes("parent")) { return "parent"; }
    const newLabel = (num: number) => t("Location variable {{ num }}", { num });
    let i = 1;
    while (existingLabels.includes(newLabel(i))) { i++; }
    return newLabel(i);
  };

/** Show a parameter_declaration as its default value in the location form. */
const convertFormVariable =
  (variable: ParameterDeclaration, resources: ResourceIndex):
    SequenceMeta | undefined => {
    const converted: ParameterApplication = {
      kind: "parameter_application", args: {
        label: variable.args.label,
        data_value: variable.args.default_value
      }
    };
    return {
      celeryNode: converted,
      dropdown: determineDropdown(converted, resources),
      vector: determineVector(converted, resources),
      isDefault: true,
    };
  };
