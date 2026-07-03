#ifndef MENU_SCREEN_SCENE_H
#define MENU_SCREEN_SCENE_H

#include <asm/types.h>
#include <data/menu_screen_t.h>

void menu_screen_init(void) BANKED;
void menu_screen_update(void) BANKED;

extern menu_screen_state_t cmst;

#endif