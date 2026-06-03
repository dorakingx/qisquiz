import type { Difficulty, QuizQuestion } from "@/types/quiz";

type QuestionSeed = {
  difficulty: Difficulty;
  question: string;
  code?: string;
  choices: [string, string, string, string];
  explanation: string;
  tags: string[];
  examSkill: string;
  commonMistake?: string;
  relatedDocsUrl?: string;
  estimatedTimeSeconds?: number;
  concept?: string;
  objective?: string;
};

type SectionBank = {
  title: string;
  docsUrl: string;
  seeds: QuestionSeed[];
};

const SOURCE_REFERENCE =
  "Original Qisquiz item mapped to IBM C1000-179 objectives";

const SECTION_BANK: Record<number, SectionBank> = {
  1: {
    title: "Perform quantum operations",
    docsUrl: "https://docs.quantum.ibm.com/guides/bit-ordering",
    seeds: [
      {
        difficulty: "easy",
        question: "Which operation flips a computational-basis qubit from |0> to |1>?",
        choices: ["The X gate", "The Z gate", "The S gate", "The identity gate"],
        explanation: "X is the Pauli bit-flip gate, so it maps |0> to |1> and |1> to |0>.",
        tags: ["pauli-operators", "quantum-gates"],
        examSkill: "Identify basic Pauli operations.",
      },
      {
        difficulty: "easy",
        question: "What state does an H gate prepare when applied to |0>?",
        code: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.h(0)",
        choices: ["An equal superposition of |0> and |1>", "The classical value 1", "The |-> state only", "A measured bit"],
        explanation: "H|0> = (|0> + |1>)/sqrt(2), which gives equal Z-basis measurement probabilities.",
        tags: ["quantum-gates", "statevector"],
        examSkill: "Reason about single-qubit gate effects.",
      },
      {
        difficulty: "easy",
        question: "Which statement best describes a projective measurement in the computational basis?",
        choices: ["It returns a classical bit and collapses the measured qubit into the observed basis state.", "It always preserves the full quantum state unchanged.", "It only reports phases and never amplitudes.", "It creates entanglement between all qubits automatically."],
        explanation: "Computational-basis measurement produces classical information and collapses the measured subsystem to the observed outcome.",
        tags: ["measurement"],
        examSkill: "Explain measurement basics.",
      },
      {
        difficulty: "easy",
        question: "Which Pauli gate changes the phase of |1> while leaving |0> unchanged?",
        choices: ["Z", "X", "H", "CX"],
        explanation: "Z maps |0> to |0> and |1> to -|1>, so it changes a relative phase without swapping basis states.",
        tags: ["pauli-operators", "relative-phase"],
        examSkill: "Match Pauli gates to state transformations.",
      },
      {
        difficulty: "easy",
        question: "In Qiskit's integer interpretation of basis states, which qubit is least significant?",
        choices: ["Qubit 0", "The highest-index qubit", "The last qubit drawn at the top", "Whichever qubit is measured first"],
        explanation: "Qiskit uses little-endian indexing for integer values, so qubit 0 is the least-significant bit.",
        tags: ["little-endian", "qubit-ordering"],
        examSkill: "Apply Qiskit bit-ordering rules.",
        commonMistake: "Confusing the diagram's vertical order with integer significance.",
      },
      {
        difficulty: "medium",
        question: "After the circuit is measured into matching classical bits, which bitstring is expected ideally?",
        code: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)\nqc.x(0)\nqc.measure([0, 1, 2], [0, 1, 2])",
        choices: ["001", "100", "010", "111"],
        explanation: "Qubit 0 is stored in classical bit 0 and displayed as the rightmost character, so the ideal string is 001. A tempting wrong answer is 100, which treats qubit 0 as the leftmost bit.",
        tags: ["little-endian", "measurement", "qubit-ordering"],
        examSkill: "Interpret measured bitstrings.",
        commonMistake: "Reading Qiskit bitstrings left-to-right as qubit 0, qubit 1, qubit 2.",
      },
      {
        difficulty: "medium",
        question: "What is the main effect of the Z gate in this circuit before the final H?",
        code: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1)\nqc.h(0)\nqc.z(0)\nqc.h(0)",
        choices: ["It converts the phase difference into an X-basis measurement change.", "It randomly measures the qubit.", "It has no possible observable effect because all phases are global.", "It swaps |0> and |1> directly."],
        explanation: "The Z adds relative phase between |0> and |1>; the final H converts that phase into a basis-state change. A tempting wrong answer is that all phase is global, but this phase is relative.",
        tags: ["relative-phase", "statevector", "quantum-gates"],
        examSkill: "Distinguish global and relative phase.",
        commonMistake: "Treating every phase factor as unobservable global phase.",
      },
      {
        difficulty: "medium",
        question: "Which state is prepared ideally by this circuit?",
        code: "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
        choices: ["A Bell state with correlated |00> and |11> components", "A separable state with independent fair coins", "The fixed basis state |10>", "A state where qubit 1 controls qubit 0"],
        explanation: "H on qubit 0 followed by CX(0, 1) entangles the qubits into correlated |00> and |11> amplitudes. A tempting wrong answer is independent fair coins; the marginal probabilities are fair, but outcomes are correlated.",
        tags: ["entanglement", "multi-qubit-operations"],
        examSkill: "Reason about controlled multi-qubit gates.",
      },
      {
        difficulty: "medium",
        question: "Which Qiskit object is best suited for representing a Pauli string such as 'ZZI' in observable calculations?",
        code: "from qiskit.quantum_info import SparsePauliOp\nobs = SparsePauliOp('ZZI')",
        choices: ["SparsePauliOp", "QuantumCircuit", "ClassicalRegister", "BackendV2"],
        explanation: "SparsePauliOp compactly represents sums of Pauli strings for quantum_info and Estimator workflows. A tempting wrong answer is QuantumCircuit, but circuits describe operations, not observables.",
        tags: ["pauli-operators", "estimator-v2", "observables"],
        examSkill: "Choose quantum_info classes for Pauli observables.",
      },
      {
        difficulty: "medium",
        question: "What does applying CX(1, 0) mean in Qiskit's circuit API?",
        code: "qc.cx(1, 0)",
        choices: ["Qubit 1 is the control and qubit 0 is the target.", "Qubit 0 is the control because it is least significant.", "Both qubits are targets.", "The operation is invalid unless qubit 1 is drawn above qubit 0."],
        explanation: "The first CX argument is the control and the second is the target. A tempting wrong answer mixes API argument order with little-endian numeric significance.",
        tags: ["multi-qubit-operations", "qubit-ordering"],
        examSkill: "Read multi-qubit gate argument order.",
      },
      {
        difficulty: "hard",
        question: "Two circuits differ only by an overall factor of -1 on every amplitude. What measurement difference should you expect?",
        choices: ["No difference in measurement probabilities", "Every bitstring is inverted", "Only odd-parity bitstrings remain", "The circuit cannot be simulated"],
        explanation: "A global phase multiplies all amplitudes equally and cancels in probabilities. A tempting wrong answer is bitstring inversion, which would require an X-like operation, not a global phase.",
        tags: ["global-phase", "measurement"],
        examSkill: "Identify unobservable global phase.",
      },
      {
        difficulty: "hard",
        question: "For this statevector, which amplitude corresponds to basis state |10> in Qiskit's little-endian indexing?",
        code: "from qiskit.quantum_info import Statevector\nsv = Statevector([0, 0, 1, 0])",
        choices: ["Index 2", "Index 1", "Index 3", "Index 0"],
        explanation: "Qiskit orders statevector amplitudes by integer basis value. The bitstring |10> has integer value 2 when the left bit is qubit 1 and the right bit is qubit 0. A tempting wrong answer is index 1 from reversing significance.",
        tags: ["statevector", "little-endian", "qubit-ordering"],
        examSkill: "Map basis labels to statevector indices.",
        commonMistake: "Using display-string order without converting to Qiskit's integer convention.",
      },
      {
        difficulty: "hard",
        question: "Which circuit is equivalent to a CZ up to the usual basis-change identity?",
        code: "qc.h(1)\nqc.cx(0, 1)\nqc.h(1)",
        choices: ["A controlled-Z with qubit 0 as control and qubit 1 as target", "A SWAP gate", "A controlled-X with qubit 1 as control", "Two independent H gates"],
        explanation: "Conjugating the target of CX by H changes X into Z, giving CZ. A tempting wrong answer is SWAP; SWAP requires three CX-like operations and exchanges qubit states.",
        tags: ["quantum-gates", "multi-qubit-operations"],
        examSkill: "Recognize gate decompositions and equivalences.",
      },
      {
        difficulty: "hard",
        question: "What phase relationship is captured by multiplying Pauli operators X and Y?",
        choices: ["XY = iZ, so Pauli multiplication can introduce a complex phase.", "XY = Z with no phase in all conventions.", "XY = identity because X and Y cancel.", "Pauli operators cannot be multiplied in Qiskit."],
        explanation: "Pauli matrices do not commute; XY = iZ while YX = -iZ. A tempting wrong answer omits the phase, which matters for algebra even when some global phases are unobservable.",
        tags: ["pauli-operators", "relative-phase"],
        examSkill: "Apply Pauli algebra.",
      },
      {
        difficulty: "hard",
        question: "Why can two statevectors with the same measurement probabilities still behave differently later in a circuit?",
        choices: ["They may differ by relative phase, which can affect later interference.", "Measurement probabilities fully determine all future behavior.", "Qiskit discards phase after every gate.", "Only hardware can observe phases, not simulators."],
        explanation: "Measurement probabilities in one basis do not capture relative phase. Later gates can convert phase into different amplitudes. A tempting wrong answer is that probabilities fully determine the state; they do not.",
        tags: ["statevector", "relative-phase", "measurement"],
        examSkill: "Reason from statevectors beyond raw probabilities.",
      },
    ],
  },
  2: {
    title: "Visualize quantum circuits, measurements, and states",
    docsUrl: "https://docs.quantum.ibm.com/api/qiskit/visualization",
    seeds: [
      {
        difficulty: "easy",
        question: "Which method is the standard entry point for drawing a QuantumCircuit?",
        code: "qc.draw()",
        choices: ["QuantumCircuit.draw()", "plot_histogram(qc)", "qc.measure()", "Statevector.draw_circuit()"],
        explanation: "QuantumCircuit.draw() renders circuit diagrams, with output modes such as text and mpl.",
        tags: ["visualization", "circuit.draw"],
        examSkill: "Choose circuit visualization APIs.",
      },
      {
        difficulty: "easy",
        question: "Which visualization function is intended for a counts dictionary such as {'00': 520, '11': 504}?",
        choices: ["plot_histogram", "plot_bloch_vector", "plot_state_city", "circuit.draw"],
        explanation: "plot_histogram displays counts or probability-like mappings over measurement outcomes.",
        tags: ["visualization", "plot_histogram", "counts"],
        examSkill: "Select a plot for measurement results.",
      },
      {
        difficulty: "easy",
        question: "Which function plots a 3D vector on a Bloch sphere?",
        code: "from qiskit.visualization import plot_bloch_vector\nplot_bloch_vector([0, 0, 1])",
        choices: ["plot_bloch_vector", "plot_histogram", "plot_error_map", "draw_backend"],
        explanation: "plot_bloch_vector visualizes a Bloch vector such as [x, y, z] for a single-qubit state.",
        tags: ["visualization", "plot_bloch_vector"],
        examSkill: "Recognize Bloch-sphere visualization.",
      },
      {
        difficulty: "easy",
        question: "What does a histogram bar labeled '101' represent?",
        choices: ["The number or probability of shots that produced the classical bitstring 101", "The third gate in the circuit", "The qubit count only", "A complex amplitude with value 101"],
        explanation: "Histogram labels are classical measurement outcomes, not gates or amplitudes.",
        tags: ["plot_histogram", "measurement"],
        examSkill: "Interpret measurement plots.",
      },
      {
        difficulty: "easy",
        question: "Which output argument requests Matplotlib circuit rendering?",
        code: "qc.draw(output='mpl')",
        choices: ["output='mpl'", "style='histogram'", "backend='matplotlib'", "format='bloch'"],
        explanation: "The draw method accepts output='mpl' for Matplotlib diagrams.",
        tags: ["circuit.draw", "matplotlib", "visualization"],
        examSkill: "Use circuit drawing options.",
      },
      {
        difficulty: "medium",
        question: "A Bell circuit histogram has large bars for 00 and 11 only. What does this most directly show?",
        choices: ["The measured qubits are strongly correlated.", "The state has no entanglement because only two bars appear.", "The circuit failed because all four outcomes must appear.", "The bars are statevector amplitudes, not measurement outcomes."],
        explanation: "The Bell state gives correlated 00 and 11 outcomes. A tempting wrong answer is that all four outcomes must appear; entanglement can restrict correlations while preserving randomness.",
        tags: ["plot_histogram", "measurement", "entanglement"],
        examSkill: "Analyze histograms from entangled circuits.",
      },
      {
        difficulty: "medium",
        question: "Why might a circuit diagram show q_0 above q_1 while a bitstring displays q_0 as the rightmost bit?",
        choices: ["Diagram order and bitstring significance are different conventions in Qiskit.", "Qiskit randomly reorders qubits for every drawing.", "The diagram is wrong unless reverse_bits is set.", "Bitstrings never include qubit 0."],
        explanation: "Qiskit diagrams and integer/bitstring conventions are related but not identical. A tempting wrong answer is that the diagram is wrong; it is using the normal display convention.",
        tags: ["visualization", "little-endian", "qubit-ordering"],
        examSkill: "Connect visual diagrams to bit ordering.",
      },
      {
        difficulty: "medium",
        question: "Which workflow visualizes the state prepared by a circuit without measuring it?",
        code: "from qiskit.quantum_info import Statevector\nsv = Statevector.from_instruction(qc)",
        choices: ["Build a Statevector from the circuit, then use a state visualization function.", "Call qc.measure_all() first, then plot_state_city on the counts.", "Use plot_histogram on the unmeasured circuit object.", "Export to OpenQASM 3 because statevectors are unavailable."],
        explanation: "Statevector simulation preserves amplitudes for visualization. A tempting wrong answer is measuring first; measurement turns the state into samples and loses phase information.",
        tags: ["statevector", "visualization", "plot_state_city"],
        examSkill: "Choose state visualization workflows.",
      },
      {
        difficulty: "medium",
        question: "What is plot_state_city designed to show?",
        choices: ["The real and imaginary parts of a density matrix or state object", "A backend's physical layout", "Only classical counts", "A text circuit diagram"],
        explanation: "State-city plots visualize state or density-matrix structure. A tempting wrong answer is backend layout, which uses different visualization tools.",
        tags: ["plot_state_city", "statevector", "visualization"],
        examSkill: "Select state visualization tools.",
      },
      {
        difficulty: "medium",
        question: "Which code best creates a histogram from Sampler-style bit array counts?",
        code: "counts = result[0].data.meas.get_counts()",
        choices: ["plot_histogram(counts)", "plot_histogram(qc.draw())", "plot_bloch_vector(counts)", "qc.plot_counts(counts)"],
        explanation: "SamplerV2 measurement data can expose a BitArray whose get_counts() output is suitable for plot_histogram. A tempting wrong answer passes a circuit drawing, not data.",
        tags: ["sampler-v2", "plot_histogram", "counts"],
        examSkill: "Visualize primitive measurement results.",
      },
      {
        difficulty: "hard",
        question: "You want a Bloch visualization for one qubit in a two-qubit entangled Bell state. What should you remember?",
        choices: ["A single-qubit reduced state may be mixed and not represented by a full-length pure-state Bloch vector.", "Each qubit in a Bell state always has Bloch vector [1, 0, 0].", "Entangled states cannot be simulated.", "plot_histogram is the correct pure-state Bloch plot."],
        explanation: "Entangled subsystems are generally mixed even when the joint state is pure. A tempting wrong answer assigns a pure Bloch vector to each qubit, which misses reduced-state behavior.",
        tags: ["bloch-sphere", "statevector", "entanglement"],
        examSkill: "Interpret state visualizations for entangled systems.",
      },
      {
        difficulty: "hard",
        question: "Which visualization choice is least likely to reveal a relative phase before interference gates?",
        choices: ["A computational-basis counts histogram", "A statevector amplitude visualization", "A phase-aware state plot", "A Bloch-sphere plot for a single pure qubit"],
        explanation: "Counts in one basis can hide relative phase. A tempting wrong answer is statevector visualization, which can show complex amplitudes and phases.",
        tags: ["relative-phase", "plot_histogram", "statevector"],
        examSkill: "Know what each visualization can and cannot show.",
      },
      {
        difficulty: "hard",
        question: "If qc.draw(output='mpl') fails in a notebook environment, what is a likely cause?",
        choices: ["Matplotlib support is missing or unavailable in that environment.", "The circuit must be executed on hardware before drawing.", "Only OpenQASM 3 circuits can be drawn.", "The draw method was removed in Qiskit 2.x."],
        explanation: "Matplotlib output depends on plotting dependencies and environment support. A tempting wrong answer is that hardware execution is required; circuit drawing is static.",
        tags: ["circuit.draw", "matplotlib", "visualization"],
        examSkill: "Troubleshoot visualization mode choices.",
      },
      {
        difficulty: "hard",
        question: "A histogram from hardware shows small nonzero bars for outcomes that are impossible ideally. What is the best interpretation?",
        choices: ["Noise, readout error, or finite-shot effects can add unexpected counts.", "The ideal circuit analysis is always invalid.", "Qiskit histograms fabricate extra bars by design.", "Only statevector simulators can produce histograms."],
        explanation: "Hardware data includes noise and finite sampling, so small unexpected bars are common. A tempting wrong answer discards the ideal analysis entirely; ideal predictions remain a useful baseline.",
        tags: ["hardware-results", "plot_histogram", "analysis"],
        examSkill: "Compare ideal and experimental visual results.",
      },
      {
        difficulty: "hard",
        question: "Why should you label plots carefully when comparing two counts dictionaries?",
        choices: ["The same bitstring labels can have different counts, shots, or ordering assumptions across experiments.", "Qiskit automatically merges all experiments into one label.", "Labels are ignored by plot_histogram.", "Counts dictionaries cannot be compared visually."],
        explanation: "Comparisons require clear labels and consistent bit-order interpretation. A tempting wrong answer says labels are ignored; labels are exactly what the viewer uses to read outcomes.",
        tags: ["plot_histogram", "counts", "little-endian"],
        examSkill: "Avoid misleading result visualizations.",
      },
    ],
  },
  3: {
    title: "Create quantum circuits",
    docsUrl: "https://docs.quantum.ibm.com/api/qiskit/qiskit.circuit.QuantumCircuit",
    seeds: [
      {
        difficulty: "easy",
        question: "Which code creates a circuit with two qubits and two classical bits?",
        code: "from qiskit import QuantumCircuit",
        choices: ["QuantumCircuit(2, 2)", "QuantumCircuit('2q2c')", "QuantumCircuit(qubits=2, bits=2, backend=True)", "QuantumCircuit.from_backend(2, 2)"],
        explanation: "QuantumCircuit(2, 2) allocates two qubits and two classical bits.",
        tags: ["quantum-circuit", "classical-registers"],
        examSkill: "Create basic QuantumCircuit objects.",
      },
      {
        difficulty: "easy",
        question: "Which method adds measurements from all qubits to classical bits automatically?",
        code: "qc.measure_all()",
        choices: ["measure_all()", "draw_all()", "sample_all()", "collapse_all()"],
        explanation: "measure_all() appends measurements for all qubits, adding classical bits if needed.",
        tags: ["measurement", "quantum-circuit"],
        examSkill: "Add measurement operations.",
      },
      {
        difficulty: "easy",
        question: "Which object represents a symbolic circuit angle before binding?",
        code: "from qiskit.circuit import Parameter\ntheta = Parameter('theta')",
        choices: ["Parameter", "ClassicalRegister", "BackendV2", "Statevector"],
        explanation: "Parameter stores a symbolic value that can be assigned later.",
        tags: ["parameterized-circuits"],
        examSkill: "Create parameterized circuits.",
      },
      {
        difficulty: "easy",
        question: "Which method binds a numeric value to a circuit parameter?",
        code: "bound = qc.assign_parameters({theta: 0.5})",
        choices: ["assign_parameters", "draw", "measure", "generate_preset_pass_manager"],
        explanation: "assign_parameters returns a circuit with the supplied symbolic parameters replaced by numeric values.",
        tags: ["parameterized-circuits", "assign_parameters"],
        examSkill: "Bind parameter values.",
      },
      {
        difficulty: "easy",
        question: "Which operation composes one circuit onto another?",
        code: "combined = qc1.compose(qc2)",
        choices: ["compose", "plot_histogram", "service.job", "SparsePauliOp"],
        explanation: "compose combines circuit instructions while preserving circuit semantics.",
        tags: ["circuit-composition"],
        examSkill: "Build circuits from smaller circuits.",
      },
      {
        difficulty: "medium",
        question: "What does this measurement call do?",
        code: "qc = QuantumCircuit(2, 2)\nqc.measure([0, 1], [1, 0])",
        choices: ["It measures qubit 0 into classical bit 1 and qubit 1 into classical bit 0.", "It swaps the two qubits before measuring.", "It measures both qubits into classical bit 0.", "It creates two new qubits."],
        explanation: "The first list is qubits and the second is classical bits, paired by position. A tempting wrong answer is that this swaps qubits; it only maps measurement destinations.",
        tags: ["measurement", "classical-registers", "qubit-ordering"],
        examSkill: "Map qubits to classical bits.",
      },
      {
        difficulty: "medium",
        question: "Which code creates a reusable parameterized rotation layer?",
        code: "from qiskit.circuit import Parameter\nfrom qiskit import QuantumCircuit",
        choices: ["theta = Parameter('theta'); qc.ry(theta, 0)", "theta = 0.7; qc.measure(theta, 0)", "qc.parameter('theta').ry(0)", "backend.target.ry('theta')"],
        explanation: "A Parameter can be used directly in a gate angle. A tempting wrong answer uses a numeric value only, which is no longer symbolic.",
        tags: ["parameterized-circuits"],
        examSkill: "Construct parameterized gate operations.",
      },
      {
        difficulty: "medium",
        question: "Why transpile or pass-manager-run a circuit before hardware execution?",
        choices: ["To map the circuit to backend-supported instructions, coupling, and timing constraints.", "To measure the circuit automatically with perfect accuracy.", "To convert all quantum operations into classical code.", "To remove the need for a backend."],
        explanation: "Transpilation targets hardware constraints such as basis gates and connectivity. A tempting wrong answer is that it improves measurement accuracy perfectly; transpilation is not error removal.",
        tags: ["transpilation", "backend-v2", "isa-circuits"],
        examSkill: "Explain the purpose of transpilation.",
      },
      {
        difficulty: "medium",
        question: "Which function builds a preset pass manager for a backend target?",
        code: "from qiskit import generate_preset_pass_manager\npm = generate_preset_pass_manager(optimization_level=1, target=backend.target)",
        choices: ["generate_preset_pass_manager", "plot_state_city", "qasm3.dumps", "service.job"],
        explanation: "generate_preset_pass_manager creates a pass manager configured for optimization level and target. A tempting wrong answer is qasm3.dumps, which serializes a circuit.",
        tags: ["generate_preset_pass_manager", "transpilation", "backend-v2"],
        examSkill: "Prepare ISA circuits.",
      },
      {
        difficulty: "medium",
        question: "What does an ISA circuit mean in the Runtime workflow?",
        choices: ["A circuit already expressed in instructions supported by the selected backend target.", "A circuit written only in OpenQASM 2.", "A circuit that contains no measurements.", "A circuit that cannot be visualized."],
        explanation: "Runtime examples commonly transpile to backend instruction set architecture before submission. A tempting wrong answer ties ISA to OpenQASM only; ISA is about target compatibility.",
        tags: ["isa-circuits", "runtime", "transpilation"],
        examSkill: "Understand backend-ready circuit preparation.",
      },
      {
        difficulty: "hard",
        question: "Which pattern correctly builds a dynamic circuit branch after a mid-circuit measurement?",
        code: "qc.measure(0, 0)\nwith qc.if_test((0, 1)):\n    qc.x(1)",
        choices: ["Use if_test with a classical condition after measuring.", "Use if qc.measure(0, 0): in normal Python.", "Use plot_histogram to branch at runtime.", "Use qiskit.opflow.IfElseOp."],
        explanation: "if_test creates circuit control flow based on classical bits. A tempting wrong answer is a Python if statement; that runs while building the circuit, not during device execution.",
        tags: ["dynamic-circuits", "if_test", "measurement"],
        examSkill: "Create dynamic circuits.",
        commonMistake: "Using Python control flow instead of circuit control-flow builders.",
      },
      {
        difficulty: "hard",
        question: "Why can composing circuits with mismatched qubit counts fail or produce unexpected placement?",
        choices: ["Composition needs explicit compatible qubit and clbit mappings when structures differ.", "Qiskit silently creates arbitrary extra backend qubits.", "compose always measures both circuits first.", "Only OpenQASM circuits can be composed."],
        explanation: "compose maps instructions onto existing wires; explicit mappings avoid ambiguity. A tempting wrong answer expects arbitrary new physical qubits, but circuit composition is structural.",
        tags: ["circuit-composition", "quantum-circuit"],
        examSkill: "Manage circuit composition boundaries.",
      },
      {
        difficulty: "hard",
        question: "What is the risk of submitting an untranspiled high-level circuit directly to hardware primitives?",
        choices: ["It may contain instructions or connectivity not supported by the backend target.", "It will always run faster because it is shorter in source code.", "It automatically becomes noiseless.", "It is converted to OpenQASM 3 and therefore always valid."],
        explanation: "Hardware requires backend-compatible instructions and layout. A tempting wrong answer treats source-code brevity as executable validity; the backend target is what matters.",
        tags: ["transpilation", "backend-v2", "runtime"],
        examSkill: "Prepare circuits for hardware execution.",
      },
      {
        difficulty: "hard",
        question: "What should you check before using if_test on real hardware?",
        choices: ["Whether the selected backend supports the needed dynamic-circuit features.", "Whether the circuit has at least one plot_histogram call.", "Whether all parameters are named theta.", "Whether OpenQASM 2 export succeeds."],
        explanation: "Dynamic circuit support is backend-dependent. A tempting wrong answer is OpenQASM 2 export; dynamic control is associated with modern circuit and OpenQASM 3-style capabilities.",
        tags: ["dynamic-circuits", "backend-v2", "if_test"],
        examSkill: "Match dynamic circuits to backend capabilities.",
      },
      {
        difficulty: "hard",
        question: "When are parameter values often supplied to primitives instead of pre-binding the circuit?",
        choices: ["When running parameter sweeps or optimizer loops over the same parameterized circuit.", "When the circuit has no parameters.", "Only when drawing the circuit.", "Never; primitives reject parameterized circuits."],
        explanation: "V2 primitive PUBs can carry parameter values, which is useful for sweeps and hybrid algorithms. A tempting wrong answer says primitives reject parameters; they are designed to support them.",
        tags: ["parameterized-circuits", "pubs", "runtime"],
        examSkill: "Use parameterized circuits with primitives.",
      },
    ],
  },
  4: {
    title: "Run quantum circuits",
    docsUrl: "https://docs.quantum.ibm.com/guides/execute-on-hardware",
    seeds: [
      {
        difficulty: "easy",
        question: "Which class is commonly used to access IBM Quantum Runtime backends and jobs?",
        code: "from qiskit_ibm_runtime import QiskitRuntimeService",
        choices: ["QiskitRuntimeService", "QuantumCircuit", "SparsePauliOp", "Statevector"],
        explanation: "QiskitRuntimeService is the entry point for IBM Runtime service access.",
        tags: ["runtime"],
        examSkill: "Identify Runtime service APIs.",
      },
      {
        difficulty: "easy",
        question: "Which backend property describes supported instructions and qubit connectivity in BackendV2?",
        code: "target = backend.target",
        choices: ["backend.target", "backend.name only", "backend.url", "backend.histogram"],
        explanation: "BackendV2 exposes a Target object through backend.target.",
        tags: ["backend-v2", "target", "transpilation"],
        examSkill: "Use BackendV2 metadata.",
      },
      {
        difficulty: "easy",
        question: "What does job.result() generally do for a submitted Runtime job?",
        choices: ["It retrieves the completed result, waiting if necessary.", "It cancels the job.", "It changes the backend target.", "It draws the circuit."],
        explanation: "job.result() returns the result object once the job is complete.",
        tags: ["runtime-jobs", "job-monitoring"],
        examSkill: "Retrieve Runtime job results.",
      },
      {
        difficulty: "easy",
        question: "What is a backend in the context of running circuits?",
        choices: ["A simulator or quantum device capable of executing supported circuits.", "A Pauli string observable.", "A circuit parameter.", "A visualization style."],
        explanation: "Backends represent execution targets such as hardware devices or simulators.",
        tags: ["backend-v2", "hardware-execution"],
        examSkill: "Understand backend selection.",
      },
      {
        difficulty: "easy",
        question: "Which Runtime mode is intended for independent jobs that can be grouped together?",
        choices: ["Batch mode", "A Python for loop only", "OpenQASM dump mode", "Circuit draw mode"],
        explanation: "Batch mode groups independent primitive workloads for efficient submission.",
        tags: ["batch-mode", "runtime"],
        examSkill: "Choose Runtime execution modes.",
      },
      {
        difficulty: "medium",
        question: "Which execution mode is a good fit for an iterative VQE loop using many related Estimator calls?",
        choices: ["Session mode", "Batch mode only", "Circuit drawing mode", "OpenQASM import mode"],
        explanation: "Sessions are designed for iterative workloads with related calls. A tempting wrong answer is batch mode; batches are better for independent jobs.",
        tags: ["session-mode", "runtime", "estimator-v2"],
        examSkill: "Choose sessions for iterative algorithms.",
      },
      {
        difficulty: "medium",
        question: "Why is backend.target useful before calling generate_preset_pass_manager?",
        choices: ["It gives the transpiler backend-specific instruction and connectivity information.", "It stores the user's account token.", "It returns final measurement counts.", "It replaces all Runtime primitives."],
        explanation: "The target describes what the backend supports. A tempting wrong answer is measurement counts; counts come after execution.",
        tags: ["backend-v2", "target", "transpilation"],
        examSkill: "Use backend metadata for compilation.",
      },
      {
        difficulty: "medium",
        question: "Which call retrieves a backend by name from a configured Runtime service?",
        code: "service = QiskitRuntimeService()\nbackend = service.backend('ibm_example')",
        choices: ["service.backend(name)", "QuantumCircuit.backend(name)", "SparsePauliOp.backend(name)", "plot_histogram(name)"],
        explanation: "service.backend(name) returns a backend handle. A tempting wrong answer is QuantumCircuit.backend; circuits do not own provider lookup.",
        tags: ["runtime", "backend-selection"],
        examSkill: "Select a backend through the service.",
      },
      {
        difficulty: "medium",
        question: "What is the practical reason to monitor job.status()?",
        choices: ["To track whether a submitted job is queued, running, done, or failed.", "To change qubit ordering while the job runs.", "To bind new parameters after submission.", "To import OpenQASM 3 text."],
        explanation: "Job status helps users understand progress and failures. A tempting wrong answer is rebinding parameters; submitted jobs are already defined.",
        tags: ["job-monitoring", "runtime-jobs"],
        examSkill: "Monitor Runtime jobs.",
      },
      {
        difficulty: "medium",
        question: "Which statement about simulator and hardware execution is most accurate?",
        choices: ["Simulators are useful baselines, while hardware results include noise and device constraints.", "Hardware always matches exact statevector probabilities.", "Simulators require backend.target from a real device.", "Hardware execution does not need transpilation."],
        explanation: "Simulators provide ideal or configurable baselines; hardware data reflects noise and target constraints. A tempting wrong answer expects perfect hardware matches.",
        tags: ["hardware-execution", "analysis"],
        examSkill: "Compare execution targets.",
      },
      {
        difficulty: "hard",
        question: "A primitive run fails because circuits are not ISA-compatible. What is the most direct fix?",
        choices: ["Transpile or pass-manager-run the circuits against the selected backend target.", "Increase shots until the circuit becomes valid.", "Plot the histogram before submission.", "Convert all observables to strings only."],
        explanation: "ISA compatibility is a compilation issue, not a sampling issue. A tempting wrong answer is increasing shots, which changes statistics but not instruction support.",
        tags: ["isa-circuits", "transpilation", "runtime"],
        examSkill: "Fix hardware submission errors.",
      },
      {
        difficulty: "hard",
        question: "How should you think about array broadcasting in primitive workloads?",
        choices: ["Input shapes for circuits, observables, and parameter values determine how many PUB results are produced.", "Broadcasting is only a NumPy feature and never affects primitives.", "All arrays are flattened into one result without structure.", "Broadcasting changes the backend's physical qubits."],
        explanation: "Primitive PUBs can broadcast over observables or parameter sets, producing structured results. A tempting wrong answer says broadcasting is irrelevant; it affects result shape.",
        tags: ["array-broadcasting", "pubs", "runtime"],
        examSkill: "Predict primitive workload shapes.",
      },
      {
        difficulty: "hard",
        question: "Why should an app store Runtime job IDs after submission?",
        choices: ["So users can retrieve results later even after a page reload or process restart.", "Because job IDs are required to draw circuits.", "Because results cannot be retrieved with the service.", "Because job IDs replace backend names permanently."],
        explanation: "Job IDs allow later lookup through the Runtime service. A tempting wrong answer says results cannot be retrieved; service.job(job_id) exists for retrieval.",
        tags: ["runtime-jobs", "job-retrieval"],
        examSkill: "Design result retrieval workflows.",
      },
      {
        difficulty: "hard",
        question: "When is direct hardware execution less appropriate than using a Runtime Session?",
        choices: ["When a hybrid algorithm repeatedly submits related workloads with updated parameters.", "When there is exactly one independent circuit.", "When drawing an offline diagram.", "When importing a single OpenQASM string."],
        explanation: "Sessions reduce overhead for related iterative calls. A tempting wrong answer is a single independent circuit; direct execution is often fine there.",
        tags: ["session-mode", "runtime", "hardware-execution"],
        examSkill: "Select efficient Runtime execution patterns.",
      },
      {
        difficulty: "hard",
        question: "What should you verify when selecting a backend for a dynamic circuit?",
        choices: ["That the backend supports the required control-flow and measurement features.", "That the backend has the shortest display name.", "That the circuit has no classical bits.", "That plot_state_city can render the backend."],
        explanation: "Dynamic circuits depend on backend capabilities. A tempting wrong answer removes classical bits, but dynamic circuits rely on classical conditions.",
        tags: ["dynamic-circuits", "backend-v2", "hardware-execution"],
        examSkill: "Match circuits to backend feature support.",
      },
    ],
  },
  5: {
    title: "Use the Sampler primitive",
    docsUrl: "https://docs.quantum.ibm.com/guides/sampler",
    seeds: [
      {
        difficulty: "easy",
        question: "What is the main output concept of SamplerV2?",
        choices: ["Samples or counts for measured bitstrings", "Expectation values of observables only", "A transpiler pass manager", "A backend target"],
        explanation: "SamplerV2 samples circuit measurements and returns measurement data such as bit arrays and counts.",
        tags: ["sampler-v2", "measurement-sampling"],
        examSkill: "Identify Sampler's purpose.",
      },
      {
        difficulty: "easy",
        question: "What does PUB stand for in V2 primitive examples?",
        choices: ["Primitive Unified Bloc", "Python Universal Backend", "Pauli Update Buffer", "Probability Unit Bit"],
        explanation: "PUB means Primitive Unified Bloc, the input unit passed to V2 primitives.",
        tags: ["pubs", "sampler-v2"],
        examSkill: "Recognize primitive vocabulary.",
      },
      {
        difficulty: "easy",
        question: "Which minimal PUB shape is valid for a non-parameterized SamplerV2 circuit?",
        code: "pub = (circuit,)",
        choices: ["(circuit,)", "(observable, circuit)", "(shots, circuit)", "(backend, circuit)"],
        explanation: "A Sampler PUB can be just a circuit when no parameter values or per-PUB shots are needed.",
        tags: ["sampler-v2", "pubs"],
        examSkill: "Build basic Sampler PUBs.",
      },
      {
        difficulty: "easy",
        question: "Which option most directly controls the number of measurement samples?",
        choices: ["shots", "precision", "optimization_level", "global_phase"],
        explanation: "Sampler uses shots to control how many samples are drawn.",
        tags: ["sampler-v2", "shots"],
        examSkill: "Configure sampling size.",
      },
      {
        difficulty: "easy",
        question: "Why must a Sampler circuit include measurements or measurable classical registers?",
        choices: ["Sampler reports measurement outcomes, so it needs measured data to sample.", "Sampler computes observables without measurements.", "Measurements are only for circuit drawings.", "Sampler rejects all classical registers."],
        explanation: "Sampler's job is sampling measurement outcomes, so measured bits are central to its results.",
        tags: ["sampler-v2", "measurement"],
        examSkill: "Prepare circuits for sampling.",
      },
      {
        difficulty: "medium",
        question: "Which PUB shape is suitable for a parameterized Sampler circuit with one parameter set?",
        code: "pub = (circuit, [0.25])",
        choices: ["(circuit, parameter_values)", "(circuit, observable)", "(observable, parameter_values)", "(backend, circuit, observable)"],
        explanation: "Sampler PUBs pair circuits with parameter values when needed. A tempting wrong answer includes an observable, which belongs to Estimator.",
        tags: ["sampler-v2", "pubs", "parameterized-circuits"],
        examSkill: "Run parameterized circuits with Sampler.",
      },
      {
        difficulty: "medium",
        question: "How do V2 primitive results map back to submitted PUBs?",
        choices: ["result[i] corresponds to pubs[i].", "Results are sorted alphabetically by circuit name.", "Only failed PUBs are returned.", "The backend randomly reorders result indices."],
        explanation: "PrimitiveResult entries preserve PUB order. A tempting wrong answer is sorting by name; result position is the reliable mapping.",
        tags: ["sampler-v2", "pubs", "result-object"],
        examSkill: "Navigate primitive results.",
      },
      {
        difficulty: "medium",
        question: "Which code pattern commonly extracts counts from a named measurement register in a SamplerV2 result?",
        code: "counts = result[0].data.meas.get_counts()",
        choices: ["Use the BitArray get_counts() method from result[0].data.<register>.", "Call result.get_counts(circuit) on the PrimitiveResult.", "Read result[0].evs.", "Use backend.target.get_counts()."],
        explanation: "SamplerV2 PubResult data fields hold measurement BitArrays. A tempting wrong answer is result.get_counts(), which is a legacy-style result pattern.",
        tags: ["sampler-v2", "bit-arrays", "counts"],
        examSkill: "Extract Sampler measurement data.",
        commonMistake: "Expecting V1-style get_counts on the top-level primitive result.",
      },
      {
        difficulty: "medium",
        question: "What is the difference between run-level shots and per-PUB shots in SamplerV2?",
        choices: ["Run-level shots set a default, while a PUB can override shots for that specific input.", "Per-PUB shots change the backend target.", "Run-level shots are only for Estimator.", "Shots are never configurable in SamplerV2."],
        explanation: "Sampler supports default shots and can support PUB-specific shots. A tempting wrong answer says shots are unavailable, but sampling depends on shot count.",
        tags: ["sampler-v2", "shots", "pubs"],
        examSkill: "Configure Sampler shot counts.",
      },
      {
        difficulty: "medium",
        question: "Which statement about Sampler and Estimator is correct?",
        choices: ["Sampler returns measurement samples; Estimator returns expectation values.", "Sampler requires SparsePauliOp while Estimator forbids it.", "Sampler returns only exact statevectors.", "Estimator is only a drawing tool."],
        explanation: "Sampler and Estimator solve different primitive tasks. A tempting wrong answer swaps observables into Sampler; observables are Estimator inputs.",
        tags: ["sampler-v2", "estimator-v2"],
        examSkill: "Choose the correct primitive.",
      },
      {
        difficulty: "hard",
        question: "A Sampler result has two classical registers named alpha and beta. How should you access each register?",
        choices: ["Use the corresponding data fields, such as result[0].data.alpha and result[0].data.beta.", "Assume all registers are merged into data.meas.", "Use result[0].evs for both.", "Registers cannot be named in Sampler results."],
        explanation: "PubResult data mirrors measurement register names. A tempting wrong answer assumes data.meas always exists; it depends on the circuit/register naming.",
        tags: ["sampler-v2", "bit-arrays", "result-object"],
        examSkill: "Handle multiple measurement registers.",
      },
      {
        difficulty: "hard",
        question: "Why can a finite-shot Sampler result differ from ideal probabilities even on a noiseless simulator?",
        choices: ["Sampling variance means finite shots approximate probabilities with random fluctuation.", "Noiseless simulators intentionally add hardware noise.", "SamplerV2 cannot represent probabilities.", "Finite shots force every outcome to appear exactly equally."],
        explanation: "Shot sampling is statistical. A tempting wrong answer expects exact probabilities from finite samples; exactness requires analytic probability methods, not sampling.",
        tags: ["sampler-v2", "shots", "measurement-sampling"],
        examSkill: "Interpret finite-shot sampling.",
      },
      {
        difficulty: "hard",
        question: "What happens conceptually when parameter values are broadcast across multiple Sampler PUB inputs?",
        choices: ["The primitive evaluates the requested circuit/parameter combinations and returns matching result structure.", "Only the first parameter value is used.", "The circuit is rewritten as a SparsePauliOp.", "All bit arrays are discarded."],
        explanation: "Broadcasting expands workload combinations according to primitive input shape. A tempting wrong answer uses only the first value, which would silently drop intended evaluations.",
        tags: ["sampler-v2", "array-broadcasting", "pubs"],
        examSkill: "Predict Sampler result shapes.",
      },
      {
        difficulty: "hard",
        question: "Why is Sampler usually the wrong primitive for estimating <ZZ> directly from an observable object?",
        choices: ["Estimator is designed to consume observables and return expectation values directly.", "Sampler cannot execute any circuit with measurements.", "Observable objects are only for OpenQASM 3.", "BackendV2 automatically converts Sampler outputs to expectation values."],
        explanation: "Sampler can provide raw samples, but Estimator is the primitive for observable expectation values. A tempting wrong answer relies on automatic conversion that is not the primitive contract.",
        tags: ["sampler-v2", "estimator-v2", "observables"],
        examSkill: "Avoid primitive misuse.",
      },
      {
        difficulty: "hard",
        question: "A circuit measures qubit 0 into classical bit 0 only. Why might get_counts() show one-bit strings rather than full qubit-state labels?",
        choices: ["Sampler reports measured classical data, not unmeasured qubit amplitudes.", "Qubit 1 is automatically measured even when omitted.", "Counts always include every qubit in the circuit.", "The result is an Estimator value."],
        explanation: "Counts reflect the classical measurement registers present in the circuit. A tempting wrong answer expects unmeasured qubits in counts; Sampler cannot sample data that was not measured.",
        tags: ["sampler-v2", "measurement", "counts"],
        examSkill: "Interpret measured register width.",
      },
    ],
  },
  6: {
    title: "Use the Estimator primitive",
    docsUrl: "https://docs.quantum.ibm.com/guides/estimator",
    seeds: [
      {
        difficulty: "easy",
        question: "What does EstimatorV2 estimate?",
        choices: ["Expectation values of observables for prepared circuits", "Raw bitstring samples only", "Circuit diagrams", "Backend queue length only"],
        explanation: "Estimator evaluates expectation values such as <Z> or <ZZ> for supplied observables.",
        tags: ["estimator-v2", "expectation-values"],
        examSkill: "Identify Estimator's purpose.",
      },
      {
        difficulty: "easy",
        question: "Which class is commonly used to represent Pauli observables for Estimator?",
        code: "from qiskit.quantum_info import SparsePauliOp",
        choices: ["SparsePauliOp", "QuantumCircuit", "ClassicalRegister", "QiskitRuntimeService"],
        explanation: "SparsePauliOp represents Pauli-string observables such as Z, ZZ, and weighted sums.",
        tags: ["estimator-v2", "sparse-pauli-op", "observables"],
        examSkill: "Create Estimator observables.",
      },
      {
        difficulty: "easy",
        question: "Which minimal Estimator PUB shape is valid for a circuit and observable?",
        code: "pub = (circuit, observable)",
        choices: ["(circuit, observable)", "(circuit,)", "(observable, shots)", "(backend, observable)"],
        explanation: "Estimator needs both a circuit and observable for each PUB.",
        tags: ["estimator-v2", "pubs"],
        examSkill: "Build basic Estimator PUBs.",
      },
      {
        difficulty: "easy",
        question: "What is an expectation value of Z for the |0> state?",
        choices: ["+1", "0", "-1", "2"],
        explanation: "|0> is the +1 eigenstate of Z, so its expectation value is +1.",
        tags: ["expectation-values", "observables"],
        examSkill: "Compute simple Pauli expectations.",
      },
      {
        difficulty: "easy",
        question: "Which quantity is more central to Estimator accuracy control than raw bitstring counts?",
        choices: ["precision", "circuit.draw output", "bitstring label width", "OpenQASM include order"],
        explanation: "Estimator workflows commonly specify target precision for expectation values.",
        tags: ["estimator-v2", "precision"],
        examSkill: "Configure Estimator accuracy.",
      },
      {
        difficulty: "medium",
        question: "Which PUB shape is suitable for a parameterized Estimator circuit?",
        code: "pub = (circuit, observable, [0.5])",
        choices: ["(circuit, observable, parameter_values)", "(circuit, parameter_values, shots)", "(observable, circuit, backend)", "(circuit,)"],
        explanation: "Parameterized Estimator PUBs add parameter values after the observable. A tempting wrong answer omits the observable, which Estimator requires.",
        tags: ["estimator-v2", "pubs", "parameterized-circuits"],
        examSkill: "Submit parameterized Estimator workloads.",
      },
      {
        difficulty: "medium",
        question: "Where do you usually find expectation values in a V2 Estimator PubResult data object?",
        code: "evs = result[0].data.evs",
        choices: ["result[i].data.evs", "result.get_counts(i)", "result[i].data.meas.get_counts()", "backend.target.evs"],
        explanation: "Estimator PubResult data exposes expectation values, often through evs. A tempting wrong answer uses Sampler-style measurement counts.",
        tags: ["estimator-v2", "result-object", "expectation-values"],
        examSkill: "Extract Estimator values.",
      },
      {
        difficulty: "medium",
        question: "What does a standard error reported with an Estimator result describe?",
        choices: ["Uncertainty in the estimated expectation value", "The number of qubits in the backend", "The OpenQASM syntax version", "The selected circuit drawing style"],
        explanation: "Standard error quantifies statistical uncertainty in the estimate. A tempting wrong answer treats it as backend size, which is unrelated.",
        tags: ["estimator-v2", "standard-errors", "metadata"],
        examSkill: "Interpret Estimator uncertainty.",
      },
      {
        difficulty: "medium",
        question: "Why should observables be mapped to an ISA circuit layout when needed?",
        choices: ["Transpilation can change qubit layout, so observables must align with the executed circuit qubits.", "Observables are ignored after transpilation.", "ISA circuits cannot use observables.", "Observable mapping only affects histograms."],
        explanation: "If circuit layout changes, observables must refer to the correct physical/logical qubits. A tempting wrong answer says observables are ignored; Estimator's output depends on them.",
        tags: ["estimator-v2", "observables", "transpilation", "isa-circuits"],
        examSkill: "Align observables with transpiled circuits.",
      },
      {
        difficulty: "medium",
        question: "Which statement about shots and precision is accurate for Estimator workflows?",
        choices: ["Estimator emphasizes target precision, while Sampler emphasizes shots for samples.", "Estimator always returns raw shot counts only.", "Precision is a circuit parameter angle.", "Sampler and Estimator have identical output contracts."],
        explanation: "Estimator focuses on expectation-value precision; Sampler focuses on measurement samples. A tempting wrong answer treats their contracts as identical.",
        tags: ["estimator-v2", "precision", "shots"],
        examSkill: "Separate Sampler and Estimator options.",
      },
      {
        difficulty: "hard",
        question: "What is the expected value of Z after this circuit ideally?",
        code: "qc = QuantumCircuit(1)\nqc.h(0)\nobs = SparsePauliOp('Z')",
        choices: ["0", "+1", "-1", "The value cannot be estimated"],
        explanation: "H|0> = |+>, which has equal Z-basis probabilities, so <Z> = 0. A tempting wrong answer is +1, which is the value before applying H.",
        tags: ["estimator-v2", "expectation-values", "statevector"],
        examSkill: "Compute simple circuit-observable expectations.",
      },
      {
        difficulty: "hard",
        question: "A result has evs shaped like a grid over observables and parameter values. What caused that structure?",
        choices: ["Broadcasting across observable and parameter input arrays", "The backend queue order", "The number of classical bits only", "The circuit diagram layout"],
        explanation: "Estimator results preserve the broadcast shape of observables and parameter values. A tempting wrong answer is queue order; scheduling does not define array shape.",
        tags: ["estimator-v2", "array-broadcasting", "pubs"],
        examSkill: "Interpret Estimator result shapes.",
      },
      {
        difficulty: "hard",
        question: "Why might resilience or error-mitigation options change the reported Estimator metadata?",
        choices: ["Mitigation workflows can add processing details and uncertainty information.", "They convert expectation values into circuit drawings.", "They remove the need for observables.", "They force all results to exactly match theory."],
        explanation: "Resilience settings affect how estimates are produced and documented. A tempting wrong answer promises exact theory; mitigation reduces bias but does not guarantee perfection.",
        tags: ["estimator-v2", "resilience", "metadata"],
        examSkill: "Interpret mitigated Estimator outputs.",
      },
      {
        difficulty: "hard",
        question: "Why is SparsePauliOp('ZI') not interchangeable with SparsePauliOp('IZ')?",
        choices: ["They apply Z to different qubit positions under Qiskit's Pauli-string ordering rules.", "They are always identical after transpilation.", "Both mean identity on all qubits.", "SparsePauliOp ignores character order."],
        explanation: "Pauli-string character order maps to qubit positions, so ZI and IZ target different qubits. A tempting wrong answer ignores ordering, which is a common source of wrong estimates.",
        tags: ["sparse-pauli-op", "qubit-ordering", "estimator-v2"],
        examSkill: "Map observables to qubits.",
        commonMistake: "Assuming Pauli string order does not matter.",
      },
      {
        difficulty: "hard",
        question: "When should you prefer Estimator over manually sampling and post-processing counts?",
        choices: ["When the desired answer is an observable expectation value and the primitive can estimate it directly.", "When you need raw bitstrings for a histogram.", "When no observable is known.", "When the circuit has no quantum gates."],
        explanation: "Estimator directly targets expectation values and can use runtime estimation features. A tempting wrong answer asks for raw bitstrings; that is Sampler's domain.",
        tags: ["estimator-v2", "sampler-v2", "expectation-values"],
        examSkill: "Choose efficient primitive workflows.",
      },
    ],
  },
  7: {
    title: "Retrieve and analyze results of quantum circuits",
    docsUrl: "https://docs.quantum.ibm.com/guides/monitor-job",
    seeds: [
      {
        difficulty: "easy",
        question: "Which service call retrieves a previously submitted Runtime job by ID?",
        code: "job = service.job(job_id)",
        choices: ["service.job(job_id)", "service.backend(job_id)", "QuantumCircuit(job_id)", "plot_histogram(job_id)"],
        explanation: "QiskitRuntimeService.job(job_id) retrieves a Runtime job handle.",
        tags: ["job-retrieval", "runtime"],
        examSkill: "Retrieve submitted jobs.",
      },
      {
        difficulty: "easy",
        question: "Which method checks a job's current state?",
        code: "status = job.status()",
        choices: ["job.status()", "job.draw()", "job.target()", "job.qasm3()"],
        explanation: "job.status() reports progress such as queued, running, done, or failed.",
        tags: ["job-monitoring"],
        examSkill: "Monitor job progress.",
      },
      {
        difficulty: "easy",
        question: "Which plot is most appropriate for a counts dictionary?",
        choices: ["plot_histogram", "plot_state_city", "plot_bloch_vector", "qc.draw"],
        explanation: "plot_histogram displays outcome frequencies from counts.",
        tags: ["counts", "plot_histogram", "analysis"],
        examSkill: "Visualize measurement counts.",
      },
      {
        difficulty: "easy",
        question: "What does a higher count for bitstring '11' mean in a fixed-shot experiment?",
        choices: ["More shots produced the classical outcome 11.", "The circuit has exactly eleven qubits.", "The backend target is 11.", "The expectation value is always 11."],
        explanation: "Counts are integer shot tallies per classical outcome.",
        tags: ["counts", "measurement"],
        examSkill: "Interpret counts dictionaries.",
      },
      {
        difficulty: "easy",
        question: "What should you compare when validating hardware results against a simulator?",
        choices: ["Expected distributions or expectation values, allowing for noise and finite-shot variation", "Only circuit source-code length", "Only backend name alphabetic order", "The favicon file"],
        explanation: "Hardware validation compares statistical behavior against an ideal or noisy-simulator baseline.",
        tags: ["hardware-results", "analysis"],
        examSkill: "Compare ideal and hardware results.",
      },
      {
        difficulty: "medium",
        question: "How should you map a PrimitiveResult entry to its input PUB?",
        choices: ["Use the same list index: result[i] corresponds to pubs[i].", "Use the largest count first.", "Sort by backend calibration time.", "Read the circuit drawing order."],
        explanation: "V2 primitive result order follows input PUB order. A tempting wrong answer sorts by data values, which breaks workload mapping.",
        tags: ["pubs", "result-object", "analysis"],
        examSkill: "Analyze primitive result ordering.",
      },
      {
        difficulty: "medium",
        question: "Which code extracts Sampler counts from a measured register called meas?",
        code: "counts = result[0].data.meas.get_counts()",
        choices: ["result[0].data.meas.get_counts()", "result[0].data.evs", "job.status().get_counts()", "backend.target.counts"],
        explanation: "Sampler measurement data is exposed as a BitArray with get_counts(). A tempting wrong answer is data.evs, which is Estimator expectation data.",
        tags: ["sampler-v2", "bit-arrays", "counts"],
        examSkill: "Extract Sampler counts.",
      },
      {
        difficulty: "medium",
        question: "Which code extracts Estimator expectation values in many V2 examples?",
        code: "evs = result[0].data.evs",
        choices: ["result[0].data.evs", "result[0].data.meas.get_counts()", "plot_histogram(result)", "service.job(result)"],
        explanation: "Estimator PubResult data contains expectation values, often in evs. A tempting wrong answer uses Sampler count extraction.",
        tags: ["estimator-v2", "expectation-values", "result-object"],
        examSkill: "Extract Estimator values.",
      },
      {
        difficulty: "medium",
        question: "Why inspect primitive result metadata?",
        choices: ["It can include execution details, shots, precision, mitigation, or timing information.", "It contains only decorative colors.", "It replaces all numerical results.", "It is required to draw the home page."],
        explanation: "Metadata provides context for interpreting the numerical result. A tempting wrong answer says it replaces results; it supplements them.",
        tags: ["metadata", "runtime", "analysis"],
        examSkill: "Use metadata for interpretation.",
      },
      {
        difficulty: "medium",
        question: "If an ideal simulator predicts 50/50 outcomes but hardware gives 55/45, what is the most reasonable first conclusion?",
        choices: ["Finite shots and hardware noise can shift observed frequencies.", "The circuit necessarily has a syntax error.", "The simulator can never be trusted.", "The measurement register disappeared."],
        explanation: "Moderate deviations can come from sampling and noise. A tempting wrong answer is a syntax error; the circuit can be valid and still produce noisy data.",
        tags: ["hardware-results", "counts", "analysis"],
        examSkill: "Analyze experimental variation.",
      },
      {
        difficulty: "hard",
        question: "Why can negative values appear in some quasi-probability-style mitigated outputs?",
        choices: ["Error mitigation can produce quasi-probabilities that are not raw frequencies.", "Raw counts can be negative on hardware.", "Qiskit stores bitstrings as signed integers.", "Negative values mean the job was canceled."],
        explanation: "Mitigated quasi-distributions can contain negative entries, unlike raw count histograms. A tempting wrong answer says raw counts are negative; shot counts are nonnegative integers.",
        tags: ["quasi-distributions", "resilience", "analysis"],
        examSkill: "Interpret mitigated result formats.",
      },
      {
        difficulty: "hard",
        question: "What is a good way to find weak exam sections from a completed quiz session?",
        choices: ["Group answers by question.section and compute accuracy per section.", "Sort questions alphabetically by ID only.", "Look only at the first missed question.", "Count how many code blocks appeared."],
        explanation: "Section-level accuracy directly identifies weak objective areas. A tempting wrong answer uses only the first miss, which is too little evidence.",
        tags: ["analysis", "weak-area-review"],
        examSkill: "Analyze performance by objective.",
      },
      {
        difficulty: "hard",
        question: "A Runtime job handle exists but job.result() raises an error. What should you check first?",
        choices: ["Job status, failure messages, and whether the job completed successfully.", "Whether the circuit can be drawn in cyan.", "Whether the favicon exists.", "Whether all answers in a quiz are correct."],
        explanation: "Result retrieval depends on job completion and failure state. A tempting wrong answer checks unrelated UI details.",
        tags: ["job-monitoring", "runtime-jobs", "analysis"],
        examSkill: "Troubleshoot result retrieval.",
      },
      {
        difficulty: "hard",
        question: "Why is it risky to compare hardware counts from two runs without checking shot counts?",
        choices: ["Different total shots can make raw counts misleading; compare normalized probabilities when needed.", "Shot count never affects counts.", "Hardware counts are always normalized already.", "Counts are independent of experiment size."],
        explanation: "Raw counts scale with shots, so normalization is often needed. A tempting wrong answer treats counts as probabilities; they are tallies.",
        tags: ["counts", "shots", "analysis"],
        examSkill: "Normalize and compare result data.",
      },
      {
        difficulty: "hard",
        question: "How should standard errors influence conclusions from Estimator results?",
        choices: ["Differences smaller than the reported uncertainty should be interpreted cautiously.", "Standard errors prove the result is exact.", "They are only labels for qubits.", "They should be added to circuit depth."],
        explanation: "Uncertainty affects whether differences are meaningful. A tempting wrong answer treats standard error as exactness; it quantifies uncertainty.",
        tags: ["estimator-v2", "standard-errors", "analysis"],
        examSkill: "Draw statistically aware conclusions.",
      },
    ],
  },
  8: {
    title: "Operate with OpenQASM",
    docsUrl: "https://docs.quantum.ibm.com/guides/interoperate-qasm",
    seeds: [
      {
        difficulty: "easy",
        question: "Which header identifies an OpenQASM 3 program?",
        code: "OPENQASM 3;",
        choices: ["OPENQASM 3;", "QASM_VERSION = 2", "from qiskit import qasm3", "OPEN_QUANTUM 1;"],
        explanation: "OpenQASM 3 programs begin with the OPENQASM 3; version statement.",
        tags: ["openqasm-3", "syntax"],
        examSkill: "Recognize OpenQASM 3 syntax.",
      },
      {
        difficulty: "easy",
        question: "Which OpenQASM 3 declaration creates one qubit?",
        code: "qubit q;",
        choices: ["qubit q;", "qreg q[1];", "QuantumCircuit(1)", "bit q = qubit;"],
        explanation: "OpenQASM 3 uses qubit declarations; qreg is legacy OpenQASM 2 style.",
        tags: ["openqasm-3", "data-types"],
        examSkill: "Declare quantum data.",
      },
      {
        difficulty: "easy",
        question: "Which statement measures a qubit into a classical bit in OpenQASM 3?",
        code: "bit c;\nqubit q;\nc = measure q;",
        choices: ["c = measure q;", "measure(q, c);", "q -> c;", "c.measure(q)"],
        explanation: "OpenQASM 3 supports assignment-style measurement into classical data.",
        tags: ["openqasm-3", "measurement"],
        examSkill: "Use OpenQASM measurement syntax.",
      },
      {
        difficulty: "easy",
        question: "Which Qiskit module loads and dumps OpenQASM 3 programs?",
        choices: ["qiskit.qasm3", "qiskit.qasm2 only", "qiskit.visualization", "qiskit.providers.fake_provider"],
        explanation: "OpenQASM 3 interoperability lives in qiskit.qasm3.",
        tags: ["openqasm-3", "import", "export"],
        examSkill: "Use Qiskit OpenQASM 3 APIs.",
      },
      {
        difficulty: "easy",
        question: "What does qasm3.dumps(circuit) return?",
        choices: ["An OpenQASM 3 string", "A file object only", "A Runtime job ID", "A histogram"],
        explanation: "dumps follows Python naming conventions and serializes to a string.",
        tags: ["openqasm-3", "dumps", "export"],
        examSkill: "Export circuits to strings.",
      },
      {
        difficulty: "medium",
        question: "What is the difference between qasm3.dump and qasm3.dumps?",
        choices: ["dump writes to a stream or file; dumps returns a string.", "dump returns a string; dumps submits to hardware.", "They are Sampler options.", "dumps imports text and dump exports text."],
        explanation: "dump/dumps follow common Python serialization naming. A tempting wrong answer reverses import and export roles.",
        tags: ["openqasm-3", "dump", "dumps"],
        examSkill: "Choose the correct export function.",
      },
      {
        difficulty: "medium",
        question: "Which function loads an OpenQASM 3 source string into a circuit?",
        code: "from qiskit import qasm3\nqc = qasm3.loads(source)",
        choices: ["qasm3.loads(source)", "qasm3.dumps(source)", "QuantumCircuit.draw(source)", "plot_histogram(source)"],
        explanation: "loads parses a string into a QuantumCircuit. A tempting wrong answer is dumps, which exports rather than imports.",
        tags: ["openqasm-3", "loads", "import"],
        examSkill: "Import OpenQASM 3 strings.",
      },
      {
        difficulty: "medium",
        question: "What does this OpenQASM 3 conditional do?",
        code: "bit c;\nqubit q;\nc = measure q;\nif (c) {\n  x q;\n}",
        choices: ["It applies x q only when c is true.", "It always applies x q twice.", "It declares a new qubit named c.", "It exports the circuit to Python."],
        explanation: "The if block is classical control based on bit c. A tempting wrong answer treats c as a qubit, but c is classical.",
        tags: ["openqasm-3", "classical-control", "dynamic-circuits"],
        examSkill: "Read classical control in OpenQASM 3.",
      },
      {
        difficulty: "medium",
        question: "Which include is commonly used to access standard gates in OpenQASM 3 examples?",
        code: "include \"stdgates.inc\";",
        choices: ["stdgates.inc", "qiskit.py", "backend.target", "histogram.json"],
        explanation: "stdgates.inc provides common gate declarations. A tempting wrong answer is backend.target, which is Qiskit runtime metadata, not an include file.",
        tags: ["openqasm-3", "gate-declarations"],
        examSkill: "Use standard gate includes.",
      },
      {
        difficulty: "medium",
        question: "Which OpenQASM 3 gate declaration pattern defines a custom one-qubit gate body?",
        code: "gate myh a {\n  h a;\n}",
        choices: ["gate myh a { h a; }", "defgate(myh, h)", "class Gate(myh): pass", "myh = QuantumCircuit(1)"],
        explanation: "OpenQASM 3 gate declarations use gate name arguments followed by a body. A tempting wrong answer uses Python class syntax, which is not OpenQASM.",
        tags: ["openqasm-3", "gate-declarations"],
        examSkill: "Read gate declarations.",
      },
      {
        difficulty: "hard",
        question: "Why might an imported OpenQASM 3 program fail even though the first line is OPENQASM 3?",
        choices: ["The program may use unsupported constructs, missing includes, or syntax not handled by the importer.", "The version header guarantees every feature works on every backend.", "Qiskit cannot load any OpenQASM 3 string.", "All OpenQASM 3 programs require measurements."],
        explanation: "Language version alone does not guarantee importer or backend support. A tempting wrong answer assumes the header is sufficient for every feature.",
        tags: ["openqasm-3", "interoperability", "import"],
        examSkill: "Troubleshoot OpenQASM interoperability.",
      },
      {
        difficulty: "hard",
        question: "What should you consider before exporting a dynamic Qiskit circuit to OpenQASM 3?",
        choices: ["Whether the circuit's control flow can be represented and whether the target consumer supports it.", "Whether all histograms are already plotted.", "Whether the circuit has exactly one qubit.", "Whether Estimator has returned evs."],
        explanation: "Dynamic-circuit interoperability depends on representation and consumer support. A tempting wrong answer focuses on plotting, which is unrelated to export semantics.",
        tags: ["openqasm-3", "dynamic-circuits", "export"],
        examSkill: "Export dynamic circuits carefully.",
      },
      {
        difficulty: "hard",
        question: "Why is OpenQASM 3 more suitable than OpenQASM 2 for modern dynamic-circuit examples?",
        choices: ["It has richer classical types and control-flow constructs.", "It removes all measurement syntax.", "It is only a histogram format.", "It cannot describe gates."],
        explanation: "OpenQASM 3 adds modern classical control and data features. A tempting wrong answer says it removes measurement; measurement remains central.",
        tags: ["openqasm-3", "classical-control", "dynamic-circuits"],
        examSkill: "Contrast OpenQASM versions.",
      },
      {
        difficulty: "hard",
        question: "Which statement about Qiskit circuits and OpenQASM 3 text is most accurate?",
        choices: ["They are interoperable representations, but conversion can lose or reject unsupported details.", "They are always byte-for-byte reversible with no limitations.", "OpenQASM 3 is only for visualizing histograms.", "Qiskit circuits cannot be exported."],
        explanation: "Interoperability is useful but not a guarantee of perfect round-trip support for every feature. A tempting wrong answer assumes unlimited reversibility.",
        tags: ["openqasm-3", "interoperability", "export"],
        examSkill: "Understand conversion limits.",
      },
      {
        difficulty: "hard",
        question: "In OpenQASM 3, why is bit-order interpretation still important after loading into Qiskit?",
        choices: ["Qiskit result display and integer interpretation still follow Qiskit bit-ordering conventions.", "OpenQASM deletes all classical bits.", "Loaded circuits cannot be measured.", "Bitstrings are replaced by Pauli operators."],
        explanation: "After loading, Qiskit displays and analyzes results with its own bit-ordering conventions. A tempting wrong answer says bits disappear; they remain part of the circuit.",
        tags: ["openqasm-3", "little-endian", "measurement"],
        examSkill: "Connect OpenQASM circuits to Qiskit result interpretation.",
        commonMistake: "Assuming an imported circuit changes Qiskit's bitstring display rules.",
      },
    ],
  },
};

function rotateChoices(
  choices: QuestionSeed["choices"],
  offset: number,
): { choices: string[]; correctAnswerIndex: number } {
  const rotation = offset % choices.length;
  return {
    choices: [...choices.slice(rotation), ...choices.slice(0, rotation)],
    correctAnswerIndex: rotation === 0 ? 0 : choices.length - rotation,
  };
}

export const QUIZ_QUESTIONS: QuizQuestion[] = Object.entries(SECTION_BANK).flatMap(
  ([sectionKey, sectionBank]) => {
    const section = Number.parseInt(sectionKey, 10);
    return sectionBank.seeds.map((seed, index) => {
      const { choices, correctAnswerIndex } = rotateChoices(
        seed.choices,
        (section + index) % 4,
      );

      return {
        id: `s${section}-${String(index + 1).padStart(3, "0")}`,
        section,
        sectionTitle: sectionBank.title,
        difficulty: seed.difficulty,
        question: seed.question,
        code: seed.code,
        choices,
        correctAnswerIndex,
        explanation: seed.explanation,
        tags: seed.tags,
        sourceReference: SOURCE_REFERENCE,
        relatedDocsUrl: seed.relatedDocsUrl ?? sectionBank.docsUrl,
        examSkill: seed.examSkill,
        commonMistake: seed.commonMistake,
        estimatedTimeSeconds:
          seed.estimatedTimeSeconds ??
          (seed.difficulty === "hard" ? 90 : seed.difficulty === "medium" ? 70 : 45),
        concept: seed.concept ?? seed.tags[0],
        objective: seed.objective ?? seed.examSkill,
        qiskitVersion: "2.x",
      };
    });
  },
);

function validateQuestionBank(questions: QuizQuestion[]) {
  const ids = new Set<string>();
  const bySection = new Map<number, number>();
  const byDifficulty = new Map<Difficulty, number>();
  let codeQuestions = 0;

  for (const question of questions) {
    if (ids.has(question.id)) {
      throw new Error(`Duplicate question id: ${question.id}`);
    }
    ids.add(question.id);

    if (question.choices.length !== 4) {
      throw new Error(`${question.id} must have exactly four answer choices.`);
    }
    if (question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
      throw new Error(`${question.id} has an invalid correctAnswerIndex.`);
    }

    bySection.set(question.section, (bySection.get(question.section) ?? 0) + 1);
    byDifficulty.set(
      question.difficulty,
      (byDifficulty.get(question.difficulty) ?? 0) + 1,
    );
    if (question.code) codeQuestions += 1;
  }

  for (let section = 1; section <= 8; section++) {
    if ((bySection.get(section) ?? 0) < 15) {
      throw new Error(`Section ${section} has fewer than 15 questions.`);
    }
  }

  if (questions.length < 120) {
    throw new Error("Question bank must include at least 120 questions.");
  }
  if (codeQuestions < 40) {
    throw new Error("Question bank must include at least 40 code questions.");
  }
  if ((byDifficulty.get("easy") ?? 0) < 30) {
    throw new Error("Question bank must include at least 30 easy questions.");
  }
  if ((byDifficulty.get("medium") ?? 0) < 40) {
    throw new Error("Question bank must include at least 40 medium questions.");
  }
  if ((byDifficulty.get("hard") ?? 0) < 30) {
    throw new Error("Question bank must include at least 30 hard questions.");
  }
}

if (process.env.NODE_ENV !== "production") {
  validateQuestionBank(QUIZ_QUESTIONS);
}
