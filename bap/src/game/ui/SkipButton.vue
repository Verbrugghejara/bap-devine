<template>
  <div class="button-text fixed-bottom" style="position:relative;align-items:center;" @click="$emit('click')">
    <svg width="32" height="32" style="margin-right:12px;" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" :stroke="color" stroke-width="4" fill="none" opacity="0.2" />
      <circle
        cx="16" cy="16" r="14"
        :stroke="color"
        stroke-width="4"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference - (circumference * progress)"
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.1s linear;"
      />
    </svg>
    <slot>OVERSLAAN</slot>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { closeRotaryClient } from '../utils/rotaryClientSingleton';
const props = defineProps({
  progress: { type: Number, required: true },
  circumference: { type: Number, required: true },
  color: { type: String},
});
</script>

<style scoped>
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
</style>
