const id = "MENU_DEFINE_TEXT_AREA";
const groups = ["Menus"];
const name = "Draw Text Area";

const fields = [{
    key: "textArea",
    label: "Text Area #",
    type: "togglebuttons",
    options: Array(9).fill().map((_, i) => [i, `${i ? i : "Variable"}`]),
    defaultValue: 1,
}, {
    type: "variable",
    key: "variable",
    conditions: [{
        key: "textArea",
        eq: 0
    }]
}, {
    key: "text",
    type: "text"
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    // helpers.compileEvents([{
    //     "command": "MENU_PREPARE_TEXT_AREAS",
    //     "id": "",
    //     "args": {
    //         "collisionGroups": [input.collisionGroup]
    //     }
    // }])

    helpers._loadText(0)
    helpers._string(`\\001\\001${input.text}`)

    const symbol = `${helpers.options.scene.hash}_text_area_${input.textArea}`
    if (input.textArea > 0) {
        if (!helpers.options.compiledAssetsCache[symbol]) {
            const collisions = helpers.options.scene.collisions
            let n_tiles = Math.max(...helpers.options.scene.background.tilemap.data)
            n_tiles++
            helpers.options.compiledAssetsCache[symbol] = n_tiles

            for (let i = 0; i < collisions.length; i++) {
                const is_text = (collisions[i] & 240)
                const collision_group = (collisions[i] & 15)

                if (is_text && (collision_group == input.textArea)) {
                    helpers.options.scene.background.tilemap.data[i] = n_tiles
                    n_tiles++
                }
            }
        }
        helpers._stackPushConst(helpers.options.compiledAssetsCache[symbol])
        helpers._callNative("drawTextArea")
        helpers._stackPop(1)
    } else {
        const searchSymbol = `${helpers.options.scene.hash}_text_area_`
        const textAreaStartTile = helpers._declareLocal("textAreaStartTile", 1, true)
        const text_areas = Object.entries(helpers.options.compiledAssetsCache)
            .filter(([key, _]) => key.startsWith(searchSymbol))
            .map(([textArea, startTile]) => ({
                value: {
                    type:"number",
                    value: Number(textArea.replace(searchSymbol, ''))
                },
                branch: () => {
                    helpers.variableSetToValue(textAreaStartTile, startTile)
                }
            }))

        // TODO optimization: Can use the cache to hold a label to this switch statement if it already exists and just call it instead
        helpers.caseVariableConstValue(input.variable, text_areas)
        helpers._stackPushVariable(textAreaStartTile)
        helpers._callNative("drawTextArea")
        helpers._stackPop(1)
        helpers._markLocalUse(textAreaStartTile)
    }
    helpers._overlayWait(false, [".UI_WAIT_TEXT"])
    helpers._callNative("fixTextArea")
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    sceneTypes: ["MENU_SCREEN"],
};