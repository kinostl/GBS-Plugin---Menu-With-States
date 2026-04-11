#include <actor.h>
#include <asm/types.h>
#include <bankdata.h>
#include <data/menu_screen_t.h>
#include <game_time.h>
#include <gb/gb.h>
#include <gbs_types.h>
#include <input.h>
#include <math.h>
#include <ui.h>
#include <vm.h>
#pragma bank 255

#include "data/menu_screen_states.h"
#include "states/menu_screen.h"

typedef enum menu_screen_status_e {
  CHOICE_NONE=0,
  CHOICE_CANCELLED = 1,
  CHOICE_CHANGED = 2,
  CHOICE_SELECTED = 3
} menu_screen_status_e;

UWORD menu_state_idx[8];

void setMenuState(SCRIPT_CTX *THIS) BANKED {
  const UWORD menu_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  const UWORD state_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG0) - 1;

  menu_state_idx[state_id] = menu_id;
}

void prepareMenuState(SCRIPT_CTX *THIS) BANKED {
  const UWORD state_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG0) - 1;
  const UWORD menu_id = menu_state_idx[state_id];

  MemcpyBanked(&cmst, ((menu_screen_state_t *)menu_screen_states) + menu_id,
               sizeof(menu_screen_state_t), BANK(menu_screen_states));

  vm_call_far(THIS, cmst.on_init.bank, cmst.on_init.ptr);
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

#ifdef PRESS_AND_HOLD
  static UBYTE move_lock = 0;
  const UBYTE move_unlocked = move_lock >= PLAYER.move_speed;
  if (move_unlocked) {
    move_lock = 0;
  } else if (INPUT_RECENT_UP || INPUT_RECENT_DOWN) {
    move_lock++;
  }

#define INPUT_UP_HELD (INPUT_UP_PRESSED || (move_unlocked && INPUT_RECENT_UP))
#define INPUT_DOWN_HELD                                                        \
  (INPUT_DOWN_PRESSED || (move_unlocked && INPUT_RECENT_DOWN))
#else
#define INPUT_UP_HELD (INPUT_UP_PRESSED)
#define INPUT_DOWN_HELD (INPUT_DOWN_PRESSED)
#endif

  if (INPUT_UP_HELD) {
    *set_variable = current_menu_screen_item.iU;
    *current_menu_screen_status = CHOICE_CHANGED;
  } else if (INPUT_DOWN_HELD) {
    *set_variable = current_menu_screen_item.iD;
    *current_menu_screen_status = CHOICE_CHANGED;
  } else if (INPUT_LEFT_PRESSED) {
    *set_variable = current_menu_screen_item.iL;
    *current_menu_screen_status = CHOICE_CHANGED;
  } else if (INPUT_RIGHT_PRESSED) {
    *set_variable = current_menu_screen_item.iR;
    *current_menu_screen_status = CHOICE_CHANGED;
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

  switch (*current_menu_screen_status) {
  case CHOICE_NONE:
  default:
    return;
  case CHOICE_CHANGED:
    vm_call_far(THIS, cmst.on_change.bank, cmst.on_change.ptr);
    *current_menu_screen_status = CHOICE_NONE;
    return;
  case CHOICE_SELECTED:
    vm_call_far(THIS, cmst.on_select.bank, cmst.on_select.ptr);
    return;
  case CHOICE_CANCELLED:
    vm_call_far(THIS, cmst.on_cancel.bank, cmst.on_cancel.ptr);
    return;
  }
}
