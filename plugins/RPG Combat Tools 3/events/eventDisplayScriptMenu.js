const id = "MENU_DISPLAY_SCRIPT_MENU";
const groups = ["Menu State System"];
const name = "Display Script Menu";

const script_fields = Array(16).fill().map((_, i) => {
    const conditions = [{
        key: "count",
        gt: i
    }]

    return {
        type: "group",
        conditions,
        fields: [{
            type: "text",
            key: `slot_${i + 1}_view`,
            defaultValue: `Slot #${i + 1}`,
            width: "50%",
            conditions
        }, {
            type: "customEvent",
            key: `slot_${i + 1}_script`,
            width: "50%",
            conditions
        }]
    }
})

const script_header = [{
    type: "group",
    fields: [{
        label: "Menu Text",
        width: "50%",
    }, {
        label: "Script",
        width: "50%",
    }]
}]

const fields = [
    // ...menu_event_fields.display_menu,
    {
        key: "count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: 16,
        label: "Count"
    },
    ...script_header,
    ...script_fields,
]
/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const choice = helpers._declareLocal("choice", 1, true)

    const x = 10 - (helpers.options.maxDepth * 2)
    const width = 10 + (helpers.options.maxDepth * 2)
    const height = input.count + 2
    const is_main_menu = helpers.output.maxDepth >= 5

    const choices = []

    helpers.whileScriptValue({
        type: "true"
    }, () => {

        helpers._overlayClear(x, 0, width, height, ".UI_COLOR_WHITE", true, false)
        helpers.overlayMoveTo(0, 18 - height, ".OVERLAY_IN_SPEED")

        for (let i = 0; i < input.count; i++) {
            helpers.textDraw(input[`slot_${i + 1}_view`], x + 2, i + 1, "overlay")
            choices.push({
                value: {
                    type: "number",
                    value: i + 1,
                },
                branch: () => {
                    helpers.overlayMoveTo(0, 18, ".OVERLAY_OUT_SPEED")
                    helpers.callScript(input[`slot_${i + 1}_script`])
                }
            })
        }

        helpers._choice(choice, is_main_menu ? [] : [".UI_MENU_CANCEL_B"], input.count)
        const clampedMenuIndex = (index) => {
            if (index < 0) {
                return 0;
            }
            if (index > input.count - 1) {
                return 0;
            }
            return index + 1;
        };

        for (let i = 0; i < input.count; i++) {
            helpers._menuItem(
                x + 1,
                i + 1,
                1,
                input.count,
                clampedMenuIndex(i - 1),
                clampedMenuIndex(i + 1),
            );
        }
        helpers._addNL();

        helpers.caseVariableConstValue(choice, choices, is_main_menu ? null : () => {
            helpers.overlayMoveTo(0, 18, ".OVERLAY_OUT_SPEED")
        })
    })
    helpers.markLocalsUsed(choice)
}
module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};