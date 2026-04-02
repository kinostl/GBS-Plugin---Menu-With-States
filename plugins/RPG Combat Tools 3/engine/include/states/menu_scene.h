#ifndef MENU_SCREEN_SCENE_H
#define MENU_SCREEN_SCENE_H

#include <bankdata.h>
typedef struct menu_screen_scene_t {
  UWORD set_variable;
  far_ptr_t menu_items;
  far_ptr_t on_start;
  far_ptr_t on_select;
  far_ptr_t on_cancel;
} menu_screen_scene_t;

#endif