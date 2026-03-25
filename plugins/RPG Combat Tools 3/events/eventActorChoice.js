
const id = "MENU_WHILE_ACTOR_CHOICE";
const groups = ["RPG Menu System"];
const name = "With Actor set to Choice";

const fields = [{
    label: "Actor",
    type:"actor",
    key: "actor",
    defaultValue: "$self$"
},{
    label: "Choice",
    type: "variable",
    key: "variable",
    defaultValue: "LAST_VARIABLE"
},{
    type: "events",
    key: "events",
}]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const start = helpers.output.length
    helpers.compileEvents(input.events)

    const output = helpers.output.splice(start)
    output.forEach((_) => {
        const prep = _.split(" ").map((_) => _.trim()).filter(_ => _)
        const actor_idx = helpers.getActorIndex(input.actor)
        const check_set_local_actor = ["VM_SET_CONST", ".LOCAL_ACTOR,", `${actor_idx}`]
        const check_stack_push = ["VM_PUSH_CONST", `${actor_idx}`, ";", "Actor", `${actor_idx - 1}`]
        if (
            prep[0] === check_set_local_actor[0] &&
            prep[1] === check_set_local_actor[1] &&
            prep[2] === check_set_local_actor[2]
        ) {
            helpers._addComment("Found an actor to replace")
            helpers.variableCopy(".LOCAL_ACTOR", input.variable)
        } else if (
            prep[0] === check_stack_push[0] &&
            prep[1] === check_stack_push[1] &&
            prep[2] === check_stack_push[2]
        ) {
            helpers._addComment("Found an actor to replace 2")
            helpers._stackPushVariable(input.variable)
            helpers._stackPop(1)
            helpers.output.pop()
        } else {
            helpers.output.push(_)
        }
    })
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};