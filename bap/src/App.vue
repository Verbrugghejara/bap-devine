
<script setup lang="ts">

import Phaser from 'phaser';
import { ref, toRaw, onMounted, onUnmounted } from 'vue';
import MainMenu from './game/scenes/MainMenu.vue';
import PhaserGame from './PhaserGame.vue';
import GameUI from './game/ui/GameUI.vue';
import GameOverUI from './game/ui/GameOverUI.vue';
import GameVictoryUI from './game/ui/GameVictoryUI.vue';
import CountDownUI from './game/ui/CountDownUI.vue';
import TutorialBlueUIComponent from './game/ui/TutorialBlueUI.vue';
import TutorialRedUI from './game/ui/TutorialRedUI.vue';
import type {Tutorial} from './game/scenes/Tutorial';
// import type {Tutorial} from './game/scenes/Tutorial';
const canMoveSprite = ref(false);
import { EventBus } from './game/EventBus';
// import TutorialRedUI from './game/ui/TutorialRedUI.vue';

const phaserRef = ref();
const showGameUI = ref(false);
const showCountdown = ref(false);
const countdownActive = ref(false);

const showGameOver = ref(false);
const gameOverIndex = ref(0);

const showGameVictory = ref(false);
const gameVictoryIndex = ref(0);
const showTutorialBlueUI = ref(false);
const showTutorialRedUI = ref(false);
const currentSceneKey = ref<string | null>(null);

// Toon juiste tutorial UI op basis van EventBus scene-wissel
EventBus.on('change-scene', (scene: string) => {
    // Toon tutorials alleen als de actieve scene 'Tutorial' is
    if (currentSceneKey.value !== 'Tutorial') {
        showTutorialBlueUI.value = false;
        showTutorialRedUI.value = false;
        // GameUI blijft aan zolang het niet expliciet gameover/victory is
        if (scene === 'GameOver' || scene === 'GameVictory') {
            showGameUI.value = false;
        } else if (scene === 'Game') {
            showCountdown.value = true;
            countdownActive.value = true;
            showGameUI.value = true;
            // Zet game op pauze zodra Game scene actief wordt
            setTimeout(() => {
                if (phaserRef.value && phaserRef.value.scene) {
                    phaserRef.value.scene.scene.pause();
                }
            }, 0);
        }
        showGameOver.value = (scene === 'GameOver');
        showGameVictory.value = (scene === 'GameVictory');
        return;
    }
    if (scene === 'TutorialBlueUI') {
        showTutorialBlueUI.value = true;
        showTutorialRedUI.value = false;
        showGameUI.value = false;
        showGameOver.value = false;
        showGameVictory.value = false;
    } else if (scene === 'TutorialRedUI') {
        showTutorialBlueUI.value = false;
        showTutorialRedUI.value = true;
        showGameUI.value = false;
        showGameOver.value = false;
        showGameVictory.value = false;
    } else {
        showTutorialBlueUI.value = false;
        showTutorialRedUI.value = false;
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
    }
});


const currentScene = (scene: MainMenu) => {
    currentSceneKey.value = scene.scene.key;
    showGameUI.value = scene.scene.key === 'Game';
    // Toon tutorials alleen als de actieve scene 'Tutorial' is
    if (scene.scene.key === 'Tutorial') {
        if (!showTutorialBlueUI.value && !showTutorialRedUI.value) {
            showTutorialBlueUI.value = true;
            showTutorialRedUI.value = false;
        }
    } else {
        showTutorialBlueUI.value = false;
        showTutorialRedUI.value = false;
    }
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
    // Toon geen tutorial bij start, alleen als scene 'Tutorial' is
    showTutorialBlueUI.value = false;
    showTutorialRedUI.value = false;
    showGameUI.value = false;
    showGameOver.value = false;
    showGameVictory.value = false;
    EventBus.on('gameover-ui', onGameOverUI);
    EventBus.on('gamevictory-ui', onGameVictoryUI);
});


onUnmounted(() => {
    EventBus.off('gameover-ui', onGameOverUI);
    EventBus.off('gamevictory-ui', onGameVictoryUI);
});
</script>

<template>
    <div style="width:100vw;height:100vh;position:relative;overflow:hidden;">
        <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
        <CountDownUI v-if="showCountdown && currentSceneKey === 'Game'" :start="countdownActive" @done="onCountdownDone" />
        <GameUI v-if="showGameUI && currentSceneKey === 'Game'" />
        <GameOverUI v-if="showGameOver" :sfeerIndex="gameOverIndex" @restart="handleRestart" />
        <GameVictoryUI v-if="showGameVictory" :sfeerIndex="gameVictoryIndex" @restart="handleRestart" />
        <MainMenu v-if="!showGameUI && !showGameOver && !showGameVictory && !showTutorialBlueUI && !showTutorialRedUI" />
        <TutorialBlueUIComponent v-if="showTutorialBlueUI" />
        <TutorialRedUI v-if="showTutorialRedUI" />
    </div>
</template>
