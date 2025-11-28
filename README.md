# Data Compare Web

A Vue 3 + Vite web application for comparing numerical data between two binary files.

## Features

- **Drag & Drop File Upload**: Easily upload two files for comparison
- **Multiple Data Types**: Support for various numerical data types:
  - Integer types: int8, uint8, int16, uint16, int32, uint32, int64, uint64
  - Float types: float16, float32, float64
- **Custom Data Shapes**: Specify tensor/array shapes (e.g., 224,224,3 or 2x3x4)
- **Rich Comparison Results**:
  - Summary statistics (matching, different, missing elements)
  - Maximum and mean absolute differences
  - Maximum relative difference
- **Fancy Visualization**:
  - Detailed table view with pagination
  - Heatmap visualization for quick overview
  - Color-coded difference highlighting

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Upload Files**: Drag and drop two binary files into the upload zones, or click to browse
2. **Select Data Type**: Choose the appropriate numerical data type for your files
3. **Specify Shape** (optional): Enter the data shape if you want multi-dimensional indexing
4. **Compare**: Click the "Compare Data" button to analyze differences
5. **Explore Results**: Toggle between Table View and Heatmap View to analyze differences

## Technology Stack

- Vue 3 (Composition API)
- Vite
- JavaScript (ES6+)

## License

MIT License
