const id = "MENU_DEFINE_MENU_STATE_VIA_MENU";
const groups = ["Menus"];
const name = "Define Menu State Using Menu";
const l10n = require("../helpers/l10n").default;

const settings = [
    {
        type: "checkbox",
        label: l10n("FIELD_LAST_OPTION_CANCELS"),
        description: l10n("FIELD_LAST_OPTION_CANCELS_DESC"),
        key: "cancelOnLastOption",
    },
    {
        type: "checkbox",
        label: l10n("FIELD_CANCEL_IF_B"),
        description: l10n("FIELD_CANCEL_IF_B_DESC"),
        key: "cancelOnB",
        defaultValue: true,
    }
]

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
const on_change = event_tab("on_change");
const on_init = event_tab("on_init");

const fields = [{
    key: "menu_id",
    label: "Menu ID",
    type: "togglebuttons",
    options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
    defaultValue: 1,
},
{
    label: "Set variable",
    type: "variable",
    key: "variable"
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
        on_change: "On Cursor Change"
    },
    defaultValue: "on_select"
},
    on_init,
    on_select,
    on_cancel,
    on_change
]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    if (input.compileSubScript === "on_init") {
        //Write Menu
        //Open Menu
        return
    }

    if (input.compileSubScript === "on_select") {
        //Close Menu
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
    }, ...input.on_select_cb]

    helpers.compileEvents([{
        "command": "MENU_DEFINE_MENU_STATE",
        "id": "",
        "args": {
            ...input,
            on_init,
            on_select,
            menu_items: []
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