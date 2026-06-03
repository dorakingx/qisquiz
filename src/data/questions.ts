import type { QuizQuestion } from "@/types/quiz";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Section 1: Perform quantum operations
  {
    id: "s1-pauli-001",
    section: 1,
    sectionTitle: "Perform quantum operations",
    difficulty: "easy",
    question:
      "Which Qiskit class represents the single-qubit Pauli-X (NOT) gate as an operator object?",
    choices: [
      "Pauli('X') from qiskit.quantum_info",
      "Gate('X') from qiskit.circuit.library",
      "Operator('NOT') from qiskit.opflow",
      "QuantumRegister('X', 1)",
    ],
    correctAnswerIndex: 0,
    explanation:
      "In Qiskit 2.x, Pauli operators live in qiskit.quantum_info. Pauli('X') is the standard operator representation. Circuit-level gates use qc.x() or library gates; opflow was removed in the 2.x migration.",
    tags: ["pauli-operators", "quantum-info"],
    sourceReference: "Qiskit v2.X Tutorial — Section 1",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/quantum_info",
  },
  {
    id: "s1-ordering-002",
    section: 1,
    sectionTitle: "Perform quantum operations",
    difficulty: "medium",
    question:
      "In Qiskit's default little-endian convention, which qubit index corresponds to the least significant bit in a multi-qubit measurement outcome string?",
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(3)
qc.x(0)  # flip qubit 0
# measure all qubits`,
    choices: [
      "Qubit index 0 (rightmost bit in the outcome string)",
      "Qubit index 2 (leftmost bit in the outcome string)",
      "The highest-index qubit is always the MSB in Qiskit",
      "Qubit ordering is backend-defined and not part of the circuit API",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Qiskit uses little-endian qubit ordering: qubit 0 is the least significant bit in classical bitstrings. For a 3-qubit circuit, flipping qubit 0 affects the rightmost character in the measured bitstring.",
    tags: ["qubit-ordering", "little-endian"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/bit-ordering",
  },
  {
    id: "s1-phase-003",
    section: 1,
    sectionTitle: "Perform quantum operations",
    difficulty: "hard",
    question:
      "A circuit applies only global phase gates (e.g., P(π) on every qubit simultaneously as a global factor). How does this affect measurement outcomes compared to a relative phase between computational basis states?",
    choices: [
      "Global phase does not change measurement probabilities; relative phase between superposition components does affect interference and outcomes.",
      "Global phase always changes every measured bitstring.",
      "Relative phase is ignored by all Qiskit simulators and hardware.",
      "Global and relative phase are indistinguishable in any quantum algorithm.",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Global phase is unobservable in projective measurement statistics. Relative phase between amplitudes in a superposition affects interference (e.g., in algorithms using Hadamard layers) and therefore changes outcome distributions.",
    tags: ["global-phase", "relative-phase"],
    sourceReference: "Qiskit v2.X Tutorial — Section 1",
  },

  // Section 2: Visualize quantum circuits, measurements, and states
  {
    id: "s2-draw-004",
    section: 2,
    sectionTitle: "Visualize quantum circuits, measurements, and states",
    difficulty: "easy",
    question:
      "Which method draws a QuantumCircuit inline in a Jupyter notebook with the default text-based style?",
    code: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2)
qc.h(0)
qc.cx(0, 1)
# display circuit diagram`,
    choices: [
      "qc.draw()",
      "qc.plot()",
      "qc.visualize()",
      "qc.render_bloch()",
    ],
    correctAnswerIndex: 0,
    explanation:
      "QuantumCircuit.draw() is the standard visualization entry point. Output format can be adjusted (e.g., output='mpl' for Matplotlib). Bloch sphere visualization uses separate tools such as plot_bloch_multivector on statevectors.",
    tags: ["circuit-drawing", "visualization"],
    sourceReference: "Qiskit v2.X Tutorial — Section 2",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/qiskit.circuit.QuantumCircuit#draw",
  },
  {
    id: "s2-histogram-005",
    section: 2,
    sectionTitle: "Visualize quantum circuits, measurements, and states",
    difficulty: "medium",
    question:
      "After running a Bell-state circuit many times, the histogram shows roughly equal counts for '00' and '11' and near-zero for '01' and '10'. What does this indicate?",
    choices: [
      "The state is an entangled Bell pair; only correlated outcomes appear.",
      "The simulator is broken because four outcomes should be equally likely.",
      "Measurement error always forces outcomes to '00' only.",
      "The histogram counts quasi-probabilities, not shot counts.",
    ],
    correctAnswerIndex: 0,
    explanation:
      "A Bell state (|00⟩+|11⟩)/√2 yields perfectly correlated measurements: only '00' and '11' appear (up to noise). Histograms from Sampler or backend results plot shot counts per bitstring.",
    tags: ["histogram", "measurement", "entanglement"],
    sourceReference: "Advocate Practice Exam Concept",
  },
  {
    id: "s2-bloch-006",
    section: 2,
    sectionTitle: "Visualize quantum circuits, measurements, and states",
    difficulty: "hard",
    question:
      "Which workflow correctly visualizes a single-qubit state on the Bloch sphere after applying gates?",
    code: `from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)
qc.h(0)
sv = Statevector(qc)
# visualize on Bloch sphere`,
    choices: [
      "Use plot_bloch_multivector(sv) from qiskit.visualization",
      "Call qc.draw(output='bloch')",
      "Use EstimatorV2 to retrieve Bloch coordinates",
      "Bloch visualization requires hardware execution first",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Statevector simulation followed by plot_bloch_multivector (or plot_bloch_vector for one qubit extracted from a state) is the standard visualization path. Circuits alone do not expose Bloch coordinates without statevector or state tomography.",
    tags: ["bloch-sphere", "statevector"],
    sourceReference: "Qiskit v2.X Tutorial — Section 2",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/visualization",
  },

  // Section 3: Create quantum circuits
  {
    id: "s3-param-007",
    section: 3,
    sectionTitle: "Create quantum circuits",
    difficulty: "medium",
    question:
      "How do you bind numeric values to parameters in a parametrized QuantumCircuit before execution?",
    code: `from qiskit.circuit import Parameter
from qiskit import QuantumCircuit

theta = Parameter("θ")
qc = QuantumCircuit(1)
qc.ry(theta, 0)
bound = qc.assign_parameters({theta: 1.57})`,
    choices: [
      "qc.assign_parameters({parameter: value}) returns a bound circuit",
      "Parameters bind automatically when the circuit is transpiled",
      "Use qc.set_params([1.57]) on the unbound circuit",
      "Parameters are only supported in OpenQASM 2 export",
    ],
    correctAnswerIndex: 0,
    explanation:
      "assign_parameters (or bind_parameters in older docs) produces a concrete circuit with numeric angles. Bound circuits can then be transpiled or submitted to Runtime primitives with optional parameter_values in PUBs.",
    tags: ["parameterized-circuits", "assign_parameters"],
    sourceReference: "Qiskit v2.X Tutorial — Section 3",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/qiskit.circuit.QuantumCircuit#assign_parameters",
  },
  {
    id: "s3-pm-008",
    section: 3,
    sectionTitle: "Create quantum circuits",
    difficulty: "hard",
    question:
      "In Qiskit 2.x, which function builds a preset pass manager targeting a BackendV2 or Target for ISA-compliant circuits?",
    code: `from qiskit import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
backend = service.backend("ibm_torino")
pm = generate_preset_pass_manager(optimization_level=1, target=backend.target)
isa_circuit = pm.run(circuit)`,
    choices: [
      "generate_preset_pass_manager(..., target=backend.target)",
      "PassManager.from_preset(backend=backend) in qiskit.transpiler",
      "backend.transpile(circuit) is the only 2.x API",
      "generate_preset_pass_manager requires OpenQASM input",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Qiskit 2.x recommends generate_preset_pass_manager with a Target (often from backend.target) to produce ISA-compliant circuits. This replaces many legacy transpile(backend=...) workflows for Runtime submission.",
    tags: ["generate_preset_pass_manager", "transpilation", "ISA"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/transpiler",
  },
  {
    id: "s3-if-test-009",
    section: 3,
    sectionTitle: "Create quantum circuits",
    difficulty: "hard",
    question:
      "Which pattern correctly constructs a dynamic circuit with mid-circuit measurement and conditional operations in Qiskit?",
    code: `from qiskit import QuantumCircuit, ClassicalRegister

qr = QuantumCircuit(2, 1)
qr.h(0)
qr.measure(0, 0)
with qr.if_test((0, 1)):
    qr.x(1)`,
    choices: [
      "Use qc.if_test((clbit, value)) context manager after measure",
      "Use qc.c_if(classical_register, value) — the only dynamic API in 2.x",
      "Dynamic circuits require OpenQASM 3 export before construction",
      "if_test is deprecated; use QuantumCircuit.control_flow_legacy",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Qiskit 2.x dynamic circuits use if_test (and related control-flow builders) tied to classical register conditions after measurement. Legacy c_if exists but if_test is the modern control-flow interface for mid-circuit feedback.",
    tags: ["dynamic-circuits", "if_test", "mid-circuit-measurement"],
    sourceReference: "Qiskit v2.X Tutorial — Section 3",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/circuit-library",
  },

  // Section 4: Run quantum circuits
  {
    id: "s4-batch-010",
    section: 4,
    sectionTitle: "Run quantum circuits",
    difficulty: "medium",
    question:
      "You have dozens of independent SamplerV2 jobs (unrelated circuits, no iterative hybrid loop). Which Runtime execution mode best groups them for efficient scheduling?",
    choices: [
      "Batch mode — package independent workloads for grouped execution",
      "Session — required for every primitive call in Qiskit 2.x",
      "Direct run() without session or batch is always fastest",
      "Batch mode only supports EstimatorV2, not SamplerV2",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Batch mode targets collections of independent primitive workloads. Sessions optimize iterative algorithms that reuse context across many related calls (e.g., VQE parameter updates).",
    tags: ["batch-mode", "runtime", "sampler"],
    sourceReference: "Qiskit v2.X Tutorial — Section 4",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/run-jobs-batch",
  },
  {
    id: "s4-session-011",
    section: 4,
    sectionTitle: "Run quantum circuits",
    difficulty: "medium",
    question:
      "Your hybrid algorithm calls EstimatorV2 repeatedly with updated parameters on related circuits. What should you use to minimize queue overhead?",
    choices: [
      "Open a Qiskit Runtime Session and run EstimatorV2 inside it",
      "Use Batch mode because sessions cannot host EstimatorV2",
      "Submit each call as a separate service instance without grouping",
      "Sessions are deprecated; use job arrays only",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Sessions maintain execution context for iterative hybrid workloads. Batch is for independent jobs, not parameter-sweep loops within one algorithm.",
    tags: ["session", "runtime", "estimator"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/run-jobs-session",
  },
  {
    id: "s4-backendv2-012",
    section: 4,
    sectionTitle: "Run quantum circuits",
    difficulty: "hard",
    question:
      "When preparing circuits for IBM hardware in Qiskit 2.x, what object from a BackendV2 instance defines gate calibrations, connectivity, and instruction support for transpilation?",
    code: `from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
backend = service.backend("ibm_torino")
target = backend.target`,
    choices: [
      "backend.target (a Target object)",
      "backend.configuration().coupling_map only",
      "backend.properties().gates list without a Target",
      "BackendV2 does not expose transpilation metadata",
    ],
    correctAnswerIndex: 0,
    explanation:
      "BackendV2 exposes a Target describing supported instructions, qubit properties, and coupling. generate_preset_pass_manager and transpiler passes consume Target for ISA-aware compilation.",
    tags: ["BackendV2", "target", "transpilation"],
    sourceReference: "Qiskit v2.X Tutorial — Section 4",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/providers",
  },

  // Section 5: Use the Sampler primitive
  {
    id: "s5-pub-013",
    section: 5,
    sectionTitle: "Use the Sampler primitive",
    difficulty: "medium",
    question:
      "What is the minimum valid PUB tuple shape for SamplerV2 when sampling a non-parametrized circuit?",
    code: `from qiskit.primitives import StatevectorSampler

sampler = StatevectorSampler()
pub = (circuit,)
result = sampler.run([pub])`,
    choices: [
      "(circuit,) — circuit only",
      "(circuit, observable) — same as EstimatorV2",
      "(circuit, shots) — shots must be in the PUB tuple",
      "(circuit, backend) — backend is required in each PUB",
    ],
    correctAnswerIndex: 0,
    explanation:
      "SamplerV2 PUBs are at minimum (circuit,). Parametrized circuits extend to (circuit, parameter_values). Observables belong to EstimatorV2; shots and options are set via run options, not the PUB tuple.",
    tags: ["SamplerV2", "PUB", "primitives"],
    sourceReference: "Qiskit v2.X Tutorial — Section 5",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/primitives",
  },
  {
    id: "s5-result-014",
    section: 5,
    sectionTitle: "Use the Sampler primitive",
    difficulty: "hard",
    question:
      "After result = sampler.run(pubs).result(), how do you access measurement data for the first PUB in Qiskit 2.x primitives?",
    choices: [
      "result[0].data.meas or the documented PubResult data fields for bitstrings",
      "result.get_counts(0) — legacy V1 API",
      "result.values[0] returns a plain Python float",
      "SamplerV2 returns only metadata; counts require separate job retrieval",
    ],
    correctAnswerIndex: 0,
    explanation:
      "V2 primitives return PrimitiveResult with ordered PubResult entries. Each PubResult exposes a data object (e.g., meas for bitstring registers) rather than V1-style result.get_counts().",
    tags: ["SamplerV2", "PubResult", "result-navigation"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/primitives",
  },
  {
    id: "s5-sampling-015",
    section: 5,
    sectionTitle: "Use the Sampler primitive",
    difficulty: "easy",
    question:
      "What does SamplerV2 compute for a prepared quantum circuit?",
    choices: [
      "Quasi-probability or bitstring samples from measurement of the circuit",
      "Expectation values of Pauli observables",
      "Exact statevector amplitudes on hardware",
      "Optimized circuit depth after transpilation only",
    ],
    correctAnswerIndex: 0,
    explanation:
      "SamplerV2 executes circuits and returns sampling results (counts/quasi-distributions over measured bitstrings). Expectation values are the domain of EstimatorV2.",
    tags: ["SamplerV2", "measurement", "sampling"],
    sourceReference: "Qiskit v2.X Tutorial — Section 5",
  },

  // Section 6: Use the Estimator primitive
  {
    id: "s6-pub-016",
    section: 6,
    sectionTitle: "Use the Estimator primitive",
    difficulty: "medium",
    question:
      "Which PUB tuple is valid for EstimatorV2 with a parametrized circuit and a SparsePauliOp observable?",
    code: `from qiskit.circuit import Parameter
from qiskit.quantum_info import SparsePauliOp

theta = Parameter("θ")
# circuit uses theta
obs = SparsePauliOp("ZZ")
pub = (circuit, obs, [0.5])`,
    choices: [
      "(circuit, observable, parameter_values)",
      "(observable, circuit, shots)",
      "(circuit,) — observables are fixed on the service",
      "(circuit, shots, observable)",
    ],
    correctAnswerIndex: 0,
    explanation:
      "EstimatorV2 PUBs are (circuit, observable) with optional parameter_values when the circuit is parametrized. Shots/precision are options on the primitive run, not mandatory PUB tuple elements.",
    tags: ["EstimatorV2", "PUB", "observables"],
    sourceReference: "Qiskit v2.X Tutorial — Section 6",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/primitives",
  },
  {
    id: "s6-precision-017",
    section: 6,
    sectionTitle: "Use the Estimator primitive",
    difficulty: "hard",
    question:
      "In EstimatorV2 on IBM Runtime, how do you typically control statistical accuracy of expectation values?",
    choices: [
      "Set precision (or related resilience options) in run options — not by embedding shots in the PUB tuple",
      "Pass shots as the third element of every PUB tuple",
      "Precision is fixed by hardware and cannot be configured",
      "Use SamplerV2 first, then convert counts to precision manually",
    ],
    correctAnswerIndex: 0,
    explanation:
      "EstimatorV2 uses precision-oriented options (and resilience settings) on the primitive options object. This differs from legacy V1 Estimator where default_shots was central. PUBs carry circuit/observable/parameter bindings.",
    tags: ["EstimatorV2", "precision", "shots"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/primitives",
  },
  {
    id: "s6-evs-018",
    section: 6,
    sectionTitle: "Use the Estimator primitive",
    difficulty: "easy",
    question:
      "What quantity does EstimatorV2 return for each PUB?",
    choices: [
      "Expectation value(s) of the supplied observable with respect to the prepared state",
      "Raw measurement bitstrings only",
      "Transpiled ISA circuit depth",
      "Gradient vectors for all parameters automatically",
    ],
    correctAnswerIndex: 0,
    explanation:
      "EstimatorV2 estimates ⟨O⟩ for observables O defined in each PUB. Gradients require separate algorithms (e.g., estimator-based gradients or SPSA), not default Estimator output.",
    tags: ["EstimatorV2", "expectation-values"],
    sourceReference: "Qiskit v2.X Tutorial — Section 6",
  },

  // Section 7: Retrieve and analyze results
  {
    id: "s7-job-019",
    section: 7,
    sectionTitle: "Retrieve and analyze results of quantum circuits",
    difficulty: "medium",
    question:
      "How do you retrieve a previously submitted Runtime primitive job by ID using QiskitRuntimeService?",
    code: `from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
job = service.job("YOUR_JOB_ID")
result = job.result()`,
    choices: [
      "service.job(job_id) then job.result()",
      "service.get_backend(job_id).run()",
      "Only jobs from the current session are retrievable",
      "Past jobs must be re-submitted; IDs are not persisted",
    ],
    correctAnswerIndex: 0,
    explanation:
      "QiskitRuntimeService.job() fetches a job handle by ID. Calling result() blocks until completion (or returns cached results). Job monitoring uses job.status() and similar methods.",
    tags: ["job-retrieval", "runtime", "monitoring"],
    sourceReference: "Qiskit v2.X Tutorial — Section 7",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/monitor-job",
  },
  {
    id: "s7-quasi-020",
    section: 7,
    sectionTitle: "Retrieve and analyze results of quantum circuits",
    difficulty: "hard",
    question:
      "A SamplerV2 result includes quasi-distribution data. What does a quasi-distribution represent compared to raw counts?",
    choices: [
      "A normalized distribution that may include negative quasi-probabilities before mitigation; counts are integer shot histograms",
      "Quasi-distributions are identical to counts on simulators",
      "Quasi-distributions only appear in EstimatorV2, never SamplerV2",
      "Counts are deprecated in V2; only quasi-distributions exist",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Quasi-distributions generalize probabilities and can appear after error mitigation workflows. Raw counts (meas registers) remain the direct shot histogram. Know which field your PubResult exposes for each.",
    tags: ["quasi-distributions", "counts", "analysis"],
    sourceReference: "Advocate Practice Exam Concept",
  },
  {
    id: "s7-extract-021",
    section: 7,
    sectionTitle: "Retrieve and analyze results of quantum circuits",
    difficulty: "medium",
    question:
      "Given a completed EstimatorV2 PrimitiveResult, how should you map results back to input PUBs?",
    choices: [
      "Result list order matches input PUB order — result[i] corresponds to pubs[i]",
      "Results are keyed by circuit.name only",
      "PUB order is randomized after execution",
      "Only the last PUB result is returned for batch jobs",
    ],
    correctAnswerIndex: 0,
    explanation:
      "V2 primitives preserve ordering: each PubResult aligns with its input PUB index. This is essential when batching multiple observables or parameter bindings.",
    tags: ["PubResult", "data-extraction", "EstimatorV2"],
    sourceReference: "Qiskit v2.X Tutorial — Section 7",
  },

  // Section 8: Operate with OpenQASM
  {
    id: "s8-import-022",
    section: 8,
    sectionTitle: "Operate with OpenQASM",
    difficulty: "medium",
    question:
      "Which API loads an OpenQASM 3 program string into a QuantumCircuit in Qiskit 2.x?",
    code: `from qiskit.qasm3 import loads

src = '''OPENQASM 3;
include "stdgates.inc";
qubit q;
h q;
'''
qc = loads(src)`,
    choices: [
      "qiskit.qasm3.loads(string)",
      "QuantumCircuit.from_qasm_str(string) for all QASM versions",
      "qiskit.qasm2.loads(string) — OQ3 is backward compatible",
      "OpenQASM 3 requires manual gate-by-gate construction only",
    ],
    correctAnswerIndex: 0,
    explanation:
      "OpenQASM 3 uses qiskit.qasm3 (loads/load). QuantumCircuit.from_qasm_str targets OpenQASM 2. Match the loader to the language version.",
    tags: ["OpenQASM-3", "import", "interoperability"],
    sourceReference: "Qiskit v2.X Tutorial — Section 8",
    relatedDocsUrl: "https://docs.quantum.ibm.com/guides/interoperate-qasm",
  },
  {
    id: "s8-export-023",
    section: 8,
    sectionTitle: "Operate with OpenQASM",
    difficulty: "hard",
    question:
      "What is the difference between qiskit.qasm3.dumps and qiskit.qasm3.dump?",
    choices: [
      "dumps returns a string; dump writes to a file path or stream",
      "dump is deprecated; only dumps exists in 2.x",
      "dumps exports QASM 2; dump exports QASM 3",
      "They are aliases with identical behavior",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Following Python conventions, dumps serializes to str and dump writes to a file. Both export QuantumCircuit objects to OpenQASM 3 text.",
    tags: ["OpenQASM-3", "export", "dumps", "dump"],
    sourceReference: "Advocate Practice Exam Concept",
    relatedDocsUrl: "https://docs.quantum.ibm.com/api/qiskit/qasm3",
  },
  {
    id: "s8-syntax-024",
    section: 8,
    sectionTitle: "Operate with OpenQASM",
    difficulty: "easy",
    question:
      "Which OpenQASM 3 construct declares a single quantum bit (distinct from legacy qreg syntax)?",
    code: `OPENQASM 3;
include "stdgates.inc";
qubit q;
h q;`,
    choices: [
      "qubit q; — hardware-style single-qubit declaration",
      "qreg q[1]; — required in all OQ3 programs",
      "quantum bit q — keyword order is mandatory",
      "Qubit q = new Qubit() — object construction syntax",
    ],
    correctAnswerIndex: 0,
    explanation:
      "OpenQASM 3 introduces qubit and bit types for hardware-oriented programs. Legacy QASM 2 uses qreg/creg. Qiskit's qasm3 loader accepts OQ3 declarations when importing programs.",
    tags: ["OpenQASM-3", "syntax", "data-types"],
    sourceReference: "Qiskit v2.X Tutorial — Section 8",
  },
];
