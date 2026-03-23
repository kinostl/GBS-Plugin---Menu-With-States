const id = "MENU_DEFINE_SCRIPT_MENU_SLOT";
const groups = ["Menu State System"];
const name = "Set Dynamic Menu Slot";

const autoLabel = (fetchArg) => {
    const slot = fetchArg("slot")
    const script = fetchArg("script")

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
        key: "text",
        type: "text",
        label: "Menu Text",
        defaultValue: "Slot #"
    },
    {
        key: "script",
        label: "Script to run on select",
        type: "customEvent",
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    if(input.custom_script){
        helpers._loadText(0)
        helpers._string(`\\001\\001${input.text}\\n`)
        helpers._displayText(true);
        helpers._overlayWait(false, [".UI_WAIT_TEXT"]);
        return
    }

    const customEvent = helpers.compileCustomEventScript(input.script)
    const customEventName = helpers.options.customEvents.find((_)=>_.id == input.script).name
    helpers._addComment(`Update Dynamic Slot #${input.slot} to ${customEventName} as "${input.text}"`)
    if (customEvent.argsLen > 0) {
        throw "Scripts with args not supported yet."
    }
    helpers._stackPushConst(input.slot - 1)
    helpers._stackPushConst(`___bank_${customEvent.scriptRef}`)
    helpers._stackPushConst(`_${customEvent.scriptRef}`)
    helpers._callNative("setScriptMenuSlot")
    helpers._stackPop(3)

    const drawEvent = helpers._compileSubScript("custom", [{
        "command": id,
        "id": "",
        args: {
            ...input,
            custom_script: true
        }
    }])
    helpers._stackPushConst(input.slot - 1)
    helpers._stackPushConst(`___bank_${drawEvent}`)
    helpers._stackPushConst(`_${drawEvent}`)
    helpers._callNative("setScriptMenuViewSlot")
    helpers._stackPop(3)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    autoLabel
};