<template>
    <div class="tutorial-ui">
        <h2>Hoe werkt het?</h2>
        <div class="tutorial-description">
            <p>Draai aan Rood</p>
            <div class="tutorial-visuals">
                <div class="tutorial-visuals-items">
                    <img
                        src="/assets/balloon.png"
                        alt=""
                        :style="{
                            right: (balloonX) + 'px'
                        }"
                    />
                    <div class="progress-outer">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: (sfeerProgress * 100) + '%' }">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tutorial-visuals-checks">
                    <svg
                        :class="{ 'shake': shakeSvg }"
                        xmlns="http://www.w3.org/2000/svg" width="90" height="83" viewBox="0 0 126 130">
                        <path :fill="`#93886F`" d="M63.2354 0C98.4495 0.000113376 94.135 28.6735 72.8125 53.6162C75.313 55.7635 77.0978 58.7201 77.7607 62.0801C108.798 56.9686 135.427 68.7781 119.057 97.1318C101.551 127.453 79.0331 109.763 68.0225 79.1523C66.4651 79.7 64.7905 79.9999 63.0459 80C61.2895 80 59.6034 79.6973 58.0371 79.1426C46.9324 108.528 23.4196 125.627 7.06445 97.2998C-10.4723 66.9253 16.2318 56.2849 48.3223 62.123C49.0049 58.6094 50.913 55.5336 53.585 53.3594C33.5882 29.0215 30.4642 0.000265808 63.2354 0ZM63.0459 59C59.7322 59 57.0459 61.6863 57.0459 65C57.0459 68.3137 59.7322 71 63.0459 71C66.3594 70.9998 69.0459 68.3136 69.0459 65C69.0459 61.6864 66.3594 59.0002 63.0459 59Z" />
                    </svg>
                    <div :style="{position: 'relative'}">
                        <svg class="tutorial-visuals-arrows rotating-arrows" xmlns="http://www.w3.org/2000/svg" width="153" height="211" viewBox="0 0 153 211" fill="none">
                            <path d="M137.663 191.75L129.003 196.75C113.528 205.685 96.0353 210.541 78.1689 210.866C60.3029 211.191 42.6469 206.973 26.8574 198.606L18.0205 193.924L22.9385 184.642C30.5842 189.776 38.8983 193.749 47.5918 196.481C47.6741 196.507 47.7565 196.533 47.8389 196.559C49.1494 196.967 50.4683 197.347 51.7949 197.698C51.9026 197.727 52.0104 197.755 52.1182 197.783C52.4335 197.866 52.7493 197.946 53.0654 198.025C53.2171 198.063 53.3687 198.101 53.5205 198.139C53.8946 198.23 54.2693 198.32 54.6445 198.407C54.6843 198.416 54.7239 198.426 54.7637 198.436C55.6846 198.648 56.609 198.847 57.5361 199.032C57.5807 199.041 57.6253 199.05 57.6699 199.059C79.1083 203.32 102.09 200.282 122.619 188.872C122.65 188.855 122.681 188.838 122.712 188.82C123.143 188.58 123.573 188.338 124.002 188.091C126.927 186.402 129.728 184.58 132.403 182.641L137.663 191.75ZM74.4531 0.0175781C92.3191 -0.306967 109.975 3.91112 125.765 12.2773L134.602 16.96L129.696 26.2158C100.378 6.45573 61.1822 3.81172 28.502 22.6797C25.5905 24.3606 22.8011 26.1719 20.1367 28.1016L14.959 19.1338L23.6191 14.1338C39.0945 5.19911 56.5867 0.342254 74.4531 0.0175781Z" fill="white"/>
                            <path d="M16.4545 6.72432L31.4545 32.7051L7.33334 28.926L16.4545 6.72432Z" fill="white"/>
                            <path d="M136.168 204.16L121.168 178.18L145.289 181.959L136.168 204.16Z" fill="white"/>
                        </svg>
                        <svg :style="{transform: 'rotate(' + balloonRotation + 'deg)',
                                transition: 'left 0.4s cubic-bezier(.4,1.4,.6,1), transform 0.4s cubic-bezier(.4,1.4,.6,1)'}" xmlns="http://www.w3.org/2000/svg" width="126" height="130" viewBox="0 0 126 130" fill="none">
                            <path d="M63.2354 0C98.4495 0.000113376 94.135 28.6735 72.8125 53.6162C75.313 55.7635 77.0978 58.7201 77.7607 62.0801C108.798 56.9686 135.427 68.7781 119.057 97.1318C101.551 127.453 79.0331 109.763 68.0225 79.1523C66.4651 79.7 64.7905 79.9999 63.0459 80C61.2895 80 59.6034 79.6973 58.0371 79.1426C46.9324 108.528 23.4196 125.627 7.06445 97.2998C-10.4723 66.9253 16.2318 56.2849 48.3223 62.123C49.0049 58.6094 50.913 55.5336 53.585 53.3594C33.5882 29.0215 30.4642 0.000265808 63.2354 0ZM63.0459 59C59.7322 59 57.0459 61.6863 57.0459 65C57.0459 68.3137 59.7322 71 63.0459 71C66.3594 70.9998 69.0459 68.3136 69.0459 65C69.0459 61.6864 66.3594 59.0002 63.0459 59Z" fill="#F25C54"/>
                        </svg>
                    </div>
                    
                
                </div>
            </div>
        </div>
            <p class="button-text fixed-bottom">Overslaan</p>
    </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { getRotaryClient } from '../utils/rotaryClientSingleton';
import AnimatedButton from './AnimatedButton.vue';
import { EventBus } from '../../game/EventBus';

// Gebruik singleton rotary client zodat events ook in de tutorial werken
const rotary = getRotaryClient();
console.log("TutorialUI: rotary singleton", rotary);



// Shake animatie voor tweede SVG
const shakeSvg = ref(false);
// angle1 waarde opslaan
const angle1Value = ref<number|null>(null);
let lastAngle1: number | null = null;

let startAngle2: number | null = null;
let totalDelta: number = 0;
let lastAngle2: number | null = null;

function handleRotaryWS(event: MessageEvent) {
    try {
        const data = JSON.parse(event.data);
        if (typeof data.angle2 === "number") {
            // Rond af op hele graden
            const angle2 = Math.round(data.angle2);
            // Debug: log binnenkomende waarde
            // console.log('[TutorialUI] Ontvangen angle2:', angle2, 'lastAngle2:', lastAngle2);
            if (startAngle2 === null) {
                startAngle2 = angle2;
                lastAngle2 = angle2; // Eerste waarde als referentie, niet verwerken
                return;
            }
            if (lastAngle2 !== null && angle2 !== lastAngle2) {
                const deltaStep = angle2 - lastAngle2;
                // Verwerk alleen realistische stappen (geen wrap/jitter)
                if (Math.abs(deltaStep) < 50 && Math.abs(deltaStep) > 0) {
                    totalDelta += Math.abs(deltaStep);
                    // 2000 graden totaal = volle balk
                    let progress = Math.min(1, totalDelta / 2000);
                    balloonX.value = balloonXMin + (balloonXMax - balloonXMin) * progress;
                    sfeerProgress.value = progress;
                    // Ballon rotatie: cumulatief, bv. 1:1 graden
                    balloonRotation.value += deltaStep;
                    // Start automatisch de game als progress vol is
                    if (progress >= 1) {
                        EventBus.emit('change-scene', 'Game');
                    }
                } else {
                    // console.warn('[TutorialUI] Onrealistische stap genegeerd:', deltaStep);
                }
            }
            lastAngle2 = angle2;
        }
        // SHAKE SVG als angle1 beweegt
        if (typeof data.angle1 === "number") {
            const angle1 = Math.round(data.angle1);
            angle1Value.value = angle1;
            // Alleen shake bij een verschil van minstens 10 graden
            if (
                lastAngle1 !== null &&
                Math.abs(angle1 - lastAngle1) >= 10
            ) {
                triggerShake();
            }
            lastAngle1 = angle1;
        }
    } catch (e) {
        console.error('[TutorialUI] Error parsing rotary message:', e);
    }
}
// Shake animatie trigger functie
function triggerShake() {
    if (!shakeSvg.value) {
        shakeSvg.value = true;
        setTimeout(() => {
            shakeSvg.value = false;
        }, 400); // duur animatie
    }
}

function attachWSHandler() {
    if (rotary.ws) {
        rotary.ws.onmessage = handleRotaryWS;
    }
}

attachWSHandler();
// Herkoppel bij reconnect
watchEffect(() => {
    if (rotary.ws) {
        rotary.ws.onmessage = handleRotaryWS;
    }
});

const sensor1Active = ref(false);
const sensor2Active = ref(false);

// Balloon movement and progress
const balloonX = ref(0); // px, 0 = start, max = 550
const balloonXMin = 0;
const balloonXMax = 550;
const sfeerProgress = ref(0); // 0..1
const balloonRotation = ref(0); // graden

let sensor1Timeout: any = null;
let sensor2Timeout: any = null;

function skipTutorial() {
    EventBus.emit('change-scene', 'Game');
}

onMounted(() => {
    let lastBothActive = false;
    // rotary1-move en rotary2-move zijn niet meer nodig voor de visuele feedback
});
onUnmounted(() => {
    EventBus.off('rotary1-move');
    EventBus.off('rotary2-move');
    clearTimeout(sensor1Timeout);
    clearTimeout(sensor2Timeout);
});


</script>

<style scoped>
.tutorial-ui {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* border-radius: 24px; */
    /* border: 5px solid #F25C54; */
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
    background: #F25C54;
    box-shadow: 0 6px 0 0 #A83C37;
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
    border: 5px solid #F25C54;
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
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    /* align-items: center; */
    gap: 0;
    margin-top: 48px;
    height: 450px;
    width: 100%;
}

.tutorial-visuals-items img {
    position: absolute;
    width: 200px; 
    height: auto; 
    top:32px;
    z-index:2;
}

.tutorial-visuals-checks {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 64px;
    margin-top: 100px;
    /* padding: 0 70px; */
}

.tutorial-visuals-arrows {
    position: absolute;
    top: -30%;
    left: -10%;
}

.rotating-arrows {
    animation: rotate-arrows 4s linear infinite;
    transform-origin: 50% 50%;
}

@keyframes rotate-arrows {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
}

.button-text {
    color: #F25C54;
    font-family: Bungee;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: inline-flex;
    padding: 16px 32px;
    gap: 16px;
    border-radius: 24px;
    border: 5px solid #F25C54;
    margin-top: 46px;
    transition: bottom 0.18s cubic-bezier(.4, 1.6, .6, 1);
}

.fixed-bottom {
    position: fixed;
    right: 0;
    /* bottom: 32px; */
    z-index: 200;
    transform: none;
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

.progress-outer {
    /* position: absolute; */
    display: flex;
    flex:1;
    align-items: end;
    /* height: 100vh; */
    /* width: 800px; */
    justify-content: center;
    pointer-events: none;
}

.progress-bar {
    position: relative;
    width: 600px;
    height: 32px;
    background: #ffffff25;
    border-radius: 24px;
    margin-left: 80px;
    margin-right: 80px;
    overflow: hidden;
}

.progress-fill {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: #F25C54;
    border-radius: 0 24px 24px 0;
    z-index: 1;
    border-radius: 25px;
    transition: width 0.15s cubic-bezier(.4, 1.4, .6, 1);
}

@keyframes shake-rotate {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-18deg); }
    50% { transform: rotate(15deg); }
    80% { transform: rotate(-10deg); }
    100% { transform: rotate(0deg); }
}
.shake {
    animation: shake-rotate 0.4s cubic-bezier(.4,1.4,.6,1);
}
</style>


