# VSCO Preset Converter
<img width="2400" height="1532" alt="metaldata_lrc" src="https://github.com/user-attachments/assets/459e4351-d8a3-465e-ac42-6beaed92c272" />

Convert camera-specific VSCO Film presets to work with **any modern raw format** (CR3, ARW, NEF, RAF, etc.) by replacing custom camera profiles with Adobe Standard.

## Why?

VSCO Film presets were built for specific camera models and use custom DCP profiles that don't exist for newer cameras. This tool converts them to use `Adobe Standard` profile, which works universally.

## Quick Start

```bash
# Install dependencies
npm install

# Convert Canon presets for CR3 compatibility
npx tsx scripts/convert_vsco_presets.ts --source data/VSCO_CANON --output data/VSCO_CANON_CR3

# Convert Sony presets for ARW compatibility  
npx tsx scripts/convert_vsco_presets.ts --source data/VSCO_SONY --output data/VSCO_SONY_ARW

# Convert Nikon presets for NEF compatibility
npx tsx scripts/convert_vsco_presets.ts --source data/VSCO_NIKON --output data/VSCO_NIKON_NEF
```

## What It Does

- ✅ Replaces `CameraProfile` with `"Adobe Standard"`
- ✅ Updates `ProcessVersion` to `"11.0"` (Lightroom Classic 2023+)
- ✅ Generates new UUIDs to avoid catalog conflicts
- ✅ Preserves all color grading (curves, HSL, grain, split toning)

## Installation in Lightroom

Copy converted preset folders to:

- **macOS**: `~/Library/Application Support/Adobe/CameraRaw/Settings/`
- **Windows**: `%APPDATA%\Adobe\CameraRaw\Settings\`

Restart Lightroom Classic.

## Requirements

- Node.js 18+
- TypeScript (via `npx tsx`)

## License

MIT
