#include <vm.h>
#include <bankdata.h>
#include <states/menu_screen.h>
#include <ui.h>
#include <input.h>

#pragma bank 255

BOOLEAN menu_state_lock_textbox_height;
UBYTE menu_state_lock_textbox;

void prepareDynamicMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED
{
    const UWORD count = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
    const UWORD longest = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
    const unsigned char *text = (const unsigned char *)THIS->PC;
    unsigned char *d = ui_text_data;
    for (UBYTE i = 0; i < count; i++)
    {
        *d++ = 3;
        *d++ = 1;
        *d++ = i + 1;
        for (const unsigned char *line = text + (i * longest); *line != '\0'; line++)
        {
            *d++ = *line;
        }
    }
    THIS->PC += count * longest;

    INPUT_RESET;
    text_options = 0;
    text_drawn = text_ff = FALSE;
}