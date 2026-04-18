#!/usr/bin/env python3
"""Automatisches Bumpen der App-Version je Zielbranch.

Regeln:
- dev  -> Patch +1
- main -> Minor +1, Patch = 0
- Major wird manuell in version.json gepflegt.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def update_backend_pom(path: Path, version: str) -> None:
    content = path.read_text(encoding="utf-8")
    updated = re.sub(
        r"(<artifactId>tarot-backend</artifactId>\s*<version>)([^<]+)(</version>)",
        rf"\g<1>{version}\g<3>",
        content,
        count=1,
        flags=re.MULTILINE,
    )
    if updated == content:
        raise RuntimeError("Konnte backend/pom.xml nicht aktualisieren.")
    path.write_text(updated, encoding="utf-8")


def update_frontend_package_lock(path: Path, version: str) -> None:
    content = path.read_text(encoding="utf-8")
    updated = re.sub(r'("version"\s*:\s*")\d+\.\d+\.\d+(")', rf"\g<1>{version}\2", content, count=2)
    if updated == content:
        raise RuntimeError("Konnte frontend/package-lock.json nicht aktualisieren.")
    path.write_text(updated, encoding="utf-8")


def bump_version(current: dict, branch: str) -> dict:
    next_version = dict(current)

    if branch == "dev":
        next_version["patch"] += 1
    elif branch == "main":
        next_version["minor"] += 1
        next_version["patch"] = 0
    else:
        raise ValueError(f"Branch '{branch}' ist fuer automatische Versionierung nicht freigegeben.")

    return next_version


def to_semver(payload: dict) -> str:
    return f"{payload['major']}.{payload['minor']}.{payload['patch']}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--branch", default=None, help="Branchname (default: GITHUB_REF_NAME)")
    args = parser.parse_args()

    branch = args.branch or os.environ.get("GITHUB_REF_NAME", "")

    if branch not in {"dev", "main"}:
        print(f"Kein automatischer Version-Bump fuer Branch '{branch}'.")
        return 0

    repo_root = Path(__file__).resolve().parents[2]
    version_file = repo_root / "version.json"
    frontend_package = repo_root / "frontend" / "package.json"
    frontend_lock = repo_root / "frontend" / "package-lock.json"
    backend_pom = repo_root / "backend" / "pom.xml"

    current_version = load_json(version_file)
    next_version = bump_version(current_version, branch)
    semver = to_semver(next_version)

    write_json(version_file, next_version)

    frontend_pkg_payload = load_json(frontend_package)
    frontend_pkg_payload["version"] = semver
    write_json(frontend_package, frontend_pkg_payload)

    update_frontend_package_lock(frontend_lock, semver)
    update_backend_pom(backend_pom, semver)

    print(f"Version aktualisiert: {to_semver(current_version)} -> {semver} ({branch})")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # pragma: no cover
        print(f"Fehler beim Version-Bump: {exc}", file=sys.stderr)
        raise SystemExit(1)


