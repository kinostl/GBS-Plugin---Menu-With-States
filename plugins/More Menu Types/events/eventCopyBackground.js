
const id = "MENU_COPY_BKG_TO_WIN";
const groups = ["Menus"];
const name = "Copy Background to Overlay";

const fields = []

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    helpers.overlayCopyFromBackground()
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
};