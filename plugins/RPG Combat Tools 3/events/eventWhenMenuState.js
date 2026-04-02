const id = "MENU_ATTACH_TO_STATE";
const groups = ["RPG Menu System"];
const name = "Attach Script to State";

const fields = [{
    label: "State",
    type:"number",
    key: "state",
},{
    label: "Set variable",
    type: "variable",
    key: "variable"
},{
    type: "events",
    key: "events",
}]
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
    const tiles = helpers.options.scene.collisions
    const menu = []
    let x = 0
    let y = 0
    const x_lim = helpers.options.scene.width

    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i] === input.state) {
            const choice = { x, y }
            menu.push(choice)
        }

        x++
        if (x >= x_lim) {
            x = 0
            y++
        }
    }

    const count = menu.length
    const max_x = menu.reduce((_, __)=>Math.max(_, __.x), 0)
    const min_x = menu.reduce((_, __)=>Math.min(_, __.x), 0)

    let cid = 1

    const menu_2 = []
    for (let x = min_x; x <= max_x; x++) {
        const col = menu.filter((_) => _.x === x)
        if (col) {
            col.sort((a, b) => a.y - b.y)
            col.forEach((_) => {
                _.id = cid
                cid++
            })
            menu_2.push(...col)
        }
    }

    const options = menu_2.map((_) => {
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

    const script = helpers._compileSubScript("input", input.events)
    
    /**
     * So like do we want to push th e script and menu item config
     * into an array or something
     * and load that as part of a state swap?
     */







    /**
     * The idea here is to build up some structs that let us know what a menu scene's sections are, where they are, etc.
     * Stuff to help with the menuing
     * 
     * Also the what to do on select.
     * 
     * Run this stuff through ui_run_menu() and hope for magic
     * 
     * Collision tile dictates section and also dictates where the cursor shows up
     */

    /**
     * When Menu Height of State hit if upper limit if lower limit do actions
     */

    /**
     * Don't care about text drawing
     * Don't care about frame drawing
     * Just copy background to overlay and bring overlay up
     */

     /** 
     * Probably need to consider how to handle the directionality part. Is it always up/down, etc
     * 
     * Also how to handle actually filling in the stuff
     * 
     * Do we need "Attach Script to Menu State Starting" ?
     * 
     * So on init we'd go ahead and load up the stuff
     * Use this script to build the structs that get loaded
     * 
     * Then also from there like. Uhhhhhh 
     * fuck like, gotta figure out how to handle stuff like hitting a menu edge at some point right
     * that has to be engine compliant
     * 
     * Thats what the afformentioned "Attach Script to Menu State".
     * 
     * Start with assumption that we can go with top left to bottom right
     * calculate columns intelligently
     * replicate the 2 column if necessary
     * 
     * add "use player as cursor" or "use actor as cursor"?
     * 
     * do we care to override ui_run_menu at all or replicate it and make our own?
     */
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};