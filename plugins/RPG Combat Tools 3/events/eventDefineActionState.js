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

const actions = states.filter((_) => ["action"].includes(_.type))

const fields = [
    {
        key: "state",
        label: "Which State?",
        type: "select",
        options: actions.map((_) => [_.name, _.name]),
        defaultValue: states[0].name
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
    const menu_state_choice = input.state
    const menu_state = states.find((_) => (_.name == menu_state_choice))

    if (input.compile_subscript) {
        helpers._loadText(0)
        helpers._string(`\\001\\001${menu_state.name}\\n`)
        helpers._displayText(true);
        helpers._overlayWait(false, [".UI_WAIT_TEXT"]);
        return
    }

    if (helpers.options.compiledAssetsCache[menu_state.name]) {
        throw new Error(`${menu_state.name} has already been defined.`)
    }


    helpers.options.compiledAssetsCache[menu_state.name] = input.script
    helpers.options.compiledAssetsCache[`${menu_state.name}___display`] = helpers._compileSubScript("custom", [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            "compile_subscript": true
        }
    }])

    const menu_actions = actions.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[action.name]
        if (!customEventScript) return `{0, 0} /*${action.name} has no script*/`
        const customEvent = helpers.compileCustomEventScript(customEventScript)
        return `TO_FAR_PTR_T(${customEvent.scriptRef}) /*${action.name}*/`
    })

    const menu_display_actions = actions.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[`${action.name}___display`]
        if (!customEventScript) return `{0, 0} /*${action.name} has no display script*/`
        return `TO_FAR_PTR_T(${customEventScript}) /*${action.name}*/`
    })

    const menu_deps = [...new Set(actions.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[action.name]
        if (!customEventScript) return ``
        const customEvent = helpers.compileCustomEventScript(customEventScript)
        return `${customEvent.scriptRef}`
    }).filter((_) => _.trim()))]

    const menu_display_deps = [...new Set(actions.map((action) => {
        const customEventScript = helpers.options.compiledAssetsCache[`${action.name}___display`]
        if (!customEventScript) return ``
        return `${customEventScript}`
    }).filter((_) => _.trim()))]

    helpers.compileEvents([{
        "command": "MENU_MAKE_ARRAY_DATA_FILES",
        "id": "",
        "args": {
            type: "far_ptr_t",
            symbol: "menu_actions",
            comment: "/* Menu Actions */",
            array: menu_actions,
            perLine: 1,
            dependencies: menu_deps
        }
    }])

    helpers.compileEvents([{
        "command": "MENU_MAKE_ARRAY_DATA_FILES",
        "id": "",
        "args": {
            type: "far_ptr_t",
            symbol: "menu_display_actions",
            comment: "/* Menu Display Actions */",
            array: menu_display_actions,
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