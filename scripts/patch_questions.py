"""Field-level patcher for the TypeScript question source files.

Locates a question block by its explicit `id:` and replaces, inserts, or
removes individual fields without disturbing the rest of the file.

Used only during authoring; the question files remain the source of truth.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SECTION_FILES = {
    n: ROOT / f"src/data/questions/section-{n}.ts" for n in range(1, 9)
}

# Fields appear in this order inside a seed object.
FIELD_ORDER = [
    "id", "difficulty", "type", "question", "code", "codeStatus", "language",
    "choices", "answer", "explanation", "mistake", "tags", "concept",
    "objective", "refs", "seconds", "reviewedOn", "waivers",
]


def _find_block(source: str, qid: str):
    marker = f'      id: "{qid}",\n'
    start = source.find(marker)
    if start == -1:
        raise KeyError(f"question {qid} not found")
    open_brace = source.rfind("    {\n", 0, start)
    if open_brace == -1:
        raise KeyError(f"opening brace for {qid} not found")
    # Scan forward tracking brace depth, skipping string literals.
    i = open_brace
    depth = 0
    in_str = False
    quote = ""
    while i < len(source):
        ch = source[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                in_str = False
        else:
            if ch in "\"'`":
                in_str = True
                quote = ch
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    if source[end : end + 1] == ",":
                        end += 1
                    if source[end : end + 1] == "\n":
                        end += 1
                    return open_brace, end
        i += 1
    raise KeyError(f"unterminated block for {qid}")


def _field_span(block: str, key: str):
    """Return (start, end) of `      <key>: <value>,\n` inside a seed block."""
    pattern = re.compile(rf"^      {re.escape(key)}:", re.M)
    match = pattern.search(block)
    if not match:
        return None
    i = match.end()
    depth = 0
    in_str = False
    quote = ""
    while i < len(block):
        ch = block[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == quote:
                in_str = False
        else:
            if ch in "\"'`":
                in_str = True
                quote = ch
            elif ch in "{[(":
                depth += 1
            elif ch in "}])":
                depth -= 1
            elif ch == "," and depth == 0:
                end = i + 1
                if block[end : end + 1] == "\n":
                    end += 1
                return match.start(), end
        i += 1
    raise ValueError(f"unterminated field {key}")


def _render(key: str, value: str) -> str:
    """Render a field. `value` is raw TypeScript source for the value."""
    single = f"      {key}: {value},\n"
    if "\n" not in value and len(single) <= 82:
        return single
    if value.startswith('"') and "\n" not in value:
        return f"      {key}:\n        {value},\n"
    return single


def patch(qid: str, fields: dict, remove=()):
    section = int(qid[1])
    path = SECTION_FILES[section]
    source = path.read_text()
    start, end = _find_block(source, qid)
    block = source[start:end]

    for key in remove:
        span = _field_span(block, key)
        if span:
            block = block[: span[0]] + block[span[1] :]

    for key, value in fields.items():
        span = _field_span(block, key)
        rendered = _render(key, value)
        if span:
            block = block[: span[0]] + rendered + block[span[1] :]
        else:
            # Insert in canonical field order.
            insert_at = None
            position = FIELD_ORDER.index(key)
            for later in FIELD_ORDER[position + 1 :]:
                later_span = _field_span(block, later)
                if later_span:
                    insert_at = later_span[0]
                    break
            if insert_at is None:
                insert_at = block.rfind("    }")
            block = block[:insert_at] + rendered + block[insert_at:]

    path.write_text(source[:start] + block + source[end:])


def apply_all(patches: dict):
    for qid, spec in patches.items():
        patch(qid, spec.get("fields", {}), spec.get("remove", ()))
    print(f"patched {len(patches)} questions")


if __name__ == "__main__":
    print("import this module and call apply_all(...)", file=sys.stderr)
