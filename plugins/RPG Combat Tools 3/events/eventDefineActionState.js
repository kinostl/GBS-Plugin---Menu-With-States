const id = "MENU_DEFINE_MENU_ACTION_STATE";
const groups = ["Menu State System"];
const name = "Define Menu Action State";
const api = require("plugin-api")
const states = api.readJSON("./states.json")


const autoLabel = (fetchArg) => {
    const state = fetchArg("state")
    const script = fetchArg("script")

    return `[AS]${state}=${script}`
}

const fields = [
    {
        key: "state",
        label: "Which State?",
        type: "select",
        options: states.map((_) => [_, _]),
        defaultValue: states[0]
    },
    {
        key: "script",
        label: "Script to Run for Action State",
        type: "customEvent"
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const menu_state = input.state

    switch (input.compile_subscript) {
        case "script":
            helpers.callScript(input.script)
            return
        case "display":
            helpers._loadText(0)
            helpers._string(`\\001\\001${menu_state}\\n`)
            helpers._displayText(true);
            helpers._overlayWait(false, [".UI_WAIT_TEXT"]);
            return
    }

    if (helpers.options.compiledAssetsCache[menu_state]) {
        throw new Error(`${menu_state} has already been defined.`)
    }

    helpers.options.compiledAssetsCache[menu_state] = helpers._compileSubScript("thread", [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            "compile_subscript": "script"
        }
    }])
    helpers.options.compiledAssetsCache[`${menu_state}___display`] = helpers._compileSubScript("custom", [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            "compile_subscript": "display"
        }
    }])

    const menu_states = states.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[action]
        if (!customEventScript) return `{0, 0} /*${action} has no script*/`
        return `TO_FAR_PTR_T(${customEventScript}) /*${action}*/`
    })

    const menu_display_states = states.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[`${action}___display`]
        if (!customEventScript) return `{0, 0} /*${action} has no display script*/`
        return `TO_FAR_PTR_T(${customEventScript}) /*${action}*/`
    })

    const menu_deps = [...new Set(states.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[action]
        if (!customEventScript) return ``
        return `${customEventScript}`
    }).filter((_) => _.trim()))]

    const menu_display_deps = [...new Set(states.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[`${action}___display`]
        if (!customEventScript) return ``
        return `${customEventScript}`
    }).filter((_) => _.trim()))]

    helpers.compileEvents([{
        "command": "MENU_MAKE_ARRAY_DATA_FILES",
        "id": "",
        "args": {
            type: "far_ptr_t",
            symbol: "menu_states",
            comment: "/* Menu States */",
            array: menu_states,
            perLine: 1,
            dependencies: menu_deps
        }
    }])

    helpers.compileEvents([{
        "command": "MENU_MAKE_ARRAY_DATA_FILES",
        "id": "",
        "args": {
            type: "far_ptr_t",
            symbol: "menu_display_states",
            comment: "/* Menu Display States */",
            array: menu_display_states,
            perLine: 1,
            dependencies: menu_display_deps
        }
    }])
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    autoLabel
};