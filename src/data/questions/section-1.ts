import { defineSection } from "./define";
import { api, guide } from "./refs";

const BIT_ORDERING = guide("bit-ordering");
const OPERATORS = guide("operators-overview");
const OPERATOR_CLASS = guide("operator-class");
const PAULI_OBS = guide("specify-observables-pauli");
const CIRCUIT_LIBRARY = guide("circuit-library");
const CONSTRUCT = guide("construct-circuits");
const MEASURE = guide("measure-qubits");
const SV = api("qiskit/qiskit.quantum_info.Statevector");
const OP = api("qiskit/qiskit.quantum_info.Operator");
const SPO = api("qiskit/qiskit.quantum_info.SparsePauliOp");
const PAULI = api("qiskit/qiskit.quantum_info.Pauli");
const DM = api("qiskit/qiskit.quantum_info.DensityMatrix");
const QC = api("qiskit/qiskit.circuit.QuantumCircuit");

/**
 * Section 1 — Perform quantum operations (official weight 16%).
 * Target: 51 questions.
 */
export const SECTION_1_QUESTIONS = defineSection(
  { section: 1, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s1-001",
      difficulty: "easy",
      type: "concept",
      question:
        "Which single-qubit gate maps |0> to |1> and |1> to |0> in the computational basis?",
      choices: {
        a: "The Z gate",
        b: "The S gate",
        c: "The H gate",
        d: "The X gate",
      },
      answer: "d",
      explanation:
        "X is the Pauli bit-flip: it exchanges the two computational-basis states. Z leaves both basis states in place and only negates the |1> amplitude, S adds a quarter-turn phase to |1>, and H maps |0> to an equal superposition rather than to |1>.",
      tags: ["pauli-operators", "single-qubit-gates"],
      concept: "Pauli bit flip",
      objective: "Identify the action of the Pauli operators on basis states.",
      refs: [CIRCUIT_LIBRARY, api("qiskit/qiskit.circuit.library.XGate")],
    },
    {
      id: "s1-002",
      difficulty: "easy",
      type: "code-behavior",
      question: "Ideally, what state does this circuit prepare?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)",
      codeStatus: "executable",
      choices: {
        a: "An equal superposition of |0> and |1>",
        b: "The |1> state",
        c: "The |-> state",
        d: "A classical random bit that has already been measured",
      },
      answer: "a",
      explanation:
        "H|0> = (|0> + |1>)/sqrt(2), an equal superposition with a positive relative phase. |-> would require a preceding X or a following Z. Nothing has been measured yet, so the qubit is still in a coherent superposition rather than a classical random bit.",
      mistake:
        "Describing a superposition as if the qubit were already a random classical bit.",
      tags: ["single-qubit-gates", "superposition", "statevector"],
      concept: "Hadamard on a basis state",
      objective: "Predict the state produced by a single-qubit gate.",
      refs: [CIRCUIT_LIBRARY, api("qiskit/qiskit.circuit.library.HGate")],
    },
    {
      id: "s1-003",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the final instruction in this circuit do?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, 1)\nqc.h(0)\nqc.measure(0, 0)",
      codeStatus: "executable",
      choices: {
        a: "It writes a classical outcome into bit 0 and leaves the qubit in the matching basis state",
        b: "It reads the two amplitudes of the superposition into bit 0 without disturbing the qubit",
        c: "It records the relative phase between the two components of the superposition",
        d: "It entangles the measured qubit with every other qubit declared in the circuit",
      },
      answer: "a",
      explanation:
        "A computational-basis measurement produces a classical bit and projects the measured subsystem onto the observed basis state, so the superposition created by the preceding gate collapses. It cannot read the two amplitudes undisturbed, and it certainly cannot report a relative phase: a single shot returns one outcome, and repeated shots only reveal probabilities. Nothing here entangles anything, since a measurement acts on one qubit.",
      tags: ["measurement", "state-collapse"],
      concept: "Projective measurement",
      objective: "Explain what a computational-basis measurement does.",
      refs: [MEASURE, BIT_ORDERING],
    },
    {
      id: "s1-004",
      difficulty: "easy",
      type: "code-output",
      question:
        "What are the two amplitudes of the resulting state, in array order?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\n\nqc = QuantumCircuit(1)\nqc.x(0)\nqc.z(0)\nsv = Statevector(qc)",
      codeStatus: "executable",
      choices: {
        a: "[0, -1]",
        b: "[0, 1]",
        c: "[1, 0]",
        d: "[-1, 0]",
      },
      answer: "a",
      explanation:
        "The bit flip moves the qubit to |1>, and the phase flip then multiplies that component by -1, leaving the amplitude vector [0, -1]. The value [0, 1] would be the state before the phase flip, [1, 0] would mean the bit flip never happened, and [-1, 0] would require negating the |0> component, which the phase flip leaves alone.",
      mistake: "Assuming the phase flip moves probability between basis states.",
      tags: ["pauli-operators", "relative-phase", "statevector"],
      concept: "Pauli phase flip",
      objective: "Predict the amplitudes produced by Pauli operations.",
      refs: [CIRCUIT_LIBRARY, api("qiskit/qiskit.circuit.library.ZGate")],
    },
    {
      id: "s1-005",
      difficulty: "easy",
      type: "code-output",
      question:
        "This program builds a two-qubit basis state from a label. Which array index holds the amplitude, and which qubit is excited?",
      code:
        "from qiskit.quantum_info import Statevector\n\nsv = Statevector.from_label(\"01\")\nprint(sv.data.argmax())",
      codeStatus: "executable",
      choices: {
        a: "Index 1, and qubit 0 is the excited one",
        b: "Index 2, and qubit 1 is the excited one",
        c: "Index 1, and qubit 1 is the excited one",
        d: "Index 2, and qubit 0 is the excited one",
      },
      answer: "a",
      explanation:
        "Labels are written with the highest-index qubit leftmost, so this label means qubit 1 is in the ground state and qubit 0 is excited. Its integer value is therefore 1, which is the array position of the amplitude. Reading the label left to right as qubits 0 and 1 gives the tempting index 2 instead, and pairing index 1 with qubit 1 mixes the two conventions.",
      mistake:
        "Assuming the qubit drawn on the top wire is the most significant bit.",
      tags: ["little-endian", "qubit-ordering", "statevector"],
      concept: "Little-endian integer convention",
      objective: "Apply Qiskit bit-ordering rules to basis-state labels.",
      refs: [BIT_ORDERING],
      seconds: 60,
    },
    {
      id: "s1-006",
      difficulty: "medium",
      type: "code-output",
      question:
        "Ideally, which single bitstring does every shot of this circuit produce?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 3)\nqc.x(0)\nqc.measure([0, 1, 2], [0, 1, 2])",
      codeStatus: "executable",
      choices: {
        a: "100",
        b: "001",
        c: "010",
        d: "111",
      },
      answer: "b",
      explanation:
        "Only qubit 0 is excited, and it is measured into classical bit 0. Qiskit prints classical bit 0 as the rightmost character, so the outcome is 001. The tempting answer 100 comes from reading the string left to right as bits 0, 1, 2, which reverses Qiskit's convention.",
      mistake:
        "Reading a printed bitstring left-to-right as classical bits 0, 1, 2.",
      tags: ["little-endian", "measurement", "qubit-ordering"],
      concept: "Bitstring ordering in results",
      objective: "Interpret measured bitstrings under Qiskit's conventions.",
      refs: [BIT_ORDERING, MEASURE],
    },
    {
      id: "s1-007",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What is the overall effect of this three-gate sequence on qubit 0?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)\nqc.z(0)\nqc.h(0)",
      codeStatus: "executable",
      choices: {
        a: "It is equivalent to an X gate.",
        b: "It is equivalent to the identity, because the two H gates cancel.",
        c: "It leaves the state unchanged except for an unobservable global phase.",
        d: "It measures the qubit in the X basis.",
      },
      answer: "a",
      explanation:
        "Conjugating Z by Hadamards exchanges the Pauli axes: H Z H = X. The two H gates do not simply cancel because a Z sits between them, and the resulting change is a real basis-state flip rather than a global phase. Nothing here performs a measurement.",
      mistake:
        "Cancelling the two Hadamards without accounting for the gate between them.",
      tags: ["single-qubit-gates", "gate-identities", "relative-phase"],
      concept: "Basis change by conjugation",
      objective: "Reason about composed single-qubit gate sequences.",
      refs: [CIRCUIT_LIBRARY, OPERATOR_CLASS],
    },
    {
      id: "s1-008",
      difficulty: "medium",
      type: "code-behavior",
      question: "Ideally, what does this circuit prepare?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "A product state in which each qubit is independently in an equal superposition",
        b: "An entangled state whose only outcomes are 00 and 11, each with probability 1/2",
        c: "The basis state |10>",
        d: "An entangled state whose only outcomes are 01 and 10, each with probability 1/2",
      },
      answer: "b",
      explanation:
        "H then CX produces (|00> + |11>)/sqrt(2). Each qubit alone looks like a fair coin, but the outcomes are perfectly correlated, which a product state cannot reproduce. The anti-correlated pair 01/10 would need an extra X on the target.",
      mistake:
        "Concluding the qubits are independent because each marginal distribution is uniform.",
      tags: ["entanglement", "two-qubit-gates", "bell-state"],
      concept: "Bell-state preparation",
      objective: "Reason about controlled operations and entanglement.",
      refs: [CIRCUIT_LIBRARY, api("qiskit/qiskit.circuit.library.CXGate")],
      seconds: 70,
    },
    {
      id: "s1-009",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "In this three-qubit observable, which qubits does the Z operator act on?",
      code: "from qiskit.quantum_info import SparsePauliOp\n\nobs = SparsePauliOp(\"ZZI\")",
      codeStatus: "executable",
      choices: {
        a: "Qubits 0 and 1",
        b: "Qubits 1 and 2",
        c: "Qubit 0 only",
        d: "All three qubits",
      },
      answer: "b",
      explanation:
        "Pauli-string labels are read right to left: the rightmost character applies to qubit 0. In \"ZZI\" the identity sits on qubit 0 and the two Z factors act on qubits 1 and 2. Reading the string left to right gives the tempting but wrong answer of qubits 0 and 1.",
      mistake: "Reading a Pauli label left to right as qubits 0, 1, 2.",
      tags: ["pauli-operators", "observables", "qubit-ordering"],
      concept: "Pauli-string qubit ordering",
      objective: "Map Pauli-string characters to qubit indices.",
      refs: [PAULI_OBS, SPO, BIT_ORDERING],
    },
    {
      id: "s1-010",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this instruction do?",
      code: "qc.cx(1, 0)",
      codeStatus: "illustrative",
      choices: {
        a: "Qubit 1 is the control and qubit 0 is the target.",
        b: "Qubit 0 is the control because it is the least significant qubit.",
        c: "Both qubits act as controls on an implicit ancilla.",
        d: "It is rejected unless qubit 1 is drawn above qubit 0.",
      },
      answer: "a",
      explanation:
        "The controlled bit-flip method takes the control first and the target second, independently of index order. Little-endian significance describes how basis labels map to integers; it does not make the least significant qubit the control, so treating the least significant qubit as the control confuses two unrelated conventions. There is no implicit ancilla involved, and diagram layout has no bearing on semantics, so the operation is not rejected when the control is drawn below the target.",
      mistake:
        "Mixing up little-endian bit significance with gate argument order.",
      tags: ["two-qubit-gates", "qubit-ordering"],
      concept: "Control and target argument order",
      objective: "Read multi-qubit gate argument order correctly.",
      refs: [QC, api("qiskit/qiskit.circuit.library.CXGate")],
      seconds: 50,
    },
    {
      id: "s1-011",
      difficulty: "hard",
      type: "concept",
      question:
        "Two state preparations differ only by an overall factor of -1 applied to every amplitude. What difference should you expect in measurement statistics?",
      choices: {
        a: "None, in any measurement basis",
        b: "None in the computational basis, but a visible difference in the X basis",
        c: "Every measured bitstring is inverted",
        d: "Outcome probabilities are negated, producing quasi-probabilities",
      },
      answer: "a",
      explanation:
        "An overall factor is a global phase: it multiplies every amplitude equally and cancels when probabilities are formed as |amplitude|^2, in every basis. Only a relative phase between components can change interference and therefore statistics. Bitstring inversion would require an actual X operation, and probabilities are never negative for unmitigated measurement data.",
      tags: ["global-phase", "measurement", "relative-phase"],
      concept: "Global phase is unobservable",
      objective: "Distinguish observable and unobservable phase.",
      refs: [OPERATORS, SV],
    },
    {
      id: "s1-012",
      difficulty: "hard",
      type: "code-output",
      question: "Which computational-basis state does this statevector describe?",
      code: "from qiskit.quantum_info import Statevector\n\nsv = Statevector([0, 0, 1, 0])",
      codeStatus: "executable",
      choices: {
        a: "|01>, meaning qubit 0 is excited",
        b: "|10>, meaning qubit 1 is excited",
        c: "|11>, meaning both qubits are excited",
        d: "An equal superposition of |01> and |10>",
      },
      answer: "b",
      explanation:
        "The amplitude sits at array position 2, and 2 in binary is 10. Qiskit prints the highest-index qubit leftmost, so this label means qubit 1 is excited and qubit 0 is not. Reading the same index as |01> reverses the convention. The label |11> is impossible because both qubits excited would place the amplitude at position 3, and a superposition would require more than one nonzero entry.",
      mistake:
        "Converting the array index to binary but then reading the bits in the wrong order.",
      tags: ["statevector", "little-endian", "qubit-ordering"],
      concept: "Statevector index to basis label",
      objective: "Map statevector array positions to basis-state labels.",
      refs: [SV, BIT_ORDERING],
    },
    {
      id: "s1-013",
      difficulty: "hard",
      type: "code-behavior",
      question: "Which single two-qubit gate is this fragment equivalent to?",
      code: "qc.h(1)\nqc.cx(0, 1)\nqc.h(1)",
      codeStatus: "illustrative",
      choices: {
        a: "A SWAP of qubits 0 and 1",
        b: "A controlled-Z on qubits 0 and 1",
        c: "A controlled-Y with qubit 0 as control",
        d: "Two independent Hadamards, because the controlled gate cancels",
      },
      answer: "b",
      explanation:
        "Conjugating the target of a controlled-X by Hadamards turns the controlled X into a controlled Z, since H X H = Z. SWAP needs three controlled-X gates in alternating directions. The Hadamards do not cancel: the controlled gate between them changes what they conjugate.",
      tags: ["two-qubit-gates", "gate-identities"],
      concept: "Controlled-gate basis change",
      objective: "Recognize standard two-qubit gate decompositions.",
      refs: [CIRCUIT_LIBRARY, api("qiskit/qiskit.circuit.library.CZGate")],
    },
    {
      id: "s1-014",
      difficulty: "hard",
      type: "concept",
      question:
        "What is the product of the Pauli operators X and Y, in that order?",
      choices: {
        a: "The identity, because X and Y are inverses",
        b: "Z, with no accompanying phase",
        c: "iZ",
        d: "-iZ",
      },
      answer: "c",
      explanation:
        "The Pauli algebra gives XY = iZ and YX = -iZ; the operators anticommute, so order matters and a factor of i appears. They are not inverses: each Pauli is its own inverse. Dropping the phase is a common slip that breaks operator arithmetic even though a global phase on a state would be unobservable.",
      mistake:
        "Dropping the imaginary factor when multiplying Pauli operators.",
      tags: ["pauli-operators", "operator-algebra"],
      concept: "Pauli multiplication",
      objective: "Apply Pauli operator algebra including phases.",
      refs: [PAULI, OPERATORS],
    },
    {
      id: "s1-015",
      difficulty: "hard",
      type: "concept",
      question:
        "Two single-qubit states give identical computational-basis probabilities but behave differently later in a circuit. What explains this?",
      choices: {
        a: "They differ by a relative phase, which changes how later gates interfere.",
        b: "Computational-basis probabilities determine the state completely, so one of the two must be measured incorrectly.",
        c: "Qiskit discards phase information after each gate.",
        d: "Only hardware can retain phase; simulators cannot.",
      },
      answer: "a",
      explanation:
        "|+> and |-> share the same computational-basis probabilities but differ by a relative phase, and a later Hadamard maps them to different basis states. Probabilities in one basis are therefore not a complete description of a state. Qiskit tracks amplitudes including phase, on simulators and in the mathematical description of hardware alike.",
      tags: ["relative-phase", "statevector", "interference"],
      concept: "Probabilities do not determine a state",
      objective: "Reason about state information beyond one basis.",
      refs: [SV, OPERATORS],
    },
    {
      id: "s1-016",
      difficulty: "easy",
      type: "code-output",
      question:
        "What value does this program print, and what does it demonstrate about quantum gates?",
      code:
        "import numpy as np\nfrom qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\n\nqc = QuantumCircuit(1)\nqc.ry(0.7, 0)\nsv = Statevector(qc)\nprint(np.round(np.sum(np.abs(sv.data) ** 2), 6))",
      codeStatus: "executable",
      choices: {
        a: "1.0, because a gate preserves the total probability of the state",
        b: "0.7, because the printed value tracks the rotation angle that was applied",
        c: "0.0, because the amplitudes of a rotated state cancel out",
        d: "2.0, because both amplitudes are counted twice by the squared magnitudes",
      },
      answer: "a",
      explanation:
        "Squared magnitudes are probabilities, and they must sum to one for any valid state, which is exactly what unitarity guarantees. The rotation angle affects how the probability is divided between the two outcomes, not the total, so 0.7 is not what is printed. The amplitudes cannot cancel because magnitudes are non-negative, and nothing is counted twice.",
      tags: ["unitary-operations", "statevector", "rotation-gates"],
      concept: "Unitarity preserves total probability",
      objective:
        "Explain the mathematical requirement a quantum gate satisfies.",
      refs: [OPERATOR_CLASS, OP],
    },
    {
      id: "s1-017",
      difficulty: "easy",
      type: "code-output",
      question: "What does this comparison print, and why?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Operator\n\na = QuantumCircuit(1)\na.z(0)\na.s(0)\n\nb = QuantumCircuit(1)\nb.s(0)\nb.z(0)\n\nprint(Operator(a) == Operator(b))",
      codeStatus: "executable",
      choices: {
        a: "True, because both operations are diagonal, so their order does not matter",
        b: "False, because reversing the order of any two gates changes the resulting matrix",
        c: "True, because the comparison ignores the order in which gates were appended",
        d: "False, because the two circuits end up differing by a global phase factor",
      },
      answer: "a",
      explanation:
        "Two diagonal matrices always commute, so appending them in either order gives the same product and the comparison is True. Order does matter in general, which is exactly why the Pauli operators anticommute, but it does not matter here. The comparison is a genuine matrix equality rather than an order-insensitive shortcut, and no global phase difference arises between these two products.",
      tags: ["single-qubit-gates", "operator-algebra", "phase-gates"],
      concept: "Commuting gates",
      objective: "Identify when single-qubit operations commute.",
      refs: [OPERATORS, CIRCUIT_LIBRARY],
    },
    {
      id: "s1-018",
      difficulty: "easy",
      type: "code-output",
      question:
        "What does this comparison print, and what relationship does it establish between the two phase gates?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Operator\n\na = QuantumCircuit(1)\na.t(0)\na.t(0)\n\nb = QuantumCircuit(1)\nb.s(0)\n\nprint(Operator(a) == Operator(b))",
      codeStatus: "executable",
      choices: {
        a: "True, because applying the smaller phase twice produces the larger one exactly",
        b: "False, because the left circuit contains two instructions and the right contains one",
        c: "False, because the two phases differ by an amount that no repetition can match",
        d: "True, but only because the comparison tolerates a small numerical difference",
      },
      answer: "a",
      explanation:
        "Both gates are diagonal and leave the ground state alone; one adds a quarter turn of phase to the excited component and the other adds an eighth turn, so applying the smaller one twice reproduces the larger exactly. Instruction count is irrelevant once the circuits are collapsed into matrices, and the equality is exact rather than approximate, so no tolerance is involved.",
      tags: ["single-qubit-gates", "phase-gates", "operator-algebra"],
      concept: "Phase gate family",
      objective: "Compare the standard phase gates.",
      refs: [
        api("qiskit/qiskit.circuit.library.SGate"),
        api("qiskit/qiskit.circuit.library.TGate"),
      ],
    },
    {
      id: "s1-019",
      difficulty: "medium",
      type: "code-output",
      question:
        "Swapping the two qubit arguments of a controlled-phase operation gives these two circuits. What does the comparison print?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Operator\n\na = QuantumCircuit(2)\na.cz(0, 1)\n\nb = QuantumCircuit(2)\nb.cz(1, 0)\n\nprint(Operator(a) == Operator(b))",
      codeStatus: "executable",
      choices: {
        a: "True, because the operation applies a phase only when both qubits are excited",
        b: "False, because the first argument is always the control and cannot be exchanged",
        c: "False, because exchanging the arguments reverses the sign of the applied phase",
        d: "True, because both circuits leave every computational-basis probability unchanged",
      },
      answer: "a",
      explanation:
        "The operation negates only the amplitude of the doubly excited component, a condition that is symmetric in the two qubits, so exchanging the arguments leaves the matrix identical. Control and target labels are interchangeable for this gate even though they are not for a controlled bit flip, and no sign reversal occurs. Noting that computational-basis probabilities are unchanged is true but insufficient, because equal probabilities would not by themselves make the two matrices equal.",
      tags: ["two-qubit-gates", "relative-phase", "operator-algebra"],
      concept: "Symmetry of controlled-phase gates",
      objective: "Describe the action of controlled-phase operations.",
      refs: [api("qiskit/qiskit.circuit.library.CZGate"), CIRCUIT_LIBRARY],
      seconds: 70,
    },
    {
      id: "s1-020",
      difficulty: "easy",
      type: "concept",
      question:
        "In the computational basis, what is the expectation value of Z for a qubit in state |1>?",
      choices: {
        a: "-1",
        b: "0",
        c: "+1",
        d: "Undefined until the qubit is measured",
      },
      answer: "a",
      explanation:
        "|1> is the eigenstate of Z with eigenvalue -1, so its expectation value is exactly -1. A value of 0 corresponds to an equal superposition such as |+>, and +1 corresponds to |0>. Expectation values are well defined for any state; measurement only estimates them.",
      tags: ["observables", "expectation-values", "pauli-operators"],
      concept: "Pauli-Z eigenvalues",
      objective: "Compute expectation values for basis states.",
      refs: [PAULI_OBS, OPERATORS],
    },
    {
      id: "s1-021",
      difficulty: "easy",
      type: "code-output",
      question:
        "Which computational-basis label carries all of the probability here?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\n\nqc = QuantumCircuit(3)\nqc.x(1)\nprint(Statevector(qc).probabilities_dict())",
      codeStatus: "executable",
      choices: {
        a: "010",
        b: "100",
        c: "001",
        d: "011",
      },
      answer: "a",
      explanation:
        "Only qubit 1 is flipped, and labels place the highest-index qubit leftmost, so the excited qubit sits in the middle position, giving 010. The label 100 would mean qubit 2 was excited and 001 would mean qubit 0 was, both of which shift or reverse the convention, while 011 would require two qubits to be flipped rather than one.",
      mistake: "Writing basis labels with qubit 0 on the left.",
      tags: ["statevector", "little-endian", "probabilities"],
      concept: "Probability dictionaries and label order",
      objective: "Read basis labels produced by quantum_info tools.",
      refs: [SV, BIT_ORDERING],
      seconds: 50,
    },
    {
      id: "s1-022",
      difficulty: "medium",
      type: "code-output",
      question:
        "For this circuit, what is the ideal expectation value of the observable Z on the single qubit?",
      code: "import numpy as np\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.ry(np.pi / 3, 0)",
      codeStatus: "executable",
      choices: {
        a: "0.5",
        b: "0.866",
        c: "0.0",
        d: "-0.5",
      },
      answer: "a",
      explanation:
        "A Y rotation by angle t applied to |0> gives <Z> = cos(t), and cos(pi/3) = 0.5. The value 0.866 is sin(pi/3), which would be <X> for this state. Zero would require a quarter turn, and -0.5 would require a rotation past the equator.",
      mistake: "Using the half-angle inside the rotation matrix as the final angle.",
      tags: ["expectation-values", "rotation-gates", "observables"],
      concept: "Rotation angle and expectation value",
      objective: "Relate rotation angles to measured expectation values.",
      refs: [api("qiskit/qiskit.circuit.library.RYGate"), PAULI_OBS],
    },
    {
      id: "s1-023",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What is the entanglement structure of the state this circuit prepares?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(4)\nqc.h(0)\nqc.cx(0, 1)\nqc.h(2)\nqc.cx(2, 3)",
      codeStatus: "executable",
      choices: {
        a: "Two independent entangled pairs that share no correlation with each other",
        b: "A single entangled state spanning all four of the circuit's qubits",
        c: "No entanglement, because the second half undoes the first half",
        d: "Three overlapping pairs, since the middle qubits belong to both halves",
      },
      answer: "a",
      explanation:
        "The first two qubits form one entangled pair and the last two form another; no gate ever connects the two halves, so the full state is a product of two pairs rather than a single four-qubit entangled state. Nothing is undone, because the second half acts on different wires than the first, and the middle qubits belong to only one pair each, so no overlapping third pair exists.",
      tags: ["entanglement", "two-qubit-gates", "circuit-structure"],
      concept: "Entanglement structure",
      objective: "Identify which qubits a circuit actually entangles.",
      refs: [CONSTRUCT, CIRCUIT_LIBRARY],
    },
    {
      id: "s1-024",
      difficulty: "easy",
      type: "code-completion",
      question:
        "The circuit should apply a phase of pi to |1> on qubit 0 without changing measurement probabilities in the computational basis. Which gate call belongs on the blank line?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)\n_____",
      codeStatus: "partial-completion",
      choices: {
        a: "qc.x(0)",
        b: "qc.z(0)",
        c: "qc.reset(0)",
        d: "qc.measure_all()",
      },
      answer: "b",
      explanation:
        "The phase-flip Pauli negates the excited amplitude and leaves computational-basis probabilities at 50/50, which is exactly what was asked. A bit flip would exchange the two amplitudes rather than adding a phase, a reset would collapse the superposition and force the ground state, and a bulk measure-all call would append measurements that destroy the superposition instead of applying any phase.",
      tags: ["relative-phase", "single-qubit-gates"],
      concept: "Applying a relative phase",
      objective: "Choose the operation that produces a required phase.",
      refs: [api("qiskit/qiskit.circuit.library.ZGate"), CIRCUIT_LIBRARY],
      seconds: 50,
    },
    {
      id: "s1-025",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "Two circuits are compared with quantum_info operators. What does this comparison test?",
      code: "from qiskit.quantum_info import Operator\n\nsame = Operator(qc_a) == Operator(qc_b)",
      codeStatus: "illustrative",
      choices: {
        a: "Whether the two circuits contain the same gate names in the same order",
        b: "Whether the two circuits implement the same unitary, including any global phase",
        c: "Whether the two circuits produce the same measurement counts on hardware",
        d: "Whether the two circuits use the same number of qubits only",
      },
      answer: "b",
      explanation:
        "Building an operator from each circuit collapses the gate sequence into a single matrix, so structurally different circuits compare equal when they implement the same unitary. Equality of these matrices is exact, which means two circuits differing only by a global phase compare unequal; a phase-insensitive comparison is available separately. This is a mathematical check and says nothing about noisy hardware counts.",
      mistake:
        "Expecting operator equality to ignore global phase the way state equivalence checks do.",
      tags: ["unitary-operations", "operator-algebra", "global-phase"],
      concept: "Comparing circuits as unitaries",
      objective: "Use operator representations to compare circuits.",
      refs: [OP, OPERATOR_CLASS],
    },
    {
      id: "s1-026",
      difficulty: "medium",
      type: "code-output",
      question: "Ideally, which measurement outcomes does this circuit produce?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3)\nqc.h(0)\nqc.cx(0, 1)\nqc.cx(0, 2)\nqc.measure_all()",
      codeStatus: "executable",
      choices: {
        a: "Only 000 and 111, each about half the time",
        b: "All eight outcomes, each about an eighth of the time",
        c: "Only 001 and 110, each about half the time",
        d: "Only 000, because the controlled gates never fire",
      },
      answer: "a",
      explanation:
        "The superposition on the first qubit is copied onto both partners by the two controlled gates, so the register ends in an equal combination of the all-zero and all-one components. Getting all eight outcomes would require a superposition on every qubit independently. The pair 001 and 110 would need an extra bit flip on two of the wires, and the controlled gates certainly do fire, because their control is not in the ground state.",
      tags: ["entanglement", "ghz-state", "two-qubit-gates"],
      concept: "GHZ preparation",
      objective: "Construct and predict multi-qubit entangled states.",
      refs: [CIRCUIT_LIBRARY, CONSTRUCT],
    },
    {
      id: "s1-027",
      difficulty: "medium",
      type: "code-output",
      question: "What is the ideal expectation value of ZZ for this state?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "+1",
        b: "0",
        c: "-1",
        d: "+0.5",
      },
      answer: "a",
      explanation:
        "The state is (|00> + |11>)/sqrt(2). Both surviving basis states have even parity, so the product of the two Z eigenvalues is +1 in each case and the expectation value is exactly +1. A value of 0 would indicate uncorrelated qubits, and -1 would require the odd-parity pair 01 and 10.",
      tags: ["expectation-values", "entanglement", "observables"],
      concept: "Correlation observables on Bell states",
      objective: "Compute multi-qubit expectation values.",
      refs: [PAULI_OBS, SPO],
    },
    {
      id: "s1-028",
      difficulty: "medium",
      type: "debugging",
      question:
        "The goal is a Bell state on qubits 0 and 1, but the resulting statevector is always |00>. What is wrong?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.cx(0, 1)\nqc.h(0)",
      codeStatus: "intentional-error",
      choices: {
        a: "The controlled-X runs before the superposition is created, so the control is still |0>.",
        b: "The controlled-X arguments are reversed.",
        c: "The circuit needs a third qubit to hold the entanglement.",
        d: "A measurement must be added before entanglement can form.",
      },
      answer: "a",
      explanation:
        "With the control still in |0>, the controlled-X does nothing, and the later Hadamard only puts qubit 0 into a superposition, leaving a product state. Swapping the control and target would still fail for the same reason. Bell pairs need exactly two qubits, and measuring would destroy the superposition rather than create entanglement.",
      mistake: "Assuming gate order does not matter when a control is involved.",
      tags: ["entanglement", "circuit-structure", "two-qubit-gates"],
      concept: "Gate ordering and entanglement",
      objective: "Diagnose why a circuit fails to entangle qubits.",
      refs: [CONSTRUCT, CIRCUIT_LIBRARY],
    },
    {
      id: "s1-029",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What is the state of qubit 0 alone after this circuit, considered on its own?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "The pure state |+>",
        b: "The maximally mixed state",
        c: "The pure state |0>",
        d: "Undefined, because a subsystem of an entangled state has no description",
      },
      answer: "b",
      explanation:
        "Tracing out the partner of a maximally entangled pair leaves the maximally mixed state, with a Bloch vector of zero length. It is not the pure state |+>, even though the qubit had that state before the controlled gate: entanglement converts local purity into correlation. A subsystem always has a well-defined density-matrix description.",
      mistake:
        "Assigning a pure single-qubit state to one half of an entangled pair.",
      tags: ["entanglement", "density-matrix", "reduced-state"],
      concept: "Reduced states of entangled systems",
      objective: "Describe subsystems of entangled states.",
      refs: [DM, OPERATORS],
      seconds: 70,
    },
    {
      id: "s1-030",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "Why can this circuit not be described by a single unitary matrix?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)\nqc.reset(0)",
      codeStatus: "executable",
      choices: {
        a: "The second instruction maps several different inputs onto one output, destroying information",
        b: "The two instructions act on the same qubit, which no unitary description allows",
        c: "The first instruction produces a superposition, which has no matrix representation",
        d: "The circuit has no classical bits, so its matrix cannot be constructed",
      },
      answer: "a",
      explanation:
        "Forcing a qubit back to the ground state sends both basis states to the same place, so the operation is not invertible and no unitary can describe it; it is implemented as a measurement followed by a conditional correction. Acting twice on one qubit is perfectly ordinary, superpositions are exactly what unitary matrices act on, and classical bits are not required to build a circuit's matrix.",
      tags: ["unitary-operations", "reset", "measurement"],
      concept: "Non-unitary operations",
      objective: "Separate unitary gates from irreversible operations.",
      refs: [QC, OPERATORS],
    },
    {
      id: "s1-031",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "A circuit is built with an explicit global-phase argument. What observable difference does that argument make on its own?",
      code: "import numpy as np\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1, global_phase=np.pi / 2)\nqc.h(0)",
      codeStatus: "executable",
      choices: {
        a: "None in measurement statistics, but the stored amplitudes and the circuit's unitary differ.",
        b: "It shifts every measured bitstring by one position.",
        c: "It changes the probability of measuring 1 to 100 percent.",
        d: "It is ignored entirely and never appears in any representation of the circuit.",
      },
      answer: "a",
      explanation:
        "A global phase multiplies the whole state, so probabilities are unchanged in every basis, but Qiskit still tracks it, and it shows up in the stored amplitudes and in the unitary built from the circuit. It does not shift or relabel any measured bitstring, and it cannot force a deterministic outcome, because it changes no relative weight. It is certainly not ignored: the value is retained precisely because it becomes physically relevant when the circuit is used as a controlled subroutine.",
      tags: ["global-phase", "statevector", "unitary-operations"],
      concept: "Tracked global phase",
      objective: "Explain how global phase is represented and when it matters.",
      refs: [QC, SV],
    },
    {
      id: "s1-032",
      difficulty: "medium",
      type: "multi-step-reasoning",
      question:
        "A qubit is prepared in |+>, a Z gate is applied, and then a Hadamard. What is the probability of measuring 1?",
      choices: {
        a: "0",
        b: "0.25",
        c: "0.5",
        d: "1",
      },
      answer: "d",
      explanation:
        "Z turns |+> into |->, and a Hadamard maps |-> to |1>, so the outcome is deterministic. The answer 0.5 comes from assuming the phase was global and therefore harmless; here it is relative, and the final Hadamard converts it into a basis-state difference. A probability of 0 would be the result without the Z.",
      mistake:
        "Treating a phase applied inside a superposition as an unobservable global phase.",
      tags: ["relative-phase", "interference", "measurement"],
      concept: "Phase to amplitude conversion",
      objective: "Trace a state through several operations to a probability.",
      refs: [OPERATORS, SV],
    },
    {
      id: "s1-033",
      difficulty: "medium",
      type: "code-output",
      question: "What does this comparison evaluate to?",
      code: "import numpy as np\nfrom qiskit.quantum_info import Statevector\n\na = Statevector([1, 0])\nb = Statevector([-1, 0])\nprint(a == b, a.equiv(b))",
      codeStatus: "executable",
      choices: {
        a: "True True",
        b: "False True",
        c: "True False",
        d: "False False",
      },
      answer: "b",
      explanation:
        "Equality compares amplitudes exactly, and the sign differs, so the first comparison is False. The equivalence check ignores an overall phase and therefore reports True, which matches the physical fact that the two describe the same state. Both being True would mean the strict comparison tolerates a phase, and both being False would mean the physically correct check failed; picking the wrong one of the two is a common source of confusing test failures.",
      tags: ["global-phase", "statevector", "comparison"],
      concept: "Exact versus up-to-phase comparison",
      objective: "Choose the right state comparison for a physical question.",
      refs: [SV, OPERATORS],
    },
    {
      id: "s1-034",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "After the exchange, which qubit is excited, and what label does that produce?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.x(0)\nqc.swap(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "Qubit 1, written as the label 10",
        b: "Qubit 0, written as the label 01",
        c: "Both qubits, written as the label 11",
        d: "Neither qubit, written as the label 00",
      },
      answer: "a",
      explanation:
        "The bit flip excites qubit 0, and the exchange then moves that excitation onto qubit 1. Labels place the highest-index qubit leftmost, so the excited qubit appears on the left. Answering qubit 0 with the label 01 describes the state before the exchange, both qubits excited would require a second bit flip, and neither excited would mean the first instruction had no effect.",
      mistake: "Writing the outcome label with qubit 0 on the left.",
      tags: ["two-qubit-gates", "little-endian", "statevector"],
      concept: "SWAP semantics and label order",
      objective: "Predict the effect of multi-qubit permutation operations.",
      refs: [api("qiskit/qiskit.circuit.library.SwapGate"), CIRCUIT_LIBRARY],
      seconds: 70,
    },
    {
      id: "s1-035",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "In this observable, what does the coefficient list mean physically?",
      code: 'from qiskit.quantum_info import SparsePauliOp\n\nobs = SparsePauliOp(["ZI", "IZ", "ZZ"], coeffs=[0.5, 0.5, -1.0])',
      codeStatus: "executable",
      choices: {
        a: "They are shot weights that control how many samples each term receives.",
        b: "They are the weights of a weighted sum of Pauli terms forming a single observable.",
        c: "They are probabilities and must sum to one.",
        d: "They select which qubits each term acts on.",
      },
      answer: "b",
      explanation:
        "This object represents one observable built as a linear combination of Pauli strings, and the coefficients are the weights in that sum, so they may be negative and need not sum to one. Which qubits a term touches is encoded in the Pauli label itself, not in the coefficient, and sampling budgets are configured through primitive options rather than through the observable.",
      tags: ["observables", "pauli-operators", "operator-algebra"],
      concept: "Weighted Pauli sums",
      objective: "Interpret a weighted sum of Pauli terms.",
      refs: [SPO, PAULI_OBS],
      seconds: 70,
    },
    {
      id: "s1-036",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You need the exact unitary matrix implemented by a small gate sequence, with no sampling noise. Which approach fits best?",
      choices: {
        a: "Build an operator from the circuit with quantum_info.",
        b: "Run the circuit with many shots and reconstruct the matrix from counts.",
        c: "Transpile the circuit for a hardware target and read the target's instruction table.",
        d: "Export the circuit to OpenQASM 3 and count the gate declarations.",
      },
      answer: "a",
      explanation:
        "Constructing an operator from the circuit multiplies the gate matrices directly and returns the exact unitary. Counts only sample probabilities and discard phase, so no number of shots recovers the matrix cleanly. A transpiler target describes what hardware supports, and a serialized program is text, not a matrix.",
      tags: ["unitary-operations", "quantum-info", "workflow"],
      concept: "Exact unitary extraction",
      objective: "Select the right tool for exact circuit analysis.",
      refs: [OP, OPERATOR_CLASS],
    },
    {
      id: "s1-037",
      difficulty: "hard",
      type: "code-output",
      question:
        "For this state, what are the ideal expectation values of XX and YY, in that order?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "+1 and +1",
        b: "+1 and -1",
        c: "0 and 0",
        d: "-1 and +1",
      },
      answer: "b",
      explanation:
        "For the even-parity entangled pair, measurements along X on the two qubits agree, giving +1, while measurements along Y anti-correlate, giving -1; the sign difference comes from the factor of i in that Pauli. Answering +1 and +1 assumes every two-qubit correlator is positive, 0 and 0 would describe an uncorrelated product state, and -1 and +1 swaps the two axes and corresponds to the odd-parity entangled state instead.",
      mistake:
        "Assuming every two-qubit Pauli correlator on a Bell state equals +1.",
      tags: ["expectation-values", "entanglement", "observables"],
      concept: "Bell correlators",
      objective: "Compute several correlators for an entangled state.",
      refs: [PAULI_OBS, SPO],
    },
    {
      id: "s1-038",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "Hadamards are applied to both qubits, then a controlled-X with qubit 0 as control and qubit 1 as target, then Hadamards on both qubits again. What is the net effect?",
      choices: {
        a: "The identity",
        b: "A controlled-X with the control and target roles reversed",
        c: "A SWAP of the two qubits",
        d: "A controlled-Z",
      },
      answer: "b",
      explanation:
        "Conjugating a controlled-X by Hadamards on both wires reverses its direction, because the Hadamards exchange the X and Z axes, turning a control into a target and vice versa. The result is a controlled-X from qubit 1 to qubit 0. It is not the identity: the Hadamards surround the controlled gate rather than cancelling against each other. SWAP needs three controlled gates, and conjugating only the target would give controlled-Z instead.",
      tags: ["two-qubit-gates", "gate-identities", "operator-algebra"],
      concept: "Direction reversal of controlled gates",
      objective: "Derive equivalences among controlled operations.",
      refs: [CIRCUIT_LIBRARY, OPERATORS],
    },
    {
      id: "s1-039",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "A Pauli string is declared with a leading phase character. What does that indicate?",
      code: 'from qiskit.quantum_info import Pauli\n\np = Pauli("-iXY")',
      codeStatus: "executable",
      choices: {
        a: "A Pauli operator carrying an explicit phase factor of -i",
        b: "An instruction to invert the qubit order of the label",
        c: "A request to negate every measurement outcome",
        d: "A syntax error, since Pauli labels accept only I, X, Y, and Z",
      },
      answer: "a",
      explanation:
        "Pauli labels may carry an optional leading phase drawn from the four values plus one, minus one, plus i, and minus i, and it is stored as part of the operator; such phases arise naturally when Pauli operators are multiplied. It is not an instruction to invert or reverse the qubit order of the label, which is still read right to left from the letter portion, and it does not negate any measurement outcome. The label is valid, so it is not a syntax error.",
      tags: ["pauli-operators", "operator-algebra", "global-phase"],
      concept: "Phases on Pauli labels",
      objective: "Read Pauli operator labels including phase.",
      refs: [PAULI, PAULI_OBS],
    },
    {
      id: "s1-040",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "The last instruction touches only qubit 0, and qubit 1 is left alone. What can that instruction still change?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.s(0)",
      codeStatus: "executable",
      choices: {
        a: "The correlations between the two qubits, because those belong to the joint state",
        b: "Nothing at all, because a gate on one wire cannot affect a joint property",
        c: "The measurement statistics of qubit 1 on its own, which is how the effect is detected",
        d: "The number of qubits the joint state occupies, since the phase adds a hidden mode",
      },
      answer: "a",
      explanation:
        "The instruction acts on the full joint state, so quantities such as the correlator between the two qubits can change even though the partner is untouched. What it cannot change is qubit 1's own statistics, which stay maximally mixed; that is precisely why no information is transmitted. Saying nothing changes goes too far, since rotating one half of an entangled pair moves correlation between different measurement axes, and no extra mode or qubit is created.",
      tags: ["entanglement", "single-qubit-gates", "reduced-state"],
      concept: "Local operations on entangled states",
      objective: "Reason about local gates in entangled systems.",
      refs: [DM, OPERATORS],
    },
    {
      id: "s1-041",
      difficulty: "hard",
      type: "code-output",
      question:
        "Ideally, which measurement outcomes have nonzero probability for this circuit?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.h(1)\nqc.cz(0, 1)\nqc.h(1)\nqc.measure_all()",
      codeStatus: "executable",
      choices: {
        a: "00 and 11 only",
        b: "00 and 01 only",
        c: "All four outcomes, with equal probability",
        d: "11 only",
      },
      answer: "a",
      explanation:
        "The controlled-phase gate sandwiched by Hadamards on qubit 1 acts as a controlled bit flip from qubit 0 to qubit 1, so the circuit is the standard entangling preparation and yields only the correlated even-parity outcomes 00 and 11. Reading the controlled-phase gate as having no effect on statistics gives the tempting uniform answer over all four outcomes. The pair 00 and 01 would need qubit 1 left unentangled, and 11 only would require no superposition at all.",
      tags: ["gate-identities", "entanglement", "measurement"],
      concept: "Controlled-Z as controlled-X",
      objective: "Predict outcomes for a circuit built from equivalent gates.",
      refs: [CIRCUIT_LIBRARY, MEASURE],
    },
    {
      id: "s1-042",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "Both circuits below are compared as operators and found unequal, yet they produce identical measurement statistics from |00>. What is the most likely explanation?",
      code: "import numpy as np\nfrom qiskit import QuantumCircuit\n\nqc_a = QuantumCircuit(2)\nqc_a.h(0)\nqc_a.cx(0, 1)\n\nqc_b = QuantumCircuit(2, global_phase=np.pi)\nqc_b.h(0)\nqc_b.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "They differ by a global phase, which operator equality treats as a real difference.",
        b: "One of the circuits is not unitary.",
        c: "Operator comparison depends on the order in which gates were appended.",
        d: "The two circuits act on different numbers of qubits.",
      },
      answer: "a",
      explanation:
        "Operator equality is an exact matrix comparison, so an overall phase makes the matrices differ even though every measurement probability is identical. Both circuits are unitary, since each is built only from gates, so neither is disqualified on that ground, and both act on the same two qubits, so a mismatch in numbers of qubits is impossible. Building an operator collapses the whole gate list into one matrix, so the order in which instructions were appended is not what the comparison depends on.",
      mistake:
        "Concluding a circuit is wrong because an exact operator comparison fails on a global phase.",
      tags: ["global-phase", "unitary-operations", "comparison"],
      concept: "Global phase in operator comparisons",
      objective: "Explain mismatches between operator equality and statistics.",
      refs: [OP, SV],
    },
    {
      id: "s1-043",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A Bell pair is prepared, then a Z gate is applied to qubit 1 only, and finally the Bell preparation is undone. What is measured?",
      choices: {
        a: "00 with certainty",
        b: "01 with certainty",
        c: "10 with certainty",
        d: "A uniform distribution over all four outcomes",
      },
      answer: "b",
      explanation:
        "Undoing the preparation turns the phase that was kicked into the entangled state back into a definite basis state. The sign flip on the doubly excited component survives the inverse controlled gate as a relative phase on qubit 0, and the final Hadamard converts it into an excitation of qubit 0, printed as the label 01. Predicting 00 assumes the phase is unobservable, but the inverse preparation is exactly the interference step that reveals it. A uniform distribution over all four outcomes would require the entanglement never to be undone, and the label 10 would place the excitation on the wrong qubit.",
      mistake:
        "Assuming a phase applied inside an entangled state cannot be detected.",
      tags: ["entanglement", "relative-phase", "interference"],
      concept: "Phase kickback in entangled registers",
      objective: "Combine entanglement and phase reasoning across a circuit.",
      refs: [OPERATORS, CIRCUIT_LIBRARY],
    },
    {
      id: "s1-044",
      difficulty: "hard",
      type: "code-output",
      question:
        "What does this comparison print, given that the two operators are built from the standard controlled-X gate with reversed arguments?",
      code: "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Operator\n\na = QuantumCircuit(2)\na.cx(0, 1)\nb = QuantumCircuit(2)\nb.cx(1, 0)\nprint(Operator(a) == Operator(b))",
      codeStatus: "executable",
      choices: {
        a: "True, because controlled-X is symmetric",
        b: "False, because control and target are not interchangeable",
        c: "True, because both circuits use the same gate name",
        d: "It raises an error, because the qubit arguments differ",
      },
      answer: "b",
      explanation:
        "Controlled-X acts asymmetrically: it flips the target only when the control is excited, so exchanging the roles gives a different unitary. Symmetry holds for controlled-Z, not for controlled-X. Both circuits are valid two-qubit circuits, so no error occurs, and identical gate names say nothing about the resulting matrix.",
      tags: ["two-qubit-gates", "unitary-operations", "operator-algebra"],
      concept: "Asymmetry of controlled-X",
      objective: "Distinguish symmetric and asymmetric controlled gates.",
      refs: [OP, api("qiskit/qiskit.circuit.library.CXGate")],
    },
    {
      id: "s1-045",
      difficulty: "hard",
      type: "code-completion",
      question:
        "The circuit should measure the observable that applies X to qubit 1 and Z to qubit 0. Which line belongs in the blank, before the computational-basis measurement?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\n_____\nqc.measure([0, 1], [0, 1])",
      codeStatus: "partial-completion",
      choices: {
        a: "qc.h(1)",
        b: "qc.h(0)",
        c: "qc.z(1)",
        d: "qc.barrier()",
      },
      answer: "a",
      explanation:
        "Hardware reads out in the computational basis, so every factor of the observable that is not diagonal needs a rotation onto that basis first; a Hadamard on the qubit carrying the X factor does exactly that. Rotating qubit 0 instead would spoil the factor that is already diagonal. A phase flip on qubit 1 leaves the measurement basis unchanged, and a barrier is only a compiler directive with no effect on what is measured.",
      tags: ["observables", "measurement", "pauli-operators"],
      concept: "Basis changes for Pauli measurement",
      objective:
        "Choose the rotations needed to measure a non-diagonal observable.",
      refs: [PAULI_OBS, MEASURE],
    },
    {
      id: "s1-046",
      difficulty: "hard",
      type: "debugging",
      question:
        "The intent was to apply a controlled rotation, but every run leaves the target unchanged. Which explanation fits the code?",
      code: "import numpy as np\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cry(0.0, 0, 1)",
      codeStatus: "intentional-error",
      choices: {
        a: "A rotation angle of zero makes the controlled gate the identity regardless of the control.",
        b: "Controlled rotations require the control qubit to be measured first.",
        c: "The control and target must be adjacent in the circuit definition.",
        d: "Controlled rotations are only valid on three or more qubits.",
      },
      answer: "a",
      explanation:
        "The control is in a proper superposition, so the gate would act if the angle were nonzero; a zero angle makes the rotation the identity and nothing happens. Measuring the control first would destroy that superposition rather than enable the gate. Qubit adjacency is a hardware coupling concern handled during compilation, not a rule about how circuits may be defined, and controlled rotations are ordinary two-qubit operations that need no third wire.",
      tags: ["rotation-gates", "two-qubit-gates", "debugging"],
      concept: "Zero-angle rotations",
      objective: "Diagnose a controlled operation that has no effect.",
      refs: [api("qiskit/qiskit.circuit.library.CRYGate"), CIRCUIT_LIBRARY],
    },
    {
      id: "s1-047",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative rule for how Qiskit maps qubit indices onto the characters of a printed measurement outcome. Which source answers this most directly?",
      choices: {
        a: "The bit-ordering guide in the IBM Quantum documentation",
        b: "The release notes for the most recent Qiskit minor version",
        c: "The API page for the Sampler primitive",
        d: "The transpiler stages guide",
      },
      answer: "a",
      explanation:
        "A dedicated guide covers endianness and how indices map to printed labels, which is exactly the convention in question. Release notes describe changes rather than stable conventions, the Sampler page documents an execution interface, and the transpiler guide covers compilation stages.",
      tags: ["little-endian", "documentation", "qubit-ordering"],
      concept: "Locating convention documentation",
      objective: "Find the authoritative source for a Qiskit convention.",
      refs: [BIT_ORDERING],
    },
    {
      id: "s1-048",
      difficulty: "medium",
      type: "code-completion",
      question:
        "The observable should measure the parity of qubits 0 and 2 in a three-qubit register while ignoring qubit 1. Which label belongs in the blank?",
      code: 'from qiskit.quantum_info import SparsePauliOp\n\nobs = SparsePauliOp("_____")',
      codeStatus: "partial-completion",
      choices: {
        a: "ZIZ",
        b: "IZZ",
        c: "ZZI",
        d: "ZZZ",
      },
      answer: "a",
      explanation:
        "Labels are read right to left starting at qubit 0, so placing the non-identity factor at the rightmost and leftmost positions and identity in the middle targets qubits 0 and 2. The label IZZ targets qubits 0 and 1 instead, ZZI targets qubits 1 and 2, and ZZZ leaves out the identity altogether and so includes qubit 1, which was supposed to be ignored.",
      mistake: "Counting Pauli label positions from the left.",
      tags: ["observables", "pauli-operators", "qubit-ordering"],
      concept: "Building a targeted Pauli observable",
      objective: "Construct Pauli labels for specific qubits.",
      refs: [PAULI_OBS, SPO, BIT_ORDERING],
    },
    {
      id: "s1-049",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this call add to a two-qubit circuit that currently has no classical bits?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.measure_all()",
      codeStatus: "executable",
      choices: {
        a: "A barrier followed by measurements of both qubits into a newly added two-bit classical register",
        b: "Measurements of both qubits, but only if classical bits already exist",
        c: "A single measurement of qubit 0 into a new one-bit register",
        d: "Nothing, because the circuit was created without classical bits",
      },
      answer: "a",
      explanation:
        "The convenience method allocates a fresh classical register wide enough for every qubit, inserts a barrier so later optimization does not move gates across the measurement boundary, and measures each qubit into the matching bit. It does not require classical bits to exist beforehand, so it does not fail on a circuit created without them, and it covers all qubits rather than only the first one.",
      mistake:
        "Expecting the convenience method to fail when the circuit has no classical register.",
      tags: ["measurement", "circuit-structure"],
      concept: "Bulk measurement helper",
      objective: "Describe what a bulk measurement call adds to a circuit.",
      refs: [QC, MEASURE],
    },
    {
      id: "s1-050",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A three-qubit register is prepared in a GHZ state, and then qubit 2 is measured and found to be 1. What is the state of the remaining two qubits?",
      choices: {
        a: "|11>, a product state",
        b: "Still entangled, in an equal superposition of |00> and |11>",
        c: "The maximally mixed two-qubit state",
        d: "Undefined until the other two qubits are also measured",
      },
      answer: "a",
      explanation:
        "The state has support only on the all-zero and all-one components, so learning one qubit's value selects one of them and forces the others to match, leaving a definite product state with both remaining qubits excited. Remaining in an equal superposition of |00> and |11> would hold if the measured qubit had been read in a rotated basis, which does not select a computational-basis branch. A maximally mixed description applies only when the outcome is discarded rather than known, and the remaining state is perfectly well defined without measuring anything else.",
      tags: ["entanglement", "ghz-state", "measurement"],
      concept: "Measurement collapse in GHZ states",
      objective: "Determine post-measurement states of entangled registers.",
      refs: [OPERATORS, MEASURE],
    },
    {
      id: "s1-051",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "Why does this comparison of an observable's terms report a shorter list than the two terms originally supplied?",
      code: 'from qiskit.quantum_info import SparsePauliOp\n\nobs = SparsePauliOp(["ZZ", "ZZ"], coeffs=[0.5, 0.25])\nprint(len(obs.simplify()))',
      codeStatus: "executable",
      choices: {
        a: "Identical Pauli terms are combined and their coefficients are added.",
        b: "Duplicate terms are silently dropped, keeping only the first coefficient.",
        c: "Terms with coefficients below one are removed.",
        d: "The observable is converted to a dense matrix, which has no term count.",
      },
      answer: "a",
      explanation:
        "Simplification merges repeated Pauli labels by summing their coefficients, so two entries for the same string collapse into one carrying 0.75. Nothing is silently dropped, so the first coefficient is not simply kept, and no magnitude threshold removes coefficients merely for being below one; only terms that cancel to zero disappear. The result also remains a sparse Pauli sum rather than becoming a dense matrix, so it still has a term count.",
      tags: ["observables", "operator-algebra", "pauli-operators"],
      concept: "Simplifying Pauli sums",
      objective: "Predict how weighted Pauli sums combine terms.",
      refs: [SPO, PAULI_OBS],
    },
  ],
);
