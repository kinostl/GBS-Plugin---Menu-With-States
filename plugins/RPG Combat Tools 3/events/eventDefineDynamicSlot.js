const id = "MENU_DEFINE_MENU_DYNAMIC SLOT";
const groups = ["Menu State System"];
const name = "Update Dynamic Menu Slot";
const api = require("plugin-api")
const states = api.readJSON("./states.json")

const autoLabel = (fetchArg) => {
    const slot = fetchArg("slot")
    const script = fetchArg("script")

    return `Set Dynamic Slot #${slot} to ${script}`
}

const actions = states.filter((_) => ["action"].includes(_.type))

const fields = [
    {
        key: "slot",
        label: "Which Slot to Update?",
        type: "number",
        min: 1,
        max: 18,
        defaultValue: 1
    },
    {
        key: "script",
        label: "Action to Load to Dynamic Slot",
        type: "select",
        options: actions.map((_) => [_.name, _.name]),
        defaultValue: actions[0].name
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const action_state = actions.find((_) => (_.name == input.script))
    const action_state_idx = actions.findIndex((_) => (_.name == input.script))

    helpers._addComment(`Update Dynamic Slot #${input.slot} to ${action_state.name}`)
    helpers._stackPushConst(input.slot - 1)
    helpers._stackPushConst(action_state_idx)
    helpers._callNative("updateDynamicSlot")
    helpers._stackPop(2)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    autoLabel
};