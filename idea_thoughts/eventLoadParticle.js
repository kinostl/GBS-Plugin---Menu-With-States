/**
 * Particle
 * 
 * A particle is a wrapper around a projectile that determines the following:
 * 
 * x, y
 * chance
 * angle
 */
const l10n = require("../helpers/l10n").default;

const id = "EVENT_EMIT_PARTICLE";
const groups = ["EVENT_GROUP_ACTOR"];
const name = "Emit Particle"

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
        type: "group",
        wrapItems: true,
        fields: [
            {
                key: "x",
                label: l10n("FIELD_X"),
                description: l10n("FIELD_X_DESC"),
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
                key: "y",
                label: l10n("FIELD_Y"),
                description: l10n("FIELD_Y_DESC"),
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
    {
        key: "chance",
        label: "Chance",
        type: "number",
        defaultValue: 100,
        min: 1,
        max: 100
    },
    {
        key: "angle",
        label: l10n("FIELD_ANGLE"),
        description: l10n("FIELD_PROJECTILE_ANGLE_DESC"),
        type: "angle",
        defaultValue: 0,
        min: -256,
        max: 256,
    }
]
/**
 * 
 * @param {*} input
 * @param {import('/home/zone/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    const launchParticle = () => {
        helpers._addComment("Launch Particle In Angle");
        helpers._stackPushScriptValue(input.x)
        helpers._stackPushScriptValue(input.y)
        helpers._stackPushConst(Math.round(input.angle % 256))
        helpers._projectileLaunch(input.slot, ".ARG2");
        helpers._stackPop(3);
        helpers._addNL();
    }

    if (input.chance == 100) {
        launchParticle()
    } else {
        const chance = helpers._declareLocal("chance", 1)
        helpers.variableSetToRandom(chance, 1, 100)
        helpers.ifVariableCompareScriptValue(chance, ".LTE", { type: "number", value: input.chance }, launchParticle)
        helpers._markLocalUse(chance)
    }
};

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    helper: {
        type: "position",
        x: "x",
        y: "y",
        units: "units",
        tileWidth: 1,
    },
};
