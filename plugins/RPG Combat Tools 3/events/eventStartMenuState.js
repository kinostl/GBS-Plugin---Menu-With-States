const id = "MENU_CALL_COLLISION_CHOICE";
const groups = ["RPG Menu System"];
const name = "Display Collision Tiles as Choice";
const l10n = require("../helpers/l10n").default;

const settings = [

    {
        type: "checkbox",
        label: l10n("FIELD_LAST_OPTION_CANCELS"),
        description: l10n("FIELD_LAST_OPTION_CANCELS_DESC"),
        key: "cancelOnLastOption",
    },
    {
        type: "checkbox",
        label: l10n("FIELD_CANCEL_IF_B"),
        description: l10n("FIELD_CANCEL_IF_B_DESC"),
        key: "cancelOnB",
        defaultValue: true,
    }
]

const fields = [{
    label: "Set variable",
    type: "variable",
    key: "variable"
}, {
    type: "group",
    fields: [{
        label: "Collision Tile X",
        type: "number",
        key: "x",
        min: 0,
        max: 255,
        defaultValue: 0
    }, {
        label: "Collision Tile Y",
        type: "number",
        key: "y",
        min: 0,
        max: 255,
        defaultValue: 0
    }]
}, ...settings]

// Needs three event tabs total
// On Start
// On Select
// On Cancel
// Possible Additional tabs
// On Choice Changes
// When Upper Boundary Reached
// When Lower Boundary Reached
// ---
// Also need an event that starts a Menu State

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const choiceFlags = []
    if (input.cancelOnLastOption) {
      choiceFlags.push(".UI_MENU_LAST_0");
    }
    if (input.cancelOnB) {
      choiceFlags.push(".UI_MENU_CANCEL_B");
    }



    const tiles = helpers.options.scene.collisions
    const width = helpers.options.scene.width
    const source_pos = input.x + (input.y * width)
    const option_pos = []
    let x = 0
    let y = 0
    const x_lim = helpers.options.scene.width

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === tiles[source_pos]) {
            const choice = { x, y }
            option_pos.push(choice)
        }

        x++
        if (x >= x_lim) {
            x = 0
            y++
        }
    }

    const options = option_pos.map((option, i) => {
        option.id = i + 1
        return option
    })

    const count = options.length

    const menu_items = options.map((_) => {
        const option = {}
        option.x = _.x
        option.y = _.y
        option.id = _.id
        option.left = 1
        option.right = count
        option.up = option.id - 1
        option.down = option.id + 1

        if (option.up <= 1) {
            option.up = 1
        }

        if (option.down >= count) {
            option.down = count
        }

        return option
    })

    helpers.overlayCopyFromBackground()
    helpers.overlayMoveTo(0, 0, -3)
    helpers._choice(helpers.getVariableAlias(input.variable), choiceFlags, menu_items.length)
    menu_items.forEach((_) => {
        helpers._menuItem(_.x, _.y, _.left, _.right, _.up, _.down)
    })
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
    helper: {
        type: "position",
        x: "x",
        y: "y",
    },
};