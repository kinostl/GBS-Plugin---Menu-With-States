#include <actor.h>
#include <asm/types.h>
#include <data_manager.h>
#include <gbs_types.h>
#include <math.h>
#include <ui.h>
#include <vm.h>

#pragma bank 255

menu_item_t actor_menu_options[MAX_ACTORS];
UBYTE actor_menu_actors[MAX_ACTORS];

inline UBYTE clampedMenuIndex(BYTE index, UBYTE length) {
      if (index < 0) {
        return 0;
      }
      if (index > length - 1) {
        return 0;
      }
      return index + 1;

}

void runActorMenu(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UBYTE menu_actors_length = 0;
  UBYTE actor_id = 0;
  for (actor_t *actor = actors_active_tail; actor; actor = actor->prev) {
    actor_id++;
  }
  const UBYTE collision_mask = *(UBYTE *)VM_REF_TO_PTR(FN_ARG1);
  const WORD variable_idx = *(WORD *)VM_REF_TO_PTR(FN_ARG0);
  WORD *variable = VM_REF_TO_PTR(variable_idx);
  *variable = 0;
  for (actor_t *actor = actors_active_tail; actor; actor = actor->prev) {
    if (actor->collision_group & collision_mask) {
      actor_menu_actors[menu_actors_length] = actor_id;
      menu_item_t *menu_actor = &actor_menu_options[menu_actors_length];
      menu_actor->X = SUBPX_TO_TILE(actor->pos.x + actor->bounds.left) - 1;
      menu_actor->Y = SUBPX_TO_TILE(actor->pos.y + actor->bounds.top);
      menu_actors_length++;
    }
    actor_id--;
  }

  for (UBYTE i = 0; i < menu_actors_length; i++) {
    menu_item_t *menu_actor = &actor_menu_options[i];
    menu_actor->iL = 1;
    menu_actor->iR = menu_actors_length;
    menu_actor->iU = clampedMenuIndex(i - 1, menu_actors_length);
    menu_actor->iD = clampedMenuIndex(i + 1, menu_actors_length);
  }

  const UBYTE choice = ui_run_menu(actor_menu_options, 0, 0, menu_actors_length, 1);
  if (choice) {
    *variable = actor_menu_actors[choice-1];
  }
}