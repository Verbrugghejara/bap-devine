
<script setup lang="ts">

import Phaser from 'phaser';
import { ref, toRaw, onMounted, onUnmounted } from 'vue';
import MainMenu from './game/scenes/MainMenu.vue';
import PhaserGame from './PhaserGame.vue';
import GameUI from './game/ui/GameUI.vue';
import GameOverUI from './game/ui/GameOverUI.vue';
import GameVictoryUI from './game/ui/GameVictoryUI.vue';
import CountDownUI from './game/ui/CountDownUI.vue';
import { EventBus } from './game/EventBus';

const phaserRef = ref();
const showGameUI = ref(false);
const showCountdown = ref(false);
const countdownActive = ref(false);

const showGameOver = ref(false);
const gameOverIndex = ref(0);

const showGameVictory = ref(false);
const gameVictoryIndex = ref(0);
const currentSceneKey = ref<string | null>(null);

// Scene-wissel: alleen Game, GameOver, GameVictory UI tonen
EventBus.on('change-scene', (scene: string) => {
    if (scene === 'GameOver' || scene === 'GameVictory') {
        showGameUI.value = false;
    } else if (scene === 'Game') {
        showCountdown.value = true;
        countdownActive.value = true;
        showGameUI.value = true;
        setTimeout(() => {
            if (phaserRef.value && phaserRef.value.scene) {
                phaserRef.value.scene.scene.pause();
            }
        }, 0);
    }
    showGameOver.value = (scene === 'GameOver');
    showGameVictory.value = (scene === 'GameVictory');
});


const currentScene = (scene: any) => {
    currentSceneKey.value = scene.scene.key;
    showGameUI.value = scene.scene.key === 'Game';
    if (scene.scene.key !== 'GameOver') {
        showGameOver.value = false;
    }
    if (scene.scene.key !== 'GameVictory') {
        showGameVictory.value = false;
    }
}

function handleRestart() {
    showGameOver.value = false;
    // Start de Game scene opnieuw
    if (phaserRef.value && phaserRef.value.scene) {
        phaserRef.value.scene.scene.restart();
    }
    showGameUI.value = true;
    showCountdown.value = true;
    countdownActive.value = true;
    setTimeout(() => {
        if (phaserRef.value && phaserRef.value.scene) {
            phaserRef.value.scene.scene.pause();
        }
    }, 0);
}


// ...existing code...

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

function onGameOverUI(index: number) {
    gameOverIndex.value = index;
    showGameOver.value = true;
    showGameUI.value = false;
}
function onGameVictoryUI(index: number) {
    gameVictoryIndex.value = index;
    showGameVictory.value = true;
    showGameOver.value = false;
    showGameUI.value = false;
    if (phaserRef.value && phaserRef.value.scene) {
        phaserRef.value.scene.scene.remove('MainMenu');
    }
}



onMounted(() => {
    showGameUI.value = false;
    showGameOver.value = false;
    showGameVictory.value = false;
    EventBus.on('gameover-ui', onGameOverUI);
    EventBus.on('gamevictory-ui', onGameVictoryUI);
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
    EventBus.off('gameover-ui', onGameOverUI);
    EventBus.off('gamevictory-ui', onGameVictoryUI);
    EventBus.off('show-countdown');
});
</script>

<template>
    <div style="width:100vw;height:100vh;position:relative;overflow:hidden;">
        <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
        <CountDownUI v-if="showCountdown && currentSceneKey === 'Game'" :start="countdownActive" @done="onCountdownDone" />
        <GameUI v-if="showGameUI && currentSceneKey === 'Game'" />
        <GameOverUI v-if="showGameOver" :sfeerIndex="gameOverIndex" @restart="handleRestart" />
        <GameVictoryUI v-if="showGameVictory" :sfeerIndex="gameVictoryIndex" @restart="handleRestart" />
        <!-- <MainMenu v-if="!showGameUI && !showGameOver && !showGameVictory" /> -->
    </div>
</template>
