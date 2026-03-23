#include <asm/types.h>
#include <bankdata.h>
#include <gb/gb.h>
#include <gbdk/far_ptr.h>
#include <gbdk/platform.h>
#include <vm.h>

#include <gbdk/emu_debug.h>

#pragma bank 255

far_ptr_t dynamic_menu_slots[16];
far_ptr_t dynamic_menu_view_slots[16];

void setScriptMenuSlot(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UWORD slot_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG2);
  UWORD script_bank = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  UWORD script_ptr = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);

  dynamic_menu_slots[slot_idx].bank = script_bank;
  dynamic_menu_slots[slot_idx].ptr = (void *)script_ptr;
}

void setScriptMenuViewSlot(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UWORD slot_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG2);
  UWORD script_bank = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  UWORD script_ptr = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);

  dynamic_menu_view_slots[slot_idx].bank = script_bank;
  dynamic_menu_view_slots[slot_idx].ptr = (void *)script_ptr;
}

void runScriptMenuSlot(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UWORD slot_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  far_ptr_t *slot = dynamic_menu_slots + slot_idx;
  if (slot->bank && slot->ptr) {
    vm_call_far(THIS, slot->bank, slot->ptr);
  }
}

void runScriptMenuViewSlot(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UWORD slot_idx = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  far_ptr_t *slot = dynamic_menu_view_slots + slot_idx;
  if (slot->bank && slot->ptr) {
    vm_call_far(THIS, slot->bank, slot->ptr);
  }
}