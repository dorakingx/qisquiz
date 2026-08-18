import { defineSection } from "./define";
import { api, guide } from "./refs";

const CONSTRUCT = guide("construct-circuits");
const LIB_GUIDE = guide("circuit-library");
const CONTROL_FLOW = guide("classical-feedforward-and-control-flow");
const TRANSPILE = guide("transpile");
const STAGES = guide("transpiler-stages");
const PASS_MANAGERS = guide("transpile-with-pass-managers");
const SET_OPT = guide("set-optimization");
const DEFAULTS = guide("defaults-and-configuration-options");
const SAVE = guide("save-circuits");
const REPRESENT = guide("represent-quantum-computers");
const FRACTIONAL = guide("fractional-gates");
const SETTINGS = guide("circuit-transpilation-settings");
const SYNTH = guide("synthesize-unitary-operators");
const DD_PASS = guide("dynamical-decoupling-pass-manager");
const MEASURE = guide("measure-qubits");
const DYNAMIC = guide("execute-dynamic-circuits");
const QC = api("qiskit/qiskit.circuit.QuantumCircuit");
const PARAM = api("qiskit/qiskit.circuit.Parameter");
const PARAM_VEC = api("qiskit/qiskit.circuit.ParameterVector");
const TARGET = api("qiskit/qiskit.transpiler.Target");
const PRESET_PM = api("qiskit/qiskit.transpiler.generate_preset_pass_manager");
const PASS_MANAGER = api("qiskit/qiskit.transpiler.PassManager");
const STAGED_PM = api("qiskit/qiskit.transpiler.StagedPassManager");
const COUPLING = api("qiskit/qiskit.transpiler.CouplingMap");
const LIB_API = api("qiskit/circuit_library");
const IF_ELSE = api("qiskit/qiskit.circuit.IfElseOp");
const FOR_LOOP = api("qiskit/qiskit.circuit.ForLoopOp");
const SWITCH = api("qiskit/qiskit.circuit.SwitchCaseOp");
const CIRCUIT_MODULE = api("qiskit/circuit");

/**
 * Section 3 — Create quantum circuits (official weight 18%).
 * Target: 58 questions.
 */
export const SECTION_3_QUESTIONS = defineSection(
  { section: 3, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s3-001",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this constructor call allocate?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 2)",
      codeStatus: "executable",
      choices: {
        a: "Three qubits and two classical bits",
        b: "Two qubits and three classical bits",
        c: "Three qubits and three classical bits, since the counts must match",
        d: "A circuit of depth three with two gates reserved",
      },
      answer: "a",
      explanation:
        "The two positional arguments are the qubit count first and the classical-bit count second, and they need not match: it is common to measure only a subset of qubits. The arguments describe register widths, not depth or a gate budget.",
      tags: ["quantum-circuit", "registers"],
      concept: "Circuit construction arguments",
      objective: "Create a QuantumCircuit with quantum and classical bits.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-002",
      difficulty: "medium",
      type: "debugging",
      question:
        "This prints 4, not 2. Why does the circuit end up with four classical bits?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()\nprint(qc.num_clbits)",
      codeStatus: "executable",
      choices: {
        a: "The bulk helper allocates a fresh register instead of reusing the existing bits",
        b: "Each measured qubit consumes two classical bits, one for value and one for validity",
        c: "The entangling gate silently allocates a second pair of classical bits",
        d: "Counting is doubled because both qubits and classical bits are reported together",
      },
      answer: "a",
      explanation:
        "The convenience method always adds its own register wide enough for every qubit, so a circuit that already declared bits ends up with both sets; passing the flag that disables adding bits, or measuring explicitly, avoids it. A measurement consumes exactly one classical bit, no gate allocates classical storage, and the property counts classical bits only rather than combining them with qubits.",
      mistake:
        "Assuming the bulk helper reuses classical bits the circuit already has.",
      tags: ["measurement", "registers", "circuit-metrics"],
      concept: "Bulk measurement allocates a new register",
      objective: "Predict how measurement helpers change a circuit's registers.",
      refs: [QC, MEASURE],
      seconds: 70,
    },
    {
      id: "s3-003",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does declaring the rotation angle this way make possible that a plain floating-point value would not?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\n\ntheta = Parameter(\"theta\")\nqc = QuantumCircuit(1)\nqc.ry(theta, 0)",
      codeStatus: "executable",
      choices: {
        a: "One compiled copy of the circuit can be reused across many different angle values",
        b: "The rotation is applied continuously rather than as a single discrete instruction",
        c: "The angle is automatically optimized to whatever value minimizes the circuit depth",
        d: "The circuit becomes executable without being compiled for a backend first",
      },
      answer: "a",
      explanation:
        "A symbolic angle survives compilation, so the expensive layout and routing work happens once and each new value is supplied at execution time; this is what makes variational loops affordable. The instruction is still a single discrete rotation, no optimizer picks the value on your behalf, and a symbolic circuit still has to be compiled for the target before hardware will accept it.",
      tags: ["parameterized-circuits", "transpilation"],
      concept: "Symbolic circuit parameters",
      objective: "Explain why circuits carry unbound angles.",
      refs: [PARAM, CONSTRUCT],
      seconds: 50,
    },
    {
      id: "s3-004",
      difficulty: "easy",
      type: "code-behavior",
      question: "What effect does the middle instruction have on this circuit?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.h(0)\nqc.barrier()\nqc.h(0)",
      codeStatus: "executable",
      choices: {
        a: "It prevents the optimizer from cancelling the two gates that surround it",
        b: "It measures the qubit into a register the circuit creates automatically",
        c: "It resets the qubit to the ground state between the two gates",
        d: "It pins the circuit onto a specific pair of physical qubits during layout",
      },
      answer: "a",
      explanation:
        "A barrier is a compiler directive: it performs no quantum operation but stops optimization passes from commuting or merging instructions across it, which is exactly what keeps the two self-inverse gates from being removed. It never measures anything, does not reset the qubit, and has no influence on which physical qubits the layout stage chooses.",
      tags: ["quantum-circuit", "transpilation", "optimization-level"],
      concept: "Barriers as compiler directives",
      objective: "Explain the role of barriers in circuits.",
      refs: [QC, CONSTRUCT],
      seconds: 50,
    },
    {
      id: "s3-005",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the second argument of the final call specify?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.circuit.library import XGate\n\nqc = QuantumCircuit(3)\nqc.append(XGate(), [1])",
      codeStatus: "executable",
      choices: {
        a: "The qubits the instruction acts on, listed in the order the gate expects them",
        b: "The number of times the instruction should be repeated in the circuit",
        c: "The classical bits that will receive the instruction's result",
        d: "The position in the instruction list where the gate should be inserted",
      },
      answer: "a",
      explanation:
        "Appending an instruction takes the operation first and then the wires it acts on, so the list names qubit arguments positionally. It is not a repetition count, which would be expressed by adding the instruction again or by a loop construct, and it is not a classical destination, since this gate writes no classical data. Instructions are always appended at the end rather than inserted at an index.",
      tags: ["quantum-circuit", "circuit-composition", "circuit-library"],
      concept: "Appending instructions to wires",
      objective: "Read the argument order of circuit instruction calls.",
      refs: [QC, CONSTRUCT],
      seconds: 50,
    },
    {
      id: "s3-006",
      difficulty: "easy",
      type: "concept",
      question:
        "What does it mean for a circuit to be an ISA circuit in the Qiskit Runtime workflow?",
      choices: {
        a: "It uses only instructions the backend supports, on qubit pairs the backend couples",
        b: "It has been serialized into a text format that external tools can also read",
        c: "It contains no measurements, so the primitive can add whatever readout it needs",
        d: "It has already been executed at least once on the hardware it targets",
      },
      answer: "a",
      explanation:
        "ISA stands for instruction set architecture, so an ISA circuit is one already expressed in the target's native operations with two-qubit gates only on coupled pairs. Serialization format, measurement content, and execution history are all unrelated to whether a circuit satisfies a target.",
      tags: ["isa-circuits", "transpilation", "runtime"],
      concept: "ISA circuits",
      objective: "Define what makes a circuit backend-ready.",
      refs: [TRANSPILE, REPRESENT],
    },
    {
      id: "s3-007",
      difficulty: "easy",
      type: "concept",
      question:
        "Why must a circuit be transpiled before running on a quantum processor?",
      choices: {
        a: "The circuit must be rewritten into the device's native gates and mapped onto physically connected qubits",
        b: "Transpilation removes noise from the circuit",
        c: "Transpilation converts quantum instructions into classical code",
        d: "Transpilation guarantees the circuit will run faster than any alternative",
      },
      answer: "a",
      explanation:
        "Devices implement only a small native gate set and connect only certain qubit pairs, so an abstract circuit must be translated and routed to satisfy those constraints. Transpilation reduces overhead but cannot remove noise, it produces quantum instructions rather than classical code, and optimization is heuristic rather than provably optimal.",
      mistake: "Believing transpilation improves the fidelity of the hardware itself.",
      tags: ["transpilation", "isa-circuits"],
      concept: "Purpose of transpilation",
      objective: "Explain why circuits must be compiled for hardware.",
      refs: [TRANSPILE, STAGES],
    },
    {
      id: "s3-008",
      difficulty: "easy",
      type: "concept",
      question:
        "Which range of optimization levels do the preset transpilation pipelines accept?",
      choices: {
        a: "0 through 3",
        b: "1 through 5",
        c: "0 through 10",
        d: "Only 0 or 1",
      },
      answer: "a",
      explanation:
        "Four preset levels are defined, from the lightest that only satisfies the target to the heaviest that spends the most effort on optimization. There is no level above three, and more than the two extremes are available.",
      tags: ["transpilation", "optimization-level"],
      concept: "Preset optimization levels",
      objective: "Recall the available transpiler optimization levels.",
      refs: [SET_OPT, PRESET_PM],
    },
    {
      id: "s3-009",
      difficulty: "medium",
      type: "code-output",
      question: "What three numbers does this print, in order?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.h(1)\nqc.cx(0, 1)\nprint(qc.size(), qc.depth(), qc.width())",
      codeStatus: "executable",
      choices: {
        a: "3 2 2",
        b: "3 3 2",
        c: "2 3 2",
        d: "3 2 4",
      },
      answer: "a",
      explanation:
        "Three instructions are present, so the size is 3. The two single-qubit gates act on different wires and share a layer, and the entangling gate must follow, so the critical path is 2 layers deep. Width counts bits, and with no classical register declared it is just the two qubits. Reporting 3 3 2 treats every instruction as its own layer, 2 3 2 confuses size with depth, and 3 2 4 counts the qubits twice in the width.",
      mistake: "Confusing total instruction count with critical-path depth.",
      tags: ["circuit-metrics", "quantum-circuit"],
      concept: "Depth, size, and width",
      objective: "Distinguish the circuit size metrics.",
      refs: [QC, CONSTRUCT],
      seconds: 75,
    },
    {
      id: "s3-010",
      difficulty: "easy",
      type: "concept",
      question:
        "In a dynamic circuit, what does classical feed-forward mean?",
      choices: {
        a: "A mid-circuit measurement result conditions later quantum operations while the job is still running",
        b: "Measurement results are post-processed after the job finishes",
        c: "Classical bits are copied onto qubits",
        d: "The circuit is rerun automatically until a target outcome appears",
      },
      answer: "a",
      explanation:
        "Feed-forward means the control system reads a mid-circuit measurement and applies subsequent gates based on it, inside the same execution. Post-processing happens after the fact and cannot change what the device did, classical bits are not copied onto qubits, and automatic retries are a host-side loop rather than a circuit feature.",
      tags: ["dynamic-circuits", "classical-control"],
      concept: "Classical feed-forward",
      objective: "Define feed-forward in dynamic circuits.",
      refs: [CONTROL_FLOW, DYNAMIC],
    },
    {
      id: "s3-011",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this print, and why does the transpiler need it?",
      code:
        "from qiskit_ibm_runtime.fake_provider import FakeAlgiers\n\nbackend = FakeAlgiers()\nprint(sorted(backend.target.operation_names))",
      codeStatus: "executable",
      choices: {
        a: "The instructions the device implements natively, which the compiler must translate into",
        b: "The names of the jobs most recently submitted to the device",
        c: "The circuits currently queued for execution on the device",
        d: "The classical registers the device allocates for every job it runs",
      },
      answer: "a",
      explanation:
        "A target maps each supported instruction to the qubits it may act on together with calibrated error and duration data, so the compiler knows what it is allowed to emit. Job history and the queue are execution metadata reached through the service rather than through the target, and classical registers belong to the submitted circuit rather than being allocated by the device.",
      tags: ["backend-v2", "target", "transpilation"],
      concept: "Backend target",
      objective: "Identify what describes a backend's capabilities.",
      refs: [TARGET, REPRESENT],
      seconds: 50,
    },
    {
      id: "s3-012",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "What does this one line give you, compared with writing the same structure gate by gate?",
      code:
        "from qiskit.circuit.library import efficient_su2\n\nansatz = efficient_su2(4, reps=2)",
      codeStatus: "executable",
      choices: {
        a: "A tested parameterized ansatz with alternating rotation and entangling layers",
        b: "A catalogue listing which quantum processors can run the circuit",
        c: "A persistent store that keeps every job submitted from this circuit",
        d: "A styling theme applied to the circuit whenever it is drawn",
      },
      answer: "a",
      explanation:
        "The circuit library ships standard, well-tested constructions such as variational ansatz families, so the layered structure and its parameter vector do not have to be rebuilt by hand. Hardware catalogues come from the runtime service, job storage is a service concern, and plot styling belongs to the visualization tools; none of them are what a library circuit constructor returns.",
      tags: ["circuit-library", "parameterized-circuits", "quantum-circuit"],
      concept: "Circuit library scope",
      objective: "Describe what the circuit library offers.",
      refs: [LIB_GUIDE, LIB_API],
      seconds: 50,
    },
    {
      id: "s3-013",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the middle instruction schedule?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.delay(300, 1, unit=\"dt\")\nqc.cx(0, 1)",
      codeStatus: "executable",
      choices: {
        a: "A real idle period on qubit 1, during which that qubit decoheres",
        b: "A pause in the Python program while the rest of the circuit is assembled",
        c: "A request that the job wait longer in the queue before it starts",
        d: "A barrier that also measures qubit 1 into a hidden classical register",
      },
      answer: "a",
      explanation:
        "A delay schedules genuine idle time on the named qubit, which matters because idling qubits lose coherence and because decoupling sequences are inserted into exactly such windows. It is part of the quantum program rather than a host-side sleep while building it, it has no bearing on queue position, and it performs no measurement of any kind.",
      tags: ["scheduling", "quantum-circuit", "dynamical-decoupling"],
      concept: "Delay instructions",
      objective: "Explain what a delay represents.",
      refs: [QC, DD_PASS],
      seconds: 50,
    },
    {
      id: "s3-014",
      difficulty: "medium",
      type: "code-output",
      question: "What does this program print?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3)\nqc.h(0)\nqc.h(1)\nqc.cx(0, 2)\nprint(qc.depth())",
      codeStatus: "executable",
      choices: {
        a: "2",
        b: "3",
        c: "1",
        d: "4",
      },
      answer: "a",
      explanation:
        "The two single-qubit gates act on different qubits, so they occupy the same layer, and the entangling gate must wait for the one on qubit 0, giving a critical path of two layers. Counting every instruction instead gives 3, which is the size rather than the depth; 1 would require all three instructions to run simultaneously, and 4 would count the idle wire as its own layer.",
      mistake: "Confusing total instruction count with critical-path depth.",
      tags: ["circuit-metrics", "quantum-circuit"],
      concept: "Depth versus instruction count",
      objective: "Compute circuit depth from gate structure.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-015",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this measurement call do?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.measure([0, 1], [1, 0])",
      codeStatus: "executable",
      choices: {
        a: "Measures qubit 0 into classical bit 1 and qubit 1 into classical bit 0",
        b: "Swaps the two qubits before measuring them in order",
        c: "Measures both qubits into classical bit 0",
        d: "Measures only qubit 1, because the lists conflict",
      },
      answer: "a",
      explanation:
        "The two lists are paired position by position, so the first qubit goes to the first listed classical bit. No quantum operation happens: the crossed mapping only changes where results are stored, which does change how the printed bitstring reads. Both qubits are measured, and each gets a distinct destination.",
      mistake:
        "Reading a crossed qubit-to-clbit mapping as a physical swap of the qubits.",
      tags: ["measurement", "registers", "qubit-ordering"],
      concept: "Explicit qubit-to-clbit mapping",
      objective: "Predict where measurement results are stored.",
      refs: [QC, MEASURE],
      seconds: 70,
    },
    {
      id: "s3-016",
      difficulty: "medium",
      type: "code-completion",
      question:
        "The rotation angle must stay symbolic so it can be swept later. Which line belongs in the blank?",
      code: 'from qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\n\nqc = QuantumCircuit(1)\n_____\nqc.ry(theta, 0)',
      codeStatus: "partial-completion",
      choices: {
        a: 'theta = Parameter("theta")',
        b: "theta = 0.7",
        c: 'theta = qc.parameter("theta")',
        d: 'theta = "theta"',
      },
      answer: "a",
      explanation:
        "A parameter object is constructed from its name and can then be used wherever a numeric angle is accepted, remaining unbound until a value is assigned. Assigning the float 0.7 fixes the angle immediately and defeats the purpose, circuits do not create parameters through a method of their own, and a bare string is not accepted as a rotation angle at all.",
      tags: ["parameterized-circuits"],
      concept: "Declaring a circuit parameter",
      objective: "Construct a parameterized rotation.",
      refs: [PARAM, CONSTRUCT],
    },
    {
      id: "s3-017",
      difficulty: "medium",
      type: "code-output",
      question: "What does this program print?",
      code: 'from qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\n\ntheta = Parameter("theta")\nphi = Parameter("phi")\nqc = QuantumCircuit(2)\nqc.ry(theta, 0)\nqc.rz(phi, 1)\nqc.rx(theta, 1)\nprint(qc.num_parameters)',
      codeStatus: "executable",
      choices: {
        a: "2",
        b: "3",
        c: "1",
        d: "0",
      },
      answer: "a",
      explanation:
        "The count reports distinct unbound symbols, and one of them is reused on two different gates, so only two names exist. Counting parameterized instructions instead gives 3, which is the usual slip; 1 would treat every symbol as the same object, and 0 would mean the circuit had already been bound.",
      mistake:
        "Counting parameterized gates rather than distinct parameter objects.",
      tags: ["parameterized-circuits", "circuit-metrics"],
      concept: "Distinct parameters versus parameterized gates",
      objective: "Reason about parameter reuse within a circuit.",
      refs: [PARAM, QC],
    },
    {
      id: "s3-018",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does the parameter-binding call return, and what happens to the original circuit?",
      code: "bound = qc.assign_parameters({theta: 0.5})",
      codeStatus: "illustrative",
      choices: {
        a: "It returns a new circuit with the value substituted and leaves the original unbound",
        b: "It modifies the original circuit in place and returns None",
        c: "It returns the numeric value that was bound",
        d: "It returns a transpiled circuit ready for hardware",
      },
      answer: "a",
      explanation:
        "By default the binding is functional: a copy is produced and the original keeps its symbolic parameters, which is what makes it safe to sweep many values from one template. In-place mutation is available through an explicit flag, and that variant returns nothing. Binding performs no compilation, so the result still needs transpiling for a target.",
      mistake:
        "Assuming the original circuit is modified and then reusing it as if it were bound.",
      tags: ["parameterized-circuits", "quantum-circuit"],
      concept: "Functional parameter binding",
      objective: "Predict the result of binding parameter values.",
      refs: [QC, PARAM],
    },
    {
      id: "s3-019",
      difficulty: "easy",
      type: "concept",
      question:
        "When is a parameter vector preferable to declaring individual parameters?",
      choices: {
        a: "When many related angles are naturally indexed, such as one per layer and qubit",
        b: "When the circuit needs exactly one angle and that angle never changes",
        c: "When every angle is already known and can be bound at construction time",
        d: "When the circuit is intended to be simulated rather than compiled for hardware",
      },
      answer: "a",
      explanation:
        "A parameter vector creates an indexed family with a shared name, which keeps large ansatz circuits readable and lets a flat array of values be supplied in a known order. A single angle needs no vector, values known at construction time are constants rather than parameters, and whether the circuit will be simulated or compiled has no bearing on the choice.",
      tags: ["parameterized-circuits", "circuit-library"],
      concept: "Indexed parameter families",
      objective: "Choose between single parameters and parameter vectors.",
      refs: [PARAM_VEC, LIB_GUIDE],
      seconds: 50,
    },
    {
      id: "s3-020",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this control-flow block express?",
      code: "qc.measure(0, 0)\nwith qc.if_test((0, 1)):\n    qc.x(1)",
      codeStatus: "illustrative",
      choices: {
        a: "The X gate is applied on the device only when classical bit 0 holds the value 1",
        b: "The X gate is added to the circuit only if the Python variable is truthy at build time",
        c: "The circuit is executed twice, once per branch",
        d: "The measurement result is discarded and the X always runs",
      },
      answer: "a",
      explanation:
        "The context manager records a conditional block inside the circuit, so the decision is made by the control electronics during execution based on the measured bit. An ordinary Python conditional would be evaluated while the circuit is being built and would bake in one fixed branch. Only one execution occurs, and the measured bit genuinely gates the operation.",
      mistake:
        "Using a plain Python if statement, which decides at build time rather than at run time.",
      tags: ["dynamic-circuits", "classical-control", "measurement"],
      concept: "Circuit-level conditionals",
      objective: "Distinguish build-time and run-time control flow.",
      refs: [CONTROL_FLOW, IF_ELSE],
    },
    {
      id: "s3-021",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "A circuit built for an abstract three-qubit register must run on a device whose qubits are not all mutually connected. Which step resolves the mismatch?",
      choices: {
        a: "Running a pass manager built for that backend, which inserts routing operations as needed",
        b: "Increasing the shot count",
        c: "Reordering the gate list by hand until it happens to fit",
        d: "Adding a barrier before every two-qubit gate",
      },
      answer: "a",
      explanation:
        "Routing is a transpiler responsibility: the pass manager chooses a layout and inserts swap-like operations so every two-qubit gate acts on a coupled pair. Shots control statistics rather than compatibility, hand-reordering is error-prone and cannot always succeed, and barriers only constrain optimization.",
      tags: ["transpilation", "routing", "isa-circuits"],
      concept: "Routing to a coupling map",
      objective: "Select the step that makes a circuit hardware-compatible.",
      refs: [STAGES, COUPLING],
    },
    {
      id: "s3-022",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does a pass manager built this way return when run on a circuit?",
      code: "from qiskit.transpiler import generate_preset_pass_manager\n\npm = generate_preset_pass_manager(optimization_level=2, backend=backend)\nisa = pm.run(qc)",
      codeStatus: "illustrative",
      choices: {
        a: "A new circuit expressed in the backend's native gates and mapped to its physical qubits",
        b: "The same circuit object, annotated with a backend name",
        c: "A job handle that must be awaited",
        d: "A list of the passes that were applied",
      },
      answer: "a",
      explanation:
        "Running a pass manager compiles the circuit and returns a new, transformed circuit that satisfies the target, carrying layout information alongside it. Nothing is submitted, so there is no job to await, and the return value is a circuit rather than a report of the pipeline.",
      tags: ["transpilation", "isa-circuits", "pass-manager"],
      concept: "Pass manager output",
      objective: "Predict what compiling a circuit produces.",
      refs: [PRESET_PM, PASS_MANAGERS],
    },
    {
      id: "s3-023",
      difficulty: "medium",
      type: "concept",
      question:
        "Which transpiler stage is responsible for choosing which physical qubits the circuit's virtual qubits occupy?",
      choices: {
        a: "Layout",
        b: "Translation",
        c: "Optimization",
        d: "Scheduling",
      },
      answer: "a",
      explanation:
        "The layout stage assigns virtual qubits to physical ones, after which routing makes the assignment feasible for every two-qubit gate. Translation rewrites gates into the native basis, optimization simplifies the result, and scheduling places instructions in time.",
      tags: ["transpilation", "transpiler-stages"],
      concept: "Transpiler stage responsibilities",
      objective: "Match transpiler stages to their tasks.",
      refs: [STAGES, TRANSPILE],
      seconds: 70,
    },
    {
      id: "s3-024",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does the second pipeline generally trade for its extra effort?",
      code:
        "from qiskit.transpiler import generate_preset_pass_manager\n\nlight = generate_preset_pass_manager(optimization_level=1, backend=backend)\nheavy = generate_preset_pass_manager(optimization_level=3, backend=backend)",
      codeStatus: "illustrative",
      choices: {
        a: "Longer compilation time, in exchange for potentially fewer operations on hardware",
        b: "Correctness of the compiled circuit, in exchange for finishing sooner",
        c: "The ability to run on hardware at all, since heavy pipelines emit abstract gates",
        d: "The shot budget the job may later request when it is submitted",
      },
      answer: "a",
      explanation:
        "Heavier presets run more and costlier passes, so compilation takes longer while often producing fewer entangling operations. Every level must preserve the circuit's semantics, so correctness is never traded away, and every level must emit a target-compatible circuit, so hardware compatibility is never lost. Shot budgets are an execution option that compilation does not touch.",
      tags: ["transpilation", "optimization-level", "pass-manager"],
      concept: "Optimization level trade-offs",
      objective: "Reason about the cost of higher optimization levels.",
      refs: [SET_OPT, SETTINGS],
    },
    {
      id: "s3-025",
      difficulty: "medium",
      type: "code-output",
      question:
        "What does this program print for the composed circuit?",
      code: "from qiskit import QuantumCircuit\n\na = QuantumCircuit(2)\na.h(0)\n\nb = QuantumCircuit(2)\nb.cx(0, 1)\n\nc = a.compose(b)\nprint(a.size(), c.size())",
      codeStatus: "executable",
      choices: {
        a: "1 2",
        b: "2 2",
        c: "1 1",
        d: "2 1",
      },
      answer: "a",
      explanation:
        "Composition returns a new circuit holding both instructions while leaving the original untouched, so the first circuit still reports a single instruction and the composed one reports two. Expecting 2 for the original assumes the operation mutates in place, and any answer where the composed circuit reports 1 would mean the second circuit's instruction was dropped.",
      mistake:
        "Assuming composition modifies the circuit it is called on.",
      tags: ["circuit-composition", "circuit-metrics"],
      concept: "Non-mutating composition",
      objective: "Predict the effect of composing circuits.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-026",
      difficulty: "medium",
      type: "debugging",
      question:
        "Composing a two-qubit circuit into a five-qubit circuit places gates on the wrong wires. What fixes it?",
      code: "big = QuantumCircuit(5)\nsmall = QuantumCircuit(2)\nsmall.cx(0, 1)\nbig = big.compose(small)",
      codeStatus: "intentional-error",
      choices: {
        a: "Pass an explicit qubit mapping so the smaller circuit lands on the intended wires",
        b: "Pad the smaller circuit with idle qubits until the widths match exactly",
        c: "Transpile the smaller circuit first",
        d: "Convert both circuits to OpenQASM and concatenate the text",
      },
      answer: "a",
      explanation:
        "Without an explicit mapping the narrower circuit lands on the lowest-numbered wires, which is rarely what a caller wants; supplying the target qubits makes the placement deliberate. Padding with idle qubits until the widths match works only by accident and wastes width, transpiling changes which gates are used rather than where a subcircuit is placed, and concatenating serialized text is not a valid way to merge two programs.",
      mistake:
        "Relying on default wire placement when composing circuits of different widths.",
      tags: ["circuit-composition", "debugging", "registers"],
      concept: "Explicit wire mapping in composition",
      objective: "Control where a subcircuit is placed.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-027",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does converting a circuit into a reusable instruction accomplish?",
      code: "sub = qc.to_gate(label=\"ansatz_block\")\nparent.append(sub, [0, 1, 2])",
      codeStatus: "illustrative",
      choices: {
        a: "One opaque instruction that can be placed repeatedly and expanded during compilation",
        b: "A circuit already rewritten into the native gate set of the connected backend",
        c: "A measurement outcome that replaces the block wherever it is later appended",
        d: "A sealed object that can no longer be drawn, inspected, or decomposed",
      },
      answer: "a",
      explanation:
        "Packaging a circuit as a gate gives an abstraction boundary: the parent circuit sees one instruction, keeping diagrams and depth calculations readable, and the definition is expanded by the transpiler or on demand. Native-gate translation happens during compilation, not at packaging time, nothing is executed, and the block remains fully inspectable.",
      tags: ["circuit-composition", "custom-gates", "quantum-circuit"],
      concept: "Packaging circuits as instructions",
      objective: "Explain the effect of turning a circuit into a gate.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-028",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this loop construct add to the circuit?",
      code: "with qc.for_loop(range(3)) as i:\n    qc.rx(0.1, 0)",
      codeStatus: "illustrative",
      choices: {
        a: "A single loop instruction that the control hardware repeats three times",
        b: "Three separate rotation instructions unrolled at build time",
        c: "A conditional that runs only if a classical bit equals 3",
        d: "A request to submit the job three times",
      },
      answer: "a",
      explanation:
        "The loop is recorded as one control-flow instruction with a body and an iteration set, so the repetition happens on the device rather than by expanding the instruction list. Writing an ordinary Python loop would produce the unrolled version instead. There is no classical condition here, and job submission is unaffected.",
      tags: ["dynamic-circuits", "classical-control"],
      concept: "Loop control-flow instructions",
      objective: "Distinguish device-side loops from build-time unrolling.",
      refs: [CONTROL_FLOW, FOR_LOOP],
    },
    {
      id: "s3-029",
      difficulty: "medium",
      type: "concept",
      question:
        "Why should a variational ansatz usually stay parameterized through transpilation rather than being bound first?",
      choices: {
        a: "Compilation happens once, and every later parameter set reuses that compiled result",
        b: "Circuits that have already been bound to values cannot be compiled at all",
        c: "Backends reject any circuit that does not carry at least one free parameter",
        d: "Compilation runs measurably faster while the angle values are still unknown",
      },
      answer: "a",
      explanation:
        "Compilation is expensive and depends on structure rather than on angle values, so compiling the symbolic template once and supplying values per execution avoids recompiling for every optimizer iteration. Bound circuits transpile perfectly well, parameters are never required by a backend, and the speed benefit comes from reuse rather than from the compilation itself.",
      tags: ["parameterized-circuits", "transpilation", "workflow"],
      concept: "Compile once, bind many times",
      objective: "Explain why parameters survive compilation.",
      refs: [PASS_MANAGERS, PARAM],
    },
    {
      id: "s3-030",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does the decompose call change about this circuit?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3)\nqc.ccx(0, 1, 2)\nprint(qc.decompose().count_ops())",
      codeStatus: "executable",
      choices: {
        a: "The three-qubit gate is expanded one level into its definition, so the operation counts change",
        b: "The circuit is fully translated into the backend's native basis",
        c: "The circuit is optimized to the smallest possible gate count",
        d: "Nothing changes, because the gate is already elementary",
      },
      answer: "a",
      explanation:
        "Decomposition expands composite instructions by exactly one level of their definitions, which for a three-qubit controlled gate yields a sequence of one- and two-qubit operations. It is not target-aware, so it neither guarantees native gates nor performs optimization, and the gate is composite rather than elementary.",
      mistake:
        "Treating one-level decomposition as a substitute for transpiling to a target.",
      tags: ["quantum-circuit", "transpilation", "circuit-metrics"],
      concept: "One-level decomposition",
      objective: "Distinguish decomposition from full transpilation.",
      refs: [QC, TRANSPILE],
    },
    {
      id: "s3-031",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You need to save compiled circuits to disk and reload them later in another session, preserving parameters and custom instructions. Which approach is intended for this?",
      choices: {
        a: "Serialize with Qiskit's binary circuit format",
        b: "Export to OpenQASM 2 text",
        c: "Store the circuit's text drawing",
        d: "Pickle the backend object along with the circuit",
      },
      answer: "a",
      explanation:
        "The binary serialization format is designed to round-trip Qiskit circuits with high fidelity, including unbound parameters and custom gate definitions. Older text serialization cannot express those features, a drawing is a picture rather than data, and serializing a backend handle stores a service connection rather than the program.",
      tags: ["serialization", "quantum-circuit", "workflow"],
      concept: "Circuit serialization",
      objective: "Choose a format for persisting circuits.",
      refs: [SAVE, CIRCUIT_MODULE],
      seconds: 70,
    },
    {
      id: "s3-032",
      difficulty: "medium",
      type: "code-output",
      question: "What does this program print?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()\nprint(qc.num_clbits)",
      codeStatus: "executable",
      choices: {
        a: "2",
        b: "0",
        c: "1",
        d: "4",
      },
      answer: "a",
      explanation:
        "The circuit began with no classical bits, and the bulk measurement helper adds a register wide enough for every qubit, so two bits are created. Expecting 0 assumes the helper needs bits to exist beforehand, 1 would measure only one qubit, and 4 double-counts by adding the qubits to the classical bits.",
      tags: ["measurement", "registers", "circuit-metrics"],
      concept: "Classical bits added by bulk measurement",
      objective: "Predict register growth from measurement helpers.",
      refs: [QC, MEASURE],
    },
    {
      id: "s3-033",
      difficulty: "easy",
      type: "code-behavior",
      question: "What do the names supplied here affect?",
      code:
        "from qiskit import ClassicalRegister, QuantumCircuit, QuantumRegister\n\nqr = QuantumRegister(2, \"data\")\ncr = ClassicalRegister(2, \"readout\")\nqc = QuantumCircuit(qr, cr)",
      codeStatus: "executable",
      choices: {
        a: "Diagram labels, and the name under which each group can be addressed as a unit",
        b: "The speed at which the named qubits execute instructions on hardware",
        c: "Whether the named bits are eligible to be measured at the end of the circuit",
        d: "The order in which the transpiler assigns the qubits to physical positions",
      },
      answer: "a",
      explanation:
        "Registers are an organizational device: the name shows up in drawings and in Sampler result fields, and the group can be referenced together. Both named and unnamed forms produce identical qubits, so there is no execution speed difference and no restriction on which bits may be measured. Physical placement is decided by the layout stage from the target, not from register names.",
      tags: ["registers", "quantum-circuit", "result-object"],
      concept: "Named registers",
      objective: "Explain what registers add over bare bit counts.",
      refs: [CONSTRUCT, QC],
      seconds: 50,
    },
    {
      id: "s3-034",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "After compiling, what does the layout attribute attached to the resulting circuit record?",
      code: "isa = pm.run(qc)\nlayout = isa.layout",
      codeStatus: "illustrative",
      choices: {
        a: "How virtual qubits were mapped to physical ones, including any routing permutation",
        b: "The measured counts produced by the most recent execution of this circuit",
        c: "The full coupling map of the backend the circuit was compiled against",
        d: "The ordered list of optimization passes the pipeline actually applied",
      },
      answer: "a",
      explanation:
        "The layout records the initial assignment and any permutation routing introduced, which is exactly what you need to interpret results and to move observables onto the right physical qubits. It is not measured counts, which come from a primitive result; it is not the device's full coupling map, which belongs to the target; and it is not a log of which passes ran.",
      tags: ["transpilation", "layout", "isa-circuits"],
      concept: "Transpile layout metadata",
      objective: "Explain what compilation records about qubit mapping.",
      refs: [PASS_MANAGERS, STAGES],
    },
    {
      id: "s3-035",
      difficulty: "medium",
      type: "concept",
      question:
        "Why do device-native two-qubit gate sets often use an echoed cross-resonance or controlled-Z style gate rather than a controlled-X?",
      choices: {
        a: "The calibrated interaction is what the hardware implements; other gates are synthesized",
        b: "A controlled bit flip is not a unitary operation and so cannot be calibrated",
        c: "A controlled bit flip cannot create entanglement between two qubits",
        d: "A controlled bit flip is reserved for simulators and rejected by real devices",
      },
      answer: "a",
      explanation:
        "Each processor family calibrates a particular entangling interaction, and the transpiler translates textbook gates into that basis, sometimes adding single-qubit rotations. The controlled-X is a perfectly valid entangling unitary and runs on hardware; it is simply not always the calibrated primitive.",
      tags: ["transpilation", "basis-gates", "hardware"],
      concept: "Native entangling gates",
      objective: "Explain why native gate sets differ from textbook gates.",
      refs: [REPRESENT, TARGET],
    },
    {
      id: "s3-036",
      difficulty: "medium",
      type: "code-completion",
      question:
        "The pipeline must target a specific device and spend the most compilation effort available. Which arguments belong in the blank?",
      code: "from qiskit.transpiler import generate_preset_pass_manager\n\npm = generate_preset_pass_manager(_____)",
      codeStatus: "partial-completion",
      choices: {
        a: "optimization_level=3, backend=backend",
        b: "optimization_level=5, backend=backend",
        c: "shots=4096, backend=backend",
        d: "optimization_level=3, observable=obs",
      },
      answer: "a",
      explanation:
        "The heaviest preset is level 3, and the pipeline needs the device so it can read the target's gates and connectivity. An optimization_level of 5 does not exist, since the presets stop at 3; a shots argument is an execution option rather than a compilation one; and an observable belongs to the Estimator rather than to a compiler pipeline.",
      tags: ["transpilation", "optimization-level", "pass-manager"],
      concept: "Configuring a preset pipeline",
      objective: "Build a pass manager for a specific target and effort level.",
      refs: [PRESET_PM, SET_OPT],
    },
    {
      id: "s3-037",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "Why check this before submitting a circuit that branches on a mid-circuit measurement?",
      code: "print(\"if_else\" in backend.target.operation_names)",
      codeStatus: "illustrative",
      choices: {
        a: "Branching needs fast classical processing that only some devices advertise",
        b: "The check is only cosmetic, since branching is a language feature every device accepts",
        c: "Branching is available on simulators alone, so hardware always reports false",
        d: "Branching requires the circuit to declare no classical bits at all",
      },
      answer: "a",
      explanation:
        "Feed-forward requires the control electronics to read a measurement and act within coherence time, so it is a hardware capability listed in the target rather than a universal language feature. It is available on selected real processors as well as simulators, so the check is far from cosmetic, and it inherently requires classical bits to hold the measured values being tested.",
      tags: ["dynamic-circuits", "backend-v2", "target"],
      concept: "Backend support for control flow",
      objective: "Check hardware capability before using dynamic circuits.",
      refs: [DYNAMIC, TARGET],
    },
    {
      id: "s3-038",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this initialization instruction do to the target qubits?",
      code: "import numpy as np\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\nqc.initialize([1 / np.sqrt(2), 1 / np.sqrt(2)], 0)",
      codeStatus: "executable",
      choices: {
        a: "It resets the qubits and then prepares the requested state, so the instruction is not unitary",
        b: "It applies a unitary that maps the current state to the requested one",
        c: "It only records metadata and has no effect on execution",
        d: "It measures the qubits and post-selects on the requested outcome",
      },
      answer: "a",
      explanation:
        "State preparation of this kind begins with a reset, which discards whatever the qubit held, and then applies a preparation unitary; the reset makes the whole instruction irreversible. A purely unitary alternative exists for cases where the qubits are known to start in the ground state. Nothing is measured or post-selected.",
      mistake:
        "Assuming state preparation is unitary and safe to insert mid-circuit.",
      tags: ["state-preparation", "quantum-circuit", "reset"],
      concept: "Initialization includes a reset",
      objective: "Recognize non-unitary state preparation.",
      refs: [QC, SYNTH],
    },
    {
      id: "s3-039",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want a hardware-efficient variational ansatz with alternating rotation and entangling layers, without writing the structure by hand. Where should you look?",
      choices: {
        a: "The circuit library's n-local ansatz family",
        b: "The visualization module",
        c: "The runtime options model",
        d: "The OpenQASM importer",
      },
      answer: "a",
      explanation:
        "The library ships parameterized ansatz families built exactly from alternating rotation and entanglement blocks, with configurable depth and entanglement pattern. Visualization renders circuits, runtime options configure execution, and the importer parses external programs.",
      tags: ["circuit-library", "parameterized-circuits", "workflow"],
      concept: "Library ansatz families",
      objective: "Locate ready-made parameterized circuits.",
      refs: [LIB_GUIDE, LIB_API],
      seconds: 70,
    },
    {
      id: "s3-040",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this flag change about how circuits are compiled for the device?",
      code:
        "backend = service.backend(\"ibm_example\", use_fractional_gates=True)",
      codeStatus: "illustrative",
      choices: {
        a: "Some rotations run directly at arbitrary angles instead of being synthesized",
        b: "Every rotation angle is rounded to the nearest quarter turn before execution",
        c: "Qubits may be addressed by fractional indices as well as whole numbers",
        d: "Shot counts may be given as fractions of the backend's default budget",
      },
      answer: "a",
      explanation:
        "Enabling this exposes continuously parameterized native operations, which can shorten circuits that would otherwise decompose one rotation into several fixed-angle pulses. Angles are not coarsened by rounding, qubit indices remain whole numbers as always, and shot counts stay integers set through primitive options.",
      tags: ["transpilation", "basis-gates", "hardware", "target"],
      concept: "Fractional native gates",
      objective: "Explain the effect of fractional gate support.",
      refs: [FRACTIONAL, TARGET],
    },
    {
      id: "s3-041",
      difficulty: "medium",
      type: "code-output",
      question: "What does this program print?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\ninv = qc.inverse()\nprint(inv.data[0].operation.name)",
      codeStatus: "executable",
      choices: {
        a: "cx",
        b: "h",
        c: "id",
        d: "inverse",
      },
      answer: "a",
      explanation:
        "Inverting a circuit reverses the instruction order and replaces each operation with its adjoint, so the first instruction of the inverse is the adjoint of the last original gate. Both gates here are self-inverse, so the name is unchanged, but the ordering is what the question turns on. Expecting the Hadamard first ignores the reversal.",
      mistake:
        "Forgetting that inversion reverses instruction order as well as inverting each gate.",
      tags: ["quantum-circuit", "circuit-composition"],
      concept: "Circuit inversion",
      objective: "Predict the structure of an inverted circuit.",
      refs: [QC, CONSTRUCT],
    },
    {
      id: "s3-042",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative list of the stages a preset transpilation pipeline runs and what each one contributes. Which source is most direct?",
      choices: {
        a: "The transpiler stages guide",
        b: "The Sampler options reference",
        c: "The bit-ordering guide",
        d: "The OpenQASM interoperability guide",
      },
      answer: "a",
      explanation:
        "A dedicated guide walks through each compilation stage in order and explains its role, which is exactly the question. Sampler options configure execution, the bit-ordering guide covers conventions, and the interoperability guide covers language conversion.",
      tags: ["documentation", "transpilation", "transpiler-stages"],
      concept: "Locating transpiler documentation",
      objective: "Find authoritative documentation for compilation stages.",
      refs: [STAGES, TRANSPILE],
    },
    {
      id: "s3-043",
      difficulty: "hard",
      type: "code-output",
      question:
        "What does this program print, assuming the circuit uses a parameter named theta?",
      code: "bound = qc.assign_parameters({theta: 0.5})\nprint(qc.num_parameters, bound.num_parameters)",
      codeStatus: "illustrative",
      choices: {
        a: "1 0",
        b: "0 1",
        c: "1 1",
        d: "0 0",
      },
      answer: "a",
      explanation:
        "Binding is functional by default, so the original template keeps its single unbound symbol while the returned copy has none left. Reporting 0 then 1 reverses the two, reporting 1 for both would mean nothing was bound, and reporting 0 for both would mean the source was mutated, which is exactly the misconception the default guards against.",
      mistake:
        "Assuming the source circuit loses its parameters after binding.",
      tags: ["parameterized-circuits", "quantum-circuit"],
      concept: "Parameter counts before and after binding",
      objective: "Trace parameter state through a binding call.",
      refs: [QC, PARAM],
    },
    {
      id: "s3-044",
      difficulty: "hard",
      type: "debugging",
      question:
        "A primitive rejects this circuit even though it runs fine on a local simulator. What is the defect?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(5)\nqc.h(0)\nqc.cx(0, 4)\nqc.measure_all()\n# submitted directly to a hardware primitive",
      codeStatus: "intentional-error",
      choices: {
        a: "The circuit was never compiled for the target, so its gates and qubit pairing may not be supported",
        b: "The circuit uses too many qubits for any device",
        c: "Bulk measurement is not allowed on hardware",
        d: "The Hadamard must be replaced by a rotation before submission",
      },
      answer: "a",
      explanation:
        "Hardware primitives require circuits already expressed in the target's instruction set with two-qubit gates on coupled pairs, and a distant pair like this usually is not directly connected. Simulators impose no such constraints, which is why the same program passes locally. Five qubits is small for any current device, bulk measurement is entirely routine on hardware, and the Hadamard is translated automatically once the circuit is compiled, so replacing it by hand solves nothing.",
      mistake:
        "Assuming a circuit that simulates correctly is ready for hardware.",
      tags: ["isa-circuits", "transpilation", "debugging", "runtime"],
      concept: "ISA requirement for hardware primitives",
      objective: "Diagnose submission failures caused by uncompiled circuits.",
      refs: [TRANSPILE, PASS_MANAGERS],
    },
    {
      id: "s3-045",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A circuit is compiled at optimization level 3 for a device with a line topology, and its two-qubit gate count roughly triples. What is the most likely explanation?",
      choices: {
        a: "Routing inserted swaps to bring distant qubits together, each costing several gates",
        b: "The optimizer failed part way through and duplicated a section of the circuit",
        c: "Higher optimization levels are designed to add gates rather than remove them",
        d: "The measurement instructions were expanded into entangling operations",
      },
      answer: "a",
      explanation:
        "On a sparse topology, gates between non-adjacent qubits require moving states along the line, and each swap decomposes into roughly three native entangling gates, so counts grow quickly despite optimization. The optimizer is still reducing what it can; it simply cannot avoid the routing cost. Higher levels aim to reduce gate counts, and measurements are single-qubit operations.",
      mistake:
        "Blaming the optimizer for growth that comes from connectivity constraints.",
      tags: ["transpilation", "routing", "optimization-level"],
      concept: "Routing overhead on sparse topologies",
      objective: "Explain gate-count growth after compilation.",
      refs: [STAGES, COUPLING],
    },
    {
      id: "s3-046",
      difficulty: "hard",
      type: "concept",
      question:
        "Why can compiling the same circuit twice at the same optimization level produce different results?",
      choices: {
        a: "Several passes are stochastic, so a seed must be fixed to make compilation reproducible",
        b: "The circuit object mutates each time it is compiled",
        c: "Optimization levels are reinterpreted on each call",
        d: "The target changes between calls",
      },
      answer: "a",
      explanation:
        "Layout and routing use randomized search, so results vary between runs unless the transpiler seed is pinned, which is why reproducible benchmarks always set it. The source circuit is not mutated, level semantics are fixed, and the target is stable for a given backend snapshot.",
      mistake:
        "Assuming compilation is deterministic and then comparing incomparable runs.",
      tags: ["transpilation", "reproducibility", "routing"],
      concept: "Stochastic transpilation",
      objective: "Explain non-determinism in compilation results.",
      refs: [SETTINGS, PASS_MANAGERS],
    },
    {
      id: "s3-047",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "What is the effect of building a pipeline this way, compared with using a preset level?",
      code: "from qiskit.transpiler import PassManager\n\npm = PassManager([pass_a, pass_b])\nout = pm.run(qc)",
      codeStatus: "illustrative",
      choices: {
        a: "Only the listed passes run, so target compatibility is not guaranteed unless those passes provide it",
        b: "The listed passes run in addition to the full preset pipeline",
        c: "The passes are reordered automatically into the canonical stage order",
        d: "The result is always an ISA circuit for the connected backend",
      },
      answer: "a",
      explanation:
        "A hand-built pipeline runs exactly what it is given, in the given order, which is powerful for experiments but means nothing adds layout, routing, or basis translation on your behalf. Presets exist precisely because assembling a correct pipeline is intricate. The listed passes are not appended to a preset, they are not reordered into canonical stage order, and because no backend is referenced here the result cannot be guaranteed to satisfy any device.",
      mistake:
        "Expecting a custom pass list to still guarantee a hardware-ready circuit.",
      tags: ["transpilation", "pass-manager", "isa-circuits"],
      concept: "Custom versus preset pipelines",
      objective: "Compare hand-built and preset compilation pipelines.",
      refs: [PASS_MANAGER, PASS_MANAGERS],
    },
    {
      id: "s3-048",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A dynamic circuit measures qubit 0, conditionally flips qubit 1, and then measures qubit 1 into a second classical bit. Ideally, what does the joint outcome distribution look like if qubit 0 was prepared in an equal superposition and qubit 1 in the ground state?",
      choices: {
        a: "Bits 0 and 1 always agree, each pair occurring about half the time",
        b: "Bits 0 and 1 are independent and uniform over all four combinations",
        c: "Bit 1 is always 0 regardless of bit 0",
        d: "Bit 1 is always 1 regardless of bit 0",
      },
      answer: "a",
      explanation:
        "The conditional flip copies the measured value onto the second qubit: when the first measurement gives 1 the second qubit is flipped and also reads 1, and otherwise both stay 0, so the two classical bits agree every shot. Independent and uniform outcomes over all four combinations would require no conditioning at all, and the two constant answers ignore the condition entirely, applying the flip either never or always regardless of bit 0.",
      tags: ["dynamic-circuits", "classical-control", "measurement"],
      concept: "Feed-forward correlation",
      objective: "Predict outcomes of a conditional dynamic circuit.",
      refs: [CONTROL_FLOW, DYNAMIC],
    },
    {
      id: "s3-049",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "Why must the first pass in this stage run before the second one?",
      code:
        "from qiskit.transpiler import PassManager\nfrom qiskit.transpiler.passes import ALAPScheduleAnalysis, PadDynamicalDecoupling\n\npm.scheduling = PassManager(\n    [ALAPScheduleAnalysis(durations), PadDynamicalDecoupling(durations, sequence)]\n)",
      codeStatus: "illustrative",
      choices: {
        a: "The padding needs instruction timings so it can find idle windows to fill",
        b: "The padding is only valid on circuits that contain no measurements at all",
        c: "The first pass converts the circuit to a text format the second one requires",
        d: "The first pass replaces the layout stage, which the second one depends on",
      },
      answer: "a",
      explanation:
        "Filling idle time with echo pulses requires knowing how long each instruction takes and where the gaps are, which is what the scheduling analysis computes. Measurements are not an obstacle and are commonly present, no serialization to text happens anywhere in the pipeline, and scheduling is an additional stage rather than a replacement for layout.",
      tags: ["scheduling", "dynamical-decoupling", "transpilation", "pass-manager"],
      concept: "Scheduling as a prerequisite",
      objective: "Explain why decoupling requires timing information.",
      refs: [DD_PASS, STAGES],
    },
    {
      id: "s3-050",
      difficulty: "hard",
      type: "code-output",
      question:
        "A five-qubit circuit is compiled for a 127-qubit device. What does the resulting circuit's qubit count report?",
      code: "isa = pm.run(qc)\nprint(qc.num_qubits, isa.num_qubits)",
      codeStatus: "illustrative",
      choices: {
        a: "5 127",
        b: "5 5",
        c: "127 127",
        d: "5 0",
      },
      answer: "a",
      explanation:
        "Compilation maps the virtual circuit onto the full physical register, so the result spans every qubit of the device with most of them idle, while the source circuit is unchanged at 5. Expecting the compiled width to stay at 5 overlooks that physical qubit indices must be addressable; expecting the source to grow to 127 would mean compilation mutated its input; and a compiled circuit certainly does not report 0 qubits.",
      mistake:
        "Being surprised that a compiled circuit reports the full device width.",
      tags: ["transpilation", "layout", "isa-circuits"],
      concept: "Physical register width after compilation",
      objective: "Predict the width of a compiled circuit.",
      refs: [PASS_MANAGERS, REPRESENT],
    },
    {
      id: "s3-051",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You need identical layout and routing decisions across a batch of structurally identical circuits so their results are directly comparable. What is the most reliable approach?",
      choices: {
        a: "Build one pass manager with a fixed seed and run every circuit through that same instance",
        b: "Compile each circuit separately at the highest optimization level",
        c: "Submit all circuits in one job and let the service align them",
        d: "Reduce the shot count so variation cannot appear",
      },
      answer: "a",
      explanation:
        "Fixing the seed removes the stochastic variation in layout and routing, and reusing one configured pipeline keeps every other setting identical across the batch. Compiling each circuit separately at the highest level may still land on different physical qubits, submitting in one job changes scheduling rather than compilation, and lowering the shot count affects statistics without touching the mapping at all.",
      tags: ["transpilation", "reproducibility", "workflow"],
      concept: "Reproducible compilation across a batch",
      objective: "Design a comparable multi-circuit compilation workflow.",
      refs: [PASS_MANAGERS, SETTINGS],
    },
    {
      id: "s3-052",
      difficulty: "hard",
      type: "debugging",
      question:
        "This control-flow block builds without error but never affects execution. What is wrong?",
      code: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 1)\nqc.h(0)\nwith qc.if_test((0, 1)):\n    qc.x(1)\nqc.measure(0, 0)",
      codeStatus: "intentional-error",
      choices: {
        a: "The classical bit is tested before anything writes to it, so the condition always sees the initial value",
        b: "The condition must compare against a qubit rather than a classical bit",
        c: "Conditional blocks may not contain single-qubit gates",
        d: "The circuit needs a second classical bit for the condition to be legal",
      },
      answer: "a",
      explanation:
        "Order matters in a dynamic circuit exactly as it does in a classical program: the measurement that would set the bit runs after the branch, so the branch reads the initial value every shot and the conditional gate never fires. Conditions are defined over classical data by construction, any gate may appear inside a block, and one bit is sufficient.",
      mistake:
        "Placing a mid-circuit measurement after the conditional that depends on it.",
      tags: ["dynamic-circuits", "classical-control", "debugging"],
      concept: "Ordering measurements before conditions",
      objective: "Diagnose a conditional block that never triggers.",
      refs: [CONTROL_FLOW, DYNAMIC],
    },
    {
      id: "s3-053",
      difficulty: "hard",
      type: "code-behavior",
      question: "What does this construct express?",
      code:
        "qc.measure([0, 1], [0, 1])\nwith qc.switch(creg) as case:\n    with case(0):\n        qc.x(2)\n    with case(1):\n        qc.z(2)\n    with case(case.DEFAULT):\n        pass",
      codeStatus: "illustrative",
      choices: {
        a: "A run-time multi-way branch selected by the value of the classical register",
        b: "A build-time selection that bakes exactly one branch into the circuit",
        c: "A loop that repeats the body once for every value the register can take",
        d: "Three separate circuits that will each be submitted as their own job",
      },
      answer: "a",
      explanation:
        "The construct records one control-flow instruction mapping each register value to a body, so the control electronics choose a branch during execution. An ordinary build-time conditional would decide while the circuit is being assembled and could not depend on a measured value. It expresses selection rather than repetition, and it produces a single circuit rather than several separate submissions.",
      tags: ["dynamic-circuits", "classical-control"],
      concept: "Multi-way classical branching",
      objective: "Select and read the right control-flow construct.",
      refs: [SWITCH, CONTROL_FLOW],
    },
    {
      id: "s3-054",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A circuit compiled with a fixed seed at level 1 yields 40 two-qubit gates; recompiled at level 3 it yields 28. Which conclusion is justified?",
      choices: {
        a: "A better layout or cancelled gates usually lowers total error, at the cost of compile time",
        b: "The two circuits now compute different functions, so the numbers are incomparable",
        c: "The heavier result is provably optimal, so no further reduction is possible",
        d: "Measured error will fall in exact proportion to the reduction in gate count",
      },
      answer: "a",
      explanation:
        "Fewer entangling gates generally means less accumulated error, and that reduction is what the heavier presets aim for through better layout selection and gate cancellation. Every level preserves the circuit's function. Nothing guarantees optimality, since the passes are heuristic, and error depends on which physical qubits and links are used, so the improvement is not simply proportional.",
      tags: ["transpilation", "optimization-level", "analysis"],
      concept: "Interpreting optimization results",
      objective: "Draw sound conclusions from compilation metrics.",
      refs: [SET_OPT, SETTINGS],
    },
    {
      id: "s3-055",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "A staged pipeline replaces only its optimization stage while keeping the preset's other stages. What does this achieve?",
      code: "pm = generate_preset_pass_manager(optimization_level=2, backend=backend)\npm.optimization = my_custom_stage",
      codeStatus: "illustrative",
      choices: {
        a: "Layout, routing, and translation still run as configured, while the optimization step uses the custom passes",
        b: "The entire pipeline is replaced by the custom passes",
        c: "The custom stage runs after the pipeline finishes, as a separate pass",
        d: "The assignment is ignored because preset pipelines are immutable",
      },
      answer: "a",
      explanation:
        "A staged pipeline exposes its phases as named attributes, so one can be swapped while the rest of the preset continues to guarantee target compatibility; this is the recommended way to experiment with a single stage. The entire pipeline is not replaced by the custom passes, the custom stage runs in place rather than afterwards as a separate step once the pipeline finishes, and the assignment is honored rather than ignored because these objects are mutable by design.",
      tags: ["transpilation", "pass-manager", "transpiler-stages"],
      concept: "Customizing one pipeline stage",
      objective: "Modify a preset pipeline safely.",
      refs: [STAGED_PM, PASS_MANAGERS],
    },
    {
      id: "s3-056",
      difficulty: "hard",
      type: "concept",
      question:
        "Which circuit change is most likely to reduce error on hardware without altering the ideal result?",
      choices: {
        a: "Cancelling redundant gates and choosing a layout on lower-error qubits",
        b: "Raising the shot count so the reported statistics are less noisy",
        c: "Inserting barriers between every pair of neighbouring instructions",
        d: "Replacing the final measurements with resets to clear residual excitation",
      },
      answer: "a",
      explanation:
        "Fewer physical operations on better-calibrated qubits means less accumulated gate and decoherence error while computing the same function. Shots reduce statistical uncertainty but not systematic error, barriers block the very optimizations that would help, and replacing measurements with resets changes what the circuit reports.",
      tags: ["transpilation", "noise", "optimization-level"],
      concept: "Reducing hardware error through compilation",
      objective: "Distinguish systematic error reduction from statistical.",
      refs: [SET_OPT, REPRESENT],
    },
    {
      id: "s3-057",
      difficulty: "hard",
      type: "code-output",
      question:
        "How many distinct parameters does this circuit report?",
      code: 'from qiskit import QuantumCircuit\nfrom qiskit.circuit import ParameterVector\n\ntheta = ParameterVector("theta", 3)\nqc = QuantumCircuit(3)\nfor i in range(3):\n    qc.ry(theta[i], i)\nfor i in range(3):\n    qc.rz(theta[i], i)\nprint(qc.num_parameters)',
      codeStatus: "executable",
      choices: {
        a: "3",
        b: "6",
        c: "1",
        d: "9",
      },
      answer: "a",
      explanation:
        "The vector declares three distinct symbols, and each is reused on two gates, so the distinct count stays at 3 even though six parameterized instructions appear. Counting instructions gives 6, which is the usual slip; treating the vector name as a single parameter gives 1; and 9 would multiply the qubits by the layers rather than counting symbols.",
      mistake:
        "Counting parameterized gates instead of distinct parameter objects.",
      tags: ["parameterized-circuits", "circuit-metrics"],
      concept: "Parameter vectors and reuse",
      objective: "Count distinct parameters in a layered ansatz.",
      refs: [PARAM_VEC, QC],
    },
    {
      id: "s3-058",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "A hybrid optimizer will evaluate the same ansatz at thousands of parameter settings on hardware. Which compilation strategy is most efficient?",
      choices: {
        a: "Compile the parameterized template once, then supply parameter values with each execution",
        b: "Bind each parameter set first, then compile every resulting circuit separately",
        c: "Compile at optimization level 0 to keep compilation cheap on every iteration",
        d: "Skip compilation and submit the abstract circuit each time",
      },
      answer: "a",
      explanation:
        "Compilation depends on structure rather than on angle values, so one compiled template can be reused for every iteration, and the primitives accept parameter values alongside the circuit. Recompiling per parameter set repeats expensive work thousands of times, dropping to the lightest level makes each circuit worse on hardware without fixing the repetition, and an uncompiled circuit is rejected by hardware primitives.",
      tags: ["parameterized-circuits", "transpilation", "workflow", "runtime"],
      concept: "Compile once, execute many times",
      objective: "Design an efficient variational execution workflow.",
      refs: [PASS_MANAGERS, DEFAULTS],
    },
  ],
);
