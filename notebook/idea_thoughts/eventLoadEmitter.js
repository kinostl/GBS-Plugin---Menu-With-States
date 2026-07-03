/**
 * Need some way of saying that either an emitter or a region or something can aim at a target or in a direction or what-have-you
 * and that its coords may be relative to an actor.
 */

/**
 * Emitter
 * 
 * A region is a field of particles
 * 
 * Width
 * Height
 * Shape - Shape of the field, default to Rectangle
 * Speed - Time to wait between emissions (type: "overlaySpeed" provides instant to Speed 6 with no subtitles)
 * Lifetime - Amount of Time to Keep Updating. Set to 0 for unlimited.
 * Density? How many total emitters to actually make in a frame
 * Blur Method? How to distribute the emitters made
 */
const l10n = require("../helpers/l10n").default;

const id = "EVENT_EMITTER_START";
const groups = ["EVENT_GROUP_ACTOR"];
const name = "Emitter Multiple Particles"

const particle_fields = [
    {
        key: "slot",
        label: l10n("FIELD_PROJECTILE_SLOT"),
        type: "togglebuttons",
        options: [0, 1, 2, 3, 4].map((n) => [
            n,
            l10n("FIELD_SLOT_N", { slot: n + 1 }),
            l10n("FIELD_PROJECTILE_SLOT_N", { slot: n + 1 }),
        ]),
        allowNone: false,
        allowMultiple: true,
        defaultValue: [0],
    },
    {
        key: "chance",
        label: "Chance",
        type: "number",
        defaultValue: 100,
        min: 1,
        max: 100,
    },
    {
        type: "group",
        fields: [
            {
                label: l10n("FIELD_LAUNCH_AT"),
                key: "directionType",
                type: "select",
                options: [
                    ["direction", l10n("FIELD_FIXED_DIRECTION")],
                    ["actor", l10n("FIELD_ACTOR_DIRECTION")],
                    ["target", l10n("FIELD_ACTOR_TARGET")],
                    ["angle", l10n("FIELD_ANGLE")],
                    ["anglevar", l10n("FIELD_ANGLE_VARIABLE")],
                ],
                defaultValue: "direction",
                alignBottom: true,
            },
            {
                key: "otherActorId",
                label: l10n("FIELD_DIRECTION"),
                description: l10n("FIELD_PROJECTILE_DIRECTION_DESC"),
                type: "actor",
                defaultValue: "$self$",
                conditions: [
                    {
                        key: "directionType",
                        eq: "actor",
                    },
                ],
            },
            {
                key: "direction",
                label: l10n("FIELD_DIRECTION"),
                description: l10n("FIELD_PROJECTILE_DIRECTION_DESC"),
                type: "direction",
                defaultValue: "right",
                conditions: [
                    {
                        key: "directionType",
                        eq: "direction",
                    },
                ],
            },
            {
                key: "angle",
                label: l10n("FIELD_ANGLE"),
                description: l10n("FIELD_PROJECTILE_ANGLE_DESC"),
                type: "angle",
                defaultValue: 0,
                min: -256,
                max: 256,
                conditions: [
                    {
                        key: "directionType",
                        eq: "angle",
                    },
                ],
            },
            {
                key: "angleVariable",
                label: l10n("FIELD_ANGLE"),
                description: l10n("FIELD_PROJECTILE_ANGLE_DESC"),
                type: "variable",
                defaultValue: "LAST_VARIABLE",
                conditions: [
                    {
                        key: "directionType",
                        eq: "anglevar",
                    },
                ],
            },
            {
                key: "targetActorId",
                label: l10n("FIELD_TARGET"),
                description: l10n("FIELD_PROJECTILE_TARGET_DESC"),
                type: "actor",
                defaultValue: "$self$",
                conditions: [
                    {
                        key: "directionType",
                        eq: "target",
                    },
                ],
            },
        ],
    },
]

const emitter_fields = [
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "x",
                label: l10n("FIELD_X"),
                description: l10n("FIELD_X_DESC"),
                type: "number",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: 0
            },
            {
                key: "y",
                label: l10n("FIELD_Y"),
                description: l10n("FIELD_Y_DESC"),
                type: "number",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: 0,
            },
        ],
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "width",
                label: "Width",
                type: "number",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: 2,
            },
            {
                key: "height",
                label: "Height",
                type: "number",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: 2
            },
        ],
    },
    // {
    //     key: "shape",
    //     label: "Field Shape",
    //     type: "select",
    //     options: [
    //         ["rect", "Rectangle"]
    //     ],
    //     defaultValue: "rect"
    // },
    // {
    //     key: "speed",
    //     label: l10n("FIELD_SPEED"),
    //     type: "overlaySpeed",
    //     defaultValue: -3,
    // },
    // {
    //     type: "group",
    //     wrapItems: true,
    //     fields: [
    //         {
    //             key: "time",
    //             label: l10n("FIELD_LIFE_TIME"),
    //             type: "value",
    //             min: 0,
    //             max: 60,
    //             step: 0.1,
    //             unitsField: "time_units",
    //             unitsDefault: "time",
    //             unitsAllowed: ["time", "frames"],
    //             defaultValue: {
    //                 type: "number",
    //                 value: 0.5,
    //             },
    //             conditions: [
    //                 {
    //                     key: "time_units",
    //                     ne: "frames",
    //                 },
    //             ],
    //         },
    //         {
    //             key: "frames",
    //             label: l10n("FIELD_LIFE_TIME"),
    //             type: "value",
    //             min: 0,
    //             max: 3600,
    //             width: "50%",
    //             unitsField: "time_units",
    //             unitsDefault: "time",
    //             unitsAllowed: ["time", "frames"],
    //             defaultValue: {
    //                 type: "number",
    //                 value: 1,
    //             },
    //             conditions: [
    //                 {
    //                     key: "time_units",
    //                     eq: "frames",
    //                 },
    //             ],
    //         },
    //     ]
    // },
    {
        key: "number_of_particles",
        type: "number",
        label: "Max Number of Particles",
        min: 1,
        max: 8,
        defaultValue: 4
    },
]

const fields = [
    {
        key: "__scriptTabs",
        type: "tabs",
        defaultValue: "emitter_def",
        variant: "eventSection",
        values: {
            emitter_def: "Emitter",
            particle_def: "Particle",
        },
    },
    ...emitter_fields.map((x)=>({
        ...x,
        conditions: [{
            key: "__scriptTabs",
            in: ["emitter_def", undefined]
        }]
    })),
    ...particle_fields.map((x)=>({
        ...x,
        conditions: [{
            key: "__scriptTabs",
            in: ["particle_def", undefined]
        }]
    }))
]

const NUM_SUBPIXEL_BITS = 5;
const tileToSubpx = (x) => Math.floor(x * (1 << (3 + NUM_SUBPIXEL_BITS)));
const pxToSubpx = (x) => Math.floor(x * (1 << NUM_SUBPIXEL_BITS));
const unitsValueToSubpx = (x, units) => {
    if (units === "tiles") {
        return tileToSubpx(x);
    }
    return pxToSubpx(x);
};

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    input.x = unitsValueToSubpx(input.x, input.units)
    input.y = unitsValueToSubpx(input.y, input.units)
    input.width = unitsValueToSubpx(input.width, input.units)
    input.height = unitsValueToSubpx(input.height, input.units)

    const x = helpers._declareLocal("x", 1)
    const y = helpers._declareLocal("y", 1)
    const slot = helpers._declareLocal("slot", 1)
    const {chance, angle} = input


    for(let i=0;i<input.number_of_particles;i++){
        helpers.variableSetToRandom(x, input.x, input.x+input.width)
        helpers.variableSetToRandom(y, input.y, input.y+input.height)
        helpers.variableSetToRandom(slot, 1, input.slot.length)
        helpers.caseVariableConstValue(slot, input.slot.map((slot, i) => ({
            value: {
                type: "number",
                value: i + 1
            },
            branch: [{
                "id": "",
                "command": "EVENT_EMIT_PARTICLE",
                "args": {
                    x: { type: "variable", value: x },
                    y: { type: "variable", value: y },
                    slot, chance, angle,
                    units: "pixels"
                }
            }]
        })))
        helpers.idle()
    }

    helpers.markLocalsUsed(x, y, slot)
};

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
};
