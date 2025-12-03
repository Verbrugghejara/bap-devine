<script setup lang="ts">

import PauseUI from './game/ui/PauseUI.vue';
import CountDownUI from './game/ui/CountDownUI.vue';
const showPauseUI = ref(false);

import Phaser from 'phaser';
import { ref, toRaw, onMounted, onUnmounted } from 'vue';

import PhaserGame from './PhaserGame.vue';
import GameUI from './game/ui/GameUI.vue';
import { EventBus } from './game/EventBus';

const phaserRef = ref();
const showGameUI = ref(false);
const showCountdown = ref(false);
const countdownActive = ref(false);

const currentSceneKey = ref<string | null>(null);

// Scene-wissel: alleen Game, GameOver, GameVictory UI tonen
EventBus.on('change-scene', (scene: string) => {
        showPauseUI.value = false;
    console.log('[App.vue] Scene verandert naar:', scene);
    if (phaserRef.value && phaserRef.value.scene) {
        console.log('Beschikbare scenes:', Object.keys(phaserRef.value.scene.scene.manager.keys));
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

function handleRestart() {
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
    EventBus.off('show-pauseui');
    EventBus.off('hide-pauseui');
    EventBus.off('show-countdown');
});
</script>

<template>
    <div style="width:100vw;height:100vh;position:relative;overflow:hidden;">
        <!-- Preload pauseAlien image -->
        <img src="/assets/pauseAlien.png" alt="" style="display:none;" />
        <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
        <CountDownUI v-if="showCountdown && currentSceneKey === 'Game'" :start="countdownActive" @done="onCountdownDone" />
        <GameUI v-if="showGameUI && currentSceneKey === 'Game'" />
        <PauseUI v-if="showPauseUI && currentSceneKey === 'Game'" />

    </div>
</template>
