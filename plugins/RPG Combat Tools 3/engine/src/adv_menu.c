#include <asm/types.h>
#include <bankdata.h>
#include <gb/gb.h>
#include <gbdk/far_ptr.h>
#include <gbdk/platform.h>
#include <string.h>
#include <vm.h>

#include <gbdk/emu_debug.h>

#pragma bank 255

UBYTE in_script_menu;
UBYTE script_menu_depth;
far_ptr_t main_menu_ptr;

void catchMainMenu(SCRIPT_CTX * THIS) OLDCALL BANKED {
  main_menu_ptr.bank = THIS->bank;
  main_menu_ptr.ptr = THIS->PC;
}

void goToMainMenu(SCRIPT_CTX * THIS) OLDCALL BANKED {
  THIS->bank = main_menu_ptr.bank;
  THIS->PC = main_menu_ptr.ptr;
  THIS->stack_ptr = THIS->base_addr;
}