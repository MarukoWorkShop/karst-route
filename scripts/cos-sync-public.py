#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Upload public/destinations|tours|reviews|light to Tencent COS (same object keys).

Credentials: macOS dialog (never printed), or TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRET_KEY.
Optional args: only sync listed dirs, e.g. `python3 scripts/cos-sync-public.py light`
"""
from __future__ import annotations

import mimetypes
import os
import subprocess
import sys
from pathlib import Path

from qcloud_cos import CosConfig, CosS3Client

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
DIRS = ("destinations", "tours", "reviews", "light")
BUCKET = "youxian-travel-1412422924"
REGION = "ap-guangzhou"
SKIP_SUFFIXES = {".md", ".txt", ".DS_Store"}


def ask_gui(prompt: str, hidden: bool = False) -> str | None:
    hidden_opt = " with hidden answer" if hidden else ""
    script = (
        f'display dialog "{prompt}" default answer ""{hidden_opt} '
        'with title "腾讯云 COS 上传" '
        'buttons {"取消", "确定"} default button "确定"'
    )
    try:
        r = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=600,
        )
        if r.returncode != 0:
            return None
        out = r.stdout.strip()
        if "text returned:" in out:
            return out.split("text returned:", 1)[1].strip()
        return None
    except Exception:
        return None


def collect_files(dirs: tuple[str, ...] = DIRS) -> list[tuple[Path, str]]:
    out: list[tuple[Path, str]] = []
    for d in dirs:
        base = PUBLIC / d
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            if path.name.startswith("."):
                continue
            if path.suffix.lower() in SKIP_SUFFIXES or path.name == "README.md":
                continue
            key = path.relative_to(PUBLIC).as_posix()
            out.append((path, key))
    return out


def content_type(path: Path) -> str:
    ctype, _ = mimetypes.guess_type(str(path))
    return ctype or "application/octet-stream"


def main() -> int:
    secret_id = os.environ.get("TENCENTCLOUD_SECRET_ID") or os.environ.get("COS_SECRET_ID")
    secret_key = os.environ.get("TENCENTCLOUD_SECRET_KEY") or os.environ.get("COS_SECRET_KEY")
    if not secret_id or not secret_key:
        secret_id = ask_gui("请输入腾讯云 SecretId：")
        secret_key = ask_gui("请输入腾讯云 SecretKey（输入将隐藏）：", hidden=True)
    if not secret_id or not secret_key:
        print("已取消：未提供密钥")
        return 1

    client = CosS3Client(
        CosConfig(Region=REGION, SecretId=secret_id, SecretKey=secret_key, Scheme="https")
    )
    # discard locals ASAP from further prints
    secret_id = secret_key = None

    dirs = tuple(a for a in sys.argv[1:] if a in DIRS) or DIRS
    files = collect_files(dirs)
    print(f"准备上传 {len(files)} 个文件到 {BUCKET}（目录：{', '.join(dirs)}）…")
    ok = fail = 0
    for i, (path, key) in enumerate(files, 1):
        size_kb = path.stat().st_size / 1024
        try:
            client.upload_file(
                Bucket=BUCKET,
                LocalFilePath=str(path),
                Key=key,
                PartSize=5,
                MAXThread=4,
                EnableMD5=False,
                ContentType=content_type(path),
            )
            ok += 1
            print(f"[{i}/{len(files)}] ok  {key}  ({size_kb:.0f} KB)")
        except Exception as e:
            fail += 1
            print(f"[{i}/{len(files)}] FAIL {key}: {e}", file=sys.stderr)
    print(f"完成：成功 {ok}，失败 {fail}")
    return 0 if fail == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
