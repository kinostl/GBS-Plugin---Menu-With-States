const id = "MENU_DEFINE_MENU_STATE_VIA_MENU";
const groups = ["Menus"];
const name = "Define Menu State Using Menu";
const l10n = require("../helpers/l10n").default;
const autoLabel = (fetchArg) => {
  const numItems = parseInt(fetchArg("slot_count"));
  const text = Array(numItems)
    .fill()
    .map((_, i) => {
      return `"${fetchArg(`slot_${i + 1}_view`)}"`;
    })
    .join();
  const variable = fetchArg("variable")
  const id = fetchArg("menu_id")
  return `Menu State #${id}: Set ${variable} With Options: ${text}`;
};

/**
 * copy the shit from Menu classic not my dynamic shit
 */
const settings = [].concat(
  [
    {
      label: l10n("FIELD_TEXT_IN_LOGO_WARNING"),
      labelVariant: "warning",
      flexBasis: "100%",
      conditions: [
        {
          sceneType: ["logo"],
        },
      ],
    },
    {
      key: "variable",
      label: l10n("FIELD_SET_VARIABLE"),
      description: l10n("FIELD_VARIABLE_DESC"),
      type: "variable",
      defaultValue: "LAST_VARIABLE",
    },
    {
      key: "slot_count",
      label: l10n("FIELD_NUMBER_OF_OPTIONS"),
      description: l10n("FIELD_NUMBER_OF_OPTIONS_DESC"),
      type: "number",
      min: 2,
      max: 8,
      defaultValue: 2,
    },
    {
      type: "break",
    },
  ],
  Array(8)
    .fill()
    .reduce((arr, _, i) => {
      const value = i + 1;
      arr.push(
        {
          key: `slot_${i + 1}_view`,
          label: l10n("FIELD_SET_TO_VALUE_IF", { value: String(i + 1) }),
          description: l10n("FIELD_SET_TO_VALUE_IF_MENU_DESC", {
            value: String(i + 1),
          }),
          hideFromDocs: i >= 2,
          type: "textarea",
          singleLine: true,
          defaultValue: "",
          placeholder: l10n("FIELD_ITEM", { value: String(i + 1) }),
          conditions: [
            {
              key: "slot_count",
              gt: value,
            },
          ],
        },
        {
          key: `slot_${i + 1}_view`,
          label: l10n("FIELD_SET_TO_VALUE_IF", { value: String(i + 1) }),
          description: l10n("FIELD_SET_TO_VALUE_IF_MENU_DESC", {
            value: String(i + 1),
          }),
          hideFromDocs: i >= 2,
          type: "textarea",
          singleLine: true,
          defaultValue: "",
          placeholder: l10n("FIELD_ITEM", { value: String(i + 1) }),
          conditions: [
            {
              key: "slot_count",
              eq: value,
            },
            {
              key: "cancelOnLastOption",
              ne: true,
            },
          ],
        },
        {
          key: `slot_${i + 1}_view`,
          label: l10n("FIELD_SET_TO_VALUE_IF", { value: "0" }),
          description: l10n("FIELD_SET_TO_VALUE_IF_MENU_DESC", { value: "0" }),
          hideFromDocs: true,
          type: "textarea",
          singleLine: true,
          defaultValue: "",
          placeholder: l10n("FIELD_ITEM", { value: String(i + 1) }),
          conditions: [
            {
              key: "slot_count",
              eq: value,
            },
            {
              key: "cancelOnLastOption",
              eq: true,
            },
          ],
        },
      );
      return arr;
    }, []),
  {
    type: "break",
  },
  {
    type: "checkbox",
    label: "Last option runs 'on cancel'",
    key: "cancelOnLastOption",
  },
  {
    type: "checkbox",
    label: "Run 'on cancel' if B is pressed",
    key: "cancelOnB",
    defaultValue: true,
  },
  {
    key: "layout",
    type: "select",
    label: l10n("FIELD_LAYOUT"),
    description: l10n("FIELD_LAYOUT_MENU_DESC"),
    options: [
      ["dialogue", l10n("FIELD_LAYOUT_DIALOGUE")],
      ["menu", l10n("FIELD_LAYOUT_MENU")],
    ],
    defaultValue: "dialogue",
  },
);

const tab_condition = (type) => {
  return {
    key: "__section",
    in: [type, undefined]
  }
}

const event_tab = (key) => {
  return {
    key,
    type: "events",
    conditions: [tab_condition(key)]
  }
}

const on_select = event_tab("on_select");
const on_cancel = event_tab("on_cancel");
const on_init = event_tab("on_init");

const fields = [{
  key: "menu_id",
  label: "Menu ID",
  type: "togglebuttons",
  options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
  defaultValue: 1,
},
...settings,
{
  key: "__section",
  type: "tabs",
  variant: "eventSection",
  values: {
    on_init: "On Init",
    on_select: "On Select",
    on_cancel: "On Cancel",
  },
  defaultValue: "on_select"
},
  on_init,
  on_select,
  on_cancel,
]


/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
  input.script_count = input.slot_count

  helpers.compileEvents([{
    "command":"MENU_DEFINE_MENU_STATE_VIA_DYNAMIC_MENU",
    "id":"",
    "args":{
      ...input,
      is_static_menu: true
    }
  }])
}

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  autoLabel,
  sceneTypes: ["MENU_SCREEN"],
};