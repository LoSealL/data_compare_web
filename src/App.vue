<script setup>
import { ref, computed } from 'vue'
import FileDropZone from './components/FileDropZone.vue'
import DataSettings from './components/DataSettings.vue'
import ComparisonSummary from './components/ComparisonSummary.vue'
import DifferenceTable from './components/DifferenceTable.vue'
import DifferenceHeatmap from './components/DifferenceHeatmap.vue'
import { parseData, parseShape, compareData, DATA_TYPES } from './utils/dataParser'

// File state
const file1 = ref(null)
const file2 = ref(null)
const file1Buffer = ref(null)
const file2Buffer = ref(null)

// Settings
const dataType = ref('float32')
const dataShape = ref('')

// Results
const comparisonResult = ref(null)
const isComparing = ref(false)
const error = ref(null)

// Parsed shape
const parsedShape = computed(() => parseShape(dataShape.value))

// Check if we can compare
const canCompare = computed(() => {
  return file1Buffer.value && file2Buffer.value && !isComparing.value
})

// File handlers
async function handleFile1Selected(file) {
  file1.value = file
  file1Buffer.value = await file.arrayBuffer()
  comparisonResult.value = null
  error.value = null
}

async function handleFile2Selected(file) {
  file2.value = file
  file2Buffer.value = await file.arrayBuffer()
  comparisonResult.value = null
  error.value = null
}

function handleFile1Removed() {
  file1.value = null
  file1Buffer.value = null
  comparisonResult.value = null
  error.value = null
}

function handleFile2Removed() {
  file2.value = null
  file2Buffer.value = null
  comparisonResult.value = null
  error.value = null
}

// Compare data
async function compareFiles() {
  if (!canCompare.value) return

  isComparing.value = true
  error.value = null

  try {
    // Parse data from both files
    const data1 = parseData(file1Buffer.value, dataType.value)
    const data2 = parseData(file2Buffer.value, dataType.value)

    // Compare the data
    const result = compareData(data1, data2)
    comparisonResult.value = result
  } catch (e) {
    error.value = e.message
    comparisonResult.value = null
  } finally {
    isComparing.value = false
  }
}

// View toggle
const activeView = ref('table')
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>📊 Data Compare Web</h1>
      <p class="subtitle">Compare numerical data between two binary files</p>
    </header>

    <main class="app-main">
      <!-- File Upload Section -->
      <section class="section file-section">
        <h2>📁 Upload Files</h2>
        <div class="file-drop-grid">
          <FileDropZone
            label="File 1 (Reference)"
            :file="file1"
            @file-selected="handleFile1Selected"
            @file-removed="handleFile1Removed"
          />
          <FileDropZone
            label="File 2 (Compare)"
            :file="file2"
            @file-selected="handleFile2Selected"
            @file-removed="handleFile2Removed"
          />
        </div>
      </section>

      <!-- Data Settings Section -->
      <section class="section settings-section">
        <h2>⚙️ Data Settings</h2>
        <DataSettings
          v-model:dataType="dataType"
          v-model:dataShape="dataShape"
        />
        
        <div class="shape-preview" v-if="parsedShape">
          <span class="shape-label">Interpreted shape:</span>
          <code>{{ parsedShape.join(' × ') }}</code>
          <span class="shape-elements">
            ({{ parsedShape.reduce((a, b) => a * b, 1).toLocaleString() }} elements)
          </span>
        </div>
      </section>

      <!-- Compare Button -->
      <section class="section compare-section">
        <button 
          class="compare-btn"
          :disabled="!canCompare"
          @click="compareFiles"
        >
          <span v-if="isComparing">⏳ Comparing...</span>
          <span v-else>🔍 Compare Data</span>
        </button>
        
        <p class="compare-hint" v-if="!file1 || !file2">
          Upload two files to compare
        </p>
      </section>

      <!-- Error Display -->
      <div class="error-message" v-if="error">
        <strong>⚠️ Error:</strong> {{ error }}
      </div>

      <!-- Results Section -->
      <section class="section results-section" v-if="comparisonResult">
        <ComparisonSummary :summary="comparisonResult.summary" />

        <!-- View Toggle -->
        <div class="view-toggle">
          <button 
            :class="{ active: activeView === 'table' }"
            @click="activeView = 'table'"
          >
            📋 Table View
          </button>
          <button 
            :class="{ active: activeView === 'heatmap' }"
            @click="activeView = 'heatmap'"
          >
            🔥 Heatmap View
          </button>
        </div>

        <!-- Difference Views -->
        <DifferenceTable 
          v-if="activeView === 'table'"
          :differences="comparisonResult.differences"
          :shape="parsedShape"
        />
        
        <DifferenceHeatmap
          v-if="activeView === 'heatmap'"
          :differences="comparisonResult.differences"
          :shape="parsedShape"
        />
      </section>
    </main>

    <footer class="app-footer">
      <p>Built with Vue 3 + Vite</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  padding: 40px 20px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 12px 0 0;
  color: var(--text-secondary, #a0aec0);
  font-size: 1.1rem;
}

.app-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  width: 100%;
  box-sizing: border-box;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  margin: 0 0 16px;
  font-size: 1.2rem;
  color: var(--text-primary, #e2e8f0);
}

.file-drop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.settings-section {
  background-color: rgba(26, 32, 44, 0.4);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(74, 85, 104, 0.3);
}

.shape-preview {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.shape-label {
  color: var(--text-secondary, #a0aec0);
  margin-right: 8px;
}

.shape-preview code {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #667eea;
  font-weight: 500;
}

.shape-elements {
  color: var(--text-secondary, #a0aec0);
  margin-left: 8px;
}

.compare-section {
  text-align: center;
}

.compare-btn {
  padding: 16px 48px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.compare-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.compare-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.compare-hint {
  margin-top: 12px;
  color: var(--text-secondary, #a0aec0);
  font-size: 14px;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #fc8181;
}

.results-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.view-toggle {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.view-toggle button {
  padding: 12px 24px;
  border: 1px solid rgba(74, 85, 104, 0.5);
  border-radius: 8px;
  background-color: rgba(26, 32, 44, 0.6);
  color: var(--text-secondary, #a0aec0);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle button:hover {
  border-color: #667eea;
  color: var(--text-primary, #e2e8f0);
}

.view-toggle button.active {
  background-color: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  color: #667eea;
}

.app-footer {
  text-align: center;
  padding: 24px;
  color: var(--text-secondary, #a0aec0);
  font-size: 14px;
  border-top: 1px solid rgba(74, 85, 104, 0.2);
}
</style>
