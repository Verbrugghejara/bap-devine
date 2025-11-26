
<script setup lang="ts">

import Phaser from 'phaser';
import { ref, toRaw, onMounted, onUnmounted } from 'vue';
import type { MainMenu } from './game/scenes/MainMenu';
import PhaserGame from './PhaserGame.vue';
import GameUI from './game/ui/GameUI.vue';
import GameOverUI from './game/ui/GameOverUI.vue';
import GameVictoryUI from './game/ui/GameVictoryUI.vue';
import TutorialUI from './game/ui/TutorialUI.vue';
// import MainMenu from './game/scenes/MainMenu.vue';
import type {Tutorial} from './game/scenes/Tutorial';
// import type {Tutorial} from './game/scenes/Tutorial';
const canMoveSprite = ref(false);
import { EventBus } from './game/EventBus';

const phaserRef = ref();
const showGameUI = ref(false);

const showGameOver = ref(false);
const gameOverIndex = ref(0);

const showGameVictory = ref(false);
const gameVictoryIndex = ref(0);
const showTutorialUI = ref(false);

const currentScene = (scene: MainMenu) => {
    showGameUI.value = scene.scene.key === 'Game';
    showTutorialUI.value = scene.scene.key === 'Tutorial';
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
        <GameUI v-if="showGameUI" />
        <GameOverUI v-if="showGameOver" :sfeerIndex="gameOverIndex" @restart="handleRestart" />
        <GameVictoryUI v-if="showGameVictory" :sfeerIndex="gameVictoryIndex" @restart="handleRestart" />
        <MainMenu v-if="!showGameUI && !showGameOver && !showGameVictory && !showTutorialUI" />
        <TutorialUI v-if="showTutorialUI" />
    </div>
</template>
