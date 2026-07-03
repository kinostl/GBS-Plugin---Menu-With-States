const id = "MENU_DEFINE_MENU_STATE_VIA_ACTORS";
const groups = ["Menus"];
const name = "Define Menu State Using Actors";
const l10n = require("../helpers/l10n").default;
const autoLabel = (fetchArg) => {
  const variable = fetchArg("variable")
  const id = fetchArg("menu_id")
  const group = fetchArg("collisionGroup")
  return `Menu State #${id}: Set ${variable} With Actors in Group ${group} as Options`;
};

/**
 * Displays a list of actors in a specified group
 */

const settings = [
    {
        type: "checkbox",
        label: l10n("FIELD_CANCEL_IF_B"),
        description: l10n("FIELD_CANCEL_IF_B_DESC"),
        key: "cancelOnB",
        defaultValue: true,
    }
]

const tab_condition = (type) => {
    return {
        key: "__section",
        in: [type, undefined]
    }
}

const event_tab = (key) => {
    return {
        key,
        type: "events",
        conditions: [tab_condition(key)]
    }
}

const compound_tab = (key) => {
    return [{
        key: `${key}_group`,
        label: "Run this 'On Hit' Script",
        type: "collisionMask",
        includePlayer: true,
        defaultValue: "1",
        conditions: [tab_condition(key)]
    },{
        label: "Then after the 'On Hit' Script is done",
        conditions: [tab_condition(key)]
    },{
        key: `${key}_cb`,
        type: "events",
        conditions: [tab_condition(key)]
    }]
}

const on_select = compound_tab("on_select");
const on_cancel = event_tab("on_cancel");
const on_change = event_tab("on_change");
const on_init = event_tab("on_init");

const fields = [{
    key: "menu_id",
    label: "Menu ID",
    type: "togglebuttons",
    options: Array(8).fill().map((_, i) => [i + 1, `${i + 1}`]),
    defaultValue: 1,
},
{
    label: "Set variable",
    type: "variable",
    key: "variable"
},
{
    key: "collisionGroup",
    label: "List Actors in Groups",
    type: "collisionMask",
    defaultValue: ["1"],
},
...settings,
{
    key: "__section",
    type: "tabs",
    variant: "eventSection",
    values: {
        on_init: "On Init",
        on_select: "On Select",
        on_cancel: "On Cancel",
        on_change: "On Cursor Change"
    },
    defaultValue: "on_select"
},
    on_init,
    ...on_select,
    on_cancel,
    on_change
]

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

    if (input.compileSubScript === "on_init") {
        const actors = helpers.options.scene.actors.filter((x)=>{
            return x.collisionGroup == input.collisionGroup
        }).sort((a,b)=>b.y-a.y)

        helpers._addComment("Actor Menu On Init")
        actors.forEach((actor)=>{
            helpers.actorPushById(actor.id)
        })
        helpers._stackPushConst(actors.length, "Actor Count")
        helpers._callNative("prepareActorMenuState")
        helpers._stackPop(actors.length+1)
        return
    }

    if (input.compileSubScript === "on_select") {
        helpers._addComment("Actor Menu On Select")
        const thread_lock = helpers._declareLocal("thread_lock", 1, true)
        helpers._stackPushReference(thread_lock)
        helpers._stackPushConst(toASMCollisionGroup(input.on_select_group))
        helpers._callNative("runActorMenuScript")
        helpers._stackPop(2)
        helpers._addCmd("VM_JOIN", helpers.getVariableAlias(thread_lock))
        helpers._markLocalUse(thread_lock)
        return
    }

    const on_init = [
        ...input.on_init,
        {
            "command": id,
            "id": "",
            "args": {
                ...input,
                compileSubScript: "on_init"
            }
        }]

    const on_select = [{
        "command": id,
        "id": "",
        "args": {
            ...input,
            compileSubScript: "on_select"
        }
    }, ...input.on_select_cb]

    helpers.compileEvents([{
        "command": "MENU_DEFINE_MENU_STATE",
        "id": "",
        "args": {
            ...input,
            on_init,
            on_select,
            menu_items: []
        }
    }])
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    autoLabel,
    sceneTypes: ["MENU_SCREEN"],
};