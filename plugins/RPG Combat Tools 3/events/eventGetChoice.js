const id = "MENU_GET_CHOICE";
const groups = ["RPG Menu System"];
const name = "Use Background as Menu";

const MAX_OPTIONS = 32

const option_fields = Array(MAX_OPTIONS).fill().map((_, i) => {
    let page = "page_0"
    if (i > 7) page = "page_1"
    if (i > 15) page = "page_2"
    if (i > 23) page = "page_3"
    const conditions = [{
        key: "option_count",
        gt: i
    }, {
        key: "__section",
        in: [page, undefined]
    }]

    const dest_conditions = [...conditions, {
        key: "override_dest",
        eq: true
    }]

    return {
        type: "group",
        conditions,
        fields: [{
            label: `${i + 1}. `,
            inline: true,
            alignBottom: true,
            conditions
        }, {
            type: "number",
            key: `option_${i + 1}_x`,
            defaultValue: 0,
            conditions
        }, {
            type: "number",
            key: `option_${i + 1}_y`,
            defaultValue: 0,
            conditions
        }, {
            type: "number",
            key: `option_${i + 1}_left`,
            defaultValue: i + 2,
            conditions: dest_conditions
        }, {
            type: "number",
            key: `option_${i + 1}_right`,
            defaultValue: i - 1,
            conditions: dest_conditions
        }, {
            type: "number",
            key: `option_${i + 1}_up`,
            defaultValue: 0,
            conditions: dest_conditions
        }, {
            type: "number",
            key: `option_${i + 1}_down`,
            defaultValue: -1,
            conditions: dest_conditions
        }]
    }
})



const header_conditions = [{}]

const dest_conditions = [...header_conditions, {
    key: "override_dest",
    eq: true
}]

const option_header = [{
    type: "group",
    conditions: header_conditions,
    fields: [{
        label: `ID`,
        inline: true,
        alignBottom: true,
        conditions: header_conditions,
    }, {
        label: "X",
        conditions: header_conditions,
    }, {
        label: "Y",
        conditions: header_conditions,
    }, {
        label: "Up",
        conditions: dest_conditions
    }, {
        label: "Left",
        conditions: dest_conditions
    }, {
        label: "Right",
        conditions: dest_conditions
    }, {
        label: "Up",
        conditions: dest_conditions
    }, {
        label: "Down",
        conditions: dest_conditions
    }]
}]

const option_fields_group = [{
    type: "group",
    wrapItems: true,
    fields: [
        ...option_header,
        ...option_fields
    ]
}]

const fields = [{
    label: "Set variable",
    type: "variable",
    key: "variable",
    defaultValue: "LAST_VARIABLE"
}, {
    key: "option_count",
    type: "number",
    defaultValue: 2,
    min: 2,
    max: MAX_OPTIONS,
    label: "Number of options",
},
{
    type: "checkbox",
    key: "override_dest",
    label: "Override Destinations",
    defaultValue: false
},
{
    key: "__section",
    type: "tabs",
    defaultValue: "page_0",
    variant: "eventSection",
    values: {
        page_0: "1 - 8",
        page_1: "9 - 16",
        page_2: "17 - 24",
        page_3: "24 - 32"
    },
},
...option_fields_group
]

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
    helpers.overlayMoveTo(0, 18, -3)
    helpers.overlayCopyFromBackground()
    helpers.overlayMoveTo(0, 0, -3)

    helpers._choice(helpers.getVariableAlias(input.variable), [], input.option_count)
    for (let i = 0; i < input.option_count; i++) {
        let option = {
            x: input[`option_${i + 1}_x`],
            y: input[`option_${i + 1}_y`],
        }

        if (input.override_dest) {
            option.left = input[`option_${i + 1}_left`]
            option.right = input[`option_${i + 1}_right`]
            option.up = input[`option_${i + 1}_up`]
            option.down = input[`option_${i + 1}_down`]
        }else{
            option.left = i + 1
            option.right = i + 1 + 8

            if(i>=8){
                option.left-=8
                option.right+=8
            }
            if(i>=16){
                option.left-=8
                option.right+=8
            }
            if(i>=24){
                option.left-=8
                option.right+=8
            }

            if(option.left <= 0){
                option.left = 1
            }

            if(option.right >= input.option_count){
                option.right = i + 1
            }

            option.up = i <= 0 ? 1 : i
            option.down = i+2 >= input.option_count ? input.option_count : i+2
        }

        helpers._menuItem(option.x, option.y, option.left, option.right, option.up, option.down)
    }
    helpers.overlayMoveTo(0, 18, -3)
}

module.exports = {
    id,
    name,
    groups,
    fields,
    compile,
    waitUntilAfterInitFade: true,
};