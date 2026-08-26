#!/usr/bin/env python3
"""Generate only missing ID portraits and remember processed source images."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from typing import Any


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MANIFEST_NAME = ".crear-fotos-manifest.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Procesa únicamente las fotos que todavía no tienen retrato de carnet."
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
        help="Raíz del proyecto; por defecto, el directorio actual.",
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path("fotos"),
        help="Carpeta de fotos, relativa a la raíz salvo que sea absoluta.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output/imagegen"),
        help="Carpeta de salida, relativa a la raíz salvo que sea absoluta.",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Genera las fotos pendientes. Sin esta opción solo informa el plan.",
    )
    parser.add_argument(
        "--imagegen-script",
        type=Path,
        help="Ruta opcional al image_gen.py oficial.",
    )
    return parser.parse_args()


def resolve_from_root(root: Path, path: Path) -> Path:
    return path.resolve() if path.is_absolute() else (root / path).resolve()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_manifest(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"version": 1, "items": {}}

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"No se puede leer {path}; se detiene para evitar duplicados: {exc}"
        ) from exc

    if data.get("version") != 1 or not isinstance(data.get("items"), dict):
        raise RuntimeError(
            f"El manifiesto {path} no tiene un formato reconocido; no se generó nada."
        )
    return data


def save_manifest(path: Path, manifest: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def find_imagegen_script(explicit: Path | None) -> Path:
    if explicit is not None:
        candidate = explicit.expanduser().resolve()
        if candidate.is_file():
            return candidate
        raise RuntimeError(f"No existe el script de imagegen: {candidate}")

    candidates: list[Path] = []
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        candidates.append(
            Path(codex_home).expanduser() / "skills/imagegen/scripts/image_gen.py"
        )
    candidates.append(Path.home() / ".codex/skills/imagegen/scripts/image_gen.py")

    for candidate in candidates:
        if candidate.is_file():
            return candidate.resolve()

    raise RuntimeError(
        "No se encontró image_gen.py. Instalar o indicar la habilidad imagegen "
        "con --imagegen-script."
    )


def relative_label(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def record_item(
    manifest: dict[str, Any], source_hash: str, source: Path, target: Path, root: Path
) -> None:
    output_hash = file_sha256(target) if target.is_file() else None
    manifest["items"][source_hash] = {
        "source": relative_label(source, root),
        "output": relative_label(target, root),
        "output_sha256": output_hash,
    }


def main() -> int:
    args = parse_args()
    root = args.project_root.expanduser().resolve()
    input_dir = resolve_from_root(root, args.input_dir)
    output_dir = resolve_from_root(root, args.output_dir)
    manifest_path = output_dir / MANIFEST_NAME
    prompt_path = Path(__file__).resolve().parent.parent / "references/carnet-prompt.txt"

    if not input_dir.is_dir():
        print(f"ERROR: no existe la carpeta de entrada {input_dir}", file=sys.stderr)
        return 2
    if not prompt_path.is_file():
        print(f"ERROR: no existe el prompt {prompt_path}", file=sys.stderr)
        return 2

    try:
        manifest = load_manifest(manifest_path)
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    sources = sorted(
        (
            path
            for path in input_dir.iterdir()
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
        ),
        key=lambda path: path.name.casefold(),
    )

    pending: list[tuple[Path, Path, str]] = []
    planned_hashes: dict[str, Path] = {}
    skipped_existing = 0
    skipped_duplicate = 0
    manifest_changed = False

    for source in sources:
        source_hash = file_sha256(source)
        target = output_dir / f"{source.stem}-carnet.png"

        if target.exists():
            print(f"OMITIDA destino existente: {relative_label(target, root)}")
            skipped_existing += 1
            if args.execute and source_hash not in manifest["items"]:
                record_item(manifest, source_hash, source, target, root)
                manifest_changed = True
            continue

        previous = manifest["items"].get(source_hash)
        if previous is not None:
            print(
                "OMITIDA foto ya procesada: "
                f"{relative_label(source, root)} -> {previous.get('output', 'destino registrado')}"
            )
            skipped_duplicate += 1
            continue

        duplicate_in_batch = planned_hashes.get(source_hash)
        if duplicate_in_batch is not None:
            print(
                "OMITIDA foto duplicada en el lote: "
                f"{relative_label(source, root)} = {relative_label(duplicate_in_batch, root)}"
            )
            skipped_duplicate += 1
            continue

        planned_hashes[source_hash] = source
        pending.append((source, target, source_hash))
        print(
            f"PENDIENTE: {relative_label(source, root)} -> {relative_label(target, root)}"
        )

    if args.execute and manifest_changed:
        save_manifest(manifest_path, manifest)

    print(
        "RESUMEN: "
        f"{len(sources)} fuentes, {len(pending)} pendientes, "
        f"{skipped_existing} con destino existente, "
        f"{skipped_duplicate} duplicadas o ya procesadas."
    )

    if not args.execute or not pending:
        return 0

    if not os.environ.get("OPENAI_API_KEY"):
        print("ERROR: falta OPENAI_API_KEY; no se generó nada.", file=sys.stderr)
        return 2

    uv = shutil.which("uv")
    if uv is None:
        print("ERROR: no se encontró el ejecutable uv.", file=sys.stderr)
        return 2

    try:
        imagegen_script = find_imagegen_script(args.imagegen_script)
    except RuntimeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    output_dir.mkdir(parents=True, exist_ok=True)
    failures = 0
    created = 0

    for source, target, source_hash in pending:
        if target.exists():
            print(
                f"OMITIDA destino apareció durante la ejecución: {relative_label(target, root)}"
            )
            record_item(manifest, source_hash, source, target, root)
            save_manifest(manifest_path, manifest)
            continue

        command = [
            uv,
            "run",
            "--with",
            "openai",
            "python",
            str(imagegen_script),
            "edit",
            "--image",
            str(source),
            "--prompt-file",
            str(prompt_path),
            "--no-augment",
            "--size",
            "768x1024",
            "--quality",
            "low",
            "--out",
            str(target),
        ]
        print(f"GENERANDO: {relative_label(source, root)}")
        result = subprocess.run(command, check=False)

        if target.exists():
            record_item(manifest, source_hash, source, target, root)
            save_manifest(manifest_path, manifest)

        if result.returncode == 0 and target.is_file() and target.stat().st_size > 0:
            created += 1
            print(f"CREADA: {relative_label(target, root)}")
        else:
            failures += 1
            print(
                f"ERROR al procesar {relative_label(source, root)}; no se reintentará "
                "automáticamente.",
                file=sys.stderr,
            )

    print(f"RESULTADO: {created} creadas, {failures} fallidas.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
