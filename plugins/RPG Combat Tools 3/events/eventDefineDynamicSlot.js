const id = "MENU_DEFINE_MENU_DYNAMIC SLOT";
const groups = ["Menu State System"];
const name = "Update Dynamic Menu Slot";
const api = require("plugin-api")
const states = api.readJSON("./states.json")

const autoLabel = (fetchArg) => {
    const slot = fetchArg("slot")
    const script = fetchArg("state")

    return `Set Dynamic Slot #${slot} to ${script}`
}


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
        key: "state",
        label: "State to Load to Dynamic Slot",
        type: "select",
        options: states.map((_) => [_, _]),
        defaultValue: states[0]
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const state_idx = states.indexOf(input.state)

    helpers._addComment(`Update Dynamic Slot #${input.slot} to ${input.state}`)
    helpers._stackPushConst(input.slot - 1)
    helpers._stackPushConst(state_idx)
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