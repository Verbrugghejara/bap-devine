<script setup lang="ts">

import Phaser from 'phaser';
import { ref, toRaw, onMounted, onUnmounted } from 'vue';
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
    console.log('[App.vue] Scene verandert naar:', scene);
    if (phaserRef.value && phaserRef.value.scene) {
        console.log('Beschikbare scenes:', Object.keys(phaserRef.value.scene.scene.manager.keys));
    }
    if (scene === 'MainMenu') {
        if (phaserRef.value && phaserRef.value.scene) {
            phaserRef.value.scene.scene.start('MainMenu');
        }
        showGameUI.value = false;
        showGameOver.value = false;
        showGameVictory.value = false;
        showCountdown.value = false;
        countdownActive.value = false;
    }
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
    if (!showGameOver.value) {
        console.log('[App.vue] GameOverUI verdwijnt door scene-wissel naar', scene);
    }
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

function onGameOverUI(index: number) {
    console.log('[App.vue] GameOverUI wordt getoond, index:', index);
    gameOverIndex.value = index;
    showGameOver.value = true;
    showGameUI.value = false;
}

function onGameVictoryUI(index: number) {
    gameVictoryIndex.value = index;
    showGameVictory.value = true;
    showGameOver.value = false;
    showGameUI.value = false;
}

function handleRestart() {
    console.log('[App.vue] GameOverUI verdwijnt door restart');
    showGameOver.value = false;
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
    </div>
</template>
