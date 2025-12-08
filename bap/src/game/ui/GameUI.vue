<template>
  <div class="game-ui-container" v-show="visible">
    <div class="sfeer-progress-outer">
      <div class="sfeer-progress-alien" :style="{ bottom: 'calc(' + (sfeerProgress * 100) + '% - 32px)', transition: 'background 0.1s ease' }">
        <svg width="81" height="92" viewBox="0 0 128 147" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M91.3716 48.4137L114.141 25.6447C115.052 24.7335 116.529 24.7334 117.44 25.6447V25.6447C123.272 31.4766 123.272 40.9319 117.44 46.7638L115.791 48.4137C109.047 55.1568 98.1147 55.1568 91.3716 48.4137V48.4137Z" fill="#008049"/>
        <path d="M36.6279 48.4137L13.8589 25.6447C12.9477 24.7335 11.4703 24.7334 10.5591 25.6447V25.6447C4.72718 31.4766 4.72718 40.9319 10.5591 46.7638L12.209 48.4137C18.9521 55.1568 29.8848 55.1568 36.6279 48.4137V48.4137Z" fill="#008049"/>
        <ellipse cx="52.8348" cy="33.9623" rx="8.23128" ry="18.5204" fill="#008049"/>
        <ellipse cx="69.2228" cy="35.5967" rx="8.23128" ry="18.5204" transform="rotate(30 69.2228 35.5967)" fill="#008049"/>
        <ellipse cx="64.7073" cy="23.4956" rx="9.65993" ry="21.7348" transform="rotate(15 64.7073 23.4956)" fill="#008049"/>
        <rect x="6.47266" y="35.2578" width="115.112" height="110.795" rx="40.2892" fill="#00B873"/>
        <path d="M71.0379 45.2268C72.8815 45.8377 68.543 43.9207 63.344 44.131C58.2026 44.3378 52.9995 47.267 56.4397 45.7631" stroke="#008049" stroke-width="4.12905" stroke-miterlimit="10" stroke-linecap="round"/>
        <circle cx="64.0292" cy="75.5419" r="23.0224" fill="white"/>
        <path d="M63.6934 71.948C71.0408 71.9483 76.9971 77.9051 76.9971 85.2527C76.9969 92.6001 71.0408 98.5561 63.6934 98.5564C56.3457 98.5564 50.3888 92.6003 50.3887 85.2527C50.3887 77.905 56.3456 71.948 63.6934 71.948Z" fill="black"/>
        <circle cx="55.4187" cy="77.7024" r="5.7556" fill="white"/>
        <path d="M48.2016 111.159C45.0229 111.159 42.3588 113.825 43.5506 116.772C43.7051 117.154 43.8754 117.532 44.0616 117.905C45.1282 120.043 46.6915 121.986 48.6623 123.623C50.6331 125.26 52.9728 126.558 55.5478 127.444C58.1228 128.33 60.8826 128.786 63.6698 128.786C66.4569 128.786 69.2168 128.33 71.7918 127.444C74.3668 126.558 76.7064 125.26 78.6773 123.623C80.6481 121.986 82.2114 120.043 83.278 117.905C83.4641 117.532 83.6345 117.154 83.7889 116.772C84.9808 113.825 82.3167 111.159 79.138 111.159L63.6698 111.159L48.2016 111.159Z" fill="#008049"/>
        <ellipse cx="63.6672" cy="125.185" rx="8.27368" ry="2.15835" fill="#A42348"/>
        </svg>
      </div>
      <!-- <div style="color:#222;font-size:18px;text-align:center;width:100%">Progress: {{ (sfeerProgress * 100).toFixed(1) }}%</div> -->
      <div class="sfeer-progress-bar"  :style="{ height: 'calc(' + (sfeerProgress * 100) + '% - 32px)', transition: 'background 0.1s ease' }">
        <div class="sfeer-progress-highlight"
         >
        </div>
      </div>
    </div>
    <div class="game-ui">
      <div class="left-ui">

        <div class="sfeer-label">
          <div class="sfeer-circle-outer"
            :style="{ borderColor: SFEER_COLORS[sfeerIndex].e, transition: 'background 0.3s' }">
            <!-- <div class="sfeer-circle-inner"></div> -->
          </div>
          <div class="sfeer-label-text" :style="{ color: SFEER_COLORS[sfeerIndex].e }">{{ sfeerText }}</div>
        </div>
        <div class="timer-container">

          <div class="timer">
            <svg xmlns="http://www.w3.org/2000/svg" width="58" height="64" viewBox="0 0 58 64" fill="none">
      <path d="M31.29 0C32.6188 5.80751e-08 33.6963 1.07745 33.6963 2.40625C33.6962 3.73494 32.6188 4.8125 31.29 4.8125H30.8086V6.31934C36.5325 6.6972 41.8008 8.74014 46.1318 11.9717C45.9255 11.3327 46.0587 10.6044 46.5459 10.0752C47.2662 9.29331 48.4846 9.24273 49.2666 9.96289L52.0986 12.5713C52.8805 13.2915 52.9302 14.5092 52.21 15.291C51.7316 15.8102 51.0345 16.0038 50.3906 15.8662C54.9697 20.9758 57.7548 27.7254 57.7549 35.126C57.7549 51.0721 44.8265 63.9989 28.8779 63.999C12.9292 63.999 0 51.0721 0 35.126C9.64748e-05 27.7934 2.73507 21.1002 7.23926 16.0078C6.6192 16.1119 5.96067 15.9129 5.50293 15.416C4.78271 14.6341 4.83326 13.4165 5.61523 12.6963L8.44727 10.0879C9.22928 9.36799 10.4468 9.4184 11.167 10.2002C11.6241 10.6966 11.7691 11.3678 11.6152 11.9766C15.9505 8.7396 21.2263 6.6945 26.958 6.31836V4.8125H26.4766C25.1479 4.81239 24.0704 3.73487 24.0703 2.40625C24.0703 1.07752 25.1479 0.000112317 26.4766 0H31.29Z" fill="#FFB703"/>
      <ellipse cx="28.8762" cy="35.1309" rx="21.177" ry="21.1738" fill="white"/>
      <ellipse cx="28.8756" cy="35.1309" rx="3.85022" ry="3.84961" fill="#E73228"/>
      <path d="M27.8968 25.6893C28.1244 24.6381 29.6238 24.6381 29.8514 25.6893L31.1126 31.5135C31.2475 32.1366 30.7728 32.7251 30.1353 32.7251H27.6129C26.9754 32.7251 26.5007 32.1366 26.6356 31.5135L27.8968 25.6893Z" fill="#E73228"/>
    </svg>
    <p :style="{ color: `${SFEER_COLORS[sfeerIndex].e}` }">{{ timerText }}</p>
          </div>
          <Transition name="timer-bonus">
            <p v-if="showTimerUpdate" class="timer-update" :style="{ color: `${SFEER_COLORS[sfeerIndex].e}` }">-10</p>
          </Transition>
        </div>
      </div>
      <div class="right-ui">

        <div class="healthbar">
          <div class="healthbar-bg">
            <div class="hearts">
              <span v-for="n in 3" :key="n" class="heart-slot">
                <svg class="heart heart-empty" xmlns="http://www.w3.org/2000/svg" width="74" height="64" viewBox="0 0 74 64" fill="none">
                  <path d="M36.5557 6.22754C44.9126 -2.08832 58.4283 -2.07549 66.7695 6.26563C75.1235 14.6196 75.1235 28.1636 66.7695 36.5176C66.4639 36.8232 66.1501 37.1162 65.8311 37.3994L42.1836 61.0469C39.0594 64.171 33.9943 64.171 30.8701 61.0469L7.3584 37.5361C6.98556 37.2114 6.62053 36.8725 6.26562 36.5176C-2.08832 28.1636 -2.08832 14.6196 6.26562 6.26563C14.61 -2.0786 28.1321 -2.08781 36.4883 6.23731L36.5273 6.19922L36.5557 6.22754Z" fill="#EDEDED"/>
                </svg>
                <Transition name="heart-pop">
                  <svg v-if="n <= health" :key="'full'" class="heart active heart-full" xmlns="http://www.w3.org/2000/svg" width="74" height="64" viewBox="0 0 74 64" fill="none">
                    <path d="M36.5557 6.22754C44.9126 -2.08832 58.4283 -2.07549 66.7695 6.26563C75.1235 14.6196 75.1235 28.1636 66.7695 36.5176C66.4639 36.8232 66.1501 37.1162 65.8311 37.3994L42.1836 61.0469C39.0594 64.171 33.9943 64.171 30.8701 61.0469L7.3584 37.5361C6.98556 37.2114 6.62053 36.8725 6.26562 36.5176C-2.08832 28.1636 -2.08832 14.6196 6.26562 6.26563C14.61 -2.0786 28.1321 -2.08781 36.4883 6.23731L36.5273 6.19922L36.5557 6.22754Z" fill="#E73228"/>
                    <circle cx="13.7715" cy="13.499" r="4.3524" transform="rotate(45 13.7715 13.499)" fill="white" fill-opacity="0.25"/>
                  </svg>
                </Transition>
              </span>
            </div>
          </div>
        </div>
        <div class="powerup-container" v-if="activePowerUp">
          <div class="powerup-icon">
            <img v-if="activePowerUp === 'freeze'" src="/assets/powerUps/freeze.png" alt="Freeze" />
            <img v-if="activePowerUp === 'shield'" src="/assets/powerUps/shield.png" alt="Shield" />
          </div>
          <div class="powerup-progress">
            <div class="powerup-bar" :style="{ width: (powerUpProgress * 100) + '%' }">
              <div class="powerup-bar-highlight"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';
import { EventBus } from '../EventBus';
import { SFEER_COLORS } from '../utils/sfeerLabels';
import { sfeerProgress } from '../utils/sfeerProgressStore';
const health = ref(3);
const sfeerText = ref('TROPOSFEER');
const sfeerIndex = ref(0);
const visible = ref(true);
const timerText = ref('0:00');
const activePowerUp = ref<string | null>(null);
const powerUpProgress = ref(0);
const showTimerUpdate = ref(false);
function hideGameUI() {
  visible.value = false;
}
function showGameUI() {
  visible.value = true;
}

function updateHealth(newHealth: number) {
  health.value = newHealth;
}

function updateSfeer(text: string) {
  sfeerText.value = text;
}

function updateSfeerIndex(idx: number) {
  if (typeof idx === 'number' && idx >= 0 && idx <= 4) {
    sfeerIndex.value = idx;
    // console.log('Sfeer index updated to', sfeerIndex.value);
  }
}


function updateSfeerProgress(progress: number) {
  if (typeof progress === 'number') {
    sfeerProgress.value = Math.max(0, Math.min(1, progress));
    // console.log('Sfeer progress updated to', sfeerProgress.value);
  }
}

function updateTimer(time: string) {
  timerText.value = time;
}

function updateTimerBonus() {
  showTimerUpdate.value = true;
  setTimeout(() => {
    showTimerUpdate.value = false;
  }, 2000);
}

function updatePowerUp(powerUp: string | null) {
  activePowerUp.value = powerUp;
  if (powerUp) {
    // Start progress countdown
    powerUpProgress.value = 1;
    const startTime = Date.now();
    const duration = 10000; // 10 seconds
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      powerUpProgress.value = Math.max(0, 1 - (elapsed / duration));
      
      if (powerUpProgress.value > 0 && activePowerUp.value === powerUp) {
        requestAnimationFrame(updateProgress);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }
}

onMounted(() => {
  EventBus.on('hide-gameui', hideGameUI);
  EventBus.on('show-gameui', showGameUI);
  EventBus.on('update-health', updateHealth);
  EventBus.on('update-sfeer', updateSfeer);
  EventBus.on('update-sfeer-index', updateSfeerIndex);
  EventBus.on('update-sfeer-progress', updateSfeerProgress);
  EventBus.on('update-timer', updateTimer);
  EventBus.on('timer-update', updateTimerBonus);
  EventBus.on('update-powerup', updatePowerUp);
});

onUnmounted(() => {
  EventBus.off('hide-gameui', hideGameUI);
  EventBus.off('show-gameui', showGameUI);
  EventBus.off('update-health', updateHealth);
  EventBus.off('update-sfeer', updateSfeer);
  EventBus.off('update-sfeer-index', updateSfeerIndex);
  EventBus.off('update-sfeer-progress', updateSfeerProgress);
  EventBus.off('update-timer', updateTimer);
  EventBus.off('timer-update', updateTimerBonus);
  EventBus.off('update-powerup', updatePowerUp);
});
</script>

<style scoped>
.game-ui-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  pointer-events: none;
  z-index: 20;
}

.game-ui {
  margin-top: 48px;
  margin-left: 48px;
  margin-right: 72px;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: start;
  width: 100%;
  pointer-events: auto;
  z-index: 10;
}

.left-ui {
  display: flex;
  flex-direction: column;
  gap: 48px;
}
.right-ui {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 48px;
}

.sfeer-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  /* border: 6px solid #2E3A6A; */
  /* box-shadow: 10px 10px 0 0 rgba(0, 0, 0, 0.25); */
  /* box-shadow: 10px 10px 0 0 #2E3A6A; */
  border-radius: 16px;
  height: 110px;
  min-width: 450px;
  /* margin-right: 32px; */
  padding-left: 32px;
  position: relative;
}

.sfeer-circle-outer {
  width: 140px;
  height: 140px;
  background: #fff;
  border: 12px solid #2E3A6A;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -32px;
  margin-right: 8px;
  z-index: 1;
}

.sfeer-circle-inner {
  width: 100px;
  height: 100px;
  background: #ffffff25;
  /* border: 3px solid #2E3A6A; */
  border-radius: 50%;
}

.sfeer-label-text {
  font-family: 'Bungee', 'Arial Black', Arial, sans-serif;
  font-size: 48px;
  color: #fff;
  font-weight: bold;
  margin-left: 12px;
  margin-right: 24px;
  z-index: 2;
  text-align: center;
  flex: 1;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 16px;
/* height: 65px; */
  /* justify-content: center; */
}

.timer {
  display: inline-flex;
padding: 16px 32px;
align-items: center;
gap: 24px;
border-radius: 32px;
background: #fff;
display: flex;
min-width: 240px;
height: 65px;
}

.timer p {
  font-family: 'Bungee', 'Arial Black', Arial, sans-serif;
  font-size: 48px;
font-style: normal;
font-weight: 400;
line-height: normal;
min-width: 120px;
text-align: left;
}
.timer-update {
font-family: Bungee;
font-size: 48px;
font-style: normal;
font-weight: 400;
line-height: normal;
margin: 0;
}

/* Timer bonus animation */
.timer-bonus-enter-active {
  animation: timer-bonus-in 0.3s ease-out;
}

.timer-bonus-leave-active {
  animation: timer-bonus-out 0.5s ease-in;
}

@keyframes timer-bonus-in {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes timer-bonus-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
}

/* Heart animation */
.heart-pop-enter-active {
  animation: heart-pop-in 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.heart-pop-leave-active {
  animation: heart-pop-out 0.3s ease-in;
}

.heart-pop-move {
  transition: transform 0.3s ease;
}

@keyframes heart-pop-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes heart-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

.healthbar {
  position: relative;
  width: 330px;
  height: 110px;
  /* margin-right: 64px; */
  transform-origin: top right;
}

.healthbar-bg {
  width: 100%;
  height: 100%;
  background: #fff;
  /* border: 6px solid #2E3A6A; */
  border-radius: 16px;
  /* box-shadow: 10px 10px 0 0 rgba(0, 0, 0, 0.25); */
  display: flex;
  align-items: center;
  justify-content: center;
}

.hearts {
  display: flex;
  /* padding: 0 16px; */
  gap: 24px;
  /* padding: 24px 32px;  */
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.heart-slot {
  position: relative;
  width: 74px;
  height: 64px;
}

.heart {
  /* width: 55px; */
  height: auto;
  opacity: 1;
  transition: opacity 0.2s;
}

.heart-empty {
  position: absolute;
  top: 0;
  left: 0;
}

.heart-full {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.heart.active {
  opacity: 1;
}


.sfeer-progress-outer {
  position: absolute;
  display: flex;
  height: 800px;
  min-width: 80px;
  top: 470px;
  left: 64px;
  background: #fff;
  border-radius: 80px;
}

.sfeer-progress-bar {
  position: absolute;
  left: 16px;
  bottom: 16px;
  width: 48px;
  background: #008049;
  border-radius: 100px;
  z-index: 1;
  transition: height 0.6s cubic-bezier(.4, 1.4, .6, 1);
}

.sfeer-progress-highlight {
  position: absolute;
  left: 8px;
  bottom: 16px;
  width: 8px;
  
  background: rgba(255, 255, 255, 0.25);
  /* background: red; */
  border-radius: 100px;
  z-index: 1;
  border-radius: 25px;
  height: calc(100% - 40px);
}

.powerup-container {
  display: inline-flex;
  width: 325px;
  height: 80px;
  align-items: center;
  gap: 24px;
  border-radius: 80px;
  background: #fff;
  padding: 16px 32px;
  position: relative;
}

.powerup-icon {
  width: 48px;
  height: 48px;
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.powerup-icon img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.powerup-progress {
  border-radius: 80px;
  background: #EDEDED;
  width: 100%;
  height: 40px;
  position: relative;
}

.powerup-bar {
  position: relative;
  background: #26B31F;
  border-radius: 100px;
  height: 100%;
  transition: width 0.6s cubic-bezier(.4, 1.4, .6, 1);
}

.powerup-bar-highlight {
  position: absolute;
  top: 8px;
  left: 16px;
  width: calc(100% - 40px);
  height: 8px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 25px;
}

.sfeer-progress-alien {
  position: absolute;
  bottom: 0;
  left: 50%;
  
  /* right: 50%; */
  background: #fff;
  border-radius: 16px;
  transform: translateX(-50%);
  width: 112px;
  height: 112px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
