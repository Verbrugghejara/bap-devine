<script setup lang="ts">

import PauseUI from './game/ui/PauseUI.vue';
import CountDownUI from './game/ui/CountDownUI.vue';
import InterludeUI from './game/ui/InterludeUI.vue';
const showPauseUI = ref(false);

import { ref, onMounted, onUnmounted } from 'vue';

import PhaserGame from './PhaserGame.vue';
import GameUI from './game/ui/GameUI.vue';
import { EventBus } from './game/EventBus';

const phaserRef = ref();
const showGameUI = ref(false);
const showCountdown = ref(false);
const countdownActive = ref(false);

const GAME_DESIGN_WIDTH = 1080;
const GAME_DESIGN_HEIGHT = 1920;
const gameScale = ref(1);

const currentSceneKey = ref<string | null>(null);

// Scene-wissel: alleen Game, GameOver, GameVictory UI tonen
EventBus.on('change-scene', (scene: string) => {
        showPauseUI.value = false;
    if (phaserRef.value && phaserRef.value.scene) {
    }
    if (scene === 'MainMenu') {
        if (phaserRef.value && phaserRef.value.scene) {
            phaserRef.value.scene.scene.start('MainMenu');
        }
        showGameUI.value = false;
        showCountdown.value = false;
        countdownActive.value = false;
    }
    if (scene === 'Game') {
        showCountdown.value = true;
        countdownActive.value = true;
        showGameUI.value = true;
        setTimeout(() => {
            if (phaserRef.value && phaserRef.value.scene) {
                phaserRef.value.scene.scene.pause();
            }
        }, 0);
    }
});


const currentScene = (scene: any) => {
    currentSceneKey.value = scene.scene.key;
    showGameUI.value = scene.scene.key === 'Game';
}

function updateGameScale() {
    gameScale.value = Math.min(
        window.innerWidth / GAME_DESIGN_WIDTH,
        window.innerHeight / GAME_DESIGN_HEIGHT
    );
}

function onCountdownDone() {
    // Forceer reset van countdownActive zodat de countdown altijd opnieuw start
    countdownActive.value = false;
    showCountdown.value = false;
    setTimeout(() => {
        if (phaserRef.value && phaserRef.value.scene) {
            phaserRef.value.scene.scene.resume();
        }
    }, 0);
}

onMounted(() => {
    updateGameScale();
    window.addEventListener('resize', updateGameScale);

    EventBus.on('show-pauseui', () => {
        showPauseUI.value = true;
    });
    EventBus.on('hide-pauseui', () => {
        showPauseUI.value = false;
    });
    showGameUI.value = false;
    EventBus.on('show-countdown', () => {
        showCountdown.value = true;
        countdownActive.value = true;
        setTimeout(() => {
            if (phaserRef.value && phaserRef.value.scene) {
                phaserRef.value.scene.scene.pause();
            }
        }, 0);
    });
});

onUnmounted(() => {
    window.removeEventListener('resize', updateGameScale);
    EventBus.off('show-pauseui');
    EventBus.off('hide-pauseui');
    EventBus.off('show-countdown');
});
</script>

<template>
    <div class="app-shell">
        <!-- Preload pauseAlien image -->
        <img src="/assets/pauseAlien.png" alt="" style="display:none;" />
        <div class="game-wrapper">
            <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
            <GameUI
                v-if="showGameUI && currentSceneKey === 'Game'"
                :style="{ '--game-scale': gameScale.toString() }"
            />
        </div>
        <CountDownUI v-if="showCountdown && currentSceneKey === 'Game'" :start="countdownActive" @done="onCountdownDone" />
        <InterludeUI v-if="currentSceneKey === 'Game'" />
        <PauseUI v-if="showPauseUI && currentSceneKey === 'Game'" />
    </div>
</template>

<style scoped>
.app-shell {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

.game-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
