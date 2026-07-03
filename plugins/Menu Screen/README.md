# Menu Scene Type

## Who is this for, and What does it do

This is a menu system for anyone making a game where menus matter a bit more than a simple choice. It lets you define "Menu States" using Collision, Actors, or something resembling the classic menu. To do this, it turns the player into a cursor similarly to Point and Click mode, and makes use of some new engine functions to make that happen.

## What is a Menu State

A "Menu State" is an event that can be jumped to, and contains up to 4 of the following:

### On Init

This script will run when the menu state is called, before it initiates the menu state. This is good for moving actors into necessary areas, clearing the overlay, or setting up your menu in general. Like setting the Variable to 1.

### On Select

This script will run after the menu state selection has been made. Its good for jumping to a new menu state, or having actors act using the included "Call Actor's Script" event.

### On Cancel

Simlar to "On Select", but happens after a cancellation choice is made.

### On Change

A hook to let you do some dynamic things when the player changes a choice. Good for things like swapping out a text field when a choice is changed. In the example project, you can see extensive use of this in the Magic Configuration screen.

# New Events

The following new events have been included. They are only intended to be used in a Menu Screen scene type. Usage in any other scene type is undefined behavior. It will probably work how you expect, but I'm not promising anything there.

## Menu States 

When you define a menu state you will provide is a menu id. If you define another menu state with the same id, it will override the previous one of that id.

### Define Menu State by Collision

Allows you to use a Menu Scene's collision tiles to define a Menu State. To do this, select all the areas that your menu state's actor can be at. Use one tile for each location you want to be an option. The player will move from left to right, then top to bottom.

### Define Menu State by Menu

Use the overlay to create a static menu, similar to the Display Menu functionality. Works as the Display Menu event, except the player is the cursor.

### Define Menu State by Dynamic Menu

Use the overlay to create a *dynamic* menu. A dynamic menu is one where the slots may be multiple options from a list. Provide the id of the item to the menu, and it will build the menu with those choices.

### Define Menu State by Actors

Allows you to use actor groups to create a menu state. Actorss of the chosen collision type. The cursor will be able to travel between the location of the actors chosen at the time of this state starting.

### Jump to Menu State

Starts a menu state by selecting the ID of the menu state you wish to jump to.

## Text Areas

In the Menu Scene type you can define "text areas" with the collision system. Highlight the areas you want to use for text, and then mark those areas as text with the blue triangle collision type. 

### Prepare Text Area

Sets up the scene to use the indicated spaces as text areas. Run this at the start of your scene. 

Select which Collision IDs are text areas.

### Draw Text Area

Use this to select the id of a text area and begin writing to it. It will use space in the background tiles area to display text.

## Utility Tools

Some things that are useful for the general workflow you might run into with this scene type.

### Call Actor's Script

Run an actor's on-hit script. Optionally wait for it to finish. Similar to Gud's, a bit simpler under the hood, and might not account for some important things that Gud's has.

# Engine Fields

## Locked Textbox Height

When this is active, it will force the textbox to always stay at a specific height. Good for making a menu seem more consistent, like in many RPGs.

# Techniques and Advice

## Using Dialogue With Locked Textbox

If you display text when you have the Locked Textbox enabled, it will result in the dialogue working as normal. To circumvent this, use the non-modal feature of display dialogue to match the Locked Textbox, and then have the script pause until a button is pressed. That will keep the textbox in line with everything else.
