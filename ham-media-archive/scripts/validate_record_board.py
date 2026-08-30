#!/usr/bin/env python3
"""Validate the shared star-record board contract on one HTML page."""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
from pathlib import Path


class ContractParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.main_attrs: dict[str, str | None] = {}
        self.filters: set[str] = set()
        self.record_kinds: list[str] = []
        self.record_cards: list[dict[str, str | None]] = []
        self.article_record_ids: set[str] = set()
        self.photo_record_ids: set[str] = set()
        self.map_nodes = 0
        self.ids: set[str] = set()
        self.stylesheets: set[str] = set()
        self.scripts: set[str] = set()
        self.design_method_visible = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        classes = set((data.get("class") or "").split())

        if tag == "main" and "room-house-page" in classes:
            self.main_attrs = data
        if data.get("id"):
            self.ids.add(data["id"] or "")
        if "star-record-filter" in classes and data.get("data-record-filter"):
            self.filters.add(data["data-record-filter"] or "")
        if "star-record-card" in classes and data.get("data-record-kind"):
            self.record_kinds.append(data["data-record-kind"] or "")
            self.record_cards.append(data)
        if "room-article-link" in classes and data.get("data-record-id"):
            self.article_record_ids.add(data["data-record-id"] or "")
        if "room-house-photo" in classes and data.get("data-record-id"):
            self.photo_record_ids.add(data["data-record-id"] or "")
        if "record-map-node" in classes:
            self.map_nodes += 1
        if tag == "link" and data.get("rel") == "stylesheet" and data.get("href"):
            self.stylesheets.add(data["href"] or "")
        if tag == "script" and data.get("src"):
            self.scripts.add(data["src"] or "")
        if data.get("id") == "fountain-design-room" and "room-house-panel" not in classes and "hidden" not in data:
            self.design_method_visible = True


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    cli = argparse.ArgumentParser()
    cli.add_argument("page", type=Path)
    args = cli.parse_args()

    parser = ContractParser()
    parser.feed(args.page.read_text(encoding="utf-8"))
    errors: list[str] = []

    require(parser.main_attrs.get("data-room-context-nav") == "true", "context navigation must be enabled", errors)
    require(parser.main_attrs.get("data-map-house-target") == "fountain-map-room", "map target is missing", errors)
    require("fountain-map-room" in parser.ids, "map panel is missing", errors)
    require({"all", "sentence", "scene"} <= parser.filters, "all/sentence/scene filters are required", errors)
    require(len(parser.record_kinds) >= 8, "at least eight records are required for the first specimen", errors)
    require("sentence" in parser.record_kinds and "scene" in parser.record_kinds, "sentence and scene records must coexist", errors)
    record_ids = [card.get("data-record-id") or "" for card in parser.record_cards]
    require(all(record_ids), "every record needs a stable data-record-id", errors)
    require(len(record_ids) == len(set(record_ids)), "record ids must be unique", errors)
    require(all(card.get("data-record-target") for card in parser.record_cards), "every record needs a detail target", errors)
    require(all(kind in {"sentence", "scene"} for kind in parser.record_kinds), "record kind must be sentence or scene", errors)
    for card in parser.record_cards:
        target = card.get("data-record-target") or ""
        if card.get("data-record-kind") == "sentence":
            require(target in parser.article_record_ids, f"sentence target has no article route: {target}", errors)
        if card.get("data-record-kind") == "scene":
            require(target in parser.photo_record_ids, f"scene target has no photo route: {target}", errors)
    require(parser.map_nodes == 6, "the first specimen map must contain six real path nodes", errors)
    require("../assets/css/star-records.css" in parser.stylesheets, "shared record stylesheet is missing", errors)
    require("../assets/js/main.js?v=room-context-nav-v2" in parser.scripts, "shared room navigation is missing", errors)
    require("../assets/js/star-records.js" in parser.scripts, "shared record behavior is missing", errors)
    require(parser.design_method_visible, "design method must be a visible lower section, not a competing panel", errors)

    shared_css = (args.page.parent / "../assets/css/star-records.css").resolve()
    require(shared_css.is_file(), "shared record stylesheet file does not exist", errors)
    if shared_css.is_file():
        css = shared_css.read_text(encoding="utf-8")
        require("@media (max-width: 620px)" in css, "mobile record layout is missing", errors)
        require("@media (prefers-reduced-motion: reduce)" in css, "reduced-motion fallback is missing", errors)

    if errors:
        print(f"FAIL {args.page}")
        for error in errors:
            print(f"- {error}")
        return 1

    sentence_count = parser.record_kinds.count("sentence")
    scene_count = parser.record_kinds.count("scene")
    print(f"PASS records={len(parser.record_kinds)} sentence={sentence_count} scene={scene_count} filters=3 map=1")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
