const id = "MENU_PREPARE_TEXT_AREAS";
const groups = ["Menus"];
const name = "Prepare Text Area";

const fields = [{
    key: "collisionGroups",
    label: "Text Area #s",
    type: "togglebuttons",
    options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
    defaultValue: [1, 2, 3, 4, 5, 6, 7, 8],
    allowMultiple: true
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    let n_tiles = Math.max(...helpers.options.scene.background.tilemap.data)
    n_tiles++

    input.collisionGroups.forEach((collisionGroup) => {
        const symbol = `${helpers.options.scene.hash}_text_area_${collisionGroup}`
        const len_symbol = `len_${symbol}`

        if (!helpers.options.compiledAssetsCache[symbol]) {
            let len = n_tiles
            const collisions = helpers.options.scene.collisions
            helpers.options.compiledAssetsCache[symbol] = n_tiles

            for (let i = 0; i < collisions.length; i++) {
                const is_text = (collisions[i] & 240)
                const collision_group = (collisions[i] & 15)

                if (is_text && (collision_group == collisionGroup)) {
                    helpers.options.scene.background.tilemap.data[i] = n_tiles
                    n_tiles++
                }
            }
            len = Math.min(16, n_tiles - len)
            helpers.options.compiledAssetsCache[len_symbol] = len
        }

        if (!input.saveArea) {
            helpers._stackPushConst(helpers.options.compiledAssetsCache[symbol])
            helpers._stackPushConst(helpers.options.compiledAssetsCache[len_symbol])
            helpers._callNative("clearTextArea")
            helpers._stackPop(2)
        }
    })
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    sceneTypes: ["MENU_SCREEN"],
};