export class UI {
    constructor(player) {
        this.player = player;
        this.healthBar = document.getElementById('health-bar');
        this.ammoCount = document.getElementById('ammo-count');
        this.weaponSlots = document.querySelectorAll('#weapon-slots .slot');
        this.menu = document.getElementById('menu');
        this.hud = document.getElementById('hud');
        this.playButton = document.getElementById('play-button');

        // Play button starts game
        this.playButton.addEventListener('click', () => {
            this.menu.style.display = 'none';
            this.hud.style.display = 'flex';
            // Trigger game start in Game.js
        });
    }

    update() {
        this.healthBar.value = this.player.health;
        const weapon = this.player.weapons[this.player.currentWeapon];
        this.ammoCount.textContent = `Ammo: ${weapon.ammo}/${weapon.maxAmmo}`;
        this.weaponSlots.forEach((slot, idx) => {
            slot.classList.toggle('active', idx === this.player.currentWeapon);
        });
    }
}
