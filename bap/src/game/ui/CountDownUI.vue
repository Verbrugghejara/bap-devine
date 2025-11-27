<template>
        <div class="countdown-ui">
            <div class="countdown-number" :class="{ 'fade-out': fadeOut }">{{ countDownNumber }}</div>
        </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineEmits, defineProps } from 'vue';
import { EventBus } from '../EventBus';
const props = defineProps<{ start: boolean }>();
const emit = defineEmits(['done']);
const countDownNumber = ref<number | string>(5);
const fadeOut = ref(false);
let interval: any = null;

function startCountdown() {
    countDownNumber.value = 5;
    fadeOut.value = false;
    clearInterval(interval);
    // Pauzeer de game scene
    EventBus.emit('pause-game-scene');
    interval = setInterval(() => {
        if (typeof countDownNumber.value === 'number' && countDownNumber.value > 1) {
            countDownNumber.value--;
        } else {
            countDownNumber.value = 'start';
            fadeOut.value = true;
            clearInterval(interval);
            setTimeout(() => {
                // Resume de game scene
                EventBus.emit('resume-game-scene');
                emit('done');
            }, 900);
        }
    }, 1000);
}

watch(() => props.start, (val) => {
    if (val) startCountdown();
});

onMounted(() => {
    if (props.start) startCountdown();
});
</script>

<style>
.countdown-ui {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #11000075;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
.countdown-number {
    font-family: 'Bungee', sans-serif;
    font-size: 5rem;
    font-weight: bold;
    color: white;
    transition: opacity 1s ease-in-out;
    text-align: center;
}
.fade-out {
    opacity: 0;
}
</style>