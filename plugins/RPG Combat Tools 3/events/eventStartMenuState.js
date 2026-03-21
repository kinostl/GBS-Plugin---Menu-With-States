const id = "MENU_START_MENU_STATE";
const groups = ["Menu State System"];
const name = "Start Menu State";
const api = require("plugin-api")
const states = api.readJSON("./states.json")

const state_in_state_condition = {
    key: "state",
    in: ["Dynamic Menu"]
}

const autoLabel = (fetchArg) => {
    const state = fetchArg("state")

    return `Start Menu State "${state}"`
}

const fields = [
    {
        key: "state",
        label: "Which State?",
        type: "select",
        options: ["Dynamic Menu", ...states].map((_) => [_, _]),
        defaultValue: "Dynamic Menu"
    },
    {
        type: "select",
        label: "On Cancel",
        key: "on_cancel",
        options: ["Do Nothing", ...states].map((_) => [_, _]),
        defaultValue: "Do Nothing",
        conditions: [state_in_state_condition],
    },
    {
        type: "group",
        wrapItems: true,
        conditions: [state_in_state_condition],
        fields: [
            {
                key: "width",
                label: "Width",
                type: "number",
                min: 1,
                max: 18,
                width: "50%",
                defaultValue: 1,
                conditions: [state_in_state_condition],
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                min: 1,
                max: 16,
                width: "50%",
                defaultValue: 1,
                conditions: [state_in_state_condition],
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        conditions: [state_in_state_condition],
        fields: [
            {
                key: "x",
                label: "X",
                type: "number",
                min: 0,
                max: 20,
                width: "50%",
                defaultValue: 0,
                conditions: [state_in_state_condition],
            },
            {
                key: "y",
                label: "Y",
                type: "number",
                min: 0,
                max: 18,
                width: "50%",
                defaultValue: 0,
                conditions: [state_in_state_condition],
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        conditions: [state_in_state_condition],
        fields: [
            {
                key: "clear_previous",
                label: "Clear Previous",
                type: "checkbox",
                defaultValue: true,
                width: "50%",
                conditions: [state_in_state_condition],
            },
            {
                key: "show_frame",
                label: "Show Frame",
                type: "checkbox",
                defaultValue: true,
                width: "50%",
                conditions: [state_in_state_condition],
            },
        ],
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const menu_state = input.state
    const state_idx = states.indexOf(menu_state)
    const on_cancel = states.indexOf(input.on_cancel)

    const run_dynamic_menu = () => {
        const len = helpers._declareLocal("len", 1, true)
        const choice = helpers._declareLocal("choice", 1, true)
        const actors_on_overlay = helpers._declareLocal("actors_on_overlay", 1, true)
        const oct_x = Number(input.x + 2).toString(8).padStart(3, "0")
        const oct_y = Number(input.y + 1).toString(8).padStart(3, "0")

        const isColor = helpers.options.settings.colorMode !== "mono";
        if (isColor) {
            helpers._getMemUInt8(actors_on_overlay, "overlay_priority");
            helpers._setConstMemUInt8("overlay_priority", 0);
        } else {
            helpers._getMemUInt8(actors_on_overlay, "show_actors_on_overlay");
            helpers._setConstMemUInt8("show_actors_on_overlay", 1);
        }

        if (input.clear_previous) {
            helpers.overlayHide()
            helpers.overlayCopyFromBackground()
        }
        helpers._overlayClear(input.x - 1, input.y - 1, input.width + 2, input.height + 2, ".UI_COLOR_WHITE", input.show_frame, false)
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
        if (input.clear_previous) {
            helpers.overlayMoveTo(0, 0, -3)
        }

        if (on_cancel < 0) {
            helpers.labelDefine("dynamic_menu")
        }
        helpers._choice(choice, input.on_cancel == "Do Nothing" ? [] : [".UI_MENU_CANCEL_B"], input.height)
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
                input.x,
                input.y + i,
                1,
                input.height,
                clampedMenuIndex(i - 1),
                clampedMenuIndex(i + 1),
            );
        }
        helpers._addNL();

        helpers.ifVariableCompareScriptValue(choice, '.GT', {
            type: "number",
            value: 0
        }, () => {
            helpers.variableDec(choice)
            helpers._stackPush(choice)
            helpers._callNative("runDynamicMenuChoice")
            helpers._stackPop(1)
        }, () => {
            if (on_cancel > -1) {
                helpers._stackPushConst(on_cancel)
                helpers._callNative("runDynamicMenuState")
                helpers._stackPop(1)
            }
        })

        helpers._addNL();

        if(on_cancel < 0){
            helpers.labelGoto("dynamic_menu")
        }

        if (isColor) {
            helpers._setMemUInt8("overlay_priority", actors_on_overlay);
        } else {
            helpers._setMemUInt8("show_actors_on_overlay", actors_on_overlay);
        }

        helpers.markLocalsUsed(len, choice, actors_on_overlay)
    }

    if (menu_state == "Dynamic Menu") {
        run_dynamic_menu()
    } else {
        helpers._stackPushConst(state_idx)
        helpers._callNative("runDynamicMenuState")
        helpers._stackPop(1)
    }
}
/**
 * TODO 3/21/26
 * 
 * What if I use threads and make option 0 be the current state like add it as option 0 as part of this event before run_dynamic_menu
 * 
 * That should be fine and it would avoib it would mess up for undoing the undo
 * Do I really need the entire history of menus to make it work right
 * maybe
 * 
 * 
 * 
 * If I use threads then I can use "on cancel return to" or something like that. 
 */

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
    autoLabel
};