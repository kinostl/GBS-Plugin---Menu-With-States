#include <actor.h>
#include <asm/types.h>
#include <bankdata.h>
#include <data/menu_screen_t.h>
#include <gb/gb.h>
#include <gb/hardware.h>
#include <gbs_types.h>
#include <input.h>
#include <math.h>
#include <scroll.h>
#include <string.h>
#include <ui.h>
#include <vm.h>
#pragma bank 255

#include "data/menu_screen_states.h"
#include "states/menu_screen.h"

menu_screen_state_t cmst;
typedef enum menu_screen_status_e {
  CHOICE_NONE=0,
  CHOICE_CANCELLED = 1,
  CHOICE_CHANGED = 2,
  CHOICE_SELECTED = 3
} menu_screen_status_e;

UWORD menu_state_idx[8];

void menu_screen_init(void) BANKED {}
void menu_screen_update(void) BANKED {}

void setMenuState(SCRIPT_CTX *THIS) BANKED {
  const UWORD menu_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG0) - 1;
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

void continueMenuState(SCRIPT_CTX *THIS) BANKED {
  const WORD menu_status_id = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  menu_screen_status_e *current_menu_screen_status =
      (menu_screen_status_e *)VM_REF_TO_PTR(menu_status_id);

#define oneWayJump(dest)                                                       \
  THIS->stack_ptr = THIS->base_addr;                                           \
  THIS->bank = dest.bank;                                                      \
  THIS->PC = dest.ptr

  switch (*current_menu_screen_status) {
  case CHOICE_NONE:
  default:
    return;
  case CHOICE_CHANGED:
    vm_call_far(THIS, cmst.on_change.bank, cmst.on_change.ptr);
    *current_menu_screen_status = CHOICE_NONE;
    return;
  case CHOICE_SELECTED:
    oneWayJump(cmst.on_select);
    return;
  case CHOICE_CANCELLED:
    oneWayJump(cmst.on_cancel);
    return;
  }
#undef oneWayJump
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

void clearTextArea(SCRIPT_CTX *THIS) BANKED {
  const WORD textAreaLength = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  const WORD textAreaTile = *(WORD *)VM_REF_TO_PTR(FN_ARG1);
  memset(ui_text_data, 0, textAreaLength*16);
  set_bkg_data(textAreaTile, textAreaLength, ui_text_data);
}

void drawTextArea(SCRIPT_CTX *THIS) BANKED {
  const WORD textAreaTile = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  ui_set_start_tile(textAreaTile, 0);

  THIS;

  INPUT_RESET;
  text_options = 0;
  text_drawn = text_ff = FALSE;
  
}

void fixTextArea(SCRIPT_CTX *THIS) BANKED {
  ui_set_start_tile(TEXT_BUFFER_START, 0);
}