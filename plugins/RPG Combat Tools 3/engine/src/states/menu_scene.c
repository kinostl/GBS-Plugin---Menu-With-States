#include <actor.h>
#include <bankdata.h>
#include <data/menu_scene_t.h>
#include <data_manager.h>
#include <gbs_types.h>
#include <input.h>
#include <system.h>
#include <ui.h>
#include <vm.h>
#pragma bank 255

#include "states/menu_scene.h"
#include "data/menu_scene_states.h"

menu_screen_state_t current_menu_screen_state;
#define cmst current_menu_screen_state

void menu_screen_init(void) BANKED {}
void menu_screen_update(void) BANKED {}

void prepareMenuState(SCRIPT_CTX * THIS) BANKED {
  const UWORD scene_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  const UWORD menu_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  far_ptr_t menu_screen_ptr;

  ReadBankedFarPtr(&menu_screen_ptr, (void *)&menu_scene_states[menu_id],
                   BANK(menu_scene_states));

  MemcpyBanked(&current_menu_screen_state, menu_screen_ptr.ptr + menu_id,
               sizeof(menu_screen_state_t), menu_screen_ptr.bank);
}

UBYTE menu_screen_run_menu_state(void *THIS, UBYTE start,
                                 UWORD *stack_frame) BANKED {
  if (start) {
    vm_call_far(THIS, current_menu_screen_state.on_init.bank,
                current_menu_screen_state.on_init.ptr);
    return FALSE;
  }
  UBYTE next_index;
  static menu_item_t current_menu_item;

  if (INPUT_UP_PRESSED) {
    next_index = current_menu_item.iU;
  } else if (INPUT_DOWN_PRESSED) {
    next_index = current_menu_item.iD;
  } else if (INPUT_LEFT_PRESSED) {
    next_index = current_menu_item.iL;
  } else if (INPUT_RIGHT_PRESSED) {
    next_index = current_menu_item.iR;
  } else if (INPUT_A_PRESSED) {
    if ((*cmst.set_variable == cmst.menu_items_count) &&
        (cmst.options & MENU_CANCEL_LAST)) {
      // call the on_cancel
      vm_call_far(THIS, current_menu_screen_state.on_cancel.bank,
                  current_menu_screen_state.on_cancel.ptr);
    } else {
      // call the on_select
      vm_call_far(THIS, current_menu_screen_state.on_select.bank,
                  current_menu_screen_state.on_select.ptr);
    }
    // return
    return TRUE;
  } else if ((INPUT_B_PRESSED) && (cmst.options & MENU_CANCEL_B)) {
    vm_call_far(THIS, current_menu_screen_state.on_cancel.bank,
                current_menu_screen_state.on_cancel.ptr);
    return TRUE;
  } else {
    return FALSE;
  }

  if (!next_index)
    return FALSE;

  // update current index
  *cmst.set_variable = next_index;

  // read menu data
  MemcpyBanked(&current_menu_item,
               cmst.menu_items.ptr + *cmst.set_variable - 1u,
               sizeof(menu_item_t), cmst.menu_items.bank);
  PLAYER.pos.x = current_menu_item.X;
  PLAYER.pos.y = current_menu_item.Y;
  vm_call_far(THIS, current_menu_screen_state.on_change.bank,
              current_menu_screen_state.on_change.ptr);
  return FALSE;
}
