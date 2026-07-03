#ifndef MENU_SCREEN_SCENE_T_H
#define MENU_SCREEN_SCENE_T_H

#include <bankdata.h>
#include <vm.h>

typedef enum menu_options_e {
  UI_MENU_STANDARD = 0,
  UI_MENU_LAST = 1,
  UI_MENU_CANCEL_B = 2,
  UI_MENU_SET_START = 4
} menu_options_e;

typedef struct menu_screen_state_t {
  menu_options_e options;
  WORD set_variable_id;
  UWORD menu_items_count;
  far_ptr_t menu_items;
  far_ptr_t on_init;
  far_ptr_t on_select;
  far_ptr_t on_cancel;
  far_ptr_t on_change;
} menu_screen_state_t;

inline UBYTE clampedMenuIndex(BYTE index, UBYTE length) {
      if (index < 0) {
        return 0;
      }
      if (index > length - 1) {
        return length;
      }
      return index + 1;

}

#endif