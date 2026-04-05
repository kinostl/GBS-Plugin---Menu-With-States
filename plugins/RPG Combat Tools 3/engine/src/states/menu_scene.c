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

void menu_screen_init(void) BANKED {}
void menu_screen_update(void) BANKED {}

void prepareMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG2);
  const WORD scene_id = *(WORD *)VM_REF_TO_PTR(FN_ARG1);
  const WORD menu_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0) - 1;
  menu_item_t current_menu_screen_item;

  far_ptr_t menu_screen_ptr;

  ReadBankedFarPtr(&menu_screen_ptr, (void *)&menu_scene_states[menu_id],
                   BANK(menu_scene_states));

  MemcpyBanked(&cmst, menu_screen_ptr.ptr + menu_id,
               sizeof(menu_screen_state_t), menu_screen_ptr.bank);

  MemcpyBanked(&current_menu_screen_item, cmst.menu_items.ptr,
               sizeof(menu_item_t), cmst.menu_items.bank);

  vm_call_far(THIS, cmst.on_init.bank,
              cmst.on_init.ptr);
}

void continueMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  WORD *current_menu_screen_status = (WORD *)VM_REF_TO_PTR(menu_status_id);

  switch (*current_menu_screen_status) {
  case -1:
    // Choice Cancelled
    vm_call_far(THIS, cmst.on_cancel.bank,
                cmst.on_cancel.ptr);
    return;
  case 0:
    // Continue
    vm_call_far(THIS, cmst.on_change.bank,
                cmst.on_change.ptr);
    return;
  case 1:
    // Choice Made
    vm_call_far(THIS, cmst.on_select.bank,
                cmst.on_select.ptr);
    return;
  default:
    return;
  }
}

void invokeMenuState(SCRIPT_CTX *THIS) BANKED {
  vsync();
  input_update();
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  WORD *current_menu_screen_status = (WORD *)VM_REF_TO_PTR(menu_status_id);
  WORD *set_variable = (WORD *)VM_REF_TO_PTR(cmst.set_variable_id);
  const WORD menu_item_id = MAX(1, MIN(cmst.menu_items_count, *set_variable));
  menu_item_t current_menu_screen_item;
  MemcpyBanked(&current_menu_screen_item,
               ((menu_item_t *)cmst.menu_items.ptr) + menu_item_id - 1,
               sizeof(menu_item_t), cmst.menu_items.bank);

  PLAYER.pos.x = TILE_TO_SUBPX(current_menu_screen_item.X);
  PLAYER.pos.y = TILE_TO_SUBPX(current_menu_screen_item.Y);

  UBYTE next_index = 0;
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
      *current_menu_screen_status = -1;
    } else {
      *current_menu_screen_status = 1;
    }
    return;
  } else if ((INPUT_B_PRESSED) && (cmst.options & MENU_CANCEL_B)) {
    *current_menu_screen_status = -1;
  } else {
    return;
  }

  if (!next_index)
    return;
  *set_variable = next_index;
}
