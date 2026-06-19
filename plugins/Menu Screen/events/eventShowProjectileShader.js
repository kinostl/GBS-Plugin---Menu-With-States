const l10n = require("../helpers/l10n").default;

const id = "EVENT_PARTICLE_EFFECT";
const groups = ["EVENT_GROUP_ACTOR"];

const fields = [
    {
        key: "slot",
        label: l10n("FIELD_PROJECTILE_SLOT"),
        description: l10n("FIELD_LOAD_PROJECTILE_SLOT_DESC"),
        type: "togglebuttons",
        options: [0, 1, 2, 3, 4].map((n) => [
            n,
            l10n("FIELD_SLOT_N", { slot: n + 1 }),
            l10n("FIELD_PROJECTILE_SLOT_N", { slot: n + 1 }),
        ]),
        allowNone: false,
        defaultValue: 0,
    },
    {
        key: "actorId",
        label: "Target",
        type: "actor",
        defaultValue: "$self$",
        width: "100%",
    },
    {
        type: "group",
        fields: [
            {
                key: "effect",
                label: "Effect",
                type: "select",
                options:
                    [
                        "static", //stay in place for lifetime,
                        "rain", //randomly fire from a set direction and area,
                        "fog", //randomly appear in a set area
                        "throb", //Run around clockwise or counterclockwise,
                        "implode", //fire inwards from a circle,
                        "burst", //fire outwards from target
                        "smoke", // rise from base of target
                        "pool", //sit at base of target,
                        "bubble", //move around at base of target,
                        "sweep", //move from starting direction to opposite direction
                    ].map((x) => [x, x]),
                defaultValue: "static",
                width: "100%",
            }
        ]
    },
    {
        //For squares
        key : "direction",
        label: "Direction",
        type: "select",
        options: [
            "north",
            "east",
            "south",
            "west"
        ].map((x)=>[x,x]),
        defaultValue: "south"
    },
    {
        // For circles
        key: "polarity",
        label: "Polarity",
        type: "select",
        options: [
            "clockwise",
            "counter-clockwise"
        ].map((x)=>[x,x]),
        defaultValue: "clockwise"
    },
    {
        key: "radius",
        label: "Radius",
        type: "value",
        min: 0,
        max: 255,
        unitsField: "units",
        unitsDefault: "tiles",
        unitsAllowed: ["tiles", "pixels"],
        defaultValue: {
            type: "number",
            value: 0,
        },
    },
    {
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "width",
                label: "Width",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: {
                    type: "number",
                    value: 0,
                },
            },
            {
                key: "height",
                label: "Height",
                type: "value",
                min: 0,
                max: 255,
                width: "50%",
                unitsField: "units",
                unitsDefault: "tiles",
                unitsAllowed: ["tiles", "pixels"],
                defaultValue: {
                    type: "number",
                    value: 0,
                },
            },
        ],
    },
];

/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const projectileIndex = input.slot
    helpers.actorSetActive("player")
    helpers.launchProjectileInActorDirection(input.slot, 0, 0, input.actorId)
};

module.exports = {
    id,
    groups,
    fields,
    compile,
};
