<template>
    <div class="gameover-ui">
        <div class="gameover-bg"></div>
        <div class="gameover-content">

            <div class="gameover-title">
                <p>Game Over</p>
            </div>
            <div class="gameover-description">
                <h1>Oei... dat was een gekke landing.</h1>
                <div class="sfeer-progress-outer">
                    <!-- <div style="color:#222;font-size:18px;text-align:center;width:100%">Progress: {{ (sfeerProgress * 100).toFixed(1) }}%</div> -->
                    <div class="sfeer-progress-bar">
                        <div class="sfeer-progress-fill" :style="{ width: (sfeerProgress * 100) + '%' }">
                        </div>
                    </div>
                </div>
                <p>Opnieuw proberen?</p>
                <AnimatedButton :text="'Opnieuw'" @click="restart" />
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import AnimatedButton from './AnimatedButton.vue';
import { sfeerProgress } from '../utils/sfeerProgressStore';
import { EventBus } from '../EventBus';
import { onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['restart']);

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function restart() {
    // Forceer volledige herstart van de Game scene
    console.log('restart het spel op')
    emit('restart');
    EventBus.emit('change-scene', 'Game:restart');
}

onMounted(() => {
    timeoutId = setTimeout(() => {
        console.log('[GameOverUI] Timeout: navigeer naar MainMenu');
        EventBus.emit('change-scene', 'MainMenu');
        
        sfeerProgress.value = 0;
    }, 30000);
});

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId);
});

</script>

<style scoped>
.sfeer-progress-outer {
    /* position: absolute; */
    display: flex;
    align-items: center;
    /* height: 100vh; */
    min-width: 80px;
    justify-content: center;
    pointer-events: none;
}

.sfeer-progress-bar {
    position: relative;
    width: 400px;
    height: 32px;
    background: #ffffff25;
    border-radius: 24px;
    margin-left: 24px;
    margin-right: 32px;
    overflow: hidden;
}

.sfeer-progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: #EFA348;
    border-radius: 24px 0 0 24px;
    z-index: 1;
    border-radius: 25px;
    transition: width 0.6s cubic-bezier(.4, 1.4, .6, 1);
}

.gameover-ui {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.gameover-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background 0.3s;
    opacity: 0;
}

.gameover-title {
    font-size: 2.5em;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 24px;
    background: #F25C54;
    font-family: 'Bungee', Arial, Helvetica, sans-serif;
    box-shadow: 0 6px 0 0 #B5342D;
    display: flex;
    padding: 24px 32px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: -32px;
    z-index: 2;
    /* margin:  auto; */
}

.gameover-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.gameover-description {
    position: relative;
    background: #00000025;
    border: 5px solid #F25C54;
    border-radius: 16px;
    max-width: 700px;
    min-height: 500px;
    padding: 48px 64px;
    /* box-shadow: 0 8px 32px rgba(0,0,0,0.3); */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
    z-index: 1;
}

.gameover-description p {
    font-size: 36px;
    line-height: 1.5;
    font-weight: bold;
    font-family: 'Space Grotesk', sans-serif;
    color: #fff;
    text-align: center;
}


.button {
    position: relative;
}

.button-text {
    position: absolute;
    bottom: 8px;
    color: #FFF;
    font-family: Bungee;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: inline-flex;
    padding: 16px 32px;
    justify-content: center;
    align-items: center;
    gap: 16px;
    border-radius: 24px;
    background: #35BBF0;
    /* box-shadow: 0 8px 0 0 #2F9BC5; */
    margin-top: 46px;
    transition: bottom 0.18s cubic-bezier(.4, 1.6, .6, 1);
}

.button-text.animate {
    bottom: 0;
}

.button-shadow {

    color: #FFF;
    font-family: Bungee;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: inline-flex;
    padding: 16px 32px;
    justify-content: center;
    align-items: center;
    gap: 16px;
    border-radius: 24px;
    background: #2F9BC5;
    /* box-shadow: 0 8px 0 0 #2F9BC5; */
    margin-top: 46px;
}

button {
    /* margin-top: 32px;
    font-size: 1.2em;
    padding: 12px 32px;
    border-radius: 8px; */
    border: none;
    /* background: #0077ff;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s; */
}

p {
    margin: 0;
}

button:hover {
    background: #005fcc;
}
</style>
