<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  fontScale: number
  pageMode: 'scroll' | 'flip'
  isDark: boolean
  hasPrev: boolean
  hasNext: boolean
}>()

const emit = defineEmits<{
  fontDown: []
  fontUp: []
  setPageMode: [mode: 'scroll' | 'flip']
  toggleTheme: [event: MouseEvent]
  prevChapter: []
  nextChapter: []
}>()
</script>

<template>
  <div class="toolbar">
    <div class="tool-font">
      <button class="font-btn" @click="emit('fontDown')" aria-label="縮小字級">A-</button>
      <span class="font-val">{{ fontScale }}%</span>
      <button class="font-btn" @click="emit('fontUp')" aria-label="放大字級">A+</button>
    </div>

    <button
      class="theme-switch"
      :class="{ light: !isDark }"
      role="switch"
      :aria-checked="!isDark"
      aria-label="切換深淺色"
      @click="emit('toggleTheme', $event)"
    >
      <span class="ts-icon ts-sun">☀</span>
      <span class="ts-knob"></span>
      <span class="ts-icon ts-moon">☾</span>
    </button>

    <div class="tool-mode">
      <button :class="{ active: pageMode === 'flip' }" @click="emit('setPageMode', 'flip')">翻頁</button>
      <button :class="{ active: pageMode === 'scroll' }" @click="emit('setPageMode', 'scroll')">滑動</button>
    </div>

    <div class="tool-nav">
      <button class="nav-btn" :disabled="!hasPrev" @click="emit('prevChapter')">
        <ChevronLeft :size="16" /> 上一章
      </button>
      <button class="nav-btn primary" :disabled="!hasNext" @click="emit('nextChapter')">
        下一章 <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 22px;
  padding: 10px 22px;
  background: rgba(20, 14, 8, 0.16);
  border: 1px solid rgba(184,138,59,0.28);
  border-radius: 40px;
  backdrop-filter: blur(3px);
  z-index: 25;
}
[data-theme='light'] .toolbar { background: rgba(120, 92, 48, 0.10); }

.tool-font { display: flex; align-items: center; gap: 12px; }
.font-btn { background: transparent; border: none; color: var(--coffee); font-family: var(--font-title); font-size: 19px; font-weight: 700; cursor: pointer; transition: color 0.2s; }
[data-theme='dark'] .font-btn { color: #cda869; }
.font-btn:hover { color: var(--fire); }
[data-theme='dark'] .font-btn:hover { color: #f0d89a; }
.font-val { color: var(--coffee); font-size: 14px; min-width: 46px; text-align: center; }
[data-theme='dark'] .font-val { color: #e8d4a8; }

.theme-switch {
  position: relative; width: 64px; height: 28px; border-radius: 16px;
  border: 1px solid rgba(184,138,59,0.5);
  background: #2a1f12;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 7px; cursor: pointer; transition: background 0.3s;
}
.theme-switch.light { background: #d8b982; }
.ts-icon { font-size: 13px; line-height: 1; z-index: 1; }
.ts-sun { color: #e8c987; }
.ts-moon { color: #6b4f2a; }
.theme-switch.light .ts-sun { color: #8a5a2b; }
.theme-switch.light .ts-moon { color: #b89a6a; }
.ts-knob {
  position: absolute; top: 50%; left: 4px; transform: translateY(-50%);
  width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(160deg, #f0d89a, #b88a3b);
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
}
.theme-switch.light .ts-knob { left: 40px; }

.tool-mode { display: flex; border: 1px solid rgba(184,138,59,0.45); border-radius: 8px; overflow: hidden; }
.tool-mode button { background: transparent; border: none; padding: 7px 15px; color: var(--coffee); font-family: var(--font-body); font-size: 14px; cursor: pointer; transition: all 0.2s; }
[data-theme='dark'] .tool-mode button { color: #a98c5e; }
.tool-mode button.active { background: rgba(184,138,59,0.3); color: var(--ink); }
[data-theme='dark'] .tool-mode button.active { color: #f3e2b3; }

.tool-nav { display: flex; gap: 10px; }
.nav-btn { display: flex; align-items: center; gap: 4px; background: transparent; border: 1px solid rgba(184,138,59,0.5); border-radius: 8px; padding: 7px 16px; color: var(--coffee); font-family: var(--font-body); font-size: 14px; cursor: pointer; transition: all 0.2s; }
[data-theme='dark'] .nav-btn { color: #cda869; }
.nav-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--fire); }
[data-theme='dark'] .nav-btn:hover:not(:disabled) { color: #f0d89a; }
.nav-btn.primary { background: linear-gradient(180deg, #3a1f14, #2a160d); border-color: var(--fire); color: #f0d89a; }
.nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

@media (max-width: 768px) {
  .toolbar { gap: 12px; padding: 8px 14px; flex-wrap: wrap; max-width: 92vw; justify-content: center; }
}
</style>
