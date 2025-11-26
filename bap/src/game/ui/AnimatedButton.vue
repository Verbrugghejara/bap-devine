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
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <path
                                        d="M16 20.0002L12 16.0002M16 20.0002C17.8624 19.2918 19.6492 18.3985 21.3333 17.3335M16 20.0002V26.6668C16 26.6668 20.04 25.9335 21.3333 24.0002C22.7733 21.8402 21.3333 17.3335 21.3333 17.3335M12 16.0002C12.7095 14.1594 13.6029 12.3949 14.6666 10.7335C16.2202 8.24948 18.3835 6.20423 20.9506 4.79229C23.5178 3.38035 26.4035 2.64866 29.3333 2.66683C29.3333 6.2935 28.2933 12.6668 21.3333 17.3335M12 16.0002H5.33331C5.33331 16.0002 6.06665 11.9602 7.99998 10.6668C10.16 9.22683 14.6666 10.6668 14.6666 10.6668M5.99998 22.0002C3.99998 23.6802 3.33331 28.6668 3.33331 28.6668C3.33331 28.6668 8.31998 28.0002 9.99998 26.0002C10.9466 24.8802 10.9333 23.1602 9.87998 22.1202C9.36172 21.6255 8.67904 21.3397 7.96295 21.3175C7.24686 21.2954 6.54782 21.5385 5.99998 22.0002Z"
                                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
      </slot>
      <p>{{ text }}</p>
    </div>

    <div class="button-shadow">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <path
                                        d="M16 20.0002L12 16.0002M16 20.0002C17.8624 19.2918 19.6492 18.3985 21.3333 17.3335M16 20.0002V26.6668C16 26.6668 20.04 25.9335 21.3333 24.0002C22.7733 21.8402 21.3333 17.3335 21.3333 17.3335M12 16.0002C12.7095 14.1594 13.6029 12.3949 14.6666 10.7335C16.2202 8.24948 18.3835 6.20423 20.9506 4.79229C23.5178 3.38035 26.4035 2.64866 29.3333 2.66683C29.3333 6.2935 28.2933 12.6668 21.3333 17.3335M12 16.0002H5.33331C5.33331 16.0002 6.06665 11.9602 7.99998 10.6668C10.16 9.22683 14.6666 10.6668 14.6666 10.6668M5.99998 22.0002C3.99998 23.6802 3.33331 28.6668 3.33331 28.6668C3.33331 28.6668 8.31998 28.0002 9.99998 26.0002C10.9466 24.8802 10.9333 23.1602 9.87998 22.1202C9.36172 21.6255 8.67904 21.3397 7.96295 21.3175C7.24686 21.2954 6.54782 21.5385 5.99998 22.0002Z"
                                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
      </slot>
      <p>{{ text }}</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const props = defineProps<{
  text: string,
  onClick?: () => void
}>();
const emit = defineEmits(['click']);

const animating = ref(false);
const animatingUp = ref(false);


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



// Global key handler for Enter/Space
function globalKeyHandler(e: KeyboardEvent) {
  if ((e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space')) {
    handleClick();
  }
}

onMounted(() => {
  window.addEventListener('keydown', globalKeyHandler);
});
onUnmounted(() => {
  window.removeEventListener('keydown', globalKeyHandler);
});
</script>

<style scoped>
.button {
  position: relative;
  outline: none;
}
.button:focus {
  outline: 3px solid #35BBF0;
  outline-offset: 2px;
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
  margin-top: 46px;
}
p {
  margin: 0;
}
</style>
