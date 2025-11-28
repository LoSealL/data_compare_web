<template>
  <div class="difference-table">
    <div class="table-header">
      <h3>📋 Data Comparison Details</h3>
      <div class="controls">
        <label class="filter-toggle">
          <input 
            type="checkbox" 
            v-model="showOnlyDifferences"
          />
          Show only differences
        </label>
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredData.length }}
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="col-index">Index</th>
            <th class="col-value">File 1</th>
            <th class="col-value">File 2</th>
            <th class="col-diff">Abs Diff</th>
            <th class="col-diff">Rel Diff</th>
            <th class="col-status">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in paginatedData" 
            :key="item.index"
            :class="getRowClass(item.status)"
          >
            <td class="col-index">{{ formatIndex(item.index) }}</td>
            <td class="col-value mono">{{ formatValue(item.value1) }}</td>
            <td class="col-value mono">{{ formatValue(item.value2) }}</td>
            <td class="col-diff mono">{{ formatDiff(item.absDiff) }}</td>
            <td class="col-diff mono">{{ formatRelDiff(item.relDiff) }}</td>
            <td class="col-status">
              <span class="status-badge" :class="item.status">
                {{ getStatusLabel(item.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pagination">
      <button 
        @click="currentPage = 1" 
        :disabled="currentPage === 1"
        title="First page"
      >
        ⏮
      </button>
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        title="Previous page"
      >
        ◀
      </button>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        title="Next page"
      >
        ▶
      </button>
      <button 
        @click="currentPage = totalPages" 
        :disabled="currentPage === totalPages"
        title="Last page"
      >
        ⏭
      </button>
      
      <select v-model="pageSize" class="page-size-select">
        <option :value="25">25 per page</option>
        <option :value="50">50 per page</option>
        <option :value="100">100 per page</option>
        <option :value="500">500 per page</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from 'vue'
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

const showOnlyDifferences = ref(false)
const currentPage = ref(1)
const pageSize = ref(50)

const filteredData = computed(() => {
  if (showOnlyDifferences.value) {
    return props.differences.filter(d => d.status !== 'match')
  }
  return props.differences
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredData.value.length / pageSize.value))
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + pageSize.value, filteredData.value.length)
})

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// Reset to page 1 when filter changes
watch(showOnlyDifferences, () => {
  currentPage.value = 1
})

watch(pageSize, () => {
  currentPage.value = 1
})

function formatIndex(index) {
  if (props.shape && props.shape.length > 1) {
    // Convert flat index to multi-dimensional indices
    const indices = []
    let remaining = index
    for (let i = props.shape.length - 1; i >= 0; i--) {
      indices.unshift(remaining % props.shape[i])
      remaining = Math.floor(remaining / props.shape[i])
    }
    return `[${indices.join(', ')}]`
  }
  return index.toString()
}

function formatValue(value) {
  return formatNumber(value, 8)
}

function formatDiff(diff) {
  if (diff === null || diff === undefined) {
    return '—'
  }
  return formatNumber(diff, 6)
}

function formatRelDiff(relDiff) {
  if (relDiff === null || relDiff === undefined) {
    return '—'
  }
  if (relDiff === 0) {
    return '0%'
  }
  if (relDiff < 0.0001) {
    return '<0.01%'
  }
  return (relDiff * 100).toFixed(4) + '%'
}

function getRowClass(status) {
  return {
    'row-match': status === 'match',
    'row-diff': status === 'diff',
    'row-missing': status === 'missing',
    'row-nan': status === 'nan',
    'row-inf': status === 'inf'
  }
}

function getStatusLabel(status) {
  const labels = {
    match: '✓ Match',
    diff: '≠ Different',
    missing: '⚠ Missing',
    nan: '⚠ NaN',
    inf: '⚠ Infinity'
  }
  return labels[status] || status
}
</script>

<style scoped>
.difference-table {
  background-color: rgba(26, 32, 44, 0.6);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(74, 85, 104, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: rgba(26, 32, 44, 0.4);
  border-bottom: 1px solid rgba(74, 85, 104, 0.3);
  flex-wrap: wrap;
  gap: 12px;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary, #e2e8f0);
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary, #a0aec0);
  cursor: pointer;
}

.filter-toggle input {
  cursor: pointer;
}

.pagination-info {
  font-size: 13px;
  color: var(--text-secondary, #a0aec0);
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  text-align: left;
  padding: 12px 16px;
  background-color: rgba(74, 85, 104, 0.2);
  color: var(--text-secondary, #a0aec0);
  font-weight: 500;
  border-bottom: 1px solid rgba(74, 85, 104, 0.3);
  white-space: nowrap;
}

td {
  padding: 10px 16px;
  border-bottom: 1px solid rgba(74, 85, 104, 0.15);
  color: var(--text-primary, #e2e8f0);
}

.mono {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 12px;
}

.col-index {
  width: 100px;
  color: var(--text-secondary, #a0aec0);
}

.col-value {
  min-width: 140px;
}

.col-diff {
  min-width: 100px;
}

.col-status {
  width: 100px;
}

.row-match {
  background-color: rgba(72, 187, 120, 0.05);
}

.row-diff {
  background-color: rgba(237, 137, 54, 0.1);
}

.row-missing,
.row-nan,
.row-inf {
  background-color: rgba(239, 68, 68, 0.1);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.match {
  background-color: rgba(72, 187, 120, 0.2);
  color: #68d391;
}

.status-badge.diff {
  background-color: rgba(237, 137, 54, 0.2);
  color: #f6ad55;
}

.status-badge.missing,
.status-badge.nan,
.status-badge.inf {
  background-color: rgba(239, 68, 68, 0.2);
  color: #fc8181;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: rgba(26, 32, 44, 0.4);
  border-top: 1px solid rgba(74, 85, 104, 0.3);
  flex-wrap: wrap;
}

.pagination button {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 85, 104, 0.5);
  border-radius: 6px;
  background-color: rgba(26, 32, 44, 0.6);
  color: var(--text-primary, #e2e8f0);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  padding: 0 16px;
  font-size: 13px;
  color: var(--text-secondary, #a0aec0);
}

.page-size-select {
  margin-left: 16px;
  padding: 8px 12px;
  border: 1px solid rgba(74, 85, 104, 0.5);
  border-radius: 6px;
  background-color: rgba(26, 32, 44, 0.6);
  color: var(--text-primary, #e2e8f0);
  font-size: 13px;
  cursor: pointer;
}

.page-size-select:hover {
  border-color: #667eea;
}
</style>
