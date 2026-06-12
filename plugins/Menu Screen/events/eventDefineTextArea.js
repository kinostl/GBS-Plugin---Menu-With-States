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
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const textAreaStartTile = helpers._declareLocal("textAreaStartTile", 1, true)
    const textAreaStartLen = helpers._declareLocal("textAreaStartLen", 1, true)

    const symbol = `${helpers.options.scene.hash}_text_area_${input.textArea}`
    if (input.textArea > 0) {
        helpers.compileEvents([{
            "command": "MENU_PREPARE_TEXT_AREAS",
            "id": "",
            "args": {
                "collisionGroups": [input.collisionGroup],
                "saveArea": true
            }
        }])
        helpers._stackPushConst(helpers.options.compiledAssetsCache[symbol])
        helpers._stackPushConst(helpers.options.compiledAssetsCache[`len_${symbol}`])
    } else {
        const searchSymbol = `${helpers.options.scene.hash}_text_area_`
        const text_areas = Object.entries(helpers.options.compiledAssetsCache)
            .filter(([key, _]) => key.startsWith(searchSymbol))
            .map(([textArea, startTile]) => ({
                value: {
                    type: "number",
                    value: Number(textArea.replace(searchSymbol, ''))
                },
                branch: () => {
                    if (!helpers.options.compiledAssetsCache[`len_${textArea}`]) {
                        throw new Error(JSON.stringify({
                            key: `len_${textArea}`,
                            value: helpers.options.compiledAssetsCache[`len_${textArea}`]
                        }))
                    }
                    helpers.variableSetToValue(textAreaStartLen, 
                        helpers.options.compiledAssetsCache[`len_${textArea}`]
                    )
                    helpers.variableSetToValue(textAreaStartTile, startTile)
                }
            }))

        // TODO optimization: Can use the cache to hold a label to this switch statement if it already exists and just call it instead
        helpers.caseVariableConstValue(input.variable, text_areas)
        helpers._stackPushVariable(textAreaStartTile)
        helpers._stackPushVariable(textAreaStartLen)
    }

    helpers._callNative("clearTextArea")
    helpers._stackPop(1)

    helpers._loadText(0)
    helpers._string(`\\001\\001${input.text}`)
    helpers._callNative("drawTextArea")

    helpers._stackPop(1)

    helpers._overlayWait(false, [".UI_WAIT_TEXT"])
    helpers._callNative("fixTextArea")

    helpers._markLocalUse(textAreaStartTile, textAreaStartLen)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    sceneTypes: ["MENU_SCREEN"],
};