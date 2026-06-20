#include <gbs_types.h>
#include <projectiles.h>
#include "linked_list.h"

#pragma bank 255

extern projectile_t * projectiles_inactive_head;
projectile_t * particles = 0XA000;
projectile_t *_save_active_head;
projectile_t *_save_inactive_head;

void emitter_start(void) OLDCALL BANKED {
    _save_active_head = projectiles_active_head;
    _save_inactive_head = projectiles_inactive_head;

    projectiles_active_head = projectiles_inactive_head = NULL;
    for (projectile_t * proj = particles; proj < (particles + 40); ++proj) {
        LL_PUSH_HEAD(projectiles_inactive_head, proj);
    }
}

void emitter_end(void) OLDCALL BANKED {
    projectiles_active_head = _save_active_head;
    projectiles_inactive_head = _save_inactive_head;
}