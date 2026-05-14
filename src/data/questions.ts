export type Topic = "runtime" | "primitives" | "openqasm";

export type Choice = {
  id: string;
  label: string;
};

export type QuestionCode = {
  language: "python" | "openqasm";
  text: string;
};

export type QuizQuestion = {
  id: string;
  topic: Topic;
  prompt: string;
  code?: QuestionCode;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "rt-session-batch-1",
    topic: "runtime",
    prompt:
      "You are running many independent EstimatorV2 jobs (different circuits, no shared classical optimization loop). Which Qiskit Runtime execution mode is the best fit for throughput and cost on IBM Quantum hardware?",
    choices: [
      {
        id: "a",
        label:
          "Session — open a session and submit each job inside it so the queue keeps the same context.",
      },
      {
        id: "b",
        label:
          "Batch — group many workloads into a batch primitive request so the stack can schedule them efficiently.",
      },
      {
        id: "c",
        label:
          "Neither — always use `run()` without session or batch for maximum parallelism.",
      },
      {
        id: "d",
        label:
          "Session — batch mode is deprecated and only sessions are supported in Qiskit 2.x.",
      },
    ],
    correctChoiceId: "b",
    explanation:
      "IBM Quantum **Batch** is intended for sets of independent primitive workloads that can be packaged and executed with efficient scheduling. A **Session** is better when you reuse the same session context for iterative or tightly coupled work (for example many rounds in one algorithm). Unscoped `run()` works but does not replace batch semantics for grouped throughput.",
  },
  {
    id: "rt-session-batch-2",
    topic: "runtime",
    prompt:
      "Your VQE loop calls EstimatorV2 repeatedly with updated parameters on related circuits within one algorithm. What pattern should you prefer to keep latency predictable and reuse runtime context?",
    choices: [
      {
        id: "a",
        label:
          "Open a Qiskit Runtime **Session** and run EstimatorV2 inside that session for the optimization loop.",
      },
      {
        id: "b",
        label:
          "Use **Batch** only — sessions cannot host EstimatorV2 in Qiskit 2.x.",
      },
      {
        id: "c",
        label:
          "Avoid sessions; spawn a new service instance for every parameter update.",
      },
      {
        id: "d",
        label:
          "Batch is required whenever you pass more than one PUB to EstimatorV2.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "A **Session** keeps a coherent execution context for iterative hybrid workloads (parameter sweeps, VQE/QAOA-style loops). **Batch** optimizes independent jobs; it is not a substitute for session-style iteration when you repeatedly refine parameters on related work inside one algorithm.",
  },
  {
    id: "prim-estimator-pub-1",
    topic: "primitives",
    prompt:
      "In Qiskit Runtime EstimatorV2, each input workload is a Primitive Unified Bloc (PUB). Which tuple shape matches the usual EstimatorV2 PUB contract (circuit, observable, optional parameter values)?",
    code: {
      language: "python",
      text: `from qiskit.circuit.library import RealAmplitudes
from qiskit.quantum_info import SparsePauliOp

circuit = RealAmplitudes(num_qubits=2, reps=1)
observable = SparsePauliOp("ZZ")

# Which PUB is valid for EstimatorV2?
pub = (circuit, observable)`,
    },
    choices: [
      {
        id: "a",
        label: "`(circuit, observable)` — circuit first, then observable (Pauli-sum-like).",
      },
      {
        id: "b",
        label: "`(observable, circuit)` — observable must precede the circuit.",
      },
      {
        id: "c",
        label: "`(circuit,)` only — observables are fixed on the service, not per PUB.",
      },
      {
        id: "d",
        label: "`(circuit, observable, shots)` — shots are always the third tuple element.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "EstimatorV2 PUBs are built as **`(circuit, observable)`** with optional **parameter values** when the circuit is parametrized (for example `(circuit, observable, parameter_values)`). Shots and other options are carried on the **options** object (`precision`, etc.), not as a mandatory third tuple slot.",
  },
  {
    id: "prim-sampler-pub-1",
    topic: "primitives",
    prompt:
      "SamplerV2 consumes PUBs that describe circuits (and optional bindings) to sample bitstrings from prepared quantum states. What does `SamplerV2.run` expect as its primary argument?",
    code: {
      language: "python",
      text: `from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler()
# Runtime SamplerV2 follows the same PUB list shape.
result = sampler.run([(circuit,)])`,
    },
    choices: [
      {
        id: "a",
        label:
          "A list/tuple of PUBs, each commonly ` (circuit,) ` or ` (circuit, parameter_values) ` when parametrized.",
      },
      {
        id: "b",
        label:
          "A single `QuantumCircuit` only — PUB formatting applies to EstimatorV2, not SamplerV2.",
      },
      {
        id: "c",
        label:
          "A list of `(circuit, observable)` tuples identical to EstimatorV2.",
      },
      {
        id: "d",
        label:
          "A dict mapping job IDs to circuits; PUBs are constructed server-side.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "SamplerV2 is organized around **PUB lists** where each PUB is at minimum **`(circuit,)`**. Parametrized circuits extend the tuple with **`parameter_values`** (shape aligned to the circuit’s parameters). Observables belong to EstimatorV2 PUBs, not SamplerV2.",
  },
  {
    id: "prim-result-shape-1",
    topic: "primitives",
    prompt:
      "After `result = estimator.run(pubs)` with EstimatorV2, how should client code read expectation values per PUB?",
    choices: [
      {
        id: "a",
        label:
          "`result[i].data.evs` (or the documented `PubResult` fields) indexed in the same order as `pubs`.",
      },
      {
        id: "b",
        label: "`result.get_expectation_values()` returns a plain Python float.",
      },
      {
        id: "c",
        label:
          "`result.metadata['values']` is the only supported access path in v2.",
      },
      {
        id: "d",
        label:
          "Expectation values arrive on `result.circuits[i].expectation_value`.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "V2 primitives return a **`PrimitiveResult`** containing ordered **`PubResult`** entries—one per input PUB. Inspect the **`data`** payload on each `PubResult` (for example expectation-related fields exposed for EstimatorV2) rather than legacy v1 `.result` arrays.",
  },
  {
    id: "oq3-load-1",
    topic: "openqasm",
    prompt:
      "You received an OpenQASM 3 program string from a partner. Which Qiskit 2.x import path loads it into a `QuantumCircuit`?",
    code: {
      language: "python",
      text: `from qiskit import QuantumCircuit
from qiskit.qasm3 import loads

src = '''OPENQASM 3;
include "stdgates.inc";
qubit q;
h q;
'''
qc = loads(src)`,
    },
    choices: [
      {
        id: "a",
        label: "`from qiskit.qasm3 import loads` then `qc = loads(src)`",
      },
      {
        id: "b",
        label: "`QuantumCircuit.from_qasm_str(src)` — preferred for all QASM versions.",
      },
      {
        id: "c",
        label: "`from qiskit.qasm2 import loads` — OQ3 is backward-compatible loader.",
      },
      {
        id: "d",
        label: "`QuantumCircuit.from_qasm_file` with a `.qasm3` extension auto-detects OQ3.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "OpenQASM 3 uses the **`qiskit.qasm3`** module (`loads` / `load` for files). **`QuantumCircuit.from_qasm_str`** targets **OpenQASM 2** semantics. Mixing loaders is a common exam trap—match the language version to **`qasm3`** vs **`qasm2`**.",
  },
  {
    id: "oq3-syntax-1",
    topic: "openqasm",
    prompt:
      "Which snippet is valid OpenQASM 3 style hardware description (as opposed to legacy OpenQASM 2 `qreg` / `creg` syntax)?",
    code: {
      language: "openqasm",
      text: `OPENQASM 3;
include "stdgates.inc";

qubit q;
bit r;
h q;
measure q -> r;`,
    },
    choices: [
      {
        id: "a",
        label:
          "The snippet is valid OQ3: `qubit` / `bit` declarations and `measure q -> r;`.",
      },
      {
        id: "b",
        label:
          "Invalid — OQ3 still requires `qreg q[1];` and `creg r[1];` exclusively.",
      },
      {
        id: "c",
        label:
          "Invalid — `measure` must be `measure q[0] -> r[0];` with bracket indexing only.",
      },
      {
        id: "d",
        label:
          "Invalid — `include \"stdgates.inc\";` is QASM 2 only and is rejected in OQ3.",
      },
    ],
    correctChoiceId: "a",
    explanation:
      "OpenQASM 3 introduces **`qubit` / `bit`** declarations and allows `measure q -> r;` with hardware-style types. Qiskit’s OQ3 path (`qiskit.qasm3`) interoperates with these constructs when importing programs.",
  },
];

export const TOPIC_LABEL: Record<Topic, string> = {
  runtime: "Qiskit Runtime",
  primitives: "V2 primitives",
  openqasm: "OpenQASM 3",
};
