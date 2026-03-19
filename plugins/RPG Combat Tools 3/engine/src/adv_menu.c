#include <asm/types.h>
#include <bankdata.h>
#include <gbdk/far_ptr.h>
#include <gbdk/platform.h>
#include <vm.h>

#include "data/menu_display_actions.h"

#pragma bank 255

void updateDynamicSlot(SCRIPT_CTX * THIS) OLDCALL BANKED {}

void runActionViewScript(SCRIPT_CTX *THIS) OLDCALL BANKED {
  const UWORD idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  far_ptr_t menu_display_action;
  ReadBankedFarPtr(&menu_display_action, (void *)&menu_display_actions[idx],
                   BANK(menu_display_actions));
  vm_call_far(THIS, menu_display_action.bank, menu_display_action.ptr);
}