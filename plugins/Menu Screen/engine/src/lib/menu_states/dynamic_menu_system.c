#include <vm.h>
#include <vm_ui.h>
#include <bankdata.h>
#include <states/menu_screen.h>
#include <ui.h>
#include <input.h>

#pragma bank 255

WORD dynamic_menu_options[8];
menu_item_t dynamic_menu_items[8];

UBYTE menu_state_lock_textbox_height;
BOOLEAN menu_state_lock_textbox;

void prepareDynamicMenuStateOptions(SCRIPT_CTX *THIS) OLDCALL BANKED
{
    const UWORD count = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
    WORD *dynamic_menu_option = dynamic_menu_options;
    UBYTE option_count = 0;

    for (UBYTE i = 0; i < count; i++)
    {
        const WORD slot = *(WORD *)VM_REF_TO_PTR(FN_ARG1 - i);
        if (slot == 0)
        {
            continue;
        }
        *dynamic_menu_option++ = slot;
        option_count++;
    }

    for (BYTE i = 0; i < option_count; i++)
    {
        dynamic_menu_items[i].X = 1;
        dynamic_menu_items[i].Y = (15u - (menu_state_lock_textbox ? menu_state_lock_textbox_height : (option_count))) + i + 2;
        dynamic_menu_items[i].iU = clampedMenuIndex(i - 1, option_count);
        dynamic_menu_items[i].iD = clampedMenuIndex(i + 1, option_count);
        dynamic_menu_items[i].iL = 0;
        dynamic_menu_items[i].iR = option_count;
    }

    cmst.menu_items.bank = 0;
    cmst.menu_items.ptr = dynamic_menu_items;

    cmst.menu_items_count = option_count;

    if (menu_state_lock_textbox)
    {
        vm_overlay_clear(THIS, 0, 0, 20u, menu_state_lock_textbox_height + 2, TRUE, UI_DRAW_FRAME);
        vm_overlay_setpos(THIS, 0, 16-menu_state_lock_textbox_height);
    }
    else
    {
        vm_overlay_clear(THIS, 0, 0, 20, option_count + 2, TRUE, UI_DRAW_FRAME);
        vm_overlay_setpos(THIS, 0, 18);
    }
}

void prepareDynamicMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED
{
    const UWORD count = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
    const UWORD longest = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);

    const unsigned char *text = (const unsigned char *)THIS->PC;
    unsigned char *d = ui_text_data;

    // Set speed to instant
    *d++ = 1;
    *d++ = 1;


    for (UBYTE i = 0; i < cmst.menu_items_count; i++)
    {
        const WORD slot = dynamic_menu_options[i];

        // Set X/Y of text
        *d++ = 3;
        *d++ = 3;
        *d++ = i + 2;
        MemcpyBanked(d, text + ((slot - 1) * longest), (sizeof(const unsigned char) * longest), THIS->bank);
        d += longest - 1;
    }
    if (!menu_state_lock_textbox)
    {
        vm_overlay_move_to(THIS, 0, 16u - cmst.menu_items_count, UI_IN_SPEED);
    }

    THIS->PC += count * longest;
}

void finishDynamicMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED
{
    const WORD variable = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
    WORD *choice = (WORD *)VM_REF_TO_PTR(variable);
    *choice = dynamic_menu_options[*choice-1];

    if (menu_state_lock_textbox)
    {
        vm_overlay_clear(THIS, 0, 0, 20, menu_state_lock_textbox_height+2, TRUE, UI_DRAW_FRAME);
    }
    else
    {
        vm_overlay_move_to(THIS, 0, 18u, UI_OUT_SPEED);
    }
}

void cancelDynamicMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED
{
    if (menu_state_lock_textbox)
    {
        vm_overlay_clear(THIS, 0, 0, 20, menu_state_lock_textbox_height+2, TRUE, UI_DRAW_FRAME);
    }
    else
    {
        vm_overlay_move_to(THIS, 0, 18u, UI_OUT_SPEED);
    }
}