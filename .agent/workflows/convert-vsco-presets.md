---
description: Convert VSCO presets to universal camera compatibility (CR3, ARW, etc.)
---

# VSCO Preset Converter Workflow

This workflow converts camera-specific VSCO presets to work with any modern raw format (CR3, ARW, NEF, etc.) by replacing custom camera profiles with Adobe Standard.

## Prerequisites

- Node.js installed
- `tsx` available via npx

## Steps

// turbo

1. Navigate to the metaldata_LRC directory:

```bash
cd /Users/juju/Desktop/2025_11_METALDATA_WORKING/metaldata_LRC
```

2. Run the conversion script with source and output arguments:

```bash
npx tsx scripts/convert_vsco_presets.ts --source <SOURCE_FOLDER> --output <OUTPUT_FOLDER>
```

Example for Canon presets:

```bash
npx tsx scripts/convert_vsco_presets.ts --source data/VSCO_CANON --output data/VSCO_CANON_CR3
```

Example for Sony presets:

```bash
npx tsx scripts/convert_vsco_presets.ts --source data/VSCO_SONY --output data/VSCO_SONY_ARW
```

3. Verify the conversion by checking a sample file:

```bash
head -15 <OUTPUT_FOLDER>/*/~*.lrtemplate | grep CameraProfile
```

4. Install presets in Lightroom:
   - **macOS**: Copy to `~/Library/Application Support/Adobe/CameraRaw/Settings/`
   - **Windows**: Copy to `%APPDATA%\Adobe\CameraRaw\Settings\`

5. Restart Lightroom Classic

## What the Script Does

- Replaces `CameraProfile = "..."` with `CameraProfile = "Adobe Standard"`
- Updates `ProcessVersion` to `"11.0"` for modern Lightroom
- Generates new UUIDs to avoid catalog conflicts
- Preserves all color grading settings (curves, HSL, grain, split toning)
