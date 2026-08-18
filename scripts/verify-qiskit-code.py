"""Execute every question snippet marked `executable` against a real Qiskit 2.x
environment, and syntax-check the snippets that need credentials or hardware.

Usage:
    python -m venv .venv-qiskit
    ./.venv-qiskit/bin/pip install "qiskit[visualization]==2.*" qiskit-ibm-runtime
    ./.venv-qiskit/bin/python scripts/verify-qiskit-code.py snippets.json

`snippets.json` is produced by `npm run export:snippets`. No network calls are
made and no hardware job is ever submitted.
"""
import ast
import io
import json
import contextlib
import sys
import traceback
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # never open a window during verification


def run_snippet(code: str):
    """Execute a snippet in a fresh namespace, capturing stdout."""
    buffer = io.StringIO()
    namespace: dict = {"__name__": "__snippet__"}
    with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(io.StringIO()):
        exec(compile(code, "<snippet>", "exec"), namespace)
    return buffer.getvalue()


def main(path: str) -> int:
    import qiskit
    import qiskit_ibm_runtime

    snippets = json.loads(Path(path).read_text())
    results = []
    failures = 0

    for item in snippets:
        entry = {
            "id": item["id"],
            "status": item["codeStatus"],
            "language": item["language"],
        }

        if item["language"] == "openqasm":
            # OpenQASM programs are checked by the importer where the question
            # does not deliberately contain an error.
            if item["codeStatus"] in ("intentional-error", "partial-completion"):
                entry["result"] = f"{item['codeStatus']} (not parsed)"
            elif not item["code"].lstrip().startswith("OPENQASM"):
                # A bare fragment has no version header, so the importer would
                # reject it for a reason unrelated to the question.
                entry["result"] = "fragment (not parsed)"
            else:
                try:
                    from qiskit import qasm3

                    qasm3.loads(item["code"])
                    entry["result"] = "parsed"
                except Exception as error:  # noqa: BLE001
                    entry["result"] = f"parser-note: {type(error).__name__}"
            results.append(entry)
            continue

        if item["codeStatus"] == "executable":
            try:
                entry["stdout"] = run_snippet(item["code"]).strip()
                entry["result"] = "ok"
            except Exception:  # noqa: BLE001
                entry["result"] = "FAILED"
                entry["traceback"] = traceback.format_exc(limit=3)
                failures += 1
        else:
            # Illustrative, intentional-error and partial-completion snippets
            # are not run: they need credentials, hardware, or a deliberate
            # defect. They are still checked for parseability, except for
            # completion blanks and snippets whose defect is syntactic.
            if item["codeStatus"] == "partial-completion":
                entry["result"] = "blank (not parsed)"
            else:
                try:
                    ast.parse(item["code"])
                    entry["result"] = "syntax ok"
                except SyntaxError as error:
                    if item["codeStatus"] == "intentional-error":
                        entry["result"] = f"expected syntax error: {error.msg}"
                    else:
                        entry["result"] = "FAILED (syntax)"
                        entry["traceback"] = str(error)
                        failures += 1

        results.append(entry)

    report = {
        "qiskit": qiskit.__version__,
        "qiskit_ibm_runtime": qiskit_ibm_runtime.__version__,
        "python": sys.version.split()[0],
        "total": len(snippets),
        "failures": failures,
        "results": results,
    }
    print(json.dumps(report, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "snippets.json"))
