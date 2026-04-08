const id = "MENU_PRELOAD_MENU_STATE";
const groups = ["Menus"];
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
    sceneTypes: ["MENU_SCREEN"],
};