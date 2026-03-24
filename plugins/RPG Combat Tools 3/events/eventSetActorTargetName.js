const id = "MENU_SET_ACTOR_NAME";
const groups = ["RPG Menu System"];
const name = "Set Actor Name";

/**
 * This writes to an array that is per-scene and holds the list of names
 * one name per actor
 * 
 * Only usable with direct actors, no indirect actors. (?)
 * Does nothing in terms of gbvm generation
 */

const fields = [{
    type: "actor",
    label: "Actor",
    key: "actor",
    defaultValue: "$self$"
},{
    type: "text",
    label: "Name",
    key: "text",
    defaultValue: "Actor #",
    maxLength: 16
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const sceneIndex = helpers.options.sceneIndex + 1
    const symbol = `scene_${sceneIndex}_actor_names`
    let names = helpers.options.compiledAssetsCache[symbol] || ["Player"]
    const idx = helpers.getActorIndex(input.actor)
    names[idx] = input.text
    helpers.options.compiledAssetsCache[symbol] = names

    helpers.compileEvents([{
        "command": "MENU_MAKE_ARRAY_DATA_FILES",
        "id": "",
        "args": {
            type: "char[17]",
            symbol,
            array: names.map((_) => _ ? JSON.stringify(_) : "\"\""),
            perLine: 1
        }
    }])
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};