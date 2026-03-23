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
        max: 8,
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
    const in_child_script_menu = helpers._declareLocal("in_child_script_menu", 1, true)
    helpers._addComment(`Max Depth: ${helpers.options.maxDepth}`)

    // const x = 10 - (helpers.options.maxDepth * 2)
    // const width = 10 + (helpers.options.maxDepth * 2)
    const x = 0
    const is_main_menu = helpers.options.maxDepth >= 5

    helpers._setConstMemUInt8("in_child_script_menu", 1)
    helpers.variableSetToValue(in_child_script_menu, 1)

    const choices = []

    helpers.whileScriptValue({
        type: "variable",
        value: in_child_script_menu
    }, () => {
        helpers.textMenu(choice, Array(input.count).fill().map((_, i) => input[`slot_${i + 1}_view`]), "dialog", false, !is_main_menu)

        for (let i = 0; i < input.count; i++) {
            choices.push({
                value: {
                    type: "number",
                    value: i + 1,
                },
                branch: () => {
                    helpers._setConstMemUInt8("in_child_script_menu", 0)
                    helpers.callScript(input[`slot_${i + 1}_script`])
                    helpers._getMemUInt8(in_child_script_menu, "in_child_script_menu")
                }
            })
        }

        helpers.caseVariableConstValue(choice, choices, is_main_menu ? null : () => {
            helpers.labelGoto("end")
        })
    })
    helpers.labelDefine("end")
    helpers.markLocalsUsed(choice, in_child_script_menu)
}
module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};