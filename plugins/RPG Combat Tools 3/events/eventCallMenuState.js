const id = "MENU_JUMP_TO_MENU_STATE";
const groups = ["RPG Menu System"];
const name = "Jump To Menu State";

const fields = [{
    label: "Menu ID",
    type: "constvalue",
    key: "menu_id",
    min: 1,
    defaultValue: {
        type: "number",
        value: 1
    }
}]
//Might want some additional fields that allow you to toggle if the state's "On X" scripts run.
// Also maybe a "Then" field that runs after "On Select" runs or maybe a copy of what Define has, allowing you to do some sort of t--too complex

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const menu_status = helpers._declareLocal("menu_status", 1, true);

    helpers._stackPushScriptValue(input.menu_id)
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
        helpers._callNative("invokeMenuState")
        helpers._callNative("continueMenuState")
    })
    helpers._stackPop(1)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};