#include <input.h>
#include <string.h>
#include <ui.h>
#include <vm.h>

#pragma bank 255

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
  THIS;
}