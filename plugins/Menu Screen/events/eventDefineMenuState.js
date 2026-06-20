const id = "MENU_DEFINE_MENU_STATE";
const groups = ["Menus"];
const name = id;
const l10n = require("../helpers/l10n").default;

const fields = []

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    if (input.compileSubScript) {
        input.menu_items.forEach((_) => {
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

    /**
     * These are threads as a hack to force them to have VM_STOP at the end
     */
    const on_select_script = helpers._compileSubScript("thread", input.on_select, "ms_on_select")
    const on_cancel_script = helpers._compileSubScript("thread", input.on_cancel, "ms_on_cancel")

    /**
     * These are correctly custom scripts because they continue acting after they run
     */
    const on_init_script = helpers._compileSubScript("custom", input.on_init, "ms_on_init")
    const on_change_script = helpers._compileSubScript("custom", input.on_change, "ms_on_change")

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

    const symbol = "menu_screen_states"
    const option_symbol = `menu_screen_options`
    const option_script = helpers._compileSubScript("input", [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            "compileSubScript": true
        }
    }], option_symbol)

    const menu_struct = JSON.stringify({
        set_variable_id: `${helpers.getVariableAlias(input.variable)}`,
        menu_items: `TO_FAR_PTR_T(${option_script})`,
        menu_items_count: `${input.menu_items.length}`,
        on_init: `TO_FAR_PTR_T(${on_init_script})`,
        on_select: `TO_FAR_PTR_T(${on_select_script})`,
        on_cancel: `TO_FAR_PTR_T(${on_cancel_script})`,
        on_change: `TO_FAR_PTR_T(${on_change_script})`,
        options: unionFlags(choiceFlags)
    })

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
            array: helpers.options.compiledAssetsCache[`${symbol}`].map((_)=>JSON.parse(_)),
            dependencies: [
                "game_globals",
                "menu_screen_t",
                ...helpers.options.compiledAssetsCache[`${symbol}_h`]
            ]
        }
    }])

    helpers._stackPushConst(
        helpers.options.compiledAssetsCache[`${symbol}`].indexOf(menu_struct)
    )
    helpers._stackPushConst(input.menu_id)
    helpers._callNative("setMenuState")
    helpers._stackPop(2)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    sceneTypes: ["MENU_SCREEN"],
    deprecated: true
};