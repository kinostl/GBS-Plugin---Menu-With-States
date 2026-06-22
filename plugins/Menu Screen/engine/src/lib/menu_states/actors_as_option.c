#include <actor.h>
#include <asm/types.h>
#include <gbs_types.h>
#include <math.h>
#include <vm.h>
#include "data/game_globals.h"

#pragma bank 255

#include "states/menu_screen.h"

menu_item_t actor_menu_options[MAX_ACTORS];
actor_t * actor_menu_actors[MAX_ACTORS];

void prepareActorMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED {
  UBYTE menu_actors_length = 0;

  const UBYTE collision_mask = *(UBYTE *)VM_REF_TO_PTR(FN_ARG0);

  for (actor_t *actor = actors_active_head; actor; actor = actor->next) {
    if (actor == &PLAYER) {
      continue;
    }

    if (actor->collision_group & collision_mask) {
      actor_menu_actors[menu_actors_length] = actor;

      menu_item_t *menu_actor = &actor_menu_options[menu_actors_length];
      menu_actor->X = SUBPX_TO_TILE(actor->pos.x + actor->bounds.left) - 1;
      menu_actor->Y = SUBPX_TO_TILE(actor->pos.y + actor->bounds.top);

      menu_actors_length++;
    }
  }

  for (UBYTE i = 0; i < menu_actors_length; i++) {
    menu_item_t *menu_actor = &actor_menu_options[i];
    menu_actor->iL = 1;
    menu_actor->iR = menu_actors_length;
    menu_actor->iU = clampedMenuIndex(i - 1, menu_actors_length);
    menu_actor->iD = clampedMenuIndex(i + 1, menu_actors_length);
  }

  cmst.menu_items.bank = 0;
  cmst.menu_items.ptr = actor_menu_options;
  cmst.menu_items_count = menu_actors_length;
}

void runActorMenuScript(SCRIPT_CTX *THIS) BANKED {
  const UWORD set_var = *(UWORD *)VM_REF_TO_PTR(cmst.set_variable_id);
  const WORD lock_var = *(WORD *)VM_REF_TO_PTR(FN_ARG1);
  UWORD *lock = VM_REF_TO_PTR(lock_var);

  actor_t *hit_actor = actor_menu_actors[set_var - 1];

  const UWORD collision_group = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);

  script_execute(hit_actor->script.bank, hit_actor->script.ptr, lock, 1,
                 collision_group);
}

void runActorScript(SCRIPT_CTX *THIS) BANKED {
  const WORD lock_var = *(WORD *)VM_REF_TO_PTR(FN_ARG2);
  const UWORD collision_group = *(UWORD *)VM_REF_TO_PTR(FN_ARG1);
  const UWORD actor_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);

  UWORD *lock = VM_REF_TO_PTR(lock_var);
  actor_t *hit_actor = actors + actor_id;

  script_execute(hit_actor->script.bank, hit_actor->script.ptr, lock, 1,
                 collision_group);
}