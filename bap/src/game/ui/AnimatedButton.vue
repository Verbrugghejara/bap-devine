<template>
  <div
    class="button"
    tabindex="0"
    role="button"
    :aria-label="text"
    @click="handleClick"
  >
    <div
      class="button-text"
      :class="{ animate: animating, 'animate-up': animatingUp }"
    >
      <slot name="icon">
       <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-3 -3 30 30" fill="none">
  <circle cx="12" cy="12" r="10.5" stroke="white" stroke-width="5"/>
</svg>
      </slot>
      <p>{{ text }}</p>
    </div>

    <div class="button-shadow">
      <slot name="icon">
       <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="-3 -3 30 30" fill="none">
  <circle cx="12" cy="12" r="10.5" stroke="white" stroke-width="5"/>
</svg>
      </slot>
      <p>{{ text }}</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getRotaryClient } from '../utils/rotaryClientSingleton';

const props = defineProps<{
  text: string,
  onClick?: () => void
}>();
const emit = defineEmits(['click']);

const animating = ref(false);
const animatingUp = ref(false);
const rotary = getRotaryClient();
let wasButtonPressed = ref(false);
let buttonCheckEnabled = ref(false);


function handleClick() {
  if (animating.value || animatingUp.value) return;

  animating.value = true; // animate down

  setTimeout(() => {
    animating.value = false;

    // 🔥 Force reflow zodat de browser de state apart registreert
    void document.body.offsetHeight;

    animatingUp.value = true; // animate up
    console.log('Button clicked: down');
    setTimeout(() => {
      animatingUp.value = false;
    console.log('Button clicked: up');
      emit('click');
      props.onClick?.();
    }, 180);
  }, 180);
}

function checkButton() {
  if (!buttonCheckEnabled.value) return;

  const buttonPressed = rotary?.buttonPressed || false;

  // Trigger click alleen bij loslaten (van ingedrukt naar niet-ingedrukt)
  if (!buttonPressed && wasButtonPressed.value) {
    handleClick();
  }
  wasButtonPressed.value = buttonPressed;
}

let intervalId: number | null = null;

// Global key handler for Enter/Space
function globalKeyHandler(e: KeyboardEvent) {
  if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) {
    handleClick();
  }
}

onMounted(() => {
  window.addEventListener('keydown', globalKeyHandler);
  intervalId = window.setInterval(checkButton, 16); // ~60fps

  // Enable button checking pas als knop niet ingedrukt is (anti-accidental resume)
  const waitForRelease = () => {
    if (!(rotary?.buttonPressed)) {
      buttonCheckEnabled.value = true;
    } else {
      setTimeout(waitForRelease, 50);
    }
  };
  waitForRelease();
});
onUnmounted(() => {
  window.removeEventListener('keydown', globalKeyHandler);
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.button {
  position: relative;
  outline: none;
}
.button-text {
  position: absolute;
  bottom: 8px;
  color: #FFF;
  font-family: 'Bungee';
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: inline-flex;
  width: max-content;
  padding: 16px 32px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-radius: 24px;
  background: #FFB703;
  margin-top: 46px;
  transition: bottom 0.18s cubic-bezier(.4, 1.6, .6, 1);
}
.button-text.animate {
  bottom: 0;
}
.button-text.animate-up {
  transition: bottom 0.18s cubic-bezier(.4,1.6,.6,1);
  bottom: 8px;
}
.button-shadow {
  color: #FFF;
  font-family: Bungee;
  font-size: 64px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  display: inline-flex;
  padding: 16px 32px;
  justify-content: center;
  align-items: center;
  gap: 16px;
  border-radius: 24px;
  background: #B68302;
  margin-top: 46px;
}
p {
  margin: 0;
}
</style>
