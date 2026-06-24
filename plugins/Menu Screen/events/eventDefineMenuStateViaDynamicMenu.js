const id = "MENU_DEFINE_MENU_STATE_VIA_DYNAMIC_MENU";
const groups = ["Menus"];
const name = "Define Menu State Using Dynamic Menu";
const l10n = require("../helpers/l10n").default;
const autoLabel = (fetchArg) => {
  const variable = fetchArg("variable")
  const id = fetchArg("menu_id")
  return `Menu State #${id}: Set ${variable} With Dynamic Options`;
};

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
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const options = [
        input.slot_1_view,
        input.slot_2_view,
        input.slot_3_view,
        input.slot_4_view,
        input.slot_5_view,
        input.slot_6_view,
        input.slot_7_view,
        input.slot_8_view,
        input.slot_9_view,
        input.slot_10_view,
        input.slot_11_view,
        input.slot_12_view,
        input.slot_13_view,
        input.slot_14_view,
        input.slot_15_view,
        input.slot_16_view,
        input.slot_17_view,
        input.slot_18_view,
    ].splice(0, input.script_count)

    if (input.compileSubScript === "on_init") {
        const longest = options.reduce((longest, x)=> Math.max(longest, x.length), 0)

        helpers._addComment("Dynamic Menu On Init")

        for (let i = input.slot_count; i > 0; i--) {
            if (input.is_static_menu) {
                helpers._stackPushConst(i)
            } else {
                helpers._stackPush(helpers.getVariableAlias(input[`slot_${i}_choice`]))
            }

        }
        helpers._stackPushConst(input.script_count)

        helpers._callNative("prepareDynamicMenuStateOptions")
        helpers._overlayWait(false, [".UI_WAIT_TEXT", ".UI_WAIT_WINDOW"])
        helpers._stackPop(1+input.slot_count)
        helpers._addNL()

        helpers._stackPushConst(input.script_count)
        helpers._stackPushConst(longest+1)
        helpers._callNative("prepareDynamicMenuState")
        options.forEach((x) => {
            helpers._string(`${x}${"\\011".repeat(longest - x.length)}`)
        })
        helpers._displayText()
        helpers._overlayWait(false, [".UI_WAIT_TEXT", ".UI_WAIT_WINDOW"])
        helpers._stackPop(2)
        return
    }

    if (input.compileSubScript === "on_select"){
        helpers._stackPushReference(helpers.getVariableAlias(input.variable))
        helpers._callNative("finishDynamicMenuState")
        helpers._overlayWait(false, [".UI_WAIT_TEXT", ".UI_WAIT_WINDOW"])
        helpers._stackPop(1)
    }
    if (input.compileSubScript === "on_cancel"){
        helpers._callNative("cancelDynamicMenuState")
        helpers._overlayWait(false, [".UI_WAIT_TEXT", ".UI_WAIT_WINDOW"])
    }


    const on_init = [
        ...input.on_init,
        {
            "command": id,
            "id": "",
            "args": {
                ...input,
                compileSubScript: "on_init"
            }
        }]


    const on_select = [
        {
            "command": id,
            "id": "",
            "args": {
                ...input,
                compileSubScript: "on_select"
            }
        },
        ...input.on_select
    ]

    const on_cancel = [
        {
            "command": id,
            "id": "",
            "args": {
                ...input,
                compileSubScript: "on_cancel"
            }
        },
        ...input.on_cancel
    ]

    helpers.compileEvents([{
        "command": "MENU_DEFINE_MENU_STATE",
        "id": "",
        "args": {
            ...input,
            menu_items:[],
            on_init,
            on_select,
            on_cancel
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