const id = "MENU_START_MENU_STATE";
const groups = ["Menu State System"];
const name = "Start Menu State";
const api = require("plugin-api")
const states = api.readJSON("./states.json")
const state_choices = [{
    name: "Dynamic Menu",
    type: "dynamic"
}, ...states]

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
                type: "number",
                min: 1,
                max: 20,
                width: "50%",
                defaultValue: 1
            },
            {
                key: "y",
                label: "Anchor Y",
                type: "number",
                min: 1,
                max: 18,
                width: "50%",
                defaultValue: 1
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
                type: "number",
                min: 1,
                max: 18,
                width: "50%",
                defaultValue: 1
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                min: 1,
                max: 16,
                width: "50%",
                defaultValue: 1
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
    const run_dynamic_menu = () => {
        const len = helpers._declareLocal("len", 1, true)
        const oct_x = Number(input.x+2).toString(8).padStart(3, "0")
        const oct_y = Number(input.y+1).toString(8).padStart(3, "0")

        helpers.overlayMoveTo(0, 0, -3)
        helpers._overlayClear(input.x-1, input.y-1, input.width+2, input.height+2, ".UI_COLOR_WHITE", true, false)
        helpers._loadText(0)
        helpers._string(`\\003\\${oct_x}\\${oct_y}`)
        helpers._displayText()
        helpers._overlayWait(false, [".UI_WAIT_TEXT"]);

        helpers.variableSetToValue(len, 0)
        helpers.whileScriptValue(
            {
                type: "lt",
                valueA: {
                    type: "variable",
                    value: len,
                },
                valueB: {
                    type: "number",
                    value: input.height
                },
            }, () => {
                helpers._stackPush(len)
                helpers._callNative("runActionViewScript")
                helpers._stackPop(1)
                helpers.variableInc(len)
            })
        helpers._addNL();

        helpers._choice(len, [], input.height)
        const clampedMenuIndex = (index) => {
            if (index < 0) {
                return 0;
            }
            if (index > input.height - 1) {
                return 0;
            }
            return index + 1;
        };

        for (let i = 0; i < input.height; i++) {
            helpers._menuItem(
                1,
                1 + i,
                1,
                input.height,
                clampedMenuIndex(i - 1),
                clampedMenuIndex(i + 1),
            );
        }
        helpers.variableDec(len)
        helpers._addNL();

        helpers._stackPush(len)
        helpers._callNative("runActionScript")
        helpers._stackPop(1)
        helpers._addNL();
        helpers.markLocalsUsed(len, oct_x, oct_y)
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