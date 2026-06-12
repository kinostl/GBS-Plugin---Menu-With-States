const id = "MENU_DEFINE_MENU_STATE_VIA_MENU";
const groups = ["Menus"];
const name = "Define Menu State Using Menu";
const l10n = require("../helpers/l10n").default;

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
      key: "items",
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
          key: `option${i + 1}`,
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
              key: "items",
              gt: value,
            },
          ],
        },
        {
          key: `option${i + 1}`,
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
              key: "items",
              eq: value,
            },
            {
              key: "cancelOnLastOption",
              ne: true,
            },
          ],
        },
        {
          key: `option${i + 1}`,
          label: l10n("FIELD_SET_TO_VALUE_IF", { value: "0" }),
          description: l10n("FIELD_SET_TO_VALUE_IF_MENU_DESC", { value: "0" }),
          hideFromDocs: true,
          type: "textarea",
          singleLine: true,
          defaultValue: "",
          placeholder: l10n("FIELD_ITEM", { value: String(i + 1) }),
          conditions: [
            {
              key: "items",
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
  const decOct = (x) => Number(x).toString(8).padStart(3, 0)
  const textCodeSetSpeed = (speed) => {
    return `\\001\\${decOct(speed + 1)}`;
  };

  const textCodeSetFont = (fontIndex) => {
    return `\\002\\${decOct(fontIndex + 1)}`;
  };

  const textCodeGoto = (x, y) => {
    return `\\003\\${decOct(x)}\\${decOct(y)}`;
  };

  const options = [
    input.option1,
    input.option2,
    input.option3,
    input.option4,
    input.option5,
    input.option6,
    input.option7,
    input.option8,
  ].splice(0, input.items)

  if (input.compileSubScript === "on_init") {
    helpers._actorSetFlags(
      0,
      [".ACTOR_FLAG_PINNED"],
      [".ACTOR_FLAG_PINNED"]
    )
    const openTextMenu = (
      variable,
      options,
      layout = "menu",
      cancelOnLastOption = false,
      cancelOnB = false,
    ) => {
      helpers._setConstMemUInt8("show_actors_on_overlay", 1)
      helpers._addCmd("VM_SET_CONST_UINT8","_show_actors_on_overlay", "1")
      const variableAlias = helpers.getVariableAlias(variable);
      const optionsText = options.map(
        (option, index) => textCodeSetFont(0) + (option || `Item ${index + 1}`),
      );
      const height =
        layout === "menu" ? options.length : Math.min(options.length, 4);
      const menuText =
        textCodeSetSpeed(0) +
        textCodeGoto(3, 2) +
        (layout === "menu"
          ? optionsText.join("\n")
          : optionsText
            .map((text, i) => {
              if (i === 4) {
                return textCodeGoto(12, 2) + text;
              }
              return text;
            })
            .join("\n"));
      const numLines = options.length;
      const x = layout === "menu" ? 10 : 0;
      const choiceFlags = [];
      if (cancelOnLastOption) {
        choiceFlags.push(".UI_MENU_LAST_0");
      }
      if (cancelOnB) {
        choiceFlags.push(".UI_MENU_CANCEL_B");
      }

      helpers._addComment("Text Menu");

      let dest = variableAlias;
      if (helpers._isIndirectVariable(variable)) {
        const menuResultRef = helpers._declareLocal("menu_result", 1, true);
        dest = menuResultRef;
      }

      helpers._overlayClear(0, 0, 20 - x, height + 2, ".UI_COLOR_WHITE", true, true);
      if (layout === "menu") {
        helpers._overlayMoveTo(10, 18, ".OVERLAY_SPEED_INSTANT");
      }
      helpers._overlayMoveTo(x, 18 - height - 2, ".OVERLAY_IN_SPEED");
      helpers._setTextLayer(".TEXT_LAYER_WIN");
      helpers._loadAndDisplayText(menuText);
      helpers._overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);
    }

    openTextMenu(
      input.variable,
      options,
      input.layout,
      input.cancelOnLastOption,
      input.cancelOnB,
    );
    return
  }

  if (
    input.compileSubScript === "on_select" ||
    input.compileSubScript === "on_cancel"
  ) {
    const closeTextMenu = (
      variable,
      options,
      layout = "menu",
      cancelOnLastOption = false,
      cancelOnB = false,
    ) => {
      const x = layout === "menu" ? 10 : 0;
      helpers._setConstMemUInt8("show_actors_on_overlay", 0)
      helpers._overlayMoveTo(x, 18, ".OVERLAY_OUT_SPEED");
      helpers._overlayWait(true, [".UI_WAIT_WINDOW", ".UI_WAIT_TEXT"]);
      if (layout === "menu") {
        helpers._overlayMoveTo(0, 18, ".OVERLAY_SPEED_INSTANT");
      }

      if (helpers._isIndirectVariable(variable)) {
        helpers._setInd(variableAlias, dest);
      }

      helpers._addNL();
    }
    closeTextMenu(
      input.variable,
      options,
      input.layout,
      input.cancelOnLastOption,
      input.cancelOnB,
    );
    helpers._actorSetFlags(
      0,
      [".ACTOR_FLAG_PINNED"],
      [".ACTOR_FLAG_PINNED"]
    )
    return
  }

  const on_init = [{
    "command": id,
    "id": "",
    "args": {
      ...input,
      compileSubScript: "on_init"
    }
  }, ...input.on_init]

  const on_select = [{
    "command": id,
    "id": "",
    "args": {
      ...input,
      compileSubScript: "on_select"
    }
  }, ...input.on_select]

  const on_cancel = [{
    "command": id,
    "id": "",
    "args": {
      ...input,
      compileSubScript: "on_cancel"
    }
  }, ...input.on_cancel]

  const clampedMenuIndex = (index) => {
    if (index < 0) {
      return 0;
    }
    if (index > options.length - 1) {
      return 0;
    }
    return index + 1;
  };

  const menu_items = []
  if (input.layout === "menu") {
    const y_base = 17 - options.length
    for (let i = 0; i < options.length; i++) {
      menu_items.push({
        x: 11,
        y: y_base + i,
        left: 1,
        right: options.length,
        up: clampedMenuIndex(i - 1),
        down: clampedMenuIndex(i + 1),
      })
    }
  } else {
    const y_base = options.length < 4 ? 17 - options.length : 13
    for (let i = 0; i < options.length; i++) {
      menu_items.push({
        x: i < 4 ? 1 : 10,
        y: y_base + (i % 4),
        left: clampedMenuIndex(i - 4) || 1,
        right: clampedMenuIndex(i + 4) || options.length,
        up: clampedMenuIndex(i - 1),
        down: clampedMenuIndex(i + 1),
      })
    }
  }

  helpers.compileEvents([{
    "command": "MENU_DEFINE_MENU_STATE",
    "id": "",
    "args": {
      ...input,
      on_init,
      on_select,
      on_cancel,
      on_change: [],
      menu_items
    }
  }])
}

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
};