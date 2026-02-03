import { InputManager } from './Input.js';
import { Player, AIPlayer } from './Player.js';
import { BuildSystem } from './BuildSystem.js';
import { UI } from './UI.js';

const container = document.getElementById('game-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

// Arena: Flat ground
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0x333333 }));
ground.rotation.x = -Math.PI / 2;
ground.name = 'ground';
scene.add(ground);

// Players
const player = new Player(scene, new THREE.Vector3(0, 0, 0));
const ai = new AIPlayer(scene, new THREE.Vector3(20, 0, 20));
ai.target = player;
const players = [player, ai];
const otherPlayers = (p) => players.filter(op => op !== p);

// Input
const input = new InputManager(renderer.domElement);

// Build
const buildSystem = new BuildSystem(scene, player);

// UI
const ui = new UI(player);

// Game state
let gameStarted = false;
ui.playButton.addEventListener('click', () => { gameStarted = true; });

// Loop
let lastTime = 0;
function animate(time) {
    requestAnimationFrame(animate);
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (gameStarted) {
        // Update players
        players.forEach(p => p.update(delta, p.isAI ? null : input, buildSystem.getBuilds(), otherPlayers(p)));

        // Build update
        buildSystem.update(input, camera);

        // Camera third-person
        const offset = new THREE.Vector3(0, 5, 10).applyEuler(player.rotation);
        camera.position.copy(player.mesh.position).add(offset);
        camera.lookAt(player.mesh.position);

        // UI update
        ui.update();
    }

    renderer.render(scene, camera);
}
animate(0);

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
