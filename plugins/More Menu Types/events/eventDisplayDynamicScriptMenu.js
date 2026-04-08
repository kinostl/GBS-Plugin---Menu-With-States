/**
 * TODO 3/28/26
 * 
 * I think what I should do is add a new tab that asks "is this dynamic" and then if so, allow the first page to have more than 8 options.
 * In addition to that, the setting page asks what the height is, and then asks for variables that define each slot
 * 
 * Those are used to replicate what I have in the example right now, and run a couple switches like how its being done with the inter-script calls
 */
const id = "MENU_DISPLAY_DYNAMIC_SCRIPT_MENU";
const groups = ["Menus"];
const name = "Display Dynamic Script Menu";
const MAX_DISPLAY = 8
const MAX_SCRIPTS = 16

const script_conditions = [
    {
        key: "__section",
        in: ["scripts", undefined]
    }
]

const script_fields = Array(MAX_SCRIPTS).fill().map((_, i) => {
    const conditions = [{
        key: "script_count",
        gt: i
    },...script_conditions]

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
            defaultValue: `Item ${i + 1}`,
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
    conditions: script_conditions,
    fields: [
        {
            label: "ID",
            inline: true,
            alignBottom: true,
            conditions: script_conditions,
        },
        {
            label: "Item Text",
            width: "50%",
            conditions: script_conditions,
        }, {
            label: "Call Script",
            width: "50%",
            conditions: script_conditions,
        }]
}]

const slot_conditions = [{
    key: "__section",
    in: ["menu", undefined]
}]
const slot_fields = Array(MAX_DISPLAY).fill().map((_, i) => {
    const conditions = [{
        key: "slot_count",
        gt: i
    },
    ...slot_conditions]

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
    conditions: slot_conditions,
    fields: [
        {
            label: "#. ",
            inline: true,
            alignBottom: true,
            conditions: slot_conditions,
        },
        {
            label: "Variable containing ID for Option #",
            conditions: slot_conditions,
        }]
}]

const settings_conditions = [{
    key: "__section",
    in: ["settings", undefined]
}]
const settings = [
    {
        type: "checkbox",
        label: "Last option returns to previous menu",
        key: "cancelOnLastOption",
        conditions: settings_conditions
    },
    {
        type: "text",
        key: "cancelOnLastOptionText",
        label: "Last Option Text",
        defaultValue: "Cancel",
        conditions: [{
            key: "cancelOnLastOption",
            eq: true
        }, ...settings_conditions]
    },
    {
        type: "checkbox",
        label: "Return to previous menu if 'B' is pressed",
        key: "cancelOnB",
        defaultValue: true,
        conditions: settings_conditions
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
        conditions: settings_conditions
    },
]

const fields = [
    {
        key: "__section",
        type: "tabs",
        defaultValue: "projectile",
        variant: "eventSection",
        values: {
            menu: "Menu",
            scripts: "Scripts",
            settings: "Settings"
        },
        defaultValue: "menu"
    },
    {
        key: "slot_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: MAX_DISPLAY,
        label: "Number of options",
        conditions: slot_conditions
    },
    ...slot_header,
    ...slot_fields,
    {
        key: "script_count",
        type: "number",
        defaultValue: 1,
        min: 1,
        max: MAX_SCRIPTS,
        label: "Number of Scripts",
        conditions: script_conditions
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

    const is_main_menu = helpers.options.maxDepth >= 5

    helpers._setConstMemUInt8("in_child_script_menu", 1)
    helpers.variableSetToValue(in_child_script_menu, 1)

    const choices = []
    const dummies = []

    for (let i = 0; i < input.script_count; i++) {
        choices.push({
            value: {
                type: "number",
                value: i + 1,
            },
            branch: () => {
                helpers._setConstMemUInt8("in_child_script_menu", 0)
                const script = helpers.compileCustomEventScript(input[`slot_${i + 1}_script`])
                while(script.argsLen > dummies.length){
                    dummies.push(
                        helpers._declareLocal("dummy", 1, true)
                    )
                }

                for (let i = 0; i < script.argsLen; i++) {
                    helpers._stackPushReference(dummies[i])
                }
                helpers._callFar(script.scriptRef, script.argsLen)
                helpers._getMemUInt8(in_child_script_menu, "in_child_script_menu")
            }
        })
    }

    helpers.markLocalsUsed(...dummies)

    helpers.whileScriptValue({
        type: "variable",
        value: in_child_script_menu
    }, () => {
        helpers.compileEvents([{
            "id": "",
            "command": "MENU_DISPLAY_DYNAMIC_MENU",
            "args": {
                ...input,
                variable: choice
            }
        }])

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