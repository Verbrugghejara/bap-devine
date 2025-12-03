<template>
    <div class="pause-ui">
        <div class="pause-bg"></div>
        <div class="pause-content">

            <div class="pause-title">
                <p>Pauze</p>
            </div>
            <div class="pause-description">
                <img src="/assets/pauseAlien.png" alt="Pause Image">
                
                <p>Verder spelen?</p>
                <AnimatedButton :text="'Speel verder'" @click="resumeGame" />
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
function resumeGame() {
    EventBus.emit('hide-pauseui');
    EventBus.emit('resume-game-scene');
}
import AnimatedButton from './AnimatedButton.vue';
import { sfeerProgress } from '../utils/sfeerProgressStore';
import { EventBus } from '../EventBus';
import { onMounted, onUnmounted } from 'vue';

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

.pause-ui {
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

.pause-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background 0.3s;
    opacity: 0;
}

.pause-title {
    font-size: 64px;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 24px;
    color: #FFF;
    background: #35BBF0;
    font-family: 'Bungee', Arial, Helvetica, sans-serif;
    /* box-shadow: 0 6px 0 0 #B5342D; */
    display: flex;
    padding: 32px 64px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: -84px;
    z-index: 2;
    /* margin:  auto; */
}

.pause-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.pause-description {
    position: relative;
    background: #00000025;
    border: 32px solid #35BBF0;
    border-radius: 24px;
    width: 700px;
    height: 1100px;
    padding: 48px 64px;
    /* box-shadow: 0 8px 32px rgba(0,0,0,0.3); */
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-around; */
    z-index: 1;
}

.pause-description p {
    font-size: 36px;
    margin-top: 15%;
    line-height: 1.5;
    font-weight: bold;
    font-family: 'Space Grotesk', sans-serif;
    color: #fff;
    text-align: center;
}
.pause-description img {
    margin-top: 64px;
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
