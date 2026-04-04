#include <actor.h>
#include <bankdata.h>
#include <data_manager.h>
#include <gbs_types.h>
#include <input.h>
#include <system.h>
#include <ui.h>
#pragma bank 255

#include "states/menu_scene.h"


UWORD * menu_screen_index;
UBYTE menu_screen_next_index = 0u;
UWORD menu_screen_count = 0u;
UWORD menu_screen_options;
menu_item_t *menu_screen_start_item_ptr;
UWORD menu_screen_start_item_bank;
menu_item_t current_menu_item;
far_ptr_t menu_screen_on_cancel;
far_ptr_t menu_screen_on_select;
far_ptr_t menu_screen_on_change;

void menu_screen_init(void) BANKED {
}

void menu_screen_update(void) BANKED {

  if (INPUT_UP_PRESSED) {
    menu_screen_next_index = current_menu_item.iU;
  } else if (INPUT_DOWN_PRESSED) {
    menu_screen_next_index = current_menu_item.iD;
  } else if (INPUT_LEFT_PRESSED) {
    menu_screen_next_index = current_menu_item.iL;
  } else if (INPUT_RIGHT_PRESSED) {
    menu_screen_next_index = current_menu_item.iR;
  } else if (INPUT_A_PRESSED) {
    if ((*menu_screen_index == menu_screen_count) &&
        (menu_screen_options & MENU_CANCEL_LAST)) {
      // call the on_cancel
    } else {
      // call the on_select
    }
    // return
  } else if ((INPUT_B_PRESSED) && (menu_screen_options & MENU_CANCEL_B)) {
    // call the on_cancel
    // return
  } else {
    return;
  }

  if (!menu_screen_next_index)
    return;

  // update current index
  *menu_screen_index = menu_screen_next_index;

  // read menu data
  MemcpyBanked(&current_menu_item,
               menu_screen_start_item_ptr + *menu_screen_index - 1u,
               sizeof(menu_item_t), menu_screen_start_item_bank);
  PLAYER.pos.x = current_menu_item.X;
  PLAYER.pos.y = current_menu_item.Y;
  //call the on_change
}
