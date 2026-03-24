const id = "MENU_DISPLAY_ACTORS_MENU";
const groups = ["RPG Menu System"];
const name = "Display Actors Menu";

/**
 * Displays a list of actors in a specified group
 */

const fields = [{
    key: "variable",
    label: "Set Variable",
    type: "variable",
    defaultValue: "LAST_VARIABLE"
},{
    key: "collisionGroup",
    label: "List Actors in Groups",
    type: "collisionMask",
    defaultValue: ["1"],
}]

const toASMCollisionMask = (groups) => {
    return groups.reduce((mask, group) => {
        if (group === "player") {
            return mask | 1;
        }
        if (group === "1") {
            return mask | 2;
        }
        if (group === "2") {
            return mask | 4;
        }
        if (group === "3") {
            return mask | 8;
        }
        return mask;
    }, 0)
};

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const actors_on_overlay = helpers._declareLocal("actors_on_overlay", 1, true)
    const isColor = helpers.options.settings.colorMode !== "mono";
    if (isColor) {
        helpers._getMemUInt8(actors_on_overlay, "overlay_priority");
        helpers._setConstMemUInt8("overlay_priority", 0);
    } else {
        helpers._getMemUInt8(actors_on_overlay, "show_actors_on_overlay");
        helpers._setConstMemUInt8("show_actors_on_overlay", 1);
    }

    helpers.overlayMoveTo(0, 18, ".OVERLAY_OUT_SPEED")
    helpers.overlayCopyFromBackground()
    helpers.overlayMoveTo(0, 0, ".OVERLAY_SPEED_INSTANT")
    helpers._stackPushConst(toASMCollisionMask(input.collisionGroup))
    helpers._stackPushReference(helpers.getVariableAlias(input.variable))
    helpers._callNative("runActorMenu")
    helpers.overlayMoveTo(0, 18, ".OVERLAY_SPEED_INSTANT")
    helpers._stackPop(2)
    helpers.markLocalsUsed(actors_on_overlay)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};