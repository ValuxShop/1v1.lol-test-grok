export class BuildSystem {
    constructor(scene, player, gridSize = 5) {
        this.scene = scene;
        this.player = player;
        this.gridSize = gridSize;
        this.builds = [];
        this.previewMesh = null; // For build preview
    }

    update(input, camera) {
        if (input.isBuilding()) {
            // Raycast from camera for placement position
            const ray = new THREE.Raycaster();
            ray.setFromCamera(new THREE.Vector2(0, 0), camera); // Center screen
            const intersects = ray.intersectObjects([this.getGround()]); // Assume ground is a plane
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const snapped = this.snapToGrid(point);

                // Update preview
                if (!this.previewMesh) {
                    this.previewMesh = this.createBuildMesh('wall');
                    this.scene.add(this.previewMesh);
                }
                this.previewMesh.position.copy(snapped);

                // Place on key (e.g., 'f' for wall)
                if (input.keys['f']) {
                    const build = this.createBuildMesh('wall');
                    build.position.copy(snapped);
                    this.scene.add(build);
                    this.builds.push({ mesh: build, type: 'wall' });
                    // Fast placement: no cooldown for old feel
                }
                // Similarly for 'g' ramp, 'h' floor...
            }
        } else if (this.previewMesh) {
            this.scene.remove(this.previewMesh);
            this.previewMesh = null;
        }

        // Limit builds for perf
        if (this.builds.length > 100) {
            const old = this.builds.shift();
            this.scene.remove(old.mesh);
        }
    }

    snapToGrid(point) {
        return new THREE.Vector3(
            Math.round(point.x / this.gridSize) * this.gridSize,
            0,
            Math.round(point.z / this.gridSize) * this.gridSize
        );
    }

    createBuildMesh(type) {
        let geo;
        if (type === 'wall') geo = new THREE.BoxGeometry(5, 5, 0.5);
        else if (type === 'ramp') geo = new THREE.BoxGeometry(5, 5, 5).applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 4));
        else geo = new THREE.PlaneGeometry(5, 5);
        return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xaaaaaa }));
    }

    getGround() {
        // Return arena ground mesh from Game.js
        return this.scene.getObjectByName('ground');
    }

    getBuilds() {
        return this.builds;
    }
}
