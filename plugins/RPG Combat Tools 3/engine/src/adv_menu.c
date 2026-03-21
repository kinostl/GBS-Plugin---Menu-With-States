#include <asm/types.h>
#include <bankdata.h>
#include <gb/gb.h>
#include <gbdk/far_ptr.h>
#include <gbdk/platform.h>
#include <vm.h>

#include "data/menu_states.h"
#include "data/menu_display_states.h"
#include <gbdk/emu_debug.h>

#pragma bank 255

UWORD dynamic_menu_slots[16];

void updateDynamicSlot(SCRIPT_CTX *THIS) OLDCALL BANKED {
  const UWORD idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  const UWORD script_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  dynamic_menu_slots[idx] = script_idx;
}

void runActionViewScript(SCRIPT_CTX *THIS) OLDCALL BANKED {
  const UWORD idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  const UWORD script_idx = dynamic_menu_slots[idx];

  far_ptr_t menu_display_action;
  ReadBankedFarPtr(&menu_display_action, (void *)&menu_display_states[script_idx],
                   BANK(menu_display_states));
  vm_call_far(THIS, menu_display_action.bank, menu_display_action.ptr);
}

#define runStateScript(THIS, script_idx)                                       \
  far_ptr_t menu_action;                                                       \
  ReadBankedFarPtr(&menu_action, (void *)&menu_states[script_idx],             \
                   BANK(menu_states));                                         \
  script_execute(menu_action.bank, menu_action.ptr, 0, 0);                     \
  script_terminate(THIS->ID);

void runDynamicMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED {
  const UWORD script_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  runStateScript(THIS, script_idx);
}

void runDynamicMenuChoice(SCRIPT_CTX *THIS) OLDCALL BANKED {
  const UWORD idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  const UWORD script_idx = dynamic_menu_slots[idx];
  runStateScript(THIS, script_idx);
}