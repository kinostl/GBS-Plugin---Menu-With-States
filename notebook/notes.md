# Requirements

1. Menus have multiple States
2. Any Menu Option can induce a new State
3. An event or script may induce a new State
4. Any Menu Option may execution states or a script
5. States may stack on top of each other (add Menu State to Stack?)
6. Menu States may have dynamically or static options
7. Menu States must be rendered to display
8. Menu States may be undone (popped)

## Considerations

Menus may have borders as needed?
Menu States may show information?
Menu States may update their displayed information?
Automatic Menu State definition may be a third party consideration, but one we can likely provide some nice examples

# Events to Make

## Define Menu State (1, 4, 6, 7)
## Start Menu State (2, 3)
## Add Current Menu State to Stack (5)
## Pop Current Menu State (8)

# Menu State

A Menu State encompasses the rendering, the listing, etc.

## Thoughts

It might be possible to make use of the new Json support system to help with this.

Using something like this we can make a pretty dynamic menu event for defining a menu state. "Static" would be a nice default where it just draws a menu as normal. "Action" would be a dummy that runs a script or something like that. "Dynamic" would be the type of menu thats context dependent, or might have some way of setting its slots maybe. 

```js
[
    {
        "name":"Main Menu",
        "type": "static",
        "slots" : [
            "Fight",
            "Magic",
            "Item",
            "Run"
        ]
    },
    {
        "name": "Fight",
        "type": "action"
    },
    {
        "name": "Magic",
        "type": "dynamic",
    },
    {
        "name": "Item",
        "type": "dynamic",
    },
    {
        "name": "Run",
        "type": "action"
    },
]
```

I think Dynamic types might need/want some sort of "Push" tool, to move through slots like a list

We might want something like "When this State Performs This Action" as an event, to help with follow-ups.


------


I think dynamics should just be precompiled states probably, since the offset method we're using will work well with that. Then update the defineStatestates thing to be a bit more aware of that idea or something.


-----

Dynamic just means "run the dynamic menu", get rid of states from the dynamic setter. That way we can just care about which menu blah blha blh remember taking out the trash thoughts about how only need a few ubytes in an array and then the menu choice can just be an offset.