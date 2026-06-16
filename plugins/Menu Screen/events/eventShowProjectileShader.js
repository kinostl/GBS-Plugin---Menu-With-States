const l10n = require("../helpers/l10n").default;

const id = "EVENT_PARTICLE_EFFECT";
const groups = ["EVENT_GROUP_ACTOR"];

const fields = [
    {
        type: "group",
        fields: [
            {
                key: "spriteSheetId",
                type: "sprite",
                label: l10n("FIELD_SPRITE_SHEET"),
                description: l10n("FIELD_SPRITE_SHEET_PROJECTILE_DESC"),
                defaultValue: "LAST_SPRITE",
            },
            {
                key: "spriteStateId",
                type: "animationstate",
                label: l10n("FIELD_ANIMATION_STATE"),
                description: l10n("FIELD_ANIMATION_STATE_DESC"),
                defaultValue: "",
            },
        ],
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
                key: "speed",
                label: l10n("FIELD_SPEED"),
                description: l10n("FIELD_SPEED_DESC"),
                type: "moveSpeed",
                allowNone: true,
                defaultValue: 2,
                width: "50%",
            },
            {
                key: "animSpeed",
                label: l10n("FIELD_ANIMATION_SPEED"),
                description: l10n("FIELD_ANIMATION_SPEED_DESC"),
                type: "animSpeed",
                defaultValue: 15,
                width: "50%",
            },
        ],
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
            },
            {
                key: "time",
                label: l10n("FIELD_DURATION"),
                description: l10n("FIELD_DURATION_WAIT_DESC"),
                type: "value",
                min: 0,
                max: 60,
                step: 0.1,
                unitsField: "units",
                unitsDefault: "time",
                unitsAllowed: ["time", "frames"],
                defaultValue: {
                    type: "number",
                    value: 0.5,
                },
                conditions: [
                    {
                        key: "units",
                        ne: "frames",
                    },
                ],
            },
            {
                key: "frames",
                label: l10n("FIELD_DURATION"),
                description: l10n("FIELD_DURATION_WAIT_DESC"),
                type: "value",
                min: 0,
                max: 3600,
                width: "50%",
                unitsField: "units",
                unitsDefault: "time",
                unitsAllowed: ["time", "frames"],
                defaultValue: {
                    type: "number",
                    value: 1,
                },
                conditions: [
                    {
                        key: "units",
                        eq: "frames",
                    },
                ],
            },
        ]
    },
    {
        type: "group",
        fields: [
            {
                key: "offsetX",
                label: "Offset X",
                type: "number",
                min: 0,
                max: 256,
                defaultValue: 0,
            },
            {
                key: "offsetY",
                label: "Offset Y",
                type: "number",
                min: 0,
                max: 256,
                defaultValue: 0,
            },
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
const compile = (input, helpers) => { };

module.exports = {
    id,
    groups,
    fields,
    compile,
};
