const id = "MENU_PRELOAD_MENU_STATE";
const groups = ["Menus"];
const name = "Preload Menu State";

const fields = [{
    key: "menu_id",
    label: "Menu ID",
    type: "togglebuttons",
    options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
    defaultValue: 1,
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    helpers._stackPushConst(input.menu_id)
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