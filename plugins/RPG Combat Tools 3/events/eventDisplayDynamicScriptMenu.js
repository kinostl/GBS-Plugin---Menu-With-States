/**
 * TODO 3/28/26
 * 
 * I think what I should do is add a new tab that asks "is this dynamic" and then if so, allow the first page to have more than 8 options.
 * In addition to that, the setting page asks what the height is, and then asks for variables that define each slot
 * 
 * Those are used to replicate what I have in the example right now, and run a couple switches like how its being done with the inter-script calls
 */
const id = "MENU_DISPLAY_DYNAMIC_SCRIPT_MENU";
const groups = ["Menu State System"];
const name = "Display Dynamic Script Menu";
const MAX_DISPLAY = 8
const MAX_SCRIPTS = 16

const script_fields = Array(MAX_SCRIPTS).fill().map((_, i) => {
    const conditions = [{
        key: "script_count",
        gt: i
    }]

    return {
        type: "group",
        conditions,
        fields: [{
            label: `${i + 1}. `,
            inline: true,
            alignBottom: true
        },{
            type: "text",
            key: `slot_${i + 1}_view`,
            defaultValue: `Option #${i + 1}`,
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
    fields: [
        {
            label: "ID",
            inline: true,
            alignBottom: true
        },
        {
            label: "Menu Text",
            width: "50%",
        }, {
            label: "Call Script",
            width: "50%",
        }]
}]

const slot_fields = Array(MAX_DISPLAY).fill().map((_, i) => {
    const conditions = [{
        key: "slot_count",
        gt: i
    }]

    return {
        type: "group",
        conditions,
        fields: [

            {
                label: `${i + 1}. `,
                inline: true,
                alignBottom: true
            },
            {
                type: "variable",
                key: `slot_${i + 1}_choice`,
                conditions
            }]
    }
})

const slot_header = [{
    type: "group",
    fields: [
        {
            label: "#. ",
            inline: true,
            alignBottom: true
        },
        {
            label: "Variable containing ID for Option #",
        }]
}]

const settings = [
  {
    type: "checkbox",
    label: "Last option returns to previous menu",
    key: "cancelOnLastOption",
  },
  {
    type: "text",
    key: "cancelOnLastOptionText",
    label: "Last Option Text",
    defaultValue: "Cancel",
    conditions: [{
        key: "cancelOnLastOption",
        eq: true
    }]
  },
  {
    type: "checkbox",
    label: "Return to previous menu if 'B' is pressed",
    key: "cancelOnB",
    defaultValue: true,
  },
  {
    key: "layout",
    type: "select",
    label: "Layout",
    options: [
      ["dialogue", "Dialogue"],
      ["menu", "Menu"],
    ],
    defaultValue: "dialogue",
  },
]

const fields = [
    // ...menu_event_fields.display_menu,
    {
        key: "slot_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: MAX_DISPLAY,
        label: "Number of options"
    },
    ...slot_header,
    ...slot_fields,
    {
        key: "script_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: MAX_SCRIPTS,
        label: "Number of Scripts"
    },
    ...script_header,
    ...script_fields,
    ...settings
]
/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const choice = helpers._declareLocal("choice", 1, true)
    const in_child_script_menu = helpers._declareLocal("in_child_script_menu", 1, true)
    const slot_x = helpers._declareLocal("slot_x", 1, true)
    const slot_y = helpers._declareLocal("slot_y", 1, true)
    let menu_height = input.slot_count+2
    let choice_count = input.slot_count
    if (input.cancelOnLastOption) {
        menu_height++
        choice_count++
    }

    const is_main_menu = helpers.options.maxDepth >= 5

    const choiceFlags = [];
    if (input.cancelOnLastOption) {
      choiceFlags.push(".UI_MENU_LAST_0");
    }
    if (input.cancelOnB) {
      choiceFlags.push(".UI_MENU_CANCEL_B");
    }


    helpers._setConstMemUInt8("in_child_script_menu", 1)
    helpers.variableSetToValue(in_child_script_menu, 1)

    const choices = []
    const view_choices = []
    const confirm_choices = []

    for (let i = 0; i < input.script_count; i++) {
        choices.push({
            value: {
                type: "number",
                value: i + 1,
            },
            branch: () => {
                helpers._setConstMemUInt8("in_child_script_menu", 0)
                const script = helpers.compileCustomEventScript(input[`slot_${i + 1}_script`])
                const dummies = Array(script.argsLen).fill().map((_) => helpers._declareLocal("dummy", 1, true))
                for (let i = 0; i < script.argsLen; i++) {
                    helpers._stackPushReference(dummies[i])
                }
                helpers._callFar(script.scriptRef, script.argsLen)
                helpers.markLocalsUsed(...dummies)
                helpers._getMemUInt8(in_child_script_menu, "in_child_script_menu")
            }
        })
    }

    for (let i = 0; i < input.script_count; i++) {
        view_choices.push({
            value: {
                type: "number",
                value: i + 1,
            },
            branch: () => {
                helpers._loadText(2)
                helpers._dw(slot_x, slot_y)
                helpers._string(`\\003%c%c\\001\\001${input[`slot_${i+1}_view`]}`)
                helpers._displayText()
                helpers._overlayWait(false, [".UI_WAIT_TEXT"])
            }
        })
    }

    for (let i = 0; i < input.slot_count; i++) {
        confirm_choices.push({
            value: {
                type: "number",
                value: i + 1,
            },
            branch: () => {
                helpers.variableCopy(choice, input[`slot_${i+1}_choice`])
            }
        })
    }

    helpers.whileScriptValue({
        type: "variable",
        value: in_child_script_menu
    }, () => {
        const start_draw_view_loop = helpers.getNextLabel()
        const end_draw_view_loop = helpers.getNextLabel()

        helpers._overlayClear(0, 0, 20, menu_height, ".UI_COLOR_WHITE", true, false)
        for (let i = 0; i < input.slot_count; i++) {
            const x = 3
            const y = i+2
            helpers.variableSetToValue(slot_x, x)
            helpers.variableSetToValue(slot_y, y)
            helpers.variableCopy(choice, input[`slot_${i + 1}_choice`])
            helpers._addCmd("VM_CALL", `${start_draw_view_loop}$`)
        }
        helpers._jump(end_draw_view_loop)
        helpers._label(start_draw_view_loop)
        helpers._stackPushConst(1)
        helpers.output.pop()
        helpers.caseVariableConstValue(choice, view_choices)
        helpers._addCmd("VM_RET")
        helpers._stackPop(1)
        helpers.output.pop()
        helpers._label(end_draw_view_loop)
        if (input.cancelOnLastOption) {
            helpers.textDraw(input.cancelOnLastOptionText, 2, choice_count, "overlay")
        }

        helpers.overlayMoveTo(0, 18 - menu_height, ".OVERLAY_IN_SPEED")
        helpers._choice(choice, choiceFlags, choice_count)
        for(let i=0;i<choice_count;i++){
            helpers._menuItem(
                1,
                i + 1,
                1,
                choice_count,
                (i - 1 <= 0) ? 1 : i - 1,
                (i + 2 >= choice_count) ? choice_count : i + 2
            )
        }
        helpers.overlayMoveTo(0, 18, ".OVERLAY_OUT_SPEED")

        helpers.caseVariableConstValue(choice, confirm_choices)
        helpers.caseVariableConstValue(choice, choices, is_main_menu ? null : () => {
            helpers.labelGoto("end")
        })
    })
    helpers.labelDefine("end")
    helpers.markLocalsUsed(choice, in_child_script_menu, slot_x, slot_y)
}
module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};