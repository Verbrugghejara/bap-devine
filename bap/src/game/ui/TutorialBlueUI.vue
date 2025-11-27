<template>
    <div class="tutorial-ui">
        <h2>Hoe werkt het?</h2>
        <div class="tutorial-description">
            <p>Draai aan <span style="font-weight: bold;">blauw</span></p>
            <div class="tutorial-visuals">
                <div class="tutorial-visuals-items">
                    <!-- Proppelor sprite sheet animatie -->
                    <div style="position: absolute; left: 0; top: 80px; width: 80px; height: 80px; z-index: 3; display: flex; align-items: center; justify-content: center;">
                        <!-- <img
                            src="/assets/propellors/propellorBlauw.png"
                            alt="Propeller animatie"
                            class="propeller-spin"
                            style="width: 80px; height: 80px; image-rendering: pixelated;"
                        /> -->
                    </div>
                    <svg :style="{
                            left: (balloonX) + 'px' 
                        }" width="205" height="366" viewBox="0 0 205 366" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M60.2433 14.3848L83.1804 24.1201L59.8162 34.0335V34.2153H103.259V14.3848H60.2433Z" fill="#481328"/>
<path d="M104.354 3.39941H99.2434V51.7489H104.354V3.39941Z" fill="#A42348"/>
<path d="M102.219 289.86C158.672 289.86 204.437 235.499 204.437 168.441C204.437 101.384 158.672 47.0225 102.219 47.0225C45.7649 47.0225 0 101.384 0 168.441C0 235.499 45.7649 289.86 102.219 289.86Z" fill="#A42348"/>
<path d="M126.784 324.032H77.6533C73.4777 324.032 70.0928 327.403 70.0928 331.561V357.946C70.0928 362.104 73.4777 365.475 77.6533 365.475H126.784C130.96 365.475 134.345 362.104 134.345 357.946V331.561C134.345 327.403 130.96 324.032 126.784 324.032Z" fill="#A42348"/>
<path d="M124.509 328.03L118.504 338.762C116.087 343.077 119.223 348.388 124.185 348.388C129.442 348.388 132.76 342.764 130.201 338.191L124.513 328.03H124.509Z" fill="#481328"/>
<path d="M79.3547 328.03L73.3494 338.762C70.9326 343.077 74.0685 348.388 79.0298 348.388C84.2868 348.388 87.6052 342.764 85.0461 338.191L79.3584 328.03H79.3547Z" fill="#481328"/>
<path d="M101.934 328.03L95.9287 338.762C93.512 343.077 96.6479 348.388 101.609 348.388C106.866 348.388 110.185 342.764 107.625 338.191L101.938 328.03H101.934Z" fill="#481328"/>
<path d="M132.337 324.032H72.1007C69.8829 324.032 68.085 325.823 68.085 328.031C68.085 330.24 69.8829 332.03 72.1007 332.03H132.337C134.555 332.03 136.352 330.24 136.352 328.031C136.352 325.823 134.555 324.032 132.337 324.032Z" fill="#481328"/>
<path d="M139.4 287.967L136.526 287.45L129.264 327.518L132.138 328.035L139.4 287.967Z" fill="#481328"/>
<path d="M67.9105 287.441L65.0364 287.957L72.298 328.025L75.1721 327.509L67.9105 287.441Z" fill="#481328"/>
<path d="M140.186 274.229H64.2518C59.9169 274.229 56.4028 277.728 56.4028 282.044C56.4028 286.361 59.9169 289.86 64.2518 289.86H140.186C144.52 289.86 148.035 286.361 148.035 282.044C148.035 277.728 144.52 274.229 140.186 274.229Z" fill="#A42348"/>
<path d="M70.3845 90.8391C82.9253 82.4254 89.8495 70.8129 85.8501 64.9019C81.8508 58.9909 68.4424 61.0198 55.9016 69.4336C43.3609 77.8473 36.4367 89.4598 40.436 95.3707C44.4354 101.282 57.8438 99.2528 70.3845 90.8391Z" fill="white" fill-opacity="0.1"/>
<path d="M38.5645 117.27C42.5776 114.578 44.0043 109.696 41.7511 106.366C39.498 103.036 34.4182 102.519 30.4052 105.211C26.3921 107.903 24.9655 112.786 27.2186 116.116C29.4717 119.446 34.5515 119.963 38.5645 117.27Z" fill="white" fill-opacity="0.1"/>
<path d="M101.799 10.1788C104.621 10.1788 106.91 7.90022 106.91 5.08942C106.91 2.27861 104.621 0 101.799 0C98.976 0 96.6877 2.27861 96.6877 5.08942C96.6877 7.90022 98.976 10.1788 101.799 10.1788Z" fill="#481328"/>
<ellipse cx="99.9341" cy="2.22038" rx="1.50673" ry="0.817796" transform="rotate(-26.3475 99.9341 2.22038)" fill="white" fill-opacity="0.1"/>
<path d="M103.293 294.578C105.05 294.209 106.656 294.782 106.881 295.857C107.086 296.836 106.075 297.891 104.569 298.35L103.891 302.636C110.852 303.983 115.667 309.747 114.72 315.737C114.262 318.635 113.292 320.563 110.079 322.708C106.867 324.854 97.3784 324.901 93.6653 322.363C89.952 319.825 87.811 315.762 88.4712 311.587C89.3673 305.92 95.1074 302.037 101.683 302.368L102.292 298.515C101.358 298.349 100.666 297.869 100.524 297.192C100.299 296.117 101.536 294.946 103.293 294.578Z" fill="#00B873"/>
<path d="M103.293 294.578C105.05 294.209 106.656 294.782 106.881 295.857C107.086 296.836 106.075 297.891 104.569 298.35L103.891 302.636C110.852 303.983 115.667 309.747 114.72 315.737C114.262 318.635 113.292 320.563 110.079 322.708C106.867 324.854 97.3784 324.901 93.6653 322.363C89.952 319.825 87.811 315.762 88.4712 311.587C89.3673 305.92 95.1074 302.037 101.683 302.368L102.292 298.515C101.358 298.349 100.666 297.869 100.524 297.192C100.299 296.117 101.536 294.946 103.293 294.578Z" />
<path d="M106.218 314.456C104.368 317.409 100.762 318.573 98.1615 317.058C95.5606 315.543 94.9541 311.92 96.8035 308.966C98.6529 306.012 102.259 304.848 104.86 306.363C107.461 307.878 108.067 311.502 106.218 314.456Z" fill="white"/>
<path d="M104.036 315.39C102.835 317.489 100.546 318.35 98.9243 317.314C97.3027 316.279 96.9604 313.739 98.1633 311.64C99.3661 309.542 101.653 308.681 103.275 309.716C104.896 310.752 105.238 313.292 104.036 315.39Z" fill="#008049"/>
<path d="M105.407 295.956C105.595 296.343 104.994 296.805 104.062 296.988C103.129 297.17 102.223 297.002 102.035 296.616C101.847 296.229 102.448 295.767 103.38 295.584C104.313 295.401 105.219 295.569 105.407 295.956Z" fill="#008049"/>
</svg>
                    <div class="progress-outer">
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: (sfeerProgress * 100) + '%', left: 0, background: '#35BBF0', borderRadius: '24px 0 0 24px' }">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tutorial-visuals-checks">
                    <div :style="{position: 'relative'}">
                        <svg class="tutorial-visuals-arrows rotating-arrows" xmlns="http://www.w3.org/2000/svg" width="153" height="211" viewBox="0 0 153 211" fill="none">
                            <path d="M137.663 191.75L129.003 196.75C113.528 205.685 96.0353 210.541 78.1689 210.866C60.3029 211.191 42.6469 206.973 26.8574 198.606L18.0205 193.924L22.9385 184.642C30.5842 189.776 38.8983 193.749 47.5918 196.481C47.6741 196.507 47.7565 196.533 47.8389 196.559C49.1494 196.967 50.4683 197.347 51.7949 197.698C51.9026 197.727 52.0104 197.755 52.1182 197.783C52.4335 197.866 52.7493 197.946 53.0654 198.025C53.2171 198.063 53.3687 198.101 53.5205 198.139C53.8946 198.23 54.2693 198.32 54.6445 198.407C54.6843 198.416 54.7239 198.426 54.7637 198.436C55.6846 198.648 56.609 198.847 57.5361 199.032C57.5807 199.041 57.6253 199.05 57.6699 199.059C79.1083 203.32 102.09 200.282 122.619 188.872C122.65 188.855 122.681 188.838 122.712 188.82C123.143 188.58 123.573 188.338 124.002 188.091C126.927 186.402 129.728 184.58 132.403 182.641L137.663 191.75ZM74.4531 0.0175781C92.3191 -0.306967 109.975 3.91112 125.765 12.2773L134.602 16.96L129.696 26.2158C100.378 6.45573 61.1822 3.81172 28.502 22.6797C25.5905 24.3606 22.8011 26.1719 20.1367 28.1016L14.959 19.1338L23.6191 14.1338C39.0945 5.19911 56.5867 0.342254 74.4531 0.0175781Z" fill="white"/>
                            <path d="M16.4545 6.72432L31.4545 32.7051L7.33334 28.926L16.4545 6.72432Z" fill="white"/>
                            <path d="M136.168 204.16L121.168 178.18L145.289 181.959L136.168 204.16Z" fill="white"/>
                        </svg>
                        <svg :style="{transform: 'rotate(' + balloonRotation + 'deg)',
                                transition: 'left 0.4s cubic-bezier(.4,1.4,.6,1), transform 0.4s cubic-bezier(.4,1.4,.6,1)'}" xmlns="http://www.w3.org/2000/svg" width="126" height="130" viewBox="0 0 126 130" fill="none">
                            <path d="M63.2354 0C98.4495 0.000113376 94.135 28.6735 72.8125 53.6162C75.313 55.7635 77.0978 58.7201 77.7607 62.0801C108.798 56.9686 135.427 68.7781 119.057 97.1318C101.551 127.453 79.0331 109.763 68.0225 79.1523C66.4651 79.7 64.7905 79.9999 63.0459 80C61.2895 80 59.6034 79.6973 58.0371 79.1426C46.9324 108.528 23.4196 125.627 7.06445 97.2998C-10.4723 66.9253 16.2318 56.2849 48.3223 62.123C49.0049 58.6094 50.913 55.5336 53.585 53.3594C33.5882 29.0215 30.4642 0.000265808 63.2354 0ZM63.0459 59C59.7322 59 57.0459 61.6863 57.0459 65C57.0459 68.3137 59.7322 71 63.0459 71C66.3594 70.9998 69.0459 68.3136 69.0459 65C69.0459 61.6864 66.3594 59.0002 63.0459 59Z" fill="#35BBF0"/>
                        </svg>
                    </div>
                    <svg
                        :class="{ 'shake': shakeSvg }"
                        xmlns="http://www.w3.org/2000/svg" width="90" height="83" viewBox="0 0 126 130">
                        <path :fill="`#93886F`" d="M63.2354 0C98.4495 0.000113376 94.135 28.6735 72.8125 53.6162C75.313 55.7635 77.0978 58.7201 77.7607 62.0801C108.798 56.9686 135.427 68.7781 119.057 97.1318C101.551 127.453 79.0331 109.763 68.0225 79.1523C66.4651 79.7 64.7905 79.9999 63.0459 80C61.2895 80 59.6034 79.6973 58.0371 79.1426C46.9324 108.528 23.4196 125.627 7.06445 97.2998C-10.4723 66.9253 16.2318 56.2849 48.3223 62.123C49.0049 58.6094 50.913 55.5336 53.585 53.3594C33.5882 29.0215 30.4642 0.000265808 63.2354 0ZM63.0459 59C59.7322 59 57.0459 61.6863 57.0459 65C57.0459 68.3137 59.7322 71 63.0459 71C66.3594 70.9998 69.0459 68.3136 69.0459 65C69.0459 61.6864 66.3594 59.0002 63.0459 59Z" />
                    </svg>
                
                </div>
            </div>
        </div>
        <SkipButton :progress="enterHoldProgress" :circumference="circumference" :color="`#35BBF0`">OVERSLAAN</SkipButton>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SkipButton from './SkipButton.vue';

import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { getRotaryClient } from '../utils/rotaryClientSingleton';
import AnimatedButton from './AnimatedButton.vue';
import { EventBus } from '../../game/EventBus';


// Gebruik singleton rotary client zodat events ook in de tutorial werken
const rotary = getRotaryClient();
console.log("TutorialUI: rotary singleton", rotary);

// Shake animatie voor tweede SVG
const shakeSvg = ref(false);
const angle2Value = ref<number|null>(null);
let lastAngle2: number | null = null;

let startAngle1: number | null = null;
let totalDelta: number = 0;
let lastAngle1: number | null = null;

function triggerShake() {
    if (!shakeSvg.value) {
        shakeSvg.value = true;
        setTimeout(() => {
            shakeSvg.value = false;
        }, 400); // duur animatie
    }
}

// Animation loop die rotary.lastAngles uitleest
function updateFromRotary() {
    const angles = rotary.lastAngles;
    // Sensor 1 (blauw)
    if (typeof angles[0] === "number") {
        const angle1 = Math.round(angles[0]);
        if (startAngle1 === null) {
            startAngle1 = angle1;
            lastAngle1 = angle1;
        } else if (lastAngle1 !== null && angle1 !== lastAngle1) {
            const deltaStep = angle1 - lastAngle1;
            if (Math.abs(deltaStep) < 50 && Math.abs(deltaStep) > 0) {
                totalDelta += Math.abs(deltaStep);
                let progress = Math.min(1, totalDelta / 2000);
                balloonX.value = balloonXMin + (balloonXMax - balloonXMin) * progress;
                sfeerProgress.value = progress;
                balloonRotation.value += deltaStep;
                if (progress >= 1) {
                    EventBus.emit('change-scene', 'TutorialRedUI');
                }
            }
            lastAngle1 = angle1;
        }
    }
    // Sensor 2 (shake effect)
    if (typeof angles[1] === "number") {
        const angle2 = Math.round(angles[1]);
        angle2Value.value = angle2;
        if (lastAngle2 !== null && Math.abs(angle2 - lastAngle2) >= 10) {
            triggerShake();
        }
        lastAngle2 = angle2;
    }
    requestAnimationFrame(updateFromRotary);
}

onMounted(() => {
    updateFromRotary();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
});
onUnmounted(() => {
    EventBus.off('rotary1-move');
    EventBus.off('rotary2-move');
    clearTimeout(sensor1Timeout);
    clearTimeout(sensor2Timeout);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (enterHoldRaf !== null) {
        cancelAnimationFrame(enterHoldRaf);
        enterHoldRaf = null;
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

// Enter-toets 3 seconden ingedrukt houden om te skippen
let enterHoldRaf: number | null = null;
let enterHoldActive = false;
let isUpdating = false;

const enterHoldProgress = ref(0); // 0..1
const enterHoldStart = ref<number|null>(null);
const circumference = 2 * Math.PI * 14; // r=14

function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !enterHoldActive && !isUpdating) {
        enterHoldActive = true;
        enterHoldStart.value = Date.now();
        enterHoldProgress.value = 0;
        isUpdating = true;
        let stopped = false;
        const update = () => {
            if (!enterHoldActive || stopped) {
                isUpdating = false;
                if (enterHoldRaf !== null) {
                    cancelAnimationFrame(enterHoldRaf);
                    enterHoldRaf = null;
                }
                return;
            }
            const elapsed = Date.now() - (enterHoldStart.value || 0);
            enterHoldProgress.value = Math.min(1, elapsed / 3000);
            if (enterHoldProgress.value >= 1) {
                stopped = true;
                enterHoldActive = false;
                enterHoldProgress.value = 0;
                isUpdating = false;
                skipTutorial();
                if (enterHoldRaf !== null) {
                    cancelAnimationFrame(enterHoldRaf);
                    enterHoldRaf = null;
                }
                return;
            }
            enterHoldRaf = requestAnimationFrame(update);
        };
        update();
    }
}

function handleKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        enterHoldActive = false;
        if (enterHoldRaf !== null) {
            cancelAnimationFrame(enterHoldRaf);
            enterHoldRaf = null;
        }
        enterHoldProgress.value = 0;
        isUpdating = false;
    }
}

function skipTutorial() {
    EventBus.emit('change-scene', 'Game');
}


onMounted(() => {


    // Enter-toets event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
});
onUnmounted(() => {
    EventBus.off('rotary1-move');
    EventBus.off('rotary2-move');
    clearTimeout(sensor1Timeout);
    clearTimeout(sensor2Timeout);

    // Clean up enter hold
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (enterHoldRaf !== null) {
        cancelAnimationFrame(enterHoldRaf);
        enterHoldRaf = null;
    }
});


</script>

<style scoped>
.tutorial-ui {
    position: absolute;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* border-radius: 24px; */
    /* border: 5px solid #35BBF0; */
    /* background: rgba(0, 0, 0, 0.25); */
    /* padding: 32px 48px; */
    z-index: 10;
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
    /* font-weight: bold; */
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

.tutorial-visuals-items svg {
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
    color: #35BBF0;
    font-family: Bungee;
    font-size: 36px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    display: inline-flex;
    padding: 16px 32px;
    gap: 16px;
    border-radius: 24px;
    border: 5px solid #35BBF0;
    margin-top: 46px;
    transition: bottom 0.18s cubic-bezier(.4, 1.6, .6, 1);
}

.fixed-bottom {
    /* position: absolute; */
    left: 50%;
    /* bottom: 32px; */
    z-index: 200;
    transform: translateX(-50%);
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
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: #35BBF0;
    border-radius: 24px 0 0 24px;
    z-index: 1;
    border-radius: 25px;
    /* transition: width 0.15s cubic-bezier(.4, 1.4, .6, 1); */
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
@keyframes propeller-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.propeller-spin {
    animation: propeller-spin 0.7s linear infinite;
    display: block;
}


