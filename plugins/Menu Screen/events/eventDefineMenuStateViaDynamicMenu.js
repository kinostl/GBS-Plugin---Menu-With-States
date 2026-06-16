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
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const menu_x = input.layout == "menu" ? 10 : 0
    const menu_width = input.layout == "menu" ? 10 : 20

    let menu_height = input.slot_count + 2
    let choice_count = input.slot_count
    if (input.cancelOnLastOption) {
        menu_height++
        choice_count++
    }

    if (input.layout == "dialogue" && choice_count > 4) {
        menu_height -= 4
    }

    const choice = input.variable
    const confirm_choices = []

    for (let i = 0; i < input.slot_count; i++) {
        confirm_choices.push({
            value: {
                type: "number",
                value: i + 1,
            },
            branch: () => {
                helpers.variableCopy(choice, input[`slot_${i + 1}_choice`])
            }
        })
    }

    if (input.compileSubScript === "on_init") {
        helpers._setConstMemUInt8("show_actors_on_overlay", 1)

        const slot_x = helpers._declareLocal("slot_x", 1, true)
        const slot_y = helpers._declareLocal("slot_y", 1, true)

        helpers._actorSetFlags(
            0,
            [".ACTOR_FLAG_PINNED"],
            [".ACTOR_FLAG_PINNED"]
        )

        const view_choices = []

        for (let i = 0; i < input.script_count; i++) {
            view_choices.push({
                value: {
                    type: "number",
                    value: i + 1,
                },
                branch: () => {
                    helpers._loadText(2)
                    helpers._dw(slot_x, slot_y)
                    helpers._string(`\\003%c%c\\001\\001${input[`slot_${i + 1}_view`]}`)
                    helpers._displayText()
                    helpers._overlayWait(false, [".UI_WAIT_TEXT"])
                }
            })
        }

        helpers._overlayClear(0, 0, menu_width, menu_height, ".UI_COLOR_WHITE", true, false)
        for (let i = 0; i < input.slot_count; i++) {
            const x_off = (input.layout == "dialogue" && i >= 4) ? 9 : 0
            const x = 3 + x_off

            const y_off = (input.layout == "dialogue" && i >= 4) ? -4 : 0
            const y = i + 2 + y_off

            helpers.variableSetToValue(slot_x, x)
            helpers.variableSetToValue(slot_y, y)
            helpers.caseVariableConstValue(input[`slot_${i + 1}_choice`], view_choices)
        }
        if (input.cancelOnLastOption) {
            const x_off = (input.layout == "dialogue" && i > 4) ? 10 : 0
            const x = 2 + x_off

            const y_off = (input.layout == "dialogue" && i > 4) ? -4 : 0
            const y = choice_count + 1 + y_off
            helpers.textDraw(input.cancelOnLastOptionText, x, y, "overlay")
        }

        if (input.layout == "menu") {
            helpers.overlayMoveTo(menu_x, 18, ".OVERLAY_SPEED_INSTANT")
        }
        helpers.overlayMoveTo(menu_x, 18 - menu_height, ".OVERLAY_IN_SPEED")

        helpers.markLocalsUsed(slot_x, slot_y)
        return
    }

    if (input.compileSubScript === "on_select") {
        helpers._setConstMemUInt8("show_actors_on_overlay", 0)
        helpers.overlayMoveTo(menu_x, 18, ".OVERLAY_OUT_SPEED")
        helpers.caseVariableConstValue(choice, confirm_choices)
        return
    }
    if (input.compileSubScript === "on_cancel") {
        helpers._setConstMemUInt8("show_actors_on_overlay", 0)
        helpers.overlayMoveTo(menu_x, 18, ".OVERLAY_OUT_SPEED")
        return
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
            return 1;
        }
        if (index > choice_count - 1) {
            return choice_count;
        }
        return index + 1;
    };

    const menu_items = []
    if (input.layout === "menu") {
        const y_base = 17 - choice_count
        for (let i = 0; i < choice_count; i++) {
            menu_items.push({
                x: 11,
                y: y_base + i,
                left: 1,
                right: choice_count,
                up: clampedMenuIndex(i - 1),
                down: clampedMenuIndex(i + 1),
            })
        }
    } else {
        const y_base = choice_count < 4 ? 17 - choice_count : 13
        for (let i = 0; i < choice_count; i++) {
            menu_items.push({
                x: i < 4 ? 1 : 10,
                y: y_base + (i % 4),
                left: clampedMenuIndex(i - 4) || 1,
                right: clampedMenuIndex(i + 4) || choice_count,
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
    autoLabel,
};