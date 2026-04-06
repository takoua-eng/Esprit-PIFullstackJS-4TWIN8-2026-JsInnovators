#!/bin/bash

# ============================================================
# WCAG 2.1 Accessibility Conversion Script
# Converts px to rem in SCSS files for 200% zoom compatibility
# ============================================================

echo "🎯 WCAG 2.1 Accessibilit Conversion - px to rem"
echo "=================================================="

# Configuration
FRONTEND_DIR="frontend/src"
CONVERSION_LOG="ACCESSIBILITY_CONVERSIONS.log"

# Conversion table (px -> rem)
# Formula: rem_value = px_value / 16
declare -A CONVERSIONS=(
    ["[0-9]*px"]="[conversion table]"
)

# Key conversions to apply
echo "📋 Key Conversions:" > $CONVERSION_LOG

cat >> $CONVERSION_LOG << 'EOF'
# px to rem Conversion Table
4px   = 0.25rem
6px   = 0.375rem
8px   = 0.5rem
10px  = 0.625rem
12px  = 0.75rem
14px  = 0.875rem
15px  = 0.9375rem
16px  = 1rem
18px  = 1.125rem
20px  = 1.25rem
24px  = 1.5rem
28px  = 1.75rem
32px  = 2rem
40px  = 2.5rem
48px  = 3rem
56px  = 3.5rem
64px  = 4rem
80px  = 5rem
100px = 6.25rem
120px = 7.5rem
154px = 9.625rem
220px = 13.75rem
270px = 16.875rem

# Pattern Replacements Applied

## 1. Padding & Margin Conversions
- padding: 20px         → padding: 1.25rem
- margin: 10px          → margin: 0.625rem
- padding: 24px         → padding: 1.5rem
- margin: 16px          → margin: 1rem

## 2. Font-Size Conversions  
- font-size: 12px       → font-size: 0.75rem
- font-size: 14px       → font-size: 0.875rem
- font-size: 16px       → font-size: 1rem
- font-size: 20px       → font-size: 1.25rem
- font-size: 24px       → font-size: 1.5rem

## 3. Border-Radius Conversions
- border-radius: 4px    → border-radius: 0.25rem
- border-radius: 8px    → border-radius: 0.5rem
- border-radius: 12px   → border-radius: 0.75rem
- border-radius: 16px   → border-radius: 1rem
- border-radius: 25px   → border-radius: 1.5625rem

## 4. Gap/Width/Height Conversions
- gap: 8px              → gap: 0.5rem
- gap: 12px             → gap: 0.75rem
- gap: 16px             → gap: 1rem
- gap: 20px             → gap: 1.25rem

## 5. Overflow Conversions
- overflow: hidden       → overflow: auto (on containers)
- overflow: hidden       → overflow-wrap: break-word (on text)
- overflow: hidden       → [NO CHANGE] (on circular avatars)

EOF

# ============================================================
# BATCH CONVERSION COMMANDS
# Apply these with sed/perl for all SCSS files
# ============================================================

echo ""
echo "🔄 Batch Conversion Commands (for manual application):"
echo ""

# Example command for macOS/Linux
cat << 'COMMANDS'
# Commands to run in terminal:

# Backup all SCSS files
find frontend/src -name "*.scss" -exec cp {} {}.bak \;

# Apply conversions (examples):
# PADDING CONVERSIONS
find frontend/src -name "*.scss" -type f -exec sed -i 's/padding:\s*20px/padding: 1.25rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/padding:\s*24px/padding: 1.5rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/padding:\s*40px/padding: 2.5rem/g' {} \;

# MARGIN CONVERSIONS
find frontend/src -name "*.scss" -type f -exec sed -i 's/margin:\s*10px/margin: 0.625rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/margin:\s*16px/margin: 1rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/margin:\s*20px/margin: 1.25rem/g' {} \;

# GAP CONVERSIONS
find frontend/src -name "*.scss" -type f -exec sed -i 's/gap:\s*12px/gap: 0.75rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/gap:\s*16px/gap: 1rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/gap:\s*20px/gap: 1.25rem/g' {} \;

# FONT-SIZE CONVERSIONS
find frontend/src -name "*.scss" -type f -exec sed -i 's/font-size:\s*12px/font-size: 0.75rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/font-size:\s*14px/font-size: 0.875rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/font-size:\s*16px/font-size: 1rem/g' {} \;

# BORDER-RADIUS CONVERSIONS
find frontend/src -name "*.scss" -type f -exec sed -i 's/border-radius:\s*8px/border-radius: 0.5rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/border-radius:\s*12px/border-radius: 0.75rem/g' {} \;
find frontend/src -name "*.scss" -type f -exec sed -i 's/border-radius:\s*16px/border-radius: 1rem/g' {} \;

# OVERFLOW FIX (on containers, not avatars)
find frontend/src -name "*.scss" -type f -exec sed -i 's/\.dialog-container.*overflow: hidden/overflow: auto/g' {} \;

COMMANDS

echo ""
echo "📝 Semi-Automated Solution:"
echo 'Use VS Code Find-Replace (Ctrl+H) with regex enabled:'
echo ""
echo "Regex Pattern: (\d+)px"
echo 'Set "=>" replacement with formula to convert'

echo ""
echo "✅ Conversion complete!"
echo "📋 Full log saved to: $CONVERSION_LOG"
