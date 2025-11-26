<template>
    <div class="tutorial-ui">

        <h2>Hoe werkt het?</h2>
        <div class="tutorial-description">
        <p>Draai aan Blauw</p>
            <div class="tutorial-visuals">
                <div class="tutorial-visuals-items">
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="100" viewBox="0 0 25 51" fill="none">
                        <path
                            d="M18.278 29.0054L2.91865 15.3001C-1.81708 11.079 -0.601428 3.39481 5.20195 0.815858C11.3436 -1.92098 18.278 2.56326 18.278 9.26852V29.0158V29.0054Z"
                            fill="#EFA348" />
                        <path
                            d="M18.2781 21.4676L2.91871 35.1729C-1.81701 39.3939 -0.601367 47.0781 5.20201 49.6571C11.3437 52.3939 18.2781 47.9097 18.2781 41.2044V21.457V21.4676Z"
                            fill="#EFA348" />
                        <path
                            d="M19.0068 19.7793H14.1378C11.0126 19.7793 8.479 22.3022 8.479 25.4143V25.4272C8.479 28.5393 11.0126 31.0622 14.1378 31.0622H19.0068C22.132 31.0622 24.6656 28.5393 24.6656 25.4272V25.4143C24.6656 22.3022 22.132 19.7793 19.0068 19.7793Z"
                            fill="#EFA348" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 198 120" fill="none">
                        <path
                            d="M169.968 0H27.7064C15.6157 0 5.81421 9.76022 5.81421 21.8V98.2C5.81421 110.24 15.6157 120 27.7064 120H169.968C182.059 120 191.861 110.24 191.861 98.2V21.8C191.861 9.76022 182.059 0 169.968 0Z"
                            fill="#A42348" />
                        <path
                            d="M163.382 11.5771L145.993 42.6509C138.995 55.1456 148.076 70.5245 162.441 70.5245C177.663 70.5245 187.272 54.2403 179.862 40.9982L163.393 11.5771H163.382Z"
                            fill="#481328" />
                        <path
                            d="M32.6325 11.5771L15.2435 42.6509C8.24563 55.1456 17.326 70.5245 31.6917 70.5245C46.9137 70.5245 56.5226 54.2403 49.1124 40.9982L32.6431 11.5771H32.6325Z"
                            fill="#481328" />
                        <path
                            d="M98.0128 11.5771L80.6238 42.6509C73.6259 55.1456 82.7063 70.5245 97.072 70.5245C112.294 70.5245 121.903 54.2403 114.493 40.9982L98.0234 11.5771H98.0128Z"
                            fill="#481328" />
                        <path
                            d="M186.046 0H11.6279C5.20599 0 0 5.18407 0 11.5789C0 17.9738 5.20599 23.1579 11.6279 23.1579H186.046C192.468 23.1579 197.674 17.9738 197.674 11.5789C197.674 5.18407 192.468 0 186.046 0Z"
                            fill="#481328" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="100" viewBox="0 0 25 51" fill="none">
                        <path
                            d="M5.87042 29.0053L21.2298 15.3001C25.9655 11.079 24.7499 3.39481 18.9465 0.815865C12.8049 -1.92098 5.87042 2.5632 5.87042 9.26846V29.0158V29.0053Z"
                            fill="#EFA348" />
                        <path
                            d="M5.87042 21.4685L21.2298 35.1738C25.9655 39.3949 24.7499 47.079 18.9465 49.658C12.8049 52.3948 5.87042 47.9106 5.87042 41.2054V21.458V21.4685Z"
                            fill="#EFA348" />
                        <path
                            d="M10.1983 19.9453H5.48174C2.45425 19.9453 0 22.3892 0 25.404V25.4165C0 28.4312 2.45425 30.8751 5.48174 30.8751H10.1983C13.2258 30.8751 15.68 28.4312 15.68 25.4165V25.404C15.68 22.3892 13.2258 19.9453 10.1983 19.9453Z"
                            fill="#EFA348" />
                    </svg>

                </div>
                <div class="tutorial-visuals-checks">
                    <template v-if="sensor1Active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 31 31" fill="none">
                            <rect x="1.43629" y="1.43626" width="27.7677" height="27.7677" rx="13.8839" stroke="#26B31F"
                                stroke-width="2.87252" />
                            <path d="M8.13879 14.5107L14.4061 21.065L22.5014 9.09619" stroke="#26B31F"
                                stroke-width="2.87252" />
                        </svg>
                    </template>
                    <template v-else>
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 31 31" fill="none">
                            <rect x="1.43626" y="1.43626" width="27.7677" height="27.7677" rx="13.8839" stroke="#B31F1F"
                                stroke-width="2.87252" />
                            <path d="M8.61755 8.61768L22.0227 22.0228M8.61755 22.0228L22.0227 8.61768" stroke="#B31F1F"
                                stroke-width="2.87252" />
                        </svg>
                    </template>
                    <template v-if="sensor2Active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 31 31" fill="none">
                            <rect x="1.43629" y="1.43626" width="27.7677" height="27.7677" rx="13.8839" stroke="#26B31F"
                                stroke-width="2.87252" />
                            <path d="M8.13879 14.5107L14.4061 21.065L22.5014 9.09619" stroke="#26B31F"
                                stroke-width="2.87252" />
                        </svg>
                    </template>
                    <template v-else>
                        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 31 31" fill="none">
                            <rect x="1.43626" y="1.43626" width="27.7677" height="27.7677" rx="13.8839" stroke="#B31F1F"
                                stroke-width="2.87252" />
                            <path d="M8.61755 8.61768L22.0227 22.0228M8.61755 22.0228L22.0227 8.61768" stroke="#B31F1F"
                                stroke-width="2.87252" />
                        </svg>
                    </template>
                </div>

            </div>
                        <AnimatedButton :text="'Overslaan'" @click="skipTutorial">
                            
                        </AnimatedButton>
            <!-- Voeg hier je tutorial stappen, knoppen, visuals toe -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { DualRotaryWSClient } from '../scenes/DualRotaryWSClient';
// Initialiseer rotary websocket client zodat events ook in de tutorial werken
const rotary = new DualRotaryWSClient("ws://localhost:8765");
console.log("TutorialUI: rotary client aangemaakt", rotary);

// Helper: previous angles to detect movement (rounded to int)
let prevAngle1: number | null = null;
let prevAngle2: number | null = null;

// Listen for rotary movement from the websocket client
if (rotary.ws) {
    rotary.ws.onmessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            if (typeof data.angle1 === "number") {
                const rounded1 = Math.round(data.angle1);
                if (prevAngle1 !== null && Math.abs(rounded1 - prevAngle1) >= 10) {
                    EventBus.emit('rotary1-move');
                    // Debug
                    console.log("[TutorialUI] rotary1-move emitted", data.angle1);
                }
                prevAngle1 = rounded1;
            }
            if (typeof data.angle2 === "number") {
                const rounded2 = Math.round(data.angle2);
                if (prevAngle2 !== null && Math.abs(rounded2 - prevAngle2) >= 10) {
                    EventBus.emit('rotary2-move');
                    // Debug
                    console.log("[TutorialUI] rotary2-move emitted", data.angle2);
                }
                prevAngle2 = rounded2;
            }
        } catch (e) {
            console.error('[TutorialUI] Error parsing rotary message:', e);
        }
    };
}
import AnimatedButton from './AnimatedButton.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { EventBus } from '../../game/EventBus';

const sensor1Active = ref(false);
const sensor2Active = ref(false);


let sensor1Timeout: any = null;
let sensor2Timeout: any = null;
let inactivityTimeout: any = null;

function skipTutorial() {
    EventBus.emit('change-scene', 'Game');
}

onMounted(() => {
    let lastBothActive = false;
    function resetInactivity() {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
            EventBus.emit('change-scene', 'MainMenu');
        }, 10000);
    }
    function checkBothActive() {
        if (sensor1Active.value && sensor2Active.value && !lastBothActive) {
            lastBothActive = true;
            clearTimeout(inactivityTimeout);
            EventBus.emit('change-scene', 'Game');
        } else if (!(sensor1Active.value && sensor2Active.value)) {
            lastBothActive = false;
        }
    }
    EventBus.on('rotary1-move', () => {
        sensor1Active.value = true;
        console.log("moooved rotary 1");
        clearTimeout(sensor1Timeout);
        sensor1Timeout = setTimeout(() => { sensor1Active.value = false; checkBothActive(); }, 1000);
        checkBothActive();
        resetInactivity();
    });
    EventBus.on('rotary2-move', () => {
        sensor2Active.value = true;

        console.log("moooved rotary 2");
        clearTimeout(sensor2Timeout);
        sensor2Timeout = setTimeout(() => { sensor2Active.value = false; checkBothActive(); }, 1000);
        checkBothActive();
        resetInactivity();
    });
    resetInactivity();
});
onUnmounted(() => {
    EventBus.off('rotary1-move');
    EventBus.off('rotary2-move');
    clearTimeout(sensor1Timeout);
    clearTimeout(sensor2Timeout);
    clearTimeout(inactivityTimeout);
});


</script>

<style scoped>
.tutorial-ui {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* border-radius: 24px; */
    /* border: 5px solid #35BBF0; */
    /* background: rgba(0, 0, 0, 0.25); */
    /* padding: 32px 48px; */
    z-index: 100;
    /* min-width: 320px;
    max-width: 90vw; */
    text-align: center;
}

h2 {
    font-family: 'Bungee', Arial, Helvetica, sans-serif;
    color: #FFF;
    font-size: 2.5em;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    border-radius: 24px;
    background: #35BBF0;
    box-shadow: 0 6px 0 0 #2192BF;
    display: inline-flex;
    padding: 24px 32px;
    justify-content: center;
    align-items: center;
    gap: 8px;

    margin-bottom: -32px;
}

.tutorial-description {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: bold;
    font-size: 2em;
    border-radius: 24px;
    border: 5px solid #35BBF0;
    background: rgba(0, 0, 0, 0.25);
    padding: 48px 48px;
    padding-top: 72px;
    z-index: 100;
    min-width: 70vw;
    max-width: 90vw;
    text-align: center;
    /* font-weight: 600; */
}

.tutorial-visuals-items {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 100px;
    margin-top: 24px;
}

.tutorial-visuals-checks {
    display: flex;
    justify-content: space-between;
    padding: 0 70px;
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
    transition: bottom 0.18s cubic-bezier(.4,1.6,.6,1);
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
p {
    margin: 0;
}
</style>
