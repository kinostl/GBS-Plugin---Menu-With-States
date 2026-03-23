const id = "MENU_START_MENU_STATE";
const groups = ["Menu State System"];
const name = "Start Dynamic Menu";

const fields = [
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
                defaultValue: 1,
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                min: 1,
                max: 16,
                width: "50%",
                defaultValue: 1,
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "x",
                label: "X",
                type: "number",
                min: 0,
                max: 20,
                width: "50%",
                defaultValue: 0,
            },
            {
                key: "y",
                label: "Y",
                type: "number",
                min: 0,
                max: 18,
                width: "50%",
                defaultValue: 0,
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "clear_previous",
                label: "Clear Previous",
                type: "checkbox",
                defaultValue: false,
                width: "50%",
            },
            {
                key: "show_frame",
                label: "Show Frame",
                type: "checkbox",
                defaultValue: true,
                width: "50%",
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
    const len = helpers._declareLocal("len", 1, true)
    const choice = helpers._declareLocal("choice", 1, true)
    input.x = 11 - (helpers.options.maxDepth*2)
    input.width = 8 + (helpers.options.maxDepth*2)
    const oct_x = Number(input.x + 2).toString(8).padStart(3, "0")
    const oct_y = Number(input.y + 1).toString(8).padStart(3, "0")

    // if (input.clear_previous) {
    //     helpers.overlayHide()
    //     helpers.overlayCopyFromBackground()
    // }
    helpers._overlayClear(input.x - 1, input.y - 1, input.width + 2, input.height + 2, ".UI_COLOR_WHITE", input.show_frame, false)
    helpers._overlayWait(false, [".UI_WAIT_WINDOW"])
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
            helpers._callNative("runScriptMenuViewSlot")
            helpers._stackPop(1)
            helpers.variableInc(len)
        })
    helpers._addNL();

    if (input.clear_previous) {
        helpers.overlayMoveTo(0, 0, -3)
    }

    helpers._choice(choice, input.clear_previous ? [] : [".UI_MENU_CANCEL_B"], input.height)
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

    const run_script_menu_slot = () => {
        helpers.variableDec(choice)
        helpers._stackPush(choice)
        helpers._callNative("runScriptMenuSlot")
        helpers._stackPop(1)
    }

    helpers.ifVariableCompareScriptValue(choice, '.GT', {
        type: "number",
        value: 0
    },
        run_script_menu_slot,
        input.clear_previous ? null : () => {
            // helpers._overlayClear(input.x - 1, input.y - 1, input.width + 2, input.height + 2, ".UI_COLOR_WHITE", false, false)
            helpers._packLocals()
            helpers.unreserveLocals()
            helpers.returnFar()
        })

    helpers._addNL();
    helpers.markLocalsUsed(len, choice)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};