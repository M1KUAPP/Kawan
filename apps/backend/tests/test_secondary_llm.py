"""SecondaryStructured: drop-in `.structured` provider for ChutesLLMClient, backed by
the secondary provider instead of Chutes. Offline via httpx.MockTransport, mirroring
tests/test_chutes_client.py's injected-client pattern."""

import json

import httpx
import pytest

from app.chutes import ChutesError
from app.config import settings
from app.llm.secondary import _SCHEMAS, SecondaryStructured
from app.prompts import CHECKIN_SCHEMA, INTAKE_SCHEMA, PLAN_SCHEMA, WORKSPACE_SCHEMA, _EMOTIONS

_OPENAI_SCHEMAS = {
    "intake": INTAKE_SCHEMA, "plan": PLAN_SCHEMA, "checkin": CHECKIN_SCHEMA, "workspace": WORKSPACE_SCHEMA,
}

CANNED = {
    "intake": {
        "say": "What's your why here?",
        "slots": {"why": "career growth", "obstacles": None, "time_constraints": None, "skill": None},
        "intake_complete": False,
        "emotion": "curious",
    },
    "plan": {
        "roadmap": [{"order": 1, "title": "Outline", "est_minutes": 30, "note": "start here"}],
        "front_load_reason": "riskiest first",
        "suggested_evidence": {"type": "screenshot", "reason": "visual proof"},
        "suggested_cadence": "daily",
        "suggested_stake": {"enabled": False, "reason": "not needed"},
        "say": "Here's the plan.",
    },
    "checkin": {"say": "Checking in.", "emotion": "neutral", "escalate": False},
    "workspace": {"response_type": "coaching", "say": "Keep going.", "proposal": None, "emotion": "pleased"},
}

REQUIRED_KEYS = {
    "intake": {"say"},
    "plan": {"roadmap"},
    "checkin": {"say", "escalate"},
    "workspace": {"say", "response_type", "proposal"},
}


@pytest.fixture(autouse=True)
def _fake_key(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "fake-secondary-key")


def _client(handler):
    http = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return SecondaryStructured(http=http), http


def _provider_response(payload: dict) -> httpx.Response:
    return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": json.dumps(payload)}]}}]})


# ── per-schema request/response mapping ──────────────────────────────────────────

@pytest.mark.parametrize("schema_name", ["intake", "plan", "checkin", "workspace"])
async def test_structured_returns_schema_valid_dict_per_route(schema_name):
    def handler(request: httpx.Request) -> httpx.Response:
        return _provider_response(CANNED[schema_name])

    provider, http = _client(handler)
    try:
        out = await provider.structured(
            user_id="u1", model="ignored-by-secondary", schema_name=schema_name,
            schema=_OPENAI_SCHEMAS[schema_name],
            messages=[
                {"role": "system", "content": "SYSTEM_PROMPT_TEXT"},
                {"role": "user", "content": "USER_UTTERANCE_TEXT"},
            ],
        )
    finally:
        await http.aclose()

    assert out == CANNED[schema_name]
    for key in REQUIRED_KEYS[schema_name]:
        assert key in out


# ── outbound request shape ────────────────────────────────────────────────────────

async def test_structured_sends_expected_request_shape():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["api_key_header"] = request.headers.get("x-goog-api-key")
        seen["body"] = json.loads(request.content)
        return _provider_response(CANNED["workspace"])

    provider, http = _client(handler)
    try:
        await provider.structured(
            user_id="u1", model="ignored", schema_name="workspace", schema=WORKSPACE_SCHEMA,
            messages=[
                {"role": "system", "content": "SYSTEM_PROMPT_TEXT"},
                {"role": "assistant", "content": "PRIOR_ASSISTANT_TURN"},
                {"role": "user", "content": "USER_UTTERANCE_TEXT"},
            ],
        )
    finally:
        await http.aclose()

    assert seen["url"].endswith(":generateContent")
    assert seen["api_key_header"] == "fake-secondary-key"
    gen_config = seen["body"]["generationConfig"]
    assert gen_config["responseMimeType"] == "application/json"
    assert gen_config["responseSchema"] == _SCHEMAS["workspace"]

    contents = seen["body"]["contents"]
    flat_text = json.dumps(contents)
    assert "SYSTEM_PROMPT_TEXT" in flat_text
    assert "USER_UTTERANCE_TEXT" in flat_text
    roles = [c["role"] for c in contents]
    assert "model" in roles  # assistant -> model translation
    assert contents[0]["role"] == "user"  # guaranteed leading user turn


# ── failure -> ChutesError guards ─────────────────────────────────────────────────

async def test_structured_raises_chutes_error_when_key_unset(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")

    def handler(request: httpx.Request) -> httpx.Response:
        raise AssertionError("no HTTP call should be made when the key is unset")

    provider, http = _client(handler)
    try:
        with pytest.raises(ChutesError):
            await provider.structured(
                user_id="u1", model="m", schema_name="checkin", schema=CHECKIN_SCHEMA,
                messages=[{"role": "user", "content": "hi"}],
            )
    finally:
        await http.aclose()


async def test_structured_raises_chutes_error_on_non_200():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(500, text="upstream boom")

    provider, http = _client(handler)
    try:
        with pytest.raises(ChutesError):
            await provider.structured(
                user_id="u1", model="m", schema_name="checkin", schema=CHECKIN_SCHEMA,
                messages=[{"role": "user", "content": "hi"}],
            )
    finally:
        await http.aclose()


async def test_structured_raises_chutes_error_on_malformed_body():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": "shape"})  # no candidates[]

    provider, http = _client(handler)
    try:
        with pytest.raises(ChutesError):
            await provider.structured(
                user_id="u1", model="m", schema_name="checkin", schema=CHECKIN_SCHEMA,
                messages=[{"role": "user", "content": "hi"}],
            )
    finally:
        await http.aclose()


# ── schema-parity vs prompts.py (guards drift) ─────────────────────────────────────

def _required_and_props(schema: dict) -> tuple[set, set]:
    return set(schema.get("required", [])), set(schema.get("properties", {}).keys())


@pytest.mark.parametrize("schema_name", ["intake", "plan", "checkin", "workspace"])
def test_secondary_schema_matches_openai_schema_required_and_properties(schema_name):
    openai_required, openai_props = _required_and_props(_OPENAI_SCHEMAS[schema_name])
    secondary_required, secondary_props = _required_and_props(_SCHEMAS[schema_name])
    assert secondary_required >= openai_required
    assert secondary_props == openai_props


def test_intake_slots_nullable_translation():
    slots = _SCHEMAS["intake"]["properties"]["slots"]
    for key in ("why", "obstacles", "time_constraints", "skill"):
        prop = slots["properties"][key]
        assert prop["type"] == "string"
        assert prop["nullable"] is True
    assert set(slots["required"]) == {"why", "obstacles", "time_constraints", "skill"}


def test_workspace_proposal_nullable_object_translation():
    proposal = _SCHEMAS["workspace"]["properties"]["proposal"]
    assert proposal["type"] == "object"
    assert proposal["nullable"] is True
    assert set(proposal["required"]) == {"field", "proposed_value", "reason"}
    assert proposal["properties"]["field"]["enum"] == \
        ["deadline", "deliverable", "cadence", "evidence_type", "stake"]


def test_emotion_enums_preserved():
    assert _SCHEMAS["intake"]["properties"]["emotion"]["enum"] == _EMOTIONS
    assert _SCHEMAS["checkin"]["properties"]["emotion"]["enum"] == _EMOTIONS
    assert _SCHEMAS["workspace"]["properties"]["emotion"]["enum"] == [*_EMOTIONS, "proud"]


def test_no_additional_properties_key_in_any_secondary_schema():
    for schema in _SCHEMAS.values():
        assert "additionalProperties" not in json.dumps(schema)
