#!/usr/bin/env python3
"""Generate approved Lucky Learning World spelling audio with Sonia only."""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

import edge_tts


APPROVED_VOICE = "en-GB-SoniaNeural"
APPROVED_RATE = "-15%"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--out", required=True, type=Path)
    return parser.parse_args()


def load_entries(manifest_path: Path) -> tuple[list[dict[str, str]], str]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("voice") != APPROVED_VOICE or manifest.get("rate") != APPROVED_RATE:
        raise ValueError(
            f"Manifest must use approved voice {APPROVED_VOICE} at rate {APPROVED_RATE}."
        )
    entries = manifest.get("words")
    if not isinstance(entries, list) or not entries:
        raise ValueError("Manifest must contain a non-empty words array.")
    for entry in entries:
        if not isinstance(entry, dict) or not entry.get("word") or not entry.get("definition"):
            raise ValueError("Every manifest entry must contain word and definition text.")
    return entries, str(manifest.get("approval", "Explicit user approval required"))


async def generate_track(text: str, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(
        text,
        voice=APPROVED_VOICE,
        rate=APPROVED_RATE,
    ).save(str(output_path))
    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError(f"Audio generation produced an empty file: {output_path}")


async def main() -> None:
    args = parse_args()
    entries, approval = load_entries(args.manifest)
    args.out.mkdir(parents=True, exist_ok=True)
    definition_dir = args.out / "definitions"

    for index, entry in enumerate(entries, start=1):
        word = entry["word"].strip().lower()
        stem = f"{index:02d}_{word}.mp3"
        await generate_track(word, args.out / stem)
        await generate_track(entry["definition"].strip(), definition_dir / stem)

    provenance = (
        "# Audio provenance\n\n"
        f"- Voice: `{APPROVED_VOICE}`\n"
        f"- Rate: `{APPROVED_RATE}`\n"
        f"- Generator: `edge-tts {edge_tts.__version__}`\n"
        f"- Source manifest: `{args.manifest.as_posix()}`\n"
        f"- Approval: {approval}\n"
        "- Silent fallback voices: prohibited\n"
    )
    (args.out / "PROVENANCE.md").write_text(provenance, encoding="utf-8")
    print(f"Generated {len(entries) * 2} Sonia MP3 tracks in {args.out}")


if __name__ == "__main__":
    asyncio.run(main())
