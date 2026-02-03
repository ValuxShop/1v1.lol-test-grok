export const Weapons = {
    AssaultRifle: class {
        constructor() {
            this.ammo = 30;
            this.maxAmmo = 30;
            this.damage = 10;
            this.fireRate = 0.1; // Seconds between shots
            this.reloadTime = 1.5;
            this.lastShot = 0;
            this.reloading = false;
        }

        canShoot() {
            return this.ammo > 0 && !this.reloading && Date.now() - this.lastShot > this.fireRate * 1000;
        }

        shoot() {
            this.ammo--;
            this.lastShot = Date.now();
            if (this.ammo === 0) this.reload();
        }

        reload() {
            this.reloading = true;
            setTimeout(() => {
                this.ammo = this.maxAmmo;
                this.reloading = false;
            }, this.reloadTime * 1000);
        }

        update() {
            // UI update in Game.js
        }
    },

    Shotgun: class {
        constructor() {
            this.ammo = 5;
            this.maxAmmo = 5;
            this.damage = 30; // Per shot, but hitscan single for simplicity
            this.fireRate = 0.8;
            this.reloadTime = 2;
            this.lastShot = 0;
            this.reloading = false;
        }
        // Similar methods as above...
        canShoot() { /* ... */ }
        shoot() { /* ... */ }
        reload() { /* ... */ }
        update() { /* ... */ }
    },

    Sniper: class {
        constructor() {
            this.ammo = 1;
            this.maxAmmo = 1;
            this.damage = 50;
            this.fireRate = 1.5;
            this.reloadTime = 2.5;
            this.lastShot = 0;
            this.reloading = false;
        }
        // Similar methods...
    }
};
