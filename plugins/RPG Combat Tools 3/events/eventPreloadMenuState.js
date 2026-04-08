const id = "MENU_PRELOAD_MENU_STATE";
const groups = ["RPG Menu System"];
const name = "Preload Menu State";

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
    helpers._stackPushScriptValue(input.menu_id)
    helpers._callNative("preloadMenuState")
    helpers._stackPop(1)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
};