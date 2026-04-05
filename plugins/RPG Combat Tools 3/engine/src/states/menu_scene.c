#include <actor.h>
#include <asm/types.h>
#include <bankdata.h>
#include <data/menu_scene_t.h>
#include <gb/gb.h>
#include <gbs_types.h>
#include <input.h>
#include <math.h>
#include <ui.h>
#include <vm.h>
#pragma bank 255

#include "data/menu_scene_states.h"
#include "states/menu_scene.h"

menu_screen_state_t cmst;
typedef enum menu_screen_status_e {
  CHOICE_NONE=0,
  CHOICE_CANCELLED = 1,
  CHOICE_CHANGED = 2,
  CHOICE_SELECTED = 3
} menu_screen_status_e;

void menu_screen_init(void) BANKED {}
void menu_screen_update(void) BANKED {}

void prepareMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0) - 1;

  MemcpyBanked(&cmst, ((menu_screen_state_t *)menu_scene_states) + menu_id,
               sizeof(menu_screen_state_t), BANK(menu_scene_states));

  vm_call_far(THIS, cmst.on_init.bank, cmst.on_init.ptr);
}

void continueMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  menu_screen_status_e *current_menu_screen_status = (menu_screen_status_e *)VM_REF_TO_PTR(menu_status_id);

  switch (*current_menu_screen_status) {
  case CHOICE_CANCELLED:
    vm_call_far(THIS, cmst.on_cancel.bank, cmst.on_cancel.ptr);
    return;
  case CHOICE_CHANGED:
    vm_call_far(THIS, cmst.on_change.bank, cmst.on_change.ptr);
    *current_menu_screen_status = CHOICE_NONE;
    return;
  case CHOICE_SELECTED:
    vm_call_far(THIS, cmst.on_select.bank, cmst.on_select.ptr);
    return;
  case CHOICE_NONE:
  default:
    return;
  }
}

void invokeMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  menu_screen_status_e *current_menu_screen_status = (menu_screen_status_e *)VM_REF_TO_PTR(menu_status_id);
  WORD *set_variable = (WORD *)VM_REF_TO_PTR(cmst.set_variable_id);
  const WORD menu_item_id = MAX(1, MIN(cmst.menu_items_count, *set_variable));
  menu_item_t current_menu_screen_item;
  MemcpyBanked(&current_menu_screen_item,
               ((menu_item_t *)cmst.menu_items.ptr) + menu_item_id - 1,
               sizeof(menu_item_t), cmst.menu_items.bank);

  PLAYER.pos.x = TILE_TO_SUBPX(current_menu_screen_item.X);
  PLAYER.pos.y = TILE_TO_SUBPX(current_menu_screen_item.Y);

  UBYTE next_index = 0;

  vsync();
  input_update();

  if (INPUT_UP_PRESSED) {
    next_index = current_menu_screen_item.iU;
  } else if (INPUT_DOWN_PRESSED) {
    next_index = current_menu_screen_item.iD;
  } else if (INPUT_LEFT_PRESSED) {
    next_index = current_menu_screen_item.iL;
  } else if (INPUT_RIGHT_PRESSED) {
    next_index = current_menu_screen_item.iR;
  } else if (INPUT_A_PRESSED) {
    if ((*set_variable == cmst.menu_items_count) &&
        (cmst.options & MENU_CANCEL_LAST)) {
      *current_menu_screen_status = CHOICE_CANCELLED;
    } else {
      *current_menu_screen_status = CHOICE_SELECTED;
    }
    return;
  } else if ((INPUT_B_PRESSED) && (cmst.options & MENU_CANCEL_B)) {
    *current_menu_screen_status = CHOICE_CANCELLED;
  } else {
    *current_menu_screen_status = CHOICE_NONE;
    return;
  }

  if (!next_index)
    return;
  *set_variable = next_index;
  *current_menu_screen_status=CHOICE_CHANGED;
}
