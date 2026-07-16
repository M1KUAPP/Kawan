"""_build(): settings.ai_backend == 'secondary' routes chat through SecondaryStructured
while reusing the same Chutes-backed evidence adapters as the 'chutes' branch. Offline
(construction only; no network)."""

import app.wiring as wiring
from app.adapters.file import FileAdapter
from app.adapters.github import GitHubAdapter
from app.adapters.screenshot import ScreenshotAdapter
from app.chutes import ChutesClient
from app.config import settings
from app.llm.client import ChutesLLMClient
from app.llm.secondary import SecondaryStructured


def test_secondary_backend_routes_chat_through_secondary_provider(monkeypatch):
    monkeypatch.setattr(settings, "ai_backend", "secondary")

    adapters, llm = wiring._build()

    assert isinstance(llm, ChutesLLMClient)
    assert isinstance(llm._chutes, SecondaryStructured)
    assert isinstance(adapters["github"], GitHubAdapter)
    assert isinstance(adapters["screenshot"], ScreenshotAdapter)
    assert isinstance(adapters["file"], FileAdapter)


def test_chutes_backend_still_uses_chutes_for_chat(monkeypatch):
    monkeypatch.setattr(settings, "ai_backend", "chutes")

    _, llm = wiring._build()

    assert isinstance(llm, ChutesLLMClient)
    assert isinstance(llm._chutes, ChutesClient)


def test_stub_backend_unaffected(monkeypatch):
    monkeypatch.setattr(settings, "ai_backend", "stub")

    _, llm = wiring._build()

    assert llm.__class__.__name__ == "StubLLMClient"
