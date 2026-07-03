#include <actor.h>
#include <asm/types.h>
#include <gbs_types.h>
#include <math.h>
#include <vm.h>
#include "data/game_globals.h"
#include <macro.h>

#pragma bank 255

#include "states/menu_screen.h"

menu_item_t actor_menu_options[MAX_ACTORS];
actor_t * actor_menu_actors[MAX_ACTORS];

void prepareActorMenuState(SCRIPT_CTX *THIS) OLDCALL BANKED
{
  const UWORD menu_actors_length = *(UWORD *)VM_REF_TO_PTR(FN_ARG0);
  UWORD active_actor_count = menu_actors_length;
  menu_item_t *actor_menu_option = actor_menu_options;
  actor_t **actor_menu_actor = actor_menu_actors;

  for (UBYTE i = 0; i < menu_actors_length; i++)
  {
    const UWORD actor_id = *(UWORD *)VM_REF_TO_PTR(FN_ARG1 - i);
    *actor_menu_actor = &actors[actor_id];
    if(CHK_FLAG((*actor_menu_actor)->flags, ACTOR_FLAG_DISABLED)){
      active_actor_count--;
      continue;
    }
    actor_menu_option->X = SUBPX_TO_TILE((*actor_menu_actor)->pos.x + (*actor_menu_actor)->bounds.left) - 1;
    actor_menu_option->Y = SUBPX_TO_TILE((*actor_menu_actor)->pos.y + (*actor_menu_actor)->bounds.top);
    actor_menu_option++;
    actor_menu_actor++;
  }

  actor_menu_option = actor_menu_options;
  actor_menu_actor = actor_menu_actors;

  for (UBYTE i = 0; i < active_actor_count; i++){
    actor_menu_option->iL = 1;
    actor_menu_option->iR = active_actor_count;
    actor_menu_option->iU = clampedMenuIndex(i - 1, active_actor_count);
    actor_menu_option->iD = clampedMenuIndex(i + 1, active_actor_count);

    actor_menu_option++;
    actor_menu_actor++;
  }

  cmst.menu_items.bank = 0;
  cmst.menu_items.ptr = actor_menu_options;
  cmst.menu_items_count = active_actor_count;
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