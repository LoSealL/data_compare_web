<template>
  <div class="heatmap-view">
    <div class="heatmap-header">
      <h3>🔥 Difference Heatmap</h3>
      <div class="legend">
        <span class="legend-item">
          <span class="legend-color match"></span>
          Match
        </span>
        <span class="legend-item">
          <span class="legend-color low"></span>
          Low Diff
        </span>
        <span class="legend-item">
          <span class="legend-color medium"></span>
          Med Diff
        </span>
        <span class="legend-item">
          <span class="legend-color high"></span>
          High Diff
        </span>
        <span class="legend-item">
          <span class="legend-color error"></span>
          Error/Missing
        </span>
      </div>
    </div>
    
    <div class="heatmap-container" ref="heatmapContainer">
      <div class="heatmap-scroll">
        <div 
          class="heatmap-grid" 
          :style="gridStyle"
        >
          <div
            v-for="cell in visibleCells"
            :key="cell.index"
            class="heatmap-cell"
            :class="getCellClass(cell)"
            :style="getCellStyle(cell)"
            :title="getCellTooltip(cell)"
          ></div>
        </div>
      </div>
    </div>
    
    <div class="heatmap-info">
      <span>Displaying {{ displayedCount.toLocaleString() }} of {{ differences.length.toLocaleString() }} elements</span>
      <span v-if="maxDiff > 0">Max difference: {{ formatNumber(maxDiff) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, onMounted, onUnmounted } from 'vue'
import { formatNumber } from '../utils/dataParser'

const props = defineProps({
  differences: {
    type: Array,
    required: true
  },
  shape: {
    type: Array,
    default: null
  }
})

const heatmapContainer = ref(null)
const containerWidth = ref(800)
// Limit cells for performance - displaying more cells can cause browser slowdown
// This limit provides good visualization while maintaining responsiveness
const maxCells = 10000

onMounted(() => {
  updateContainerWidth()
  window.addEventListener('resize', updateContainerWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerWidth)
})

function updateContainerWidth() {
  if (heatmapContainer.value) {
    containerWidth.value = heatmapContainer.value.offsetWidth
  }
}

const gridDimensions = computed(() => {
  const total = Math.min(props.differences.length, maxCells)
  
  if (props.shape && props.shape.length >= 2) {
    // Use first two dimensions if available
    const rows = props.shape[0]
    const cols = props.shape.length > 1 ? props.shape[1] : 1
    const depth = props.shape.slice(2).reduce((a, b) => a * b, 1)
    return { rows: rows * depth, cols }
  }
  
  // Calculate optimal square-ish grid
  const cols = Math.ceil(Math.sqrt(total * 1.5))
  const rows = Math.ceil(total / cols)
  return { rows, cols }
})

const cellSize = computed(() => {
  const maxWidth = containerWidth.value - 40
  const size = Math.max(4, Math.min(20, Math.floor(maxWidth / gridDimensions.value.cols)))
  return size
})

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${gridDimensions.value.cols}, ${cellSize.value}px)`,
  gap: '1px'
}))

const visibleCells = computed(() => {
  return props.differences.slice(0, maxCells)
})

const displayedCount = computed(() => {
  return Math.min(props.differences.length, maxCells)
})

const maxDiff = computed(() => {
  let max = 0
  for (const d of props.differences) {
    if (d.absDiff !== null && d.absDiff > max) {
      max = d.absDiff
    }
  }
  return max
})

function getCellClass(cell) {
  if (cell.status === 'missing' || cell.status === 'nan' || cell.status === 'inf') {
    return 'error'
  }
  if (cell.status === 'match' || cell.absDiff === 0) {
    return 'match'
  }
  
  const ratio = maxDiff.value > 0 ? cell.absDiff / maxDiff.value : 0
  if (ratio < 0.1) return 'low'
  if (ratio < 0.5) return 'medium'
  return 'high'
}

function getCellStyle() {
  return {
    width: cellSize.value + 'px',
    height: cellSize.value + 'px'
  }
}

function getCellTooltip(cell) {
  const lines = [
    `Index: ${cell.index}`,
    `File 1: ${formatNumber(cell.value1)}`,
    `File 2: ${formatNumber(cell.value2)}`
  ]
  
  if (cell.absDiff !== null) {
    lines.push(`Abs Diff: ${formatNumber(cell.absDiff)}`)
  }
  
  lines.push(`Status: ${cell.status}`)
  
  return lines.join('\n')
}
</script>

<style scoped>
.heatmap-view {
  background-color: rgba(26, 32, 44, 0.6);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(74, 85, 104, 0.3);
}

.heatmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: rgba(26, 32, 44, 0.4);
  border-bottom: 1px solid rgba(74, 85, 104, 0.3);
  flex-wrap: wrap;
  gap: 12px;
}

.heatmap-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary, #e2e8f0);
}

.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary, #a0aec0);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.match {
  background-color: #48bb78;
}

.legend-color.low {
  background-color: #68d391;
}

.legend-color.medium {
  background-color: #f6ad55;
}

.legend-color.high {
  background-color: #fc8181;
}

.legend-color.error {
  background-color: #e53e3e;
}

.heatmap-container {
  padding: 20px;
}

.heatmap-scroll {
  overflow: auto;
  max-height: 400px;
}

.heatmap-grid {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px;
  border-radius: 4px;
}

.heatmap-cell {
  border-radius: 1px;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.heatmap-cell:hover {
  transform: scale(1.5);
  z-index: 10;
  position: relative;
}

.heatmap-cell.match {
  background-color: #48bb78;
}

.heatmap-cell.low {
  background-color: #9ae6b4;
}

.heatmap-cell.medium {
  background-color: #f6ad55;
}

.heatmap-cell.high {
  background-color: #fc8181;
}

.heatmap-cell.error {
  background-color: #e53e3e;
}

.heatmap-info {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: rgba(26, 32, 44, 0.4);
  border-top: 1px solid rgba(74, 85, 104, 0.3);
  font-size: 12px;
  color: var(--text-secondary, #a0aec0);
}
</style>
