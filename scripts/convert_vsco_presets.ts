/**
 * VSCO Preset Converter for Universal Camera Compatibility
 * 
 * This script converts VSCO presets to work with any raw format by:
 * 1. Replacing camera-specific profiles with "Adobe Standard"
 * 2. Updating ProcessVersion to 11.0 for modern Lightroom
 * 3. Generating new UUIDs to avoid catalog conflicts
 * 4. Preserving all other settings (curves, HSL, grain, etc.)
 * 
 * Usage:
 *   npx tsx convert_vsco_presets.ts --source <SOURCE_DIR> --output <OUTPUT_DIR>
 *   npx tsx convert_vsco_presets.ts  # Uses defaults for Canon
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Parse CLI arguments
function parseArgs(): { source: string; output: string } {
    const args = process.argv.slice(2);
    let source = path.join(__dirname, '../data/VSCO_CANON');
    let output = path.join(__dirname, '../data/VSCO_CANON_CR3');

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--source' && args[i + 1]) {
            source = path.resolve(args[i + 1]);
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            output = path.resolve(args[i + 1]);
            i++;
        }
    }

    return { source, output };
}

const { source: SOURCE_DIR, output: OUTPUT_DIR } = parseArgs();

interface ConversionStats {
    totalFiles: number;
    convertedFiles: number;
    skippedFiles: number;
    errors: string[];
    profilesReplaced: Map<string, number>;
}

const stats: ConversionStats = {
    totalFiles: 0,
    convertedFiles: 0,
    skippedFiles: 0,
    errors: [],
    profilesReplaced: new Map(),
};

/**
 * Generate a Lightroom-style UUID (uppercase hex without dashes)
 */
function generateLightroomUUID(): string {
    return randomUUID().replace(/-/g, '').toUpperCase();
}

/**
 * Convert a single .lrtemplate file
 */
function convertPreset(sourcePath: string, outputPath: string): boolean {
    try {
        let content = fs.readFileSync(sourcePath, 'utf-8');

        // Extract original profile for statistics
        const profileMatch = content.match(/CameraProfile\s*=\s*"([^"]+)"/);
        const originalProfile = profileMatch ? profileMatch[1] : 'Unknown';

        // Skip if already Adobe Standard
        if (originalProfile === 'Adobe Standard') {
            stats.skippedFiles++;
            // Still copy the file
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.copyFileSync(sourcePath, outputPath);
            return true;
        }

        // Track which profiles we're replacing
        const count = stats.profilesReplaced.get(originalProfile) || 0;
        stats.profilesReplaced.set(originalProfile, count + 1);

        // Replace CameraProfile with Adobe Standard
        content = content.replace(
            /CameraProfile\s*=\s*"[^"]+"/g,
            'CameraProfile = "Adobe Standard"'
        );

        // Update ProcessVersion to 11.0
        content = content.replace(
            /ProcessVersion\s*=\s*"[\d.]+"/g,
            'ProcessVersion = "11.0"'
        );

        // Generate new UUIDs (there are typically 2: id and uuid in value)
        content = content.replace(
            /id\s*=\s*"[A-F0-9-]+"/gi,
            `id = "${generateLightroomUUID()}"`
        );
        content = content.replace(
            /uuid\s*=\s*"[A-F0-9-]+"/gi,
            `uuid = "${generateLightroomUUID()}"`
        );

        // Write converted file
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, content, 'utf-8');

        stats.convertedFiles++;
        return true;
    } catch (error) {
        stats.errors.push(`${sourcePath}: ${error}`);
        return false;
    }
}

/**
 * Recursively process all .lrtemplate files in a directory
 */
function processDirectory(sourceDir: string, outputDir: string): void {
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(sourceDir, entry.name);
        const outputPath = path.join(outputDir, entry.name);

        if (entry.isDirectory()) {
            // Skip .DS_Store and other hidden files
            if (!entry.name.startsWith('.')) {
                processDirectory(sourcePath, outputPath);
            }
        } else if (entry.name.endsWith('.lrtemplate')) {
            stats.totalFiles++;
            convertPreset(sourcePath, outputPath);
        }
    }
}

/**
 * Main execution
 */
function main(): void {
    console.log('='.repeat(60));
    console.log('VSCO Preset Converter for Universal Camera Compatibility');
    console.log('='.repeat(60));
    console.log(`\nSource: ${SOURCE_DIR}`);
    console.log(`Output: ${OUTPUT_DIR}\n`);

    // Check source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`ERROR: Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    // Clean output directory if it exists
    if (fs.existsSync(OUTPUT_DIR)) {
        console.log('Cleaning existing output directory...');
        fs.rmSync(OUTPUT_DIR, { recursive: true });
    }

    // Process all presets
    console.log('Converting presets...\n');
    processDirectory(SOURCE_DIR, OUTPUT_DIR);

    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('CONVERSION COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nTotal files found:     ${stats.totalFiles}`);
    console.log(`Successfully converted: ${stats.convertedFiles}`);
    console.log(`Skipped (already std):  ${stats.skippedFiles}`);
    console.log(`Errors:                 ${stats.errors.length}`);

    if (stats.profilesReplaced.size > 0) {
        console.log('\nProfiles replaced:');
        const sortedProfiles = [...stats.profilesReplaced.entries()]
            .sort((a, b) => b[1] - a[1]);
        for (const [profile, count] of sortedProfiles) {
            console.log(`  ${profile}: ${count} files`);
        }
    }

    if (stats.errors.length > 0) {
        console.log('\nErrors:');
        for (const error of stats.errors) {
            console.log(`  ${error}`);
        }
    }

    console.log(`\nOutput written to: ${OUTPUT_DIR}`);
}

main();
