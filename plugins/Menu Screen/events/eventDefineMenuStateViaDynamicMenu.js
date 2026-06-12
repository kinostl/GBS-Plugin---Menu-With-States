const id = "MENU_DEFINE_MENU_STATE_VIA_DYNAMIC_MENU";
const groups = ["Menus"];
const name = "Define Menu State Using Menu";
const l10n = require("../helpers/l10n").default;

/**
 * Dynamic Menu Fields
 */
const DYNAMIC_MENU_MAX_DISPLAY = 8
const DYNAMIC_MENU_MAX_SCRIPTS = 16

const dynamic_menu_script_conditions = [
    {
        key: "__dynamic_menu_section",
        in: ["scripts", undefined]
    }
]

const dynamic_menu_script_fields = Array(DYNAMIC_MENU_MAX_SCRIPTS).fill().map((_, i) => {
    const conditions = [{
        key: "script_count",
        gt: i
    }, ...dynamic_menu_script_conditions]

    return {
        type: "group",
        conditions,
        fields: [{
            label: `${i + 1}. `,
            inline: true,
            alignBottom: true
        }, {
            type: "text",
            key: `slot_${i + 1}_view`,
            defaultValue: `Item ${i + 1}`,
            width: "50%",
            conditions
        }, {
            type: "constvalue",
            key: `slot_${i + 1}_script`,
            width: "50%",
            defaultValue: {
                type: "number",
                value: i + 1,
            },
            conditions
        }]
    }
})

const dynamic_menu_script_header = [{
    type: "group",
    conditions: dynamic_menu_script_conditions,
    fields: [
        {
            label: "ID",
            inline: true,
            alignBottom: true,
            conditions: dynamic_menu_script_conditions,
        },
        {
            label: "Item Text",
            width: "50%",
            conditions: dynamic_menu_script_conditions,
        }, {
            label: "Item Value",
            width: "50%",
            conditions: dynamic_menu_script_conditions,
        }]
}]

const dynamic_menu_slot_conditions = [{
    key: "__dynamic_menu_section",
    in: ["menu", undefined]
}]
const dynamic_menu_slot_fields = Array(DYNAMIC_MENU_MAX_DISPLAY).fill().map((_, i) => {
    const conditions = [{
        key: "slot_count",
        gt: i
    },
    ...dynamic_menu_slot_conditions]

    return {
        type: "group",
        conditions,
        fields: [

            {
                label: `${i + 1}. `,
                inline: true,
                alignBottom: true
            },
            {
                type: "variable",
                key: `slot_${i + 1}_choice`,
                conditions
            }]
    }
})

const dynamic_menu_slot_header = [{
    type: "group",
    conditions: dynamic_menu_slot_conditions,
    fields: [
        {
            label: "#. ",
            inline: true,
            alignBottom: true,
            conditions: dynamic_menu_slot_conditions,
        },
        {
            label: "Variable containing ID for Option #",
            conditions: dynamic_menu_slot_conditions,
        }]
}]

const dynamic_menu_settings_conditions = [{
    key: "__dynamic_menu_section",
    in: ["settings", undefined]
}]
const dynamic_menu_settings = [
    {
        type: "checkbox",
        label: "Last option cancels selection",
        key: "cancelOnLastOption",
        conditions: dynamic_menu_settings_conditions
    },
    {
        type: "text",
        key: "cancelOnLastOptionText",
        label: "Last Option Text",
        defaultValue: "Cancel",
        conditions: [{
            key: "cancelOnLastOption",
            eq: true
        }, ...dynamic_menu_settings_conditions]
    },
    {
        type: "checkbox",
        label: "Cancel selection if 'B' is pressed",
        key: "cancelOnB",
        defaultValue: true,
        conditions: dynamic_menu_settings_conditions
    },
    {
        key: "layout",
        type: "select",
        label: "Layout",
        options: [
            ["dialogue", "Dialogue"],
            ["menu", "Menu"],
        ],
        defaultValue: "dialogue",
        conditions: dynamic_menu_settings_conditions
    },
]

const dynamic_menu_fields = [
    {
        key: "__dynamic_menu_section",
        type: "tabs",
        defaultValue: "projectile",
        variant: "eventSection",
        values: {
            menu: "Menu",
            scripts: "Values",
            settings: "Settings"
        },
        defaultValue: "menu"
    },
    {
        key: "variable",
        type: "variable",
        defaultValue: "LAST_VARIABLE",
        label: "Set Variable",
        conditions: dynamic_menu_slot_conditions
    },
    {
        key: "slot_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: DYNAMIC_MENU_MAX_DISPLAY,
        label: "Number of options",
        conditions: dynamic_menu_slot_conditions
    },
    ...dynamic_menu_slot_header,
    ...dynamic_menu_slot_fields,
    {
        key: "script_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: DYNAMIC_MENU_MAX_SCRIPTS,
        label: "Number of Values",
        conditions: dynamic_menu_script_conditions
    },
    ...dynamic_menu_script_header,
    ...dynamic_menu_script_fields,
    ...dynamic_menu_settings
]

/**
 * Menu State Fields
 */

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
...dynamic_menu_fields,
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