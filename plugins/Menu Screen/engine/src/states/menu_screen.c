#include <actor.h>
#include <asm/types.h>
#include <bankdata.h>
#include <data/menu_screen_t.h>
#include <game_time.h>
#include <gb/gb.h>
#include <gb/hardware.h>
#include <gbs_types.h>
#include <input.h>
#include <scroll.h>
#include <ui.h>
#include <vm.h>
#include <macro.h>
#pragma bank 255

#include "states/menu_screen.h"

menu_screen_state_t cmst;

void menu_screen_init(void) BANKED {
    SET_FLAG(PLAYER.flags, ACTOR_FLAG_HIDDEN);
}
void menu_screen_update(void) BANKED {}