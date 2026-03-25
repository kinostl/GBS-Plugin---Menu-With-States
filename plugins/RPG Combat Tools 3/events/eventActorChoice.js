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

const comp_arr = (a, b) => {
    if (a.length != b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {

        if (b[i] instanceof RegExp) {
            if (!b[i].test(a[i])) {
                return false;
            }
        } else if (a[i] != b[i]) {
            return false;
        }
    }

    return true;
}

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
        const check_stack_push = ["VM_PUSH_CONST", `${actor_idx}`, ";", "Actor"]
        const check_projectile = ["VM_SET_CONST", /\.LOCAL_.*_OTHER_ACTOR\,/, `${actor_idx}`]

        if (
            comp_arr(prep, check_set_local_actor)
        ) {
            helpers._addComment("Found an actor to replace")
            helpers.variableCopy(".LOCAL_ACTOR", input.variable)
        } else if (
            comp_arr(prep.slice(0, check_stack_push.length), check_stack_push)
        ) {
            helpers._addComment("Found an actor to replace 2")
            helpers._stackPushVariable(input.variable)
            helpers._stackPop(1)
            helpers.output.pop()
        } else if (
            comp_arr(prep, check_projectile)
        ) {
            helpers._addComment("Found an actor to replace 3")
            helpers.variableCopy(prep[1].substring(0, prep[1].length - 1), input.variable)
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