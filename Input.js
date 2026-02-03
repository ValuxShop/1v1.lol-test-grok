export class InputManager {
    constructor(canvas) {
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        this.canvas = canvas;

        // Bind events
        document.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        canvas.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === canvas) {
                this.mouse.x += e.movementX;
                this.mouse.y += e.movementY;
            }
        });
        canvas.addEventListener('mousedown', () => this.mouse.down = true);
        canvas.addEventListener('mouseup', () => this.mouse.down = false);

        // Request pointer lock on click
        canvas.addEventListener('click', () => canvas.requestPointerLock());
    }

    // Get movement vector (WASD)
    getMovement() {
        let dx = 0, dz = 0;
        if (this.keys['w']) dz -= 1;
        if (this.keys['s']) dz += 1;
        if (this.keys['a']) dx -= 1;
        if (this.keys['d']) dx += 1;
        return { dx, dz };
    }

    // Check jump
    isJumping() {
        return this.keys[' '];
    }

    // Check shooting
    isShooting() {
        return this.mouse.down;
    }

    // Get weapon switch (1-3)
    getWeaponSwitch() {
        if (this.keys['1']) return 0;
        if (this.keys['2']) return 1;
        if (this.keys['3']) return 2;
        return -1;
    }

    // Build mode (Q)
    isBuilding() {
        return this.keys['q'];
    }

    // Reset mouse delta after use
    resetMouseDelta() {
        const dx = this.mouse.x, dy = this.mouse.y;
        this.mouse.x = 0;
        this.mouse.y = 0;
        return { dx, dy };
    }
}
