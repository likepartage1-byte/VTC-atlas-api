#!/usr/bin/env bash
section() { echo -e "\n\033[1;34m━━━ $* ━━━\033[0m"; }

section "STEP 1: IDENTITY BOOTSTRAP"
./scripts/testing/bootstrap.sh

section "STEP 2: RIDE LIFECYCLE (GOLDEN PATH)"
./scripts/testing/golden_path_test.sh

section "STEP 3: FINANCIAL & ANALYTICS VALIDATION"
./scripts/testing/validate_financials.sh
./scripts/testing/negative_tests.sh

echo -e "\n\033[1;32mALL SYSTEMS VALIDATED SUCCESSFULLY\033[0m"
