const id = "MENU_DEFINE_MENU_STATE_VIA_COLLISIONS";
const groups = ["Menus"];
const name = "Define Menu State Using Collisions";
const l10n = require("../helpers/l10n").default;
const autoLabel = (fetchArg) => {
  const variable = fetchArg("variable")
  const id = fetchArg("menu_id")
  return `Menu State #${id}: Set ${variable} With Collisions as Options`;
};

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
        on_select: "On Selection Made",
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
    const option_pos = []

    const tiles = helpers.options.scene.collisions
    const x_lim = helpers.options.scene.width

    let x = 0
    let y = 0

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === input.menu_id) {
            const choice = { x, y }
            option_pos.push(choice)
        }

        x++
        if (x >= x_lim) {
            x = 0
            y++
        }
    }

    const options = option_pos.map((option, i) => {
        option.id = i + 1
        return option
    })

    const count = options.length

    const menu_items = options.map((_) => {
        const option = {}
        option.x = _.x
        option.y = _.y
        option.id = _.id
        option.left = 1
        option.right = count
        option.up = option.id - 1
        option.down = option.id + 1

        if (option.up <= 1) {
            option.up = 1
        }

        if (option.down >= count) {
            option.down = count
        }

        return option
    })

    helpers.compileEvents([{
        "command": "MENU_DEFINE_MENU_STATE",
        "id": "",
        "args": {
            ...input,
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
    sceneTypes: ["MENU_SCREEN"],
    autoLabel,
};