<template>
  <div class="game-ui-container" v-show="visible">
    <div class="sfeer-progress-outer">
      <!-- <div style="color:#222;font-size:18px;text-align:center;width:100%">Progress: {{ (sfeerProgress * 100).toFixed(1) }}%</div> -->
      <div class="sfeer-progress-bar" :style="{ border: `solid 5px ${SFEER_COLORS[sfeerIndex].e}` }">
        <div class="sfeer-progress-fill"
          :style="{ height: (sfeerProgress * 100) + '%', background: SFEER_COLORS[sfeerIndex].e, transition: 'background 0.1s ease' }">
        </div>
      </div>
    </div>
    <div class="game-ui">
      <div class="sfeer-label" :style="{ border: `solid 4px ${SFEER_COLORS[sfeerIndex].e}` }">
        <div class="sfeer-circle-outer"
          :style="{ background: SFEER_COLORS[sfeerIndex].e, transition: 'background 0.3s' }">
          <div class="sfeer-circle-inner"></div>
        </div>
        <div class="sfeer-label-text" :style="{ color: SFEER_COLORS[sfeerIndex].e }">{{ sfeerText }}</div>
      </div>
      <div class="healthbar">
        <div class="healthbar-bg" :style="{ border: `solid 4px ${SFEER_COLORS[sfeerIndex].e}` }">
          <div class="hearts">
            <span v-for="n in 3" :key="n">
              <svg :class="['heart', { active: n <= health }]" xmlns="http://www.w3.org/2000/svg" width="58" height="47" viewBox="0 0 58 47" fill="none">
                <g filter="url(#filter0_d_277_1062)">
                  <path
                    d="M27.7886 10.8721C36.0517 1.42605 46.7295 -2.63884 52.6167 1.79395C59.0113 6.609 57.3328 19.6271 48.8677 30.8701C43.2325 38.3544 36.0098 43.1629 29.9243 44.123C23.2096 45.8353 13.5598 40.5733 6.73877 30.9424C-1.1648 19.7828 -2.27668 6.9861 4.25537 2.35938C10.1018 -1.78142 20.0892 2.0263 27.7886 10.8721Z"
                    :fill="SFEER_COLORS[sfeerIndex].e" />
                </g>
                <defs>
                  <filter id="filter0_d_277_1062" x="0" y="0" width="57.4995" height="46.4434"
                    filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha" />
                    <feOffset dx="1" dy="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_277_1062" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_277_1062" result="shape" />
                  </filter>
                </defs>
              </svg>
            </span>
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

onMounted(() => {
  EventBus.on('hide-gameui', hideGameUI);
  EventBus.on('show-gameui', showGameUI);
  EventBus.on('update-health', updateHealth);
  EventBus.on('update-sfeer', updateSfeer);
  EventBus.on('update-sfeer-index', updateSfeerIndex);
  EventBus.on('update-sfeer-progress', updateSfeerProgress);
});

onUnmounted(() => {
  EventBus.off('hide-gameui', hideGameUI);
  EventBus.off('show-gameui', showGameUI);
  EventBus.off('update-health', updateHealth);
  EventBus.off('update-sfeer', updateSfeer);
  EventBus.off('update-sfeer-index', updateSfeerIndex);
  EventBus.off('update-sfeer-progress', updateSfeerProgress);
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
  align-items: center;
  width: 100%;
  pointer-events: auto;
  z-index: 10;
}

.sfeer-label {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #00000010;
  /* border: 6px solid #2E3A6A; */
  box-shadow: 10px 10px 0 0 rgba(0, 0, 0, 0.25);
  /* box-shadow: 10px 10px 0 0 #2E3A6A; */
  border-radius: 16px;
  height: 80px;
  min-width: 220px;
  margin-right: 32px;
  padding-left: 0;
  position: relative;
}

.sfeer-circle-outer {
  width: 125px;
  height: 125px;
  /* background: #B4C5FF; */
  /* border: 6px solid #2E3A6A; */
  border-radius: 50%;
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
  font-size: 36px;
  color: #fff;
  font-weight: bold;
  margin-left: 12px;
  margin-right: 24px;
  z-index: 2;
  text-align: center;
  flex: 1;
}

.healthbar {
  position: relative;
  width: 240px;
  height: 80px;
  /* margin-right: 64px; */
  transform-origin: top right;
}

.healthbar-bg {
  width: 100%;
  height: 100%;
  background: #00000010;
  /* border: 6px solid #2E3A6A; */
  border-radius: 16px;
  box-shadow: 10px 10px 0 0 rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hearts {
  display: flex;
  padding: 0 50px;
  gap: 12px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.heart {
  width: 55px;
  height: auto;
  margin: 0 9px;
  filter: grayscale(1) brightness(1.5);
  opacity: 0;
  transition: filter 0.2s, opacity 0.2s;
}



.heart.active {
  filter: none;
  opacity: 1;
}


.sfeer-progress-outer {
  position: absolute;
  display: flex;
  align-items: center;
  height: 100vh;
  min-width: 80px;
  justify-content: flex-start;
  pointer-events: none;
}

.sfeer-progress-bar {
  position: relative;
  width: 32px;
  height: 400px;
  background: #00000010;
  border-radius: 24px;
  margin-left: 24px;
  margin-right: 32px;
  box-shadow: 5px 5px 0 0 rgba(0, 0, 0, 0.25);
  /* border: 4px solid #2E3A6A; */
  overflow: hidden;
}

.sfeer-progress-fill {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  /* background: #4f8cff; */
  border-radius: 0 0 24px 24px;
  z-index: 1;
  transition: height 0.6s cubic-bezier(.4, 1.4, .6, 1);
}
</style>
