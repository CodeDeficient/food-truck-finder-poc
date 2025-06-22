import re
import datetime

# Get today's date
today_date = datetime.datetime.now().strftime("%Y-%m-%d")

# Read the original markdown content
with open("🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md", "r",
          encoding="utf-8") as f:
    content = f.read()

# 1. Update Agent Status Table
# Update Jules' status
content = re.sub(
    r"\| Jules \| ⏸️ STANDBY \| Awaiting Phase 3 \| TBD \| "
    r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} \|",
    f"| Jules | 🔄 ACTIVE | Linting Remediation - Baseline | TBD | "
    f"{today_date} |",
    content
)

# Update Augment's status
# First, check the current Last Update for Augment
augment_last_update_match = re.search(
    r"\| Augment \| 🔄 ACTIVE \| .* \| (.*) \|", content
)
augment_last_update = today_date
if augment_last_update_match:
    current_augment_update = augment_last_update_match.group(1).strip()
    # Check if it's the specific date to keep
    if "2025-06-18 Current" in current_augment_update:
        augment_last_update = current_augment_update  # Keep original
    # else, it will use today_date which is already set

content = re.sub(
    r"\| Augment \| 🔄 ACTIVE \| .* \| .* \|",
    f"| Augment | ⏸️ STANDBY | Awaiting next task | TBD | "
    f"{augment_last_update} |",
    content
)


# 2. Update Live Error Tracking Section
content = re.sub(
    r"\*\*CURRENT COUNT\*\*: \d+ errors \(VERIFIED\) ✅",
    "**CURRENT COUNT**: 255 errors (VERIFIED) ✅",
    content
)
content = re.sub(
    r"\*\*LAST UPDATED\*\*: .*?\n\*\*UPDATED BY\*\*:.*",
    f"**LAST UPDATED**: {today_date} - Jules - Baseline Established\n"
    f"**UPDATED BY**: Jules - Baseline established: 255 errors, 10 warnings.",
    content,
    flags=re.DOTALL  # To match across newlines
)

# 3. Add to Recent Activity Log
new_log_entry = f"""
### ⚙️ LINTING BASELINE ESTABLISHED BY JULES ({today_date})

**🎯 MISSION STATUS**: Established current linting error baseline before
starting remediation.
**📊 BASELINE RESULTS**:
- **Total Errors**: 255
- **Total Warnings**: 10
- **Method**: `npx eslint . --format json` followed by manual parsing.
**AGENT**: Jules
**NEXT STEP**: Proceed with Phase 2 remediation, focusing on
max-lines-per-function and type safety issues.

---
"""

content = re.sub(
    r"(## 📈 RECENT ACTIVITY LOG\n)",
    # Escape backslashes and backticks for the shell
    r"\\1" + new_log_entry.replace('\\', '\\\\').replace('`', '\\`'),
    content,
    count=1  # Only replace the first occurrence
)

# Write the modified content to a temporary file
with open("temp_command_center.md", "w", encoding="utf-8") as f:
    f.write(content)
