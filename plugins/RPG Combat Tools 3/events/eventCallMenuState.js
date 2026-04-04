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
    const scene_sym = `${helpers.options.scriptSymbolName}_menu_states`
    const scene_id = helpers.options.compiledAssetsCache["menu_scene_states"].indexOf(scene_sym)

    helpers._stackPushConst(scene_id, "Scene ID")
    helpers._stackPushScriptValue(input.menu_id)
    helpers._callNative("prepareMenuState")
    helpers._stackPop(2)
    const local = helpers._declareLocal("local", 1, true)
    helpers._invoke("menu_screen_run_menu_state", 0, local)
    helpers._markLocalUse(local)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};