const id = "MENU_JUMP_TO_MENU_STATE";
const groups = ["Menus"];
const name = "Jump To Menu State";
const autoLabel = (fetchArg) => {
    const id = fetchArg("menu_id")
    return `Jump To Menu State #${id}`;
};

const fields = [{
    key: "menu_id",
    label: "Menu ID",
    type: "togglebuttons",
    options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
    defaultValue: 1,
}] //Might want some additional fields that allow you to toggle if the state's "On X" scripts run.
// Also maybe a "Then" field that runs after "On Select" runs or maybe a copy of what Define has, allowing you to do some sort of t--too complex

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    if (input.compile_subscript == "thread") {
        const menu_status = helpers._declareLocal("menu_status", 1, true);

        helpers._stackPushConst(input.menu_id)
        helpers._callNative("prepareMenuState")
        helpers._stackPop(1)

        helpers.variableSetToValue(menu_status, 0)
        helpers._stackPushReference(menu_status)
        helpers.whileScriptValue({
            "type": "eq",
            "valueA": {
                "type": "variable",
                "value": menu_status
            },
            "valueB": {
                "type": "number",
                "value": 0
            }
        }, () => {
            helpers._idle()
            helpers._callNative("invokeMenuState")
        })
        helpers._stackPop(1)
        return;
    }

    const menu_state_thread_h = helpers._declareLocal("menu_state_thread_h", 1, true)
    helpers.threadStart(menu_state_thread_h, [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            compile_subscript: "thread"
        }
    }])
    helpers.scriptEnd()
    helpers.markLocalsUsed(menu_state_thread_h)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
    sceneTypes: ["MENU_SCREEN"],
    autoLabel
};