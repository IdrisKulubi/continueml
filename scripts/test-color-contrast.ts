/**
 * Color Contrast Testing Script
 * Tests all color combinations against WCAG 2.1 Level AA requirements
 */

// OKLCH to RGB conversion (simplified for testing)
function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // This is a simplified conversion - in production, use a proper color library
  // For grayscale (c=0), we can use a simple formula
  if (c === 0) {
    const rgb = Math.round(l * 255);
    return [rgb, rgb, rgb];
  }
  
  // For chromatic colors, this is an approximation
  // In production, use a library like culori or color.js
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);
  
  // Simplified Lab to RGB (not accurate, for demonstration only)
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;
  
  const r = Math.round(Math.max(0, Math.min(255, (x * 3.2406 + y * -1.5372 + z * -0.4986) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, (x * -0.9689 + y * 1.8758 + z * 0.0415) * 255)));
  const b2 = Math.round(Math.max(0, Math.min(255, (x * 0.0557 + y * -0.2040 + z * 1.0570) * 255)));
  
  return [r, g, b2];
}

// Calculate relative luminance
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getRelativeLuminance(...rgb1);
  const l2 = getRelativeLuminance(...rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Test a color combination
function testContrast(
  name: string,
  fg: [number, number, number],
  bg: [number, number, number],
  minRatio: number
): { name: string; ratio: number; passes: boolean; required: number } {
  const ratio = getContrastRatio(fg, bg);
  const passes = ratio >= minRatio;
  
  return { name, ratio, passes, required: minRatio };
}

// Color definitions (OKLCH values from globals.css)
const colors = {
  light: {
    background: oklchToRgb(1, 0, 0), // white
    foreground: oklchToRgb(0.145, 0, 0), // near black
    mutedForeground: oklchToRgb(0.45, 0, 0), // medium gray
    primary: oklchToRgb(0.205, 0, 0), // dark gray
    primaryForeground: oklchToRgb(0.985, 0, 0), // near white
    secondary: oklchToRgb(0.97, 0, 0), // light gray
    secondaryForeground: oklchToRgb(0.205, 0, 0), // dark gray
    destructive: oklchToRgb(0.577, 0.245, 27.325), // red
    destructiveForeground: oklchToRgb(1, 0, 0), // white
    entityCharacter: oklchToRgb(0.55, 0.222, 41.116), // orange
    entityCharacterFg: oklchToRgb(1, 0, 0), // white
    entityLocation: oklchToRgb(0.5, 0.118, 184.704), // blue
    entityLocationFg: oklchToRgb(1, 0, 0), // white
    entityObject: oklchToRgb(0.65, 0.188, 70.08), // yellow
    entityObjectFg: oklchToRgb(0.05, 0, 0), // near black
    entityStyle: oklchToRgb(0.45, 0.243, 264.376), // purple
    entityStyleFg: oklchToRgb(1, 0, 0), // white
    entityCustom: oklchToRgb(0.45, 0, 0), // gray
    entityCustomFg: oklchToRgb(1, 0, 0), // white
  },
  dark: {
    background: oklchToRgb(0.145, 0, 0), // near black
    foreground: oklchToRgb(0.985, 0, 0), // near white
    mutedForeground: oklchToRgb(0.75, 0, 0), // light gray
    primary: oklchToRgb(0.922, 0, 0), // very light gray
    primaryForeground: oklchToRgb(0.145, 0, 0), // near black
    secondary: oklchToRgb(0.269, 0, 0), // dark gray
    secondaryForeground: oklchToRgb(0.985, 0, 0), // near white
    destructive: oklchToRgb(0.704, 0.191, 22.216), // light red
    destructiveForeground: oklchToRgb(0.05, 0, 0), // near black
    entityCharacter: oklchToRgb(0.7, 0.222, 41.116), // light orange
    entityCharacterFg: oklchToRgb(0.05, 0, 0), // near black
    entityLocation: oklchToRgb(0.7, 0.118, 184.704), // light blue
    entityLocationFg: oklchToRgb(0.05, 0, 0), // near black
    entityObject: oklchToRgb(0.8, 0.188, 70.08), // light yellow
    entityObjectFg: oklchToRgb(0.05, 0, 0), // near black
    entityStyle: oklchToRgb(0.65, 0.243, 264.376), // light purple
    entityStyleFg: oklchToRgb(0.05, 0, 0), // near black
    entityCustom: oklchToRgb(0.7, 0, 0), // light gray
    entityCustomFg: oklchToRgb(0.05, 0, 0), // near black
  },
};

// Run tests
console.log("=".repeat(80));
console.log("COLOR CONTRAST AUDIT - WCAG 2.1 Level AA");
console.log("=".repeat(80));
console.log();

const results: Array<{ name: string; ratio: number; passes: boolean; required: number }> = [];

// Test Light Mode
console.log("LIGHT MODE");
console.log("-".repeat(80));

results.push(testContrast("Foreground on Background", colors.light.foreground, colors.light.background, 4.5));
results.push(testContrast("Muted Foreground on Background", colors.light.mutedForeground, colors.light.background, 4.5));
results.push(testContrast("Primary Button", colors.light.primaryForeground, colors.light.primary, 4.5));
results.push(testContrast("Secondary Button", colors.light.secondaryForeground, colors.light.secondary, 4.5));
results.push(testContrast("Destructive Button", colors.light.destructiveForeground, colors.light.destructive, 4.5));
results.push(testContrast("Entity Character Badge", colors.light.entityCharacterFg, colors.light.entityCharacter, 4.5));
results.push(testContrast("Entity Location Badge", colors.light.entityLocationFg, colors.light.entityLocation, 4.5));
results.push(testContrast("Entity Object Badge", colors.light.entityObjectFg, colors.light.entityObject, 4.5));
results.push(testContrast("Entity Style Badge", colors.light.entityStyleFg, colors.light.entityStyle, 4.5));
results.push(testContrast("Entity Custom Badge", colors.light.entityCustomFg, colors.light.entityCustom, 4.5));

console.log();

// Test Dark Mode
console.log("DARK MODE");
console.log("-".repeat(80));

results.push(testContrast("Foreground on Background (Dark)", colors.dark.foreground, colors.dark.background, 4.5));
results.push(testContrast("Muted Foreground on Background (Dark)", colors.dark.mutedForeground, colors.dark.background, 4.5));
results.push(testContrast("Primary Button (Dark)", colors.dark.primaryForeground, colors.dark.primary, 4.5));
results.push(testContrast("Secondary Button (Dark)", colors.dark.secondaryForeground, colors.dark.secondary, 4.5));
results.push(testContrast("Destructive Button (Dark)", colors.dark.destructiveForeground, colors.dark.destructive, 4.5));
results.push(testContrast("Entity Character Badge (Dark)", colors.dark.entityCharacterFg, colors.dark.entityCharacter, 4.5));
results.push(testContrast("Entity Location Badge (Dark)", colors.dark.entityLocationFg, colors.dark.entityLocation, 4.5));
results.push(testContrast("Entity Object Badge (Dark)", colors.dark.entityObjectFg, colors.dark.entityObject, 4.5));
results.push(testContrast("Entity Style Badge (Dark)", colors.dark.entityStyleFg, colors.dark.entityStyle, 4.5));
results.push(testContrast("Entity Custom Badge (Dark)", colors.dark.entityCustomFg, colors.dark.entityCustom, 4.5));

console.log();

// Print results
results.forEach((result) => {
  const status = result.passes ? "✅ PASS" : "❌ FAIL";
  const ratio = result.ratio.toFixed(2);
  console.log(`${status} ${result.name.padEnd(45)} ${ratio}:1 (required: ${result.required}:1)`);
});

console.log();
console.log("=".repeat(80));

const passed = results.filter((r) => r.passes).length;
const total = results.length;
const percentage = ((passed / total) * 100).toFixed(1);

console.log(`SUMMARY: ${passed}/${total} tests passed (${percentage}%)`);
console.log("=".repeat(80));

// Exit with error code if any tests failed
if (passed < total) {
  process.exit(1);
}
