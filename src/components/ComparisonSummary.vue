<template>
  <div class="comparison-summary">
    <h3>📊 Comparison Summary</h3>
    
    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-icon">📐</div>
        <div class="card-content">
          <span class="card-value">{{ summary.totalElements.toLocaleString() }}</span>
          <span class="card-label">Total Elements</span>
        </div>
      </div>
      
      <div class="summary-card success">
        <div class="card-icon">✓</div>
        <div class="card-content">
          <span class="card-value">{{ summary.matchingElements.toLocaleString() }}</span>
          <span class="card-label">Matching</span>
        </div>
      </div>
      
      <div class="summary-card" :class="{ 'warning': summary.differentElements > 0 }">
        <div class="card-icon">≠</div>
        <div class="card-content">
          <span class="card-value">{{ summary.differentElements.toLocaleString() }}</span>
          <span class="card-label">Different</span>
        </div>
      </div>
      
      <div class="summary-card" :class="{ 'warning': summary.lengthMismatch }">
        <div class="card-icon">📏</div>
        <div class="card-content">
          <span class="card-value" v-if="!summary.lengthMismatch">Match</span>
          <span class="card-value" v-else>Mismatch</span>
          <span class="card-label" v-if="summary.lengthMismatch">
            {{ summary.file1Length }} vs {{ summary.file2Length }}
          </span>
          <span class="card-label" v-else>Length</span>
        </div>
      </div>
    </div>
    
    <div class="metrics-row" v-if="summary.differentElements > 0">
      <div class="metric">
        <span class="metric-label">Max Abs Diff:</span>
        <span class="metric-value">{{ formatNumber(summary.maxAbsDiff) }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Mean Abs Diff (of diffs):</span>
        <span class="metric-value">{{ formatNumber(summary.meanAbsDiff) }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Max Rel Diff:</span>
        <span class="metric-value">{{ formatPercent(summary.maxRelDiff) }}</span>
      </div>
    </div>
    
    <div class="match-indicator" v-if="summary.differentElements === 0">
      <span class="match-badge">🎉 Perfect Match!</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatNumber } from '../utils/dataParser'

defineProps({
  summary: {
    type: Object,
    required: true
  }
})

function formatPercent(value) {
  if (value === 0) return '0%'
  if (value < 0.0001) return '<0.01%'
  return (value * 100).toFixed(4) + '%'
}
</script>

<style scoped>
.comparison-summary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 24px;
}

h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: var(--text-primary, #e2e8f0);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.summary-card {
  background-color: rgba(26, 32, 44, 0.6);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid transparent;
}

.summary-card.success {
  border-color: rgba(72, 187, 120, 0.4);
  background-color: rgba(72, 187, 120, 0.1);
}

.summary-card.warning {
  border-color: rgba(237, 137, 54, 0.4);
  background-color: rgba(237, 137, 54, 0.1);
}

.card-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #e2e8f0);
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary, #a0aec0);
}

.metrics-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: rgba(26, 32, 44, 0.4);
  border-radius: 8px;
  margin-top: 16px;
}

.metric {
  display: flex;
  gap: 8px;
  align-items: center;
}

.metric-label {
  font-size: 13px;
  color: var(--text-secondary, #a0aec0);
}

.metric-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #e2e8f0);
  font-family: 'Monaco', 'Menlo', monospace;
}

.match-indicator {
  text-align: center;
  margin-top: 16px;
}

.match-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.3), rgba(56, 178, 172, 0.3));
  border: 1px solid rgba(72, 187, 120, 0.5);
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #68d391;
}
</style>
