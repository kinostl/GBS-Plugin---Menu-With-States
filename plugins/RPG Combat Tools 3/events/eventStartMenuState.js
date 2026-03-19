const id = "MENU_START_MENU_STATE";
const groups = ["Menu State System"];
const name = "Start Menu State";
const api = require("plugin-api")
const states = api.readJSON("./states.json")
const state_choices = [{
    name: "Dynamic Menu",
    type: "dynamic"
}, ...states]

/**
 * TODO from 3/16/26
 * 
 * This can now display a Static menu, which is supposed to be a context for other Menu States to be run from
 * 
 * Action and Dynamic are currently dummied out to just display their own names
 * 
 * What needs to be done now is implementing the Anchor Location, and Anchor X/Y portion of the menu creation.
 * 
 * This means pulling the overlay all the way up, and drawing all the menu boxes necessary in the correct spots
 * 
 * Later, it will also mean trying to see if this can be made to work with the Combat Scene type.
 */

const autoLabel = (fetchArg) => {
    const state = fetchArg("state")

    return `Start Menu State "${state}"`
}

const fields = [
    {
        key: "state",
        label: "Which State?",
        type: "select",
        options: state_choices.map((_) => [_.name, _.name]),
        defaultValue: "Dynamic Menu"
    },
    {
        label: "Anchor Location",
        type: "select",
        options: [
            "Top Left",
            "Top Right",
            "Bottom Left",
            "Bottom Right"
        ].map((_) => [_, _]),
        defaultValue: "Top Left"
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "x",
                label: "Anchor X",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                defaultValue: {
                    type: "number",
                    value: 0,
                },
            },
            {
                key: "y",
                label: "Anchor Y",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                defaultValue: {
                    type: "number",
                    value: 0,
                },
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "width",
                label: "Width",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                defaultValue: {
                    type: "number",
                    value: 20,
                },
            },
            {
                key: "height",
                label: "Height",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                defaultValue: {
                    type: "number",
                    value: 4,
                },
            },
        ],
    },
];

const actions = states.filter((_) => ["action"].includes(_.type))

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const menu_state = state_choices.find((_) => (_.name === input.state))

    /**
     * TODO 3/18/26
     * 
     * This needs something to one-time make a script that builds a huge switch statement for all the actions.
     * 
     * if helpers.cache does not have an actionSwitchId representing the script that should be generated
     * then actionSwitchId should be set for it
     * 
     * that script looks like the following:
     * 
     * for each entry in states filtered by action
     * if action is in helper.cache
     * add it to the list of cases
     * 
     * then build the switch statement
     * 
     * 
     * ---
     * 
     * Might be a really good idea to see if macros  and imports can allow for the above in a way that won't steal a lot of ram with duplication
     * 
     * have the define action state function build an importable file thats just like 
     * 
     * .MACRO ACTION_FIGHT
     * VM_CALL_FAR fight b_fight
     * ENDMACRO
     * 
     * and then in here we can just look for macros of the correct pattern or something.
     * 
     * ---
     * 
     * 3/18/26 afternoon
     * 
     * Decided it to be easier to just make the array files and probably send over the far_ptr_t somehow or something. Maybe theres an existing function to help with that. 
     */
    const run_dynamic_menu = () => {
        const len = helpers._declareLocal("len", 1, true)

        helpers.variableSetToValue(len, 0)
        helpers.whileScriptValue(
            {
                type: "lt",
                valueA: {
                    type: "variable",
                    value: len,
                },
                valueB: input.height,
            }, () => {
                helpers._stackPush(len)
                helpers._callNative("runActionViewScript")
                helpers._stackPop(1)
                helpers.variableInc(len)
            })
        helpers.overlayMoveTo(0, 0, 0)
        helpers.markLocalsUsed(len)
    }

    switch (menu_state.type) {
        case "static":
            menu_state.slots.forEach((slot, idx) => {
                helpers.compileEvents([{
                    "command": "MENU_DEFINE_MENU_DYNAMIC SLOT",
                    "args": {
                        "slot": idx+1,
                        "script": slot
                    },
                    "id": ""
                }])
            })
        case "dynamic":
            run_dynamic_menu()
            break
        case "action":
            // Look for a definition
            const action = helpers.options.compiledAssetsCache[menu_state.name]
            if (!action) {
                throw new Error(`${menu_state.name} has not been defined.`)
            }
            helpers.callScript(action)
            break;
        default:
            throw new Error(`Could not find menu state: ${menu_state.type}`)
    }
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
    autoLabel
};