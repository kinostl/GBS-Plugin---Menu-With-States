const id = "MENU_DEFINE_MENU_STATE";
const groups = ["Menus"];
const name = "Define Menu State";
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
    label: "Menu ID",
    type: "constvalue",
    key: "menu_id",
    min: 1,
    defaultValue: {
        type: "number",
        value: 1
    }
}, {
    label: "Set variable",
    type: "variable",
    key: "variable"
},
{
    key: "collisionGroup",
    label: "Collision Group",
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
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const option_pos = []

    const tiles = helpers.options.scene.collisions
    const x_lim = helpers.options.scene.width

    let x = 0
    let y = 0

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === input.collisionGroup) {
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

    if (input.compileSubScript) {
        menu_items.forEach((_) => {
            helpers._menuItem(
                _.x,
                _.y,
                _.left,
                _.right,
                _.up,
                _.down
            )
        })
        return
    }

    const on_init_script = helpers._compileSubScript("custom", input.on_init)
    const on_select_script = helpers._compileSubScript("custom", input.on_select)
    const on_cancel_script = helpers._compileSubScript("custom", input.on_cancel)
    const on_change_script = helpers._compileSubScript("custom", input.on_change)

    const unionFlags = (flags, defaultValue = "UI_MENU_STANDARD") => {
        if (flags.length === 0) {
            return defaultValue;
        }
        if (flags.length === 1) {
            return flags[0];
        }
        return `(${flags.join(" | ")})`;
    };

    const choiceFlags = []

    if (input.cancelOnLastOption) {
        choiceFlags.push("UI_MENU_LAST_0");
    }
    if (input.cancelOnB) {
        choiceFlags.push("UI_MENU_CANCEL_B");
    }

    const symbol = "menu_scene_states"
    const option_symbol = `menu_scene_options`
    const option_script = helpers._compileSubScript("input", [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            "compileSubScript": true
        }
    }], option_symbol)

    const menu_struct = {
        set_variable_id: `${helpers.getVariableAlias(input.variable)}`,
        menu_items: `TO_FAR_PTR_T(${option_script})`,
        menu_items_count: `${menu_items.length}`,
        on_init: `TO_FAR_PTR_T(${on_init_script})`,
        on_select: `TO_FAR_PTR_T(${on_select_script})`,
        on_cancel: `TO_FAR_PTR_T(${on_cancel_script})`,
        on_change: `TO_FAR_PTR_T(${on_change_script})`,
        options: unionFlags(choiceFlags)
    }
    if (!helpers.options.compiledAssetsCache[`${symbol}`]) {
        helpers.options.compiledAssetsCache[`${symbol}`] = []
    }

    if (!helpers.options.compiledAssetsCache[`${symbol}_h`]) {
        helpers.options.compiledAssetsCache[`${symbol}_h`] = []
    }

    if (!helpers.options.compiledAssetsCache[`${symbol}`].includes(menu_struct)) {
        helpers.options.compiledAssetsCache[`${symbol}`].push(menu_struct)
    }

    [on_init_script, on_select_script, on_cancel_script, on_change_script, option_script].forEach((_) => {
        if (!helpers.options.compiledAssetsCache[`${symbol}_h`].includes(_)) {
            helpers.options.compiledAssetsCache[`${symbol}_h`].push(_)
        }
    })

    helpers.compileEvents([{
        "command": "MENU_DEFINE_STRUCT_ARRAY",
        "id": "",
        "args": {
            type: "const menu_screen_state_t",
            symbol: `${symbol}`,
            comment: "",
            array: helpers.options.compiledAssetsCache[`${symbol}`],
            dependencies: [
                "game_globals",
                "menu_scene_t",
                ...helpers.options.compiledAssetsCache[`${symbol}_h`]
            ]
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
};