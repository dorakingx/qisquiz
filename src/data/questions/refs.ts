/**
 * Canonical official documentation URL builders.
 *
 * IBM Quantum documentation serves `/docs/<path>` as a 307 redirect to the
 * localized `/docs/en/<path>`. Questions must reference the canonical form so
 * the validator's "no redirecting references" rule holds. Every slug used here
 * is checked against `scripts/data/known-doc-urls.txt`, a snapshot of the
 * official docs sitemap taken on 2026-08-18.
 */

const DOCS_BASE = "https://quantum.cloud.ibm.com/docs/en";

/** A guide page, e.g. `guide("bit-ordering")`. */
export function guide(slug: string): string {
  return `${DOCS_BASE}/guides/${slug}`;
}

/** An API reference page, e.g. `api("qiskit/qiskit.circuit.QuantumCircuit")`. */
export function api(path: string): string {
  return `${DOCS_BASE}/api/${path}`;
}

/** The official OpenQASM 3 language specification. */
export const OPENQASM_SPEC = "https://openqasm.com/language/index.html";

/** Official IBM certification blueprint. */
export const CERT_BLUEPRINT =
  "https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400";
