<template>
    <div class="gamevictory-ui">
        <div class="gamevictory-bg" :style="{ background: sfeerBg }"></div>
        <div class="gamevictory-content">

            <div class="gamevictory-title">
                <p>Goed zo!</p>
            </div>
            <div class="gamevictory-description">
                <p>Yes! De alien is veilig thuis in zijn ruimteschip! Wat een topteam!</p>

                <p>Opnieuw proberen?</p>
                <AnimatedButton :text="'Opnieuw'" @click="restart" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import AnimatedButton from './AnimatedButton.vue';
import { EventBus } from '../EventBus';
import { defineEmits, computed, onMounted, onUnmounted } from 'vue';
const emit = defineEmits(['restart']);
const props = defineProps<{ sfeerIndex: number }>();

import { SFEER_LABELS } from '../utils/sfeerLabels';
import { sfeerProgress } from '../utils/sfeerProgressStore';
const sfeerColors = SFEER_LABELS.map(sfeer => `#${sfeer.colors.a.toString(16).padStart(6, '0')}`);

const sfeerBg = computed(() => sfeerColors[props.sfeerIndex] || 'rgba(0,0,0,0.7)');
console.log('Sfeer background color:', sfeerBg.value);
function restart() {
    emit('restart');
}
let timeoutId: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
    timeoutId = setTimeout(() => {
        console.log('[GameVictoryUI] Timeout: navigeer naar MainMenu');
        EventBus.emit('change-scene', 'MainMenu');
        sfeerProgress.value = 0;
        // emit('restart');
    }, 30000);
});
onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId);
});
</script>

<style scoped>
.gamevictory-ui {
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

.gamevictory-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background 0.3s;
    opacity: 0;
}

.gamevictory-title {
    font-size: 2.5em;
    font-weight: bold;
    text-transform: uppercase;
    border-radius: 24px;
    background: #26B31F;
    font-family: 'Bungee', Arial, Helvetica, sans-serif;
    box-shadow: 0 6px 0 0 #146910;
    display: flex;
    padding: 24px 32px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: -32px;
    z-index: 2;
    /* margin:  auto; */
}

.gamevictory-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.gamevictory-description {
    position: relative;
    background: #00000025;
    border: 5px solid #26B31F;
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

.gamevictory-description p {
    font-size: 2em;
    line-height: 1.5;
    font-weight: bold;
    font-family: 'Space Grotesk', sans-serif;
    color: #fff;
    text-align: center;
}

.gamevictory-description button {
    display: flex;
    align-items: center;
    text-transform: uppercase;
    border-radius: 24px;
    background: #35BBF0;
    box-shadow: 0 8px 0 0 #2F9BC5;
    padding: 16px 32px;
    gap: 16px;
    color: #FFF;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 48px;
    font-weight: bold;
    margin-top: 16px;
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
