/**
 * Data type definitions for binary data parsing
 */
export const DATA_TYPES = {
  int8: { name: 'int8', size: 1, signed: true },
  uint8: { name: 'uint8', size: 1, signed: false },
  int16: { name: 'int16', size: 2, signed: true },
  uint16: { name: 'uint16', size: 2, signed: false },
  int32: { name: 'int32', size: 4, signed: true },
  uint32: { name: 'uint32', size: 4, signed: false },
  int64: { name: 'int64', size: 8, signed: true },
  uint64: { name: 'uint64', size: 8, signed: false },
  float16: { name: 'float16', size: 2, float: true },
  float32: { name: 'float32', size: 4, float: true },
  float64: { name: 'float64', size: 8, float: true },
}

/**
 * Convert float16 (half precision) to float32
 * @param {number} h - 16-bit integer representing float16
 * @returns {number} - float32 value
 */
function float16ToFloat32(h) {
  const sign = (h >> 15) & 0x1
  const exponent = (h >> 10) & 0x1f
  const mantissa = h & 0x3ff

  if (exponent === 0) {
    if (mantissa === 0) {
      return sign ? -0 : 0
    }
    // Subnormal number
    const value = mantissa / 1024 * Math.pow(2, -14)
    return sign ? -value : value
  } else if (exponent === 31) {
    if (mantissa === 0) {
      return sign ? -Infinity : Infinity
    }
    return NaN
  }

  const value = (1 + mantissa / 1024) * Math.pow(2, exponent - 15)
  return sign ? -value : value
}

/**
 * Parse binary data based on the specified data type
 * @param {ArrayBuffer} buffer - The binary data buffer
 * @param {string} dataType - The data type to parse as
 * @returns {number[]} - Array of parsed numbers
 */
export function parseData(buffer, dataType) {
  const typeInfo = DATA_TYPES[dataType]
  if (!typeInfo) {
    throw new Error(`Unknown data type: ${dataType}`)
  }

  const dataView = new DataView(buffer)
  const elementCount = Math.floor(buffer.byteLength / typeInfo.size)
  const result = []

  for (let i = 0; i < elementCount; i++) {
    const offset = i * typeInfo.size
    let value

    switch (dataType) {
      case 'int8':
        value = dataView.getInt8(offset)
        break
      case 'uint8':
        value = dataView.getUint8(offset)
        break
      case 'int16':
        value = dataView.getInt16(offset, true) // little-endian
        break
      case 'uint16':
        value = dataView.getUint16(offset, true)
        break
      case 'int32':
        value = dataView.getInt32(offset, true)
        break
      case 'uint32':
        value = dataView.getUint32(offset, true)
        break
      case 'int64':
        value = Number(dataView.getBigInt64(offset, true))
        break
      case 'uint64':
        value = Number(dataView.getBigUint64(offset, true))
        break
      case 'float16':
        value = float16ToFloat32(dataView.getUint16(offset, true))
        break
      case 'float32':
        value = dataView.getFloat32(offset, true)
        break
      case 'float64':
        value = dataView.getFloat64(offset, true)
        break
      default:
        throw new Error(`Unsupported data type: ${dataType}`)
    }

    result.push(value)
  }

  return result
}

/**
 * Parse shape string into array of dimensions
 * @param {string} shapeStr - Shape string like "2,3,4" or "2x3x4"
 * @returns {number[]} - Array of dimensions
 */
export function parseShape(shapeStr) {
  if (!shapeStr || shapeStr.trim() === '') {
    return null
  }

  const parts = shapeStr
    .trim()
    .split(/[,x×\s]+/)
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n > 0)

  if (parts.length === 0) {
    return null
  }

  return parts
}

/**
 * Reshape flat array to multi-dimensional based on shape
 * @param {number[]} data - Flat array of numbers
 * @param {number[]} shape - Array of dimensions
 * @returns {any} - Multi-dimensional array or original if shape doesn't match
 */
export function reshapeData(data, shape) {
  if (!shape || shape.length === 0) {
    return data
  }

  const totalElements = shape.reduce((a, b) => a * b, 1)
  if (totalElements !== data.length) {
    console.warn(`Shape ${shape.join('x')} requires ${totalElements} elements, but got ${data.length}`)
    return data
  }

  function buildArray(flat, dims, offset = 0) {
    if (dims.length === 1) {
      return flat.slice(offset, offset + dims[0])
    }

    const result = []
    const subSize = dims.slice(1).reduce((a, b) => a * b, 1)

    for (let i = 0; i < dims[0]; i++) {
      result.push(buildArray(flat, dims.slice(1), offset + i * subSize))
    }

    return result
  }

  return buildArray(data, shape)
}

/**
 * Compare two data arrays and return difference information
 * @param {number[]} data1 - First data array
 * @param {number[]} data2 - Second data array
 * @returns {Object} - Comparison results
 */
export function compareData(data1, data2) {
  const maxLength = Math.max(data1.length, data2.length)
  const minLength = Math.min(data1.length, data2.length)
  
  const differences = []
  let totalAbsDiff = 0
  let maxAbsDiff = 0
  let maxRelDiff = 0
  let diffCount = 0

  for (let i = 0; i < maxLength; i++) {
    const val1 = i < data1.length ? data1[i] : undefined
    const val2 = i < data2.length ? data2[i] : undefined
    
    let absDiff = null
    let relDiff = null
    let status = 'match'

    if (val1 === undefined || val2 === undefined) {
      status = 'missing'
      diffCount++
    } else if (Number.isNaN(val1) || Number.isNaN(val2)) {
      if (Number.isNaN(val1) && Number.isNaN(val2)) {
        status = 'match'
      } else {
        status = 'nan'
        diffCount++
      }
    } else if (!Number.isFinite(val1) || !Number.isFinite(val2)) {
      if (val1 === val2) {
        status = 'match'
      } else {
        status = 'inf'
        diffCount++
      }
    } else {
      absDiff = Math.abs(val1 - val2)
      
      if (absDiff > 0) {
        status = 'diff'
        diffCount++
        totalAbsDiff += absDiff
        maxAbsDiff = Math.max(maxAbsDiff, absDiff)
        
        const maxAbs = Math.max(Math.abs(val1), Math.abs(val2))
        if (maxAbs > 0) {
          relDiff = absDiff / maxAbs
          maxRelDiff = Math.max(maxRelDiff, relDiff)
        }
      }
    }

    differences.push({
      index: i,
      value1: val1,
      value2: val2,
      absDiff,
      relDiff,
      status
    })
  }

  return {
    differences,
    summary: {
      totalElements: maxLength,
      matchingElements: maxLength - diffCount,
      differentElements: diffCount,
      lengthMismatch: data1.length !== data2.length,
      file1Length: data1.length,
      file2Length: data2.length,
      totalAbsDiff,
      maxAbsDiff,
      maxRelDiff,
      meanAbsDiff: diffCount > 0 ? totalAbsDiff / diffCount : 0
    }
  }
}

/**
 * Format a number for display with appropriate precision
 * @param {number} value - Number to format
 * @param {number} precision - Number of significant digits
 * @returns {string} - Formatted string
 */
export function formatNumber(value, precision = 6) {
  if (value === undefined || value === null) {
    return '—'
  }
  if (Number.isNaN(value)) {
    return 'NaN'
  }
  if (!Number.isFinite(value)) {
    return value > 0 ? '+Inf' : '-Inf'
  }
  if (value === 0) {
    return '0'
  }
  
  const absVal = Math.abs(value)
  if (absVal >= 1e6 || absVal < 1e-4) {
    return value.toExponential(precision - 1)
  }
  
  return value.toPrecision(precision)
}
