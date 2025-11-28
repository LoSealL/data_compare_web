<template>
  <div
    class="drop-zone"
    :class="{ 
      'drag-over': isDragOver,
      'has-file': file !== null
    }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
    @click="openFileDialog"
  >
    <input
      type="file"
      ref="fileInput"
      @change="onFileSelect"
      style="display: none"
    />
    
    <div class="drop-zone-content" v-if="!file">
      <div class="drop-icon">📁</div>
      <div class="drop-text">
        <strong>{{ label }}</strong>
        <span>Drag & drop a file here or click to browse</span>
      </div>
    </div>
    
    <div class="file-info" v-else>
      <div class="file-icon">📄</div>
      <div class="file-details">
        <strong class="file-name">{{ file.name }}</strong>
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
      </div>
      <button class="remove-btn" @click.stop="removeFile" title="Remove file">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Drop File Here'
  },
  file: {
    type: [File, null],
    default: null
  }
})

const emit = defineEmits(['file-selected', 'file-removed'])

const isDragOver = ref(false)
const fileInput = ref(null)
let dragCounter = 0

function onDragEnter() {
  dragCounter++
  isDragOver.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter === 0) {
    isDragOver.value = false
  }
}

function onDrop(event) {
  dragCounter = 0
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    emit('file-selected', files[0])
  }
}

function openFileDialog() {
  if (!props.file) {
    fileInput.value?.click()
  }
}

function onFileSelect(event) {
  const files = event.target.files
  if (files.length > 0) {
    emit('file-selected', files[0])
  }
  // Reset input so same file can be selected again
  event.target.value = ''
}

function removeFile() {
  emit('file-removed')
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.drop-zone {
  border: 2px dashed #4a5568;
  border-radius: 12px;
  padding: 24px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(74, 85, 104, 0.1);
}

.drop-zone:hover {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.1);
}

.drop-zone.drag-over {
  border-color: #667eea;
  background-color: rgba(102, 126, 234, 0.2);
  transform: scale(1.02);
}

.drop-zone.has-file {
  border-style: solid;
  border-color: #48bb78;
  background-color: rgba(72, 187, 120, 0.1);
  cursor: default;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.drop-icon {
  font-size: 48px;
}

.drop-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drop-text strong {
  font-size: 16px;
  color: var(--text-primary, #e2e8f0);
}

.drop-text span {
  font-size: 14px;
  color: var(--text-secondary, #a0aec0);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.file-icon {
  font-size: 36px;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  overflow: hidden;
}

.file-name {
  font-size: 14px;
  color: var(--text-primary, #e2e8f0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary, #a0aec0);
}

.remove-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background-color: rgba(239, 68, 68, 0.4);
}
</style>
