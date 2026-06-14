const id = "MENU_RUN_ACTOR_SCRIPT";
const groups = ["Menus"];
const name = "Call Actor's Script";

const fields = [{
    key: "actor",
    type: "actor",
    label: "Actor",
    defaultValue: "$self$"
}, {

    key: `collision_group`,
    label: "Run this 'On Hit' Script",
    type: "collisionMask",
    includePlayer: true,
    defaultValue: "1",
}, {
    /*Do VM_JOIN?*/
    type: "checkbox",
    label: "Wait for Script to complete",
    key: "waitForScript",
    defaultValue: true,
}]

const toASMCollisionGroup = (group) => {
    return ({
        "player": "0",
        "1": "2",
        "2": "4",
        "3": "8",
    })[group]
};

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const thread_lock = helpers._declareLocal("thread_lock", 1, true)
    helpers._stackPushReference(thread_lock)
    helpers._stackPushConst(toASMCollisionGroup(input.collision_group))
    helpers.actorPushById(input.actor)
    helpers._callNative("runActorScript")
    helpers._stackPop(3)
    if (input.waitForScript) {
        helpers._addCmd("VM_JOIN", helpers.getVariableAlias(thread_lock))
    }
    helpers._markLocalUse(thread_lock)
}


module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
};