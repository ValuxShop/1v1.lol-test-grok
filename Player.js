import { Weapons } from './Weapons.js';

export class Player {
    constructor(scene, position, isAI = false) {
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        scene.add(this.mesh);

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 5; // Matches old 1v1.lol movement speed
        this.jumpHeight = 2;
        this.gravity = -9.8;
        this.onGround = true;
        this.health = 100;
        this.weapons = [new Weapons.AssaultRifle(), new Weapons.Shotgun(), new Weapons.Sniper()];
        this.currentWeapon = 0;
        this.rotation = new THREE.Euler(0, 0, 0);
        this.isAI = isAI;
        this.target = null; // For AI targeting
    }

    createMesh() {
        const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        head.position.y = 1;
        body.add(head);
        return body;
    }

    update(delta, input, builds, otherPlayers) {
        // Movement
        if (!this.isAI) {
            const move = input.getMovement();
            const forward = new THREE.Vector3(0, 0, -move.dz).applyEuler(this.rotation);
            const strafe = new THREE.Vector3(-move.dx, 0, 0).applyEuler(this.rotation);
            this.velocity.x = (forward.x + strafe.x) * this.speed;
            this.velocity.z = (forward.z + strafe.z) * this.speed;

            // Jump
            if (input.isJumping() && this.onGround) {
                this.velocity.y = Math.sqrt(2 * this.jumpHeight * -this.gravity);
                this.onGround = false;
            }

            // Rotation from mouse
            const { dx, dy } = input.resetMouseDelta();
            this.rotation.y -= dx * 0.002; // Horizontal sensitivity
            this.mesh.rotation.y = this.rotation.y;
        } else {
            // AI logic: Move towards target, jump randomly, shoot if close
            if (this.target) {
                const dir = this.target.mesh.position.clone().sub(this.mesh.position).normalize();
                this.velocity.x = dir.x * this.speed;
                this.velocity.z = dir.z * this.speed;
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
                if (Math.random() < 0.1) this.velocity.y = Math.sqrt(2 * this.jumpHeight * -this.gravity); // Random jump
            }
        }

        // Gravity
        this.velocity.y += this.gravity * delta;
        this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

        // Ground collision (simple y=0 floor)
        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.onGround = true;
        }

        // Build collisions (AABB)
        builds.forEach(build => {
            if (this.checkAABBCollision(build.mesh)) {
                // Simple resolve: push back
                const push = this.mesh.position.clone().sub(build.mesh.position).normalize().multiplyScalar(0.1);
                this.mesh.position.add(push);
            }
        });

        // Player-player collision
        otherPlayers.forEach(other => {
            if (this.checkAABBCollision(other.mesh)) {
                const push = this.mesh.position.clone().sub(other.mesh.position).normalize().multiplyScalar(0.1);
                this.mesh.position.add(push);
            }
        });

        // Weapon switch
        if (!this.isAI) {
            const switchIdx = input.getWeaponSwitch();
            if (switchIdx !== -1) this.currentWeapon = switchIdx;
        }

        // Shooting
        const weapon = this.weapons[this.currentWeapon];
        weapon.update(delta);
        if ((this.isAI && this.target && this.mesh.position.distanceTo(this.target.mesh.position) < 20) || (!this.isAI && input.isShooting())) {
            if (weapon.canShoot()) {
                weapon.shoot();
                // Hitscan raycast
                const ray = new THREE.Raycaster(this.mesh.position, new THREE.Vector3(0, 0, -1).applyEuler(this.rotation));
                otherPlayers.forEach(other => {
                    const intersects = ray.intersectObject(other.mesh, true);
                    if (intersects.length > 0) {
                        other.health -= weapon.damage;
                        if (other.health <= 0) console.log('Player defeated'); // Placeholder win condition
                    }
                });
            }
        }
    }

    checkAABBCollision(otherMesh) {
        const thisBox = new THREE.Box3().setFromObject(this.mesh);
        const otherBox = new THREE.Box3().setFromObject(otherMesh);
        return thisBox.intersectsBox(otherBox);
    }
}

// AI subclass
export class AIPlayer extends Player {
    constructor(scene, position) {
        super(scene, position, true);
    }
}
