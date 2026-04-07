const id = "MENU_DEFINE_TEXT_AREA";
const groups = ["RPG Menu System"];
const name = "Use Text Area";

const fields = [{
    key: "collisionGroup",
    label: "Collision Group",
    type: "togglebuttons",
    options: Array(9).fill().map((_, i) => [i, `${i ? i : "Default"}`]),
    defaultValue: 1,
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    if (!input.collisionGroup) {
        helpers._setConstMemUInt8("text_buffer_start", 0xCC)
        helpers._callNative("touchUiTile")
        return;
    }

    if (!helpers.options.compiledAssetsCache[`${helpers._contextHash}_text_area_${input.collisionGroup}`]) {
        const collisions = helpers.options.scene.collisions
        let n_tiles = Math.max(...helpers.options.scene.background.tilemap.data)
        n_tiles++
        helpers.options.compiledAssetsCache[`${helpers._contextHash}_text_area_${input.collisionGroup}`] = n_tiles

        for (let i = 0; i < collisions.length; i++) {
            const is_text = (collisions[i] & 240)
            const collision_group = (collisions[i] & 15)

            if (is_text && (collision_group == input.collisionGroup)) {
                helpers.options.scene.background.tilemap.data[i] = n_tiles
                n_tiles++
            }
        }
    }

    helpers._setConstMemUInt8("text_buffer_start", helpers.options.compiledAssetsCache[`${helpers._contextHash}_text_area_${input.collisionGroup}`])
    helpers._callNative("touchUiTile")
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    sceneTypes: ["MENU_SCREEN"],
};