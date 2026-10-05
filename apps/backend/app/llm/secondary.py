"""Secondary chat structured provider. Drop-in for ChutesClient.structured (see
app/llm/client.py's ChutesLLMClient), backed by the same secondary provider that
already serves the evidence-vision fallback (app/fallback_judge.py). Deliberately
low-profile and self-contained; unlike the fallback judge, a failure here raises
ChutesError so the routes' existing 503-degrade path is preserved unchanged."""

from __future__ import annotations

import logging

import httpx

from app.chutes import ChutesError, _extract_json
from app.config import settings
from app.prompts import CHECKIN_SCHEMA, INTAKE_SCHEMA, PLAN_SCHEMA, WORKSPACE_SCHEMA, _EMOTIONS

logger = logging.getLogger("kawan.llm.secondary")

_MODEL = "gemini-3.1-flash-lite"
_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{_MODEL}:generateContent"

# Secondary-provider dialect mirrors of app/prompts.py's OpenAI strict-mode schemas: drop
# additionalProperties, translate ["type","null"] unions to {"type":..., "nullable":true},
# keep every enum and required list verbatim (required is what guarantees say/roadmap).
_SCHEMAS: dict[str, dict] = {
    "intake": {
        "type": "object",
        "properties": {
            "say": {"type": "string"},
            "slots": {
                "type": "object",
                "properties": {
                    "why": {"type": "string", "nullable": True},
                    "obstacles": {"type": "string", "nullable": True},
                    "time_constraints": {"type": "string", "nullable": True},
                    "skill": {"type": "string", "nullable": True},
                },
                "required": ["why", "obstacles", "time_constraints", "skill"],
            },
            "intake_complete": {"type": "boolean"},
            "emotion": {"type": "string", "enum": _EMOTIONS},
        },
        "required": ["say", "slots", "intake_complete", "emotion"],
    },
    "plan": {
        "type": "object",
        "properties": {
            "roadmap": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "order": {"type": "integer"},
                        "title": {"type": "string"},
                        "est_minutes": {"type": "integer"},
                        "note": {"type": "string"},
                    },
                    "required": ["order", "title", "est_minutes", "note"],
                },
            },
            "front_load_reason": {"type": "string"},
            "suggested_evidence": {
                "type": "object",
                "properties": {
                    "type": {"type": "string", "enum": ["github", "screenshot"]},
                    "reason": {"type": "string"},
                },
                "required": ["type", "reason"],
            },
            "suggested_cadence": {"type": "string"},
            "suggested_stake": {
                "type": "object",
                "properties": {"enabled": {"type": "boolean"}, "reason": {"type": "string"}},
                "required": ["enabled", "reason"],
            },
            "say": {"type": "string"},
        },
        "required": ["roadmap", "front_load_reason", "suggested_evidence",
                      "suggested_cadence", "suggested_stake", "say"],
    },
    "checkin": {
        "type": "object",
        "properties": {
            "say": {"type": "string"},
            "emotion": {"type": "string", "enum": _EMOTIONS},
            "escalate": {"type": "boolean"},
        },
        "required": ["say", "emotion", "escalate"],
    },
    "workspace": {
        "type": "object",
        "properties": {
            "response_type": {"type": "string", "enum": ["coaching", "refusal", "proposal"]},
            "say": {"type": "string"},
            "proposal": {
                "type": "object",
                "nullable": True,
                "properties": {
                    "field": {"type": "string",
                              "enum": ["deadline", "deliverable", "cadence", "evidence_type", "stake"]},
                    "proposed_value": {"type": "string"},
                    "reason": {"type": "string"},
                },
                "required": ["field", "proposed_value", "reason"],
            },
            "emotion": {"type": "string", "enum": [*_EMOTIONS, "proud"]},
        },
        "required": ["response_type", "say", "proposal", "emotion"],
    },
}

# Kept importable alongside _SCHEMAS so a schema-parity test can diff the two dialects.
_OPENAI_SCHEMAS = {
    "intake": INTAKE_SCHEMA, "plan": PLAN_SCHEMA, "checkin": CHECKIN_SCHEMA, "workspace": WORKSPACE_SCHEMA,
}


def _translate_messages(messages: list[dict]) -> tuple[str, list[dict]]:
    """Fold every 'system' message into one instruction block; map the rest to the
    provider's turn format (assistant -> model), guaranteeing a leading user turn."""
    system = "\n\n".join(m["content"] for m in messages if m.get("role") == "system")
    contents: list[dict] = []
    for m in messages:
        if m.get("role") == "system":
            continue
        role = "model" if m.get("role") == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": str(m.get("content", ""))}]})
    if not contents or contents[0]["role"] != "user":
        contents.insert(0, {"role": "user", "parts": [{"text": "(continue)"}]})
    return system, contents


class SecondaryStructured:
    """Drop-in for ChutesClient.structured, answering via the secondary provider."""

    def __init__(self, *, http: httpx.AsyncClient | None = None) -> None:
        self._http = http  # injected in tests (MockTransport); None -> one client per call

    async def _call(self, system: str, contents: list[dict], schema: dict) -> dict | None:
        """POST one structured turn to the secondary provider. Returns None on any problem
        (unconfigured / non-200 / unparseable) and never raises -- .structured() below is
        what translates that into the caller-facing ChutesError."""
        if not settings.gemini_api_key:
            return None
        payload_contents = contents
        if system:
            first = contents[0]
            payload_contents = [
                {"role": first["role"], "parts": [{"text": system}, *first["parts"]]},
                *contents[1:],
            ]
        payload = {
            "contents": payload_contents,
            "generationConfig": {"responseMimeType": "application/json", "responseSchema": schema},
        }
        owns = self._http is None
        http = self._http or httpx.AsyncClient(timeout=60)
        try:
            resp = await http.post(_URL, headers={"x-goog-api-key": settings.gemini_api_key}, json=payload)
            if resp.status_code != 200:
                logger.warning("secondary structured non-200: %s %s", resp.status_code, resp.text[:200])
                return None
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            return _extract_json(text)
        except Exception as exc:  # noqa: BLE001 - degrade to None; .structured() raises
            logger.warning("secondary structured failed: %r", exc)
            return None
        finally:
            if owns:
                await http.aclose()

    async def structured(self, *, user_id: str, model: str, messages: list[dict],
                          schema: dict, schema_name: str, max_tokens: int = 2048) -> dict:
        _ = user_id, model, max_tokens, schema  # ignored: the secondary uses its own model + fixed schemas
        if schema_name not in _SCHEMAS:
            raise ChutesError(f"secondary: no schema for {schema_name!r}")
        system, contents = _translate_messages(messages)
        data = await self._call(system, contents, _SCHEMAS[schema_name])
        if data is None:
            raise ChutesError("secondary provider unavailable")
        return data
