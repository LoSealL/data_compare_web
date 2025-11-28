<template>
  <div class="data-settings">
    <div class="setting-group">
      <label for="dataType">Data Type</label>
      <select 
        id="dataType" 
        :value="dataType" 
        @change="$emit('update:dataType', $event.target.value)"
      >
        <optgroup label="Integer Types">
          <option value="int8">int8 (8-bit signed)</option>
          <option value="uint8">uint8 (8-bit unsigned)</option>
          <option value="int16">int16 (16-bit signed)</option>
          <option value="uint16">uint16 (16-bit unsigned)</option>
          <option value="int32">int32 (32-bit signed)</option>
          <option value="uint32">uint32 (32-bit unsigned)</option>
          <option value="int64">int64 (64-bit signed)</option>
          <option value="uint64">uint64 (64-bit unsigned)</option>
        </optgroup>
        <optgroup label="Float Types">
          <option value="float16">float16 (half precision)</option>
          <option value="float32">float32 (single precision)</option>
          <option value="float64">float64 (double precision)</option>
        </optgroup>
      </select>
    </div>
    
    <div class="setting-group">
      <label for="dataShape">
        Shape 
        <span class="hint">(optional, e.g., 2,3,4 or 2x3x4)</span>
      </label>
      <input
        id="dataShape"
        type="text"
        :value="dataShape"
        @input="$emit('update:dataShape', $event.target.value)"
        placeholder="e.g., 224,224,3"
      />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  dataType: {
    type: String,
    required: true
  },
  dataShape: {
    type: String,
    default: ''
  }
})

defineEmits(['update:dataType', 'update:dataShape'])
</script>

<style scoped>
.data-settings {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.setting-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #e2e8f0);
}

.setting-group .hint {
  font-weight: normal;
  font-size: 12px;
  color: var(--text-secondary, #a0aec0);
}

.setting-group select,
.setting-group input {
  padding: 10px 14px;
  border: 1px solid #4a5568;
  border-radius: 8px;
  background-color: rgba(26, 32, 44, 0.6);
  color: var(--text-primary, #e2e8f0);
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.setting-group select:hover,
.setting-group input:hover {
  border-color: #667eea;
}

.setting-group select:focus,
.setting-group input:focus {
  border-color: #667eea;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.setting-group select option,
.setting-group select optgroup {
  background-color: #1a202c;
}
</style>
