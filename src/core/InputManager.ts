import { Miner } from '../entities/Miner';
import { GameManager, GameState } from './GameManager';
import { audioManager } from './AudioManager';

export class InputManager {
    private keys: { [key: string]: boolean } = {};
    private player1!: Miner;
    private player2!: Miner;
    private gameManager!: GameManager;
    private onP1Fire?: () => void;
    private onP2Fire?: () => void;
    private onP1Bomb?: () => void;
    private onP2Bomb?: () => void;

    public bindInputs(
        player1: Miner,
        player2: Miner,
        gameManager: GameManager,
        onP1Fire: () => void,
        onP2Fire: () => void,
        onP1Bomb?: () => void,
        onP2Bomb?: () => void
    ) {
        this.player1 = player1;
        this.player2 = player2;
        this.gameManager = gameManager;
        this.onP1Fire = onP1Fire;
        this.onP2Fire = onP2Fire;
        this.onP1Bomb = onP1Bomb;
        this.onP2Bomb = onP2Bomb;

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent) {
        audioManager.init(); // Initialize audio context on first action
        if (this.keys[e.key]) return;
        this.keys[e.key] = true;

        if (this.gameManager.currentState === GameState.PLAYING) {
            // Player 1 hook launch
            if (e.key === 's' || e.key === 'S') {
                if (this.gameManager.hookLockRemaining <= 0 && this.player1.hook.state === 0) { // HookState.SWINGING
                    this.player1.hook.fire();
                    if (this.onP1Fire) this.onP1Fire();
                }
            }
            // Player 1 bomb trigger
            if (e.key === 'w' || e.key === 'W') {
                if (this.gameManager.bombCount > 0 && this.player1.hook.grabbedItem) {
                    this.player1.useBomb();
                    if (this.onP1Bomb) this.onP1Bomb();
                }
            }

            // Player 2 controls (only active in co-op mode)
            if (this.gameManager.playerCount === 2) {
                // Player 2 hook launch
                if (e.key === 'ArrowDown') {
                    if (this.gameManager.hookLockRemaining <= 0 && this.player2.hook.state === 0) { // HookState.SWINGING
                        this.player2.hook.fire();
                        if (this.onP2Fire) this.onP2Fire();
                    }
                }
                // Player 2 bomb trigger
                if (e.key === 'ArrowUp') {
                    if (this.gameManager.bombCount > 0 && this.player2.hook.grabbedItem) {
                        this.player2.useBomb();
                        if (this.onP2Bomb) this.onP2Bomb();
                    }
                }
            }
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.keys[e.key] = false;
    }
}
