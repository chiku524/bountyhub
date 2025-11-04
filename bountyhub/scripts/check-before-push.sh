#!/bin/bash

# Script to check for errors before pushing to GitHub
# Usage: ./scripts/check-before-push.sh

set -e  # Exit on error

echo "🔍 Running pre-push checks..."
echo ""

# Check TypeScript compilation
echo "📝 Checking TypeScript compilation..."
if ! npm run build 2>&1 | grep -q "error TS"; then
    echo "✅ TypeScript compilation: PASSED"
else
    echo "❌ TypeScript compilation: FAILED"
    echo "Please fix TypeScript errors before pushing."
    exit 1
fi

# Check API build
echo "📝 Checking API TypeScript compilation..."
if ! npm run build:api 2>&1 | grep -q "error TS"; then
    echo "✅ API TypeScript compilation: PASSED"
else
    echo "❌ API TypeScript compilation: FAILED"
    echo "Please fix API TypeScript errors before pushing."
    exit 1
fi

# Check linter
echo "🔍 Running linter..."
if npm run lint 2>&1 | grep -q "error\|✖"; then
    echo "❌ Linter: FAILED"
    echo "Please fix linter errors before pushing."
    exit 1
else
    echo "✅ Linter: PASSED"
fi

echo ""
echo "✅ All checks passed! Ready to push."

