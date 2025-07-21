#!/bin/bash
# Update CRON_SECRET in Vercel Environment Variables
# Date: 2025-07-21
# Reason: Old secret contained 2024 timestamp (6+ months old)

# Generate new cryptographically secure secret
NEW_CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

echo "🔐 Updating CRON_SECRET in Vercel..."
echo "New secret: ${NEW_CRON_SECRET:0:10}... (truncated for security)"

# Remove old secret if it exists
echo "Removing old CRON_SECRET..."
vercel env rm CRON_SECRET --yes 2>/dev/null || echo "No existing CRON_SECRET found"

# Add new secret to all environments
echo "Adding new CRON_SECRET to Production..."
echo "$NEW_CRON_SECRET" | vercel env add CRON_SECRET production

echo "Adding new CRON_SECRET to Preview..."
echo "$NEW_CRON_SECRET" | vercel env add CRON_SECRET preview

echo "Adding new CRON_SECRET to Development..."
echo "$NEW_CRON_SECRET" | vercel env add CRON_SECRET development

echo "✅ CRON_SECRET updated in all environments!"

# Update local .env.local
echo "Updating local .env.local..."
if [ -f .env.local ]; then
    # Remove old CRON_SECRET line if exists
    grep -v "CRON_SECRET=" .env.local > .env.local.tmp 2>/dev/null || cp .env.local .env.local.tmp
    # Add new CRON_SECRET
    echo "CRON_SECRET=\"$NEW_CRON_SECRET\"" >> .env.local.tmp
    mv .env.local.tmp .env.local
    echo "✅ Local .env.local updated!"
else
    echo "⚠️ No .env.local found. Run 'vercel env pull .env.local' after this script."
fi

echo ""
echo "🧪 NEXT STEPS:"
echo "1. Test CRON endpoints with new secret"
echo "2. Verify old secret is rejected"
echo "3. Update docs/SECRET_MANAGEMENT_PLAN.md with completion status"
echo ""
echo "Test commands:"
echo "curl -X POST https://your-app.vercel.app/api/cron/auto-scrape \\"
echo "  -H 'Authorization: Bearer $NEW_CRON_SECRET'"
echo ""
echo "curl -X POST https://your-app.vercel.app/api/cron/quality-check \\"
echo "  -H 'Authorization: Bearer $NEW_CRON_SECRET'"
