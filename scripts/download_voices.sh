#!/usr/bin/env bash
# Fetch the Piper persona voices (mapping in apps/backend/app/routes/voice.py) from
# https://huggingface.co/rhasspy/piper-voices into $KAWAN_PIPER_VOICES_DIR (default apps/backend/voices/).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VOICES_DIR="${KAWAN_PIPER_VOICES_DIR:-${REPO_ROOT}/apps/backend/voices}"
HF_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main"

mkdir -p "${VOICES_DIR}"

fetch_voice() {
    local voice_name="$1"
    local hf_path="$2"  # path under /resolve/main/ on HF
    local onnx="${VOICES_DIR}/${voice_name}.onnx"
    local conf="${VOICES_DIR}/${voice_name}.onnx.json"

    if [[ -f "${onnx}" && -f "${conf}" ]]; then
        echo "  already present: ${voice_name}"
        return
    fi

    echo "  downloading ${voice_name} ..."
    curl -fL --progress-bar -o "${onnx}" "${HF_BASE}/${hf_path}/${voice_name}.onnx"
    curl -fL --progress-bar -o "${conf}" "${HF_BASE}/${hf_path}/${voice_name}.onnx.json"
    echo "  done: ${voice_name}"
}

echo "Piper voice download → ${VOICES_DIR}"
echo ""

fetch_voice "en_US-lessac-medium"  "en/en_US/lessac/medium"
fetch_voice "en_US-libritts-high"  "en/en_US/libritts/high"
fetch_voice "en_GB-alba-medium"    "en/en_GB/alba/medium"

echo ""
echo "All voices ready in ${VOICES_DIR}"
echo ""
echo "Next steps:"
echo "  1. Install piper-tts (optional dep, local only):"
echo "       cd apps/backend && uv add piper-tts"
echo "  2. Add to apps/backend/.env:"
echo "       KAWAN_PIPER_VOICES_DIR=${VOICES_DIR}"
echo "  3. Start the backend: cd apps/backend && uv run uvicorn app.main:app --reload"
