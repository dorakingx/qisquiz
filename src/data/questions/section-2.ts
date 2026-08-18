import { defineSection } from "./define";
import { api, guide } from "./refs";

const VIS_CIRCUITS = guide("visualize-circuits");
const VIS_RESULTS = guide("visualize-results");
const PLOT_STATES = guide("plot-quantum-states");
const DAG = guide("DAG-representation");
const TIMING = guide("visualize-circuit-timing");
const QPU_INFO = guide("qpu-information");
const BIT_ORDERING = guide("bit-ordering");
const DRAWER = api("qiskit/qiskit.visualization.circuit_drawer");
const HIST = api("qiskit/qiskit.visualization.plot_histogram");
const DIST = api("qiskit/qiskit.visualization.plot_distribution");
const BLOCH_MULTI = api("qiskit/qiskit.visualization.plot_bloch_multivector");
const BLOCH_VEC = api("qiskit/qiskit.visualization.plot_bloch_vector");
const CITY = api("qiskit/qiskit.visualization.plot_state_city");
const QSPHERE = api("qiskit/qiskit.visualization.plot_state_qsphere");
const HINTON = api("qiskit/qiskit.visualization.plot_state_hinton");
const PAULIVEC = api("qiskit/qiskit.visualization.plot_state_paulivec");
const GATE_MAP = api("qiskit/qiskit.visualization.plot_gate_map");
const ERROR_MAP = api("qiskit/qiskit.visualization.plot_error_map");
const LAYOUT_PLOT = api("qiskit/qiskit.visualization.plot_circuit_layout");
const LATEX = api("qiskit/qiskit.visualization.array_to_latex");
const DAG_DRAWER = api("qiskit/qiskit.visualization.dag_drawer");
const TIMELINE = api("qiskit/qiskit.visualization.timeline_drawer");
const VIS_MODULE = api("qiskit/visualization");
const SV = api("qiskit/qiskit.quantum_info.Statevector");
const DM = api("qiskit/qiskit.quantum_info.DensityMatrix");

/**
 * Section 2 — Visualize quantum circuits, measurements, and states (weight 11%).
 * Target: 35 questions.
 */
export const SECTION_2_QUESTIONS = defineSection(
  { section: 2, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s2-001",
      difficulty: "easy",
      type: "code-output",
      question:
        "No output mode is requested here. What kind of diagram does this print?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nprint(qc.draw())",
      codeStatus: "executable",
      choices: {
        a: "A plain ASCII diagram made of characters, printable in any terminal",
        b: "A Matplotlib figure window opened alongside the terminal",
        c: "A rendered LaTeX image saved next to the script",
        d: "An interactive widget that requires a notebook front end",
      },
      answer: "a",
      explanation:
        "The default drawer emits a character-based diagram, which needs no plotting dependencies and prints correctly in a terminal or a log file. A Matplotlib figure and a LaTeX rendering are both available but must be requested explicitly through an output argument, and no interactive widget renderer ships as the default at all.",
      tags: ["circuit-drawing", "visualization"],
      concept: "Default circuit drawer output",
      objective: "Identify the default circuit visualization format.",
      refs: [VIS_CIRCUITS, DRAWER],
    },
    {
      id: "s2-002",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "You have a dictionary mapping measured bitstrings to shot counts and want a bar chart of the outcomes. Which visualization is designed for this input?",
      choices: {
        a: "A histogram plot of measurement outcomes",
        b: "A Bloch-sphere plot",
        c: "A city plot of a density matrix",
        d: "A circuit diagram",
      },
      answer: "a",
      explanation:
        "Outcome tallies are categorical data over bitstrings, which is exactly what the histogram plot renders. Bloch and city plots take state objects rather than classical counts, and a circuit diagram shows the program rather than its results.",
      tags: ["histogram", "counts", "visualization"],
      concept: "Choosing a plot for counts",
      objective: "Select the right visualization for measurement data.",
      refs: [VIS_RESULTS, HIST],
    },
    {
      id: "s2-003",
      difficulty: "easy",
      type: "code-completion",
      question:
        "The plot should place a single-qubit state at the north pole of the sphere. Which value belongs in the blank?",
      code:
        "from qiskit.visualization import plot_bloch_vector\n\nplot_bloch_vector(_____)",
      codeStatus: "partial-completion",
      choices: {
        a: "[0, 0, 1]",
        b: "{\"0\": 1024, \"1\": 0}",
        c: "QuantumCircuit(1)",
        d: "[\"Z\"]",
      },
      answer: "a",
      explanation:
        "This plot takes the Cartesian coordinates of the Bloch vector, one component per axis, and the north pole is the unit vector along the third axis. A counts mapping is classical measurement data with no phase information and belongs to a histogram instead, a circuit is a program rather than a state, and a Pauli label names an observable rather than a point on the sphere.",
      tags: ["bloch-sphere", "visualization", "state-visualization"],
      concept: "Bloch vector input format",
      objective: "Supply the correct input to a Bloch-sphere plot.",
      refs: [BLOCH_VEC, PLOT_STATES],
    },
    {
      id: "s2-004",
      difficulty: "easy",
      type: "result-interpretation",
      question: "What does a histogram bar labeled 101 represent?",
      choices: {
        a: "The number of shots whose classical measurement outcome was the bitstring 101",
        b: "The complex amplitude of the basis state, scaled to an integer",
        c: "The index of the third gate applied in the circuit",
        d: "The number of qubits that ended in the excited state",
      },
      answer: "a",
      explanation:
        "Histogram categories are classical outcomes and the bar height is the tally of shots that produced them. Amplitudes are complex and are never plotted by a counts histogram, and the label is a full bitstring rather than a gate index or a count of excited qubits.",
      tags: ["histogram", "counts", "measurement"],
      concept: "Reading histogram categories",
      objective: "Interpret labels and heights in a results histogram.",
      refs: [HIST, VIS_RESULTS],
    },
    {
      id: "s2-005",
      difficulty: "easy",
      type: "code-completion",
      question:
        "The diagram should be produced as a Matplotlib figure instead of plain text. Which argument belongs in the blank?",
      code: 'from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.draw(_____)',
      codeStatus: "partial-completion",
      choices: {
        a: 'output="mpl"',
        b: 'backend="matplotlib"',
        c: 'style="figure"',
        d: 'format="png"',
      },
      answer: "a",
      explanation:
        "The drawer selects its renderer through the output argument, and the Matplotlib renderer is named with a short abbreviation. A backend argument refers to an execution target, the style argument customizes colors and fonts within a renderer rather than choosing one, and there is no format argument on this method.",
      mistake:
        "Confusing the style argument, which tunes appearance, with the argument that selects the renderer.",
      tags: ["circuit-drawing", "visualization"],
      concept: "Selecting a circuit renderer",
      objective: "Configure circuit drawing output modes.",
      refs: [DRAWER, VIS_CIRCUITS],
    },
    {
      id: "s2-006",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "This prints the device's connectivity as a list of qubit pairs. Which visualization presents the same information as a picture of the processor?",
      code:
        "from qiskit_ibm_runtime.fake_provider import FakeAlgiers\n\nbackend = FakeAlgiers()\nprint(backend.coupling_map)",
      codeStatus: "executable",
      choices: {
        a: "A gate map, which draws the qubits and the links between them",
        b: "A state city plot of the density matrix",
        c: "A histogram of measurement counts",
        d: "A Bloch multivector plot of each qubit",
      },
      answer: "a",
      explanation:
        "A gate map draws the device's qubits as nodes and the couplings as edges, which is exactly the pair list rendered spatially. A city plot and a multivector plot both visualize quantum states rather than hardware, and a histogram shows measurement outcome frequencies; none of them can express a coupling topology.",
      tags: ["backend-visualization", "visualization", "target"],
      concept: "Device topology plots",
      objective: "Select a visualization for hardware layout.",
      refs: [GATE_MAP, QPU_INFO],
    },
    {
      id: "s2-007",
      difficulty: "easy",
      type: "concept",
      question:
        "Which state visualization shows the expansion of a state in terms of Pauli-operator components?",
      choices: {
        a: "A Pauli-vector bar chart",
        b: "A qsphere plot",
        c: "A histogram of counts",
        d: "A circuit timeline",
      },
      answer: "a",
      explanation:
        "The Pauli-vector view plots one bar per Pauli term, giving the expectation value of each. A qsphere arranges basis-state amplitudes on a sphere, a counts histogram is classical measurement data, and a timeline shows instruction scheduling.",
      tags: ["state-visualization", "observables", "visualization"],
      concept: "Pauli decomposition plots",
      objective: "Match state visualizations to what they display.",
      refs: [PAULIVEC, PLOT_STATES],
    },
    {
      id: "s2-008",
      difficulty: "easy",
      type: "concept",
      question:
        "What is the practical reason the text-based circuit drawer is often preferred in automated scripts and logs?",
      choices: {
        a: "It needs no plotting libraries and produces output that can be printed or stored as plain text.",
        b: "It is the only drawer that shows classical registers.",
        c: "It renders faster because it omits gate parameters.",
        d: "It is the only drawer that supports circuits with more than five qubits.",
      },
      answer: "a",
      explanation:
        "Text output has no graphical dependencies and can be written straight to a log file. All the drawers show classical registers and gate parameters, and none of them are limited to small qubit counts, although wide circuits are folded across lines.",
      tags: ["circuit-drawing", "visualization"],
      concept: "Choosing a drawer for automation",
      objective: "Compare the practical trade-offs of circuit drawers.",
      refs: [VIS_CIRCUITS, DRAWER],
    },
    {
      id: "s2-009",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "This reads one number describing how reliably a single two-qubit operation performs. Which visualization presents the same measure across the whole processor at once?",
      code:
        "from qiskit_ibm_runtime.fake_provider import FakeAlgiers\n\nbackend = FakeAlgiers()\ntarget = backend.target\nprint(target[\"cx\"][(0, 1)].error)",
      codeStatus: "illustrative",
      choices: {
        a: "An error map, which colors each qubit and link by its calibrated rate",
        b: "A plot of the amplitudes of a prepared state",
        c: "A chart of how many shots each outcome received",
        d: "A listing of the gates a particular circuit contains",
      },
      answer: "a",
      explanation:
        "An error map overlays calibration figures on the device topology, so the noisiest regions stand out before a layout is chosen. State amplitudes and shot tallies are result data rather than hardware metadata, and a gate listing describes one program rather than the processor it will run on.",
      tags: ["backend-visualization", "hardware", "visualization", "noise"],
      concept: "Error maps",
      objective: "Explain the purpose of calibration visualizations.",
      refs: [ERROR_MAP, QPU_INFO],
    },
    {
      id: "s2-010",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "A histogram of a two-qubit experiment shows tall bars only at 00 and 11. What does this most directly indicate?",
      choices: {
        a: "The two measured bits are strongly correlated",
        b: "The state has no entanglement, since only two outcomes appear",
        c: "The experiment failed, because all four outcomes should appear",
        d: "Qubit 0 was never measured",
      },
      answer: "a",
      explanation:
        "Seeing only the even-parity outcomes means the two bits agree every time, which is precisely a strong correlation; it is the signature a Bell pair produces. Restricting which outcomes occur is not evidence against entanglement, a valid circuit need not populate every outcome, and both bits clearly carry data.",
      mistake:
        "Assuming a correct quantum experiment must produce every possible bitstring.",
      tags: ["histogram", "entanglement", "counts"],
      concept: "Correlation in histograms",
      objective: "Read correlation structure out of measurement plots.",
      refs: [HIST, VIS_RESULTS],
      seconds: 70,
    },
    {
      id: "s2-011",
      difficulty: "medium",
      type: "concept",
      question:
        "Why can a circuit diagram place qubit 0 on the top wire while a printed measurement outcome shows qubit 0 as the rightmost character?",
      choices: {
        a: "They are two different conventions that Qiskit maintains side by side on purpose",
        b: "The diagram is incorrect unless bit reversal is explicitly enabled when drawing",
        c: "The drawing library orders the wires randomly on each separate call",
        d: "Printed outcomes leave out qubit 0 entirely and start from qubit 1",
      },
      answer: "a",
      explanation:
        "Diagrams list wires top-down starting at qubit 0, while integer and bitstring conventions are little-endian, putting qubit 0 in the least significant position on the right. Both are intentional, so the diagram is not incorrect and needs no reversal to be valid, although a reversal option exists for alignment. Wire order is deterministic rather than random, and qubit 0 certainly appears in every outcome string.",
      mistake:
        "Treating the difference between wire order and bit significance as a bug.",
      tags: ["visualization", "little-endian", "qubit-ordering"],
      concept: "Two coexisting ordering conventions",
      objective: "Reconcile diagram layout with bitstring ordering.",
      refs: [BIT_ORDERING, VIS_CIRCUITS],
    },
    {
      id: "s2-012",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want to inspect the amplitudes and phases a circuit produces, without collapsing the state. Which workflow fits?",
      choices: {
        a: "Build a state object from the circuit with quantum_info, then pass it to a state visualization",
        b: "Append measurements, collect counts, and plot a histogram",
        c: "Transpile the circuit and plot the resulting layout on the device",
        d: "Export the circuit to OpenQASM 3 and read the text",
      },
      answer: "a",
      explanation:
        "State visualizations consume state objects, which retain complex amplitudes including relative phase. Measuring first destroys phase information and yields only outcome frequencies, a layout plot shows where logical qubits were placed on hardware, and serialized text describes the program rather than the state it prepares.",
      mistake:
        "Measuring before visualizing and then wondering why phase information is gone.",
      tags: ["statevector", "state-visualization", "visualization"],
      concept: "Visualizing states without measuring",
      objective: "Choose a workflow that preserves phase information.",
      refs: [PLOT_STATES, SV],
    },
    {
      id: "s2-013",
      difficulty: "easy",
      type: "code-behavior",
      question: "What do the two panels of the figure this produces contain?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import DensityMatrix\nfrom qiskit.visualization import plot_state_city\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nplot_state_city(DensityMatrix(qc))",
      codeStatus: "executable",
      choices: {
        a: "Bars for the real and the imaginary parts of the matrix, over its row and column indices",
        b: "One bar per measured bitstring, scaled by how many shots produced it",
        c: "The qubit connectivity of the device the circuit will run on",
        d: "The gate sequence laid out in scheduled time order",
      },
      answer: "a",
      explanation:
        "The figure renders the matrix itself as two three-dimensional bar charts, splitting each entry into its real and imaginary components. Measured tallies belong to a histogram, connectivity to a device map, and instruction timing to a timeline view, none of which this function produces.",
      tags: ["state-visualization", "density-matrix", "visualization"],
      concept: "City plots of density matrices",
      objective: "Describe what a state city plot shows.",
      refs: [CITY, PLOT_STATES],
      seconds: 50,
    },
    {
      id: "s2-014",
      difficulty: "easy",
      type: "code-behavior",
      question: "What effect does this drawing argument have?",
      code: 'qc.draw(output="text", idle_wires=False)',
      codeStatus: "illustrative",
      choices: {
        a: "Wires that carry no instructions are omitted from the diagram",
        b: "Idle qubits are removed from the circuit itself",
        c: "Barriers are hidden but wires remain",
        d: "Classical registers are merged into a single wire",
      },
      answer: "a",
      explanation:
        "This is a purely visual filter: unused wires are hidden so a sparse circuit reads more compactly, while the circuit object is untouched and still has the same number of qubits. It does not remove idle qubits from the circuit itself, and barrier display and classical-register grouping are governed by separate arguments rather than by this one.",
      mistake:
        "Assuming a drawing option changes the underlying circuit rather than only its rendering.",
      tags: ["circuit-drawing", "visualization"],
      concept: "Drawing filters versus circuit edits",
      objective: "Distinguish rendering options from circuit modification.",
      refs: [DRAWER, VIS_CIRCUITS],
      seconds: 50,
    },
    {
      id: "s2-015",
      difficulty: "medium",
      type: "concept",
      question:
        "Two experiments produced counts dictionaries with different total shot numbers. What is the safest way to compare them on one chart?",
      choices: {
        a: "Normalize each dictionary to probabilities, or plot a distribution rather than raw tallies",
        b: "Plot the raw counts directly, since the bars are already comparable",
        c: "Truncate the larger dictionary until both totals match",
        d: "Merge both dictionaries into one before plotting",
      },
      answer: "a",
      explanation:
        "Raw tallies scale with the number of shots, so unequal budgets make the larger run's bars systematically taller regardless of the underlying probabilities. Converting to probabilities, or using the distribution plot that expects normalized input, puts both on the same footing. Truncating the larger dictionary discards data arbitrarily, and merging the two into one destroys the very distinction the chart was meant to show.",
      mistake:
        "Comparing raw shot tallies from runs with different shot budgets.",
      tags: ["histogram", "counts", "shots", "analysis"],
      concept: "Normalizing before comparison",
      objective: "Compare measurement data from unequal shot budgets.",
      refs: [DIST, HIST, VIS_RESULTS],
    },
    {
      id: "s2-016",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "A 20-qubit circuit produces 2^20 possible outcomes, and the raw histogram is unreadable. Which adjustment keeps the plot useful?",
      choices: {
        a: "Limit the plot to the most frequent outcomes using the drawer's keep-top-values option",
        b: "Reduce the shot count so fewer distinct outcomes appear",
        c: "Switch to a Bloch multivector plot instead",
        d: "Remove the measurements so the plot has less data",
      },
      answer: "a",
      explanation:
        "The histogram accepts a limit on how many outcomes to display, folding the rest into a single remainder category, which keeps the dominant structure visible. Cutting shots only makes the estimate noisier without reducing the outcome space, a Bloch plot cannot show classical outcome frequencies, and removing measurements leaves no data at all.",
      tags: ["histogram", "visualization", "analysis"],
      concept: "Managing large outcome spaces",
      objective: "Keep result plots readable for wide registers.",
      refs: [HIST, VIS_RESULTS],
    },
    {
      id: "s2-017",
      difficulty: "medium",
      type: "concept",
      question:
        "Which visualization is designed to show where each virtual qubit of a circuit was placed on the physical device after transpilation?",
      choices: {
        a: "A circuit layout plot drawn against the device topology",
        b: "A qsphere plot of the final state",
        c: "A histogram of measurement outcomes",
        d: "A Hinton diagram of the density matrix",
      },
      answer: "a",
      explanation:
        "The layout plot overlays the chosen physical qubits on the device map, which is exactly the mapping the layout stage produced. A qsphere renders the final state, a histogram reports measurement outcomes, and a Hinton diagram renders a density matrix; all three describe results rather than compilation decisions.",
      tags: ["backend-visualization", "transpilation", "visualization"],
      concept: "Layout visualization",
      objective: "Visualize the outcome of the layout stage.",
      refs: [LAYOUT_PLOT, GATE_MAP],
    },
    {
      id: "s2-018",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this call produce, given a circuit that has already been converted to a directed acyclic graph?",
      code: "from qiskit.converters import circuit_to_dag\nfrom qiskit.visualization import dag_drawer\n\ndag_drawer(circuit_to_dag(qc))",
      codeStatus: "illustrative",
      choices: {
        a: "A graph showing instructions as nodes and qubit or clbit dependencies as edges",
        b: "A time-ordered bar chart of gate durations",
        c: "A histogram of the circuit's gate counts",
        d: "The same wire diagram the standard drawer produces",
      },
      answer: "a",
      explanation:
        "The graph view exposes data dependencies between operations, which is what the transpiler actually manipulates, so commuting or parallelizable operations become visible as unconnected branches. Durations appear in a timeline view, gate tallies come from a counting method, and the standard drawer shows sequential wires rather than a dependency graph.",
      tags: ["dag", "visualization", "transpilation"],
      concept: "Circuit dependency graphs",
      objective: "Interpret the graph representation of a circuit.",
      refs: [DAG, DAG_DRAWER],
    },
    {
      id: "s2-019",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does the figure produced here convey that a plain probability bar chart of the same state would not?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\nfrom qiskit.visualization import plot_state_qsphere\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.z(1)\nplot_state_qsphere(Statevector(qc))",
      codeStatus: "executable",
      choices: {
        a: "The phase of each basis-state amplitude, encoded by color",
        b: "The number of shots that were collected",
        c: "The coupling map of the selected device",
        d: "The depth of the circuit that produced the state",
      },
      answer: "a",
      explanation:
        "This view places each basis state on a sphere with marker size showing amplitude magnitude and color showing phase, so the sign flip applied by the last gate is visible where a magnitude-only chart would look unchanged. Shot budgets, hardware coupling, and circuit depth are all properties of the experiment or the program rather than of the state being drawn.",
      tags: ["state-visualization", "relative-phase", "visualization"],
      concept: "Phase-aware state plots",
      objective: "Compare what different state plots reveal.",
      refs: [QSPHERE, PLOT_STATES],
      seconds: 50,
    },
    {
      id: "s2-020",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "For a two-qubit Bell state, what does a per-qubit Bloch visualization show?",
      code: "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\nfrom qiskit.visualization import plot_bloch_multivector\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nplot_bloch_multivector(Statevector(qc))",
      codeStatus: "executable",
      choices: {
        a: "Two zero-length vectors at the centers of their spheres",
        b: "Two vectors pointing along the positive X axis",
        c: "One vector along X and one along Z",
        d: "An error, because entangled states cannot be plotted this way",
      },
      answer: "a",
      explanation:
        "This plot draws each qubit's reduced state, and each half of a maximally entangled pair is maximally mixed, so both Bloch vectors have zero length and sit at the center. Pointing along X would describe the unentangled |+> state each qubit had before the controlled gate. The call itself succeeds; the visualization simply cannot express the correlation, which is its main limitation.",
      mistake:
        "Expecting per-qubit Bloch arrows to describe an entangled state fully.",
      tags: ["bloch-sphere", "entanglement", "state-visualization"],
      concept: "Bloch plots of entangled subsystems",
      objective: "Predict what per-qubit visualizations show for entangled states.",
      refs: [BLOCH_MULTI, DM],
    },
    {
      id: "s2-021",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want a publication-ready matrix rendered as LaTeX from a small operator. Which utility is intended for that?",
      choices: {
        a: "The array-to-LaTeX helper in the visualization module",
        b: "The circuit drawer in text mode",
        c: "The histogram plotter",
        d: "The timeline drawer",
      },
      answer: "a",
      explanation:
        "A dedicated helper converts a numeric array into typeset LaTeX suitable for notebooks and papers. The circuit drawer renders programs, the histogram plotter renders classical outcome data, and the timeline drawer renders instruction schedules.",
      tags: ["visualization", "documentation"],
      concept: "Typesetting matrices",
      objective: "Select a utility for rendering numeric arrays.",
      refs: [LATEX, VIS_MODULE],
      seconds: 70,
    },
    {
      id: "s2-022",
      difficulty: "medium",
      type: "debugging",
      question:
        "This snippet raises an error rather than producing a plot. What is the cause?",
      code: "from qiskit import QuantumCircuit\nfrom qiskit.visualization import plot_histogram\n\nqc = QuantumCircuit(2)\nqc.h(0)\nplot_histogram(qc)",
      codeStatus: "intentional-error",
      choices: {
        a: "A circuit is not measurement data; the plot needs a counts mapping or a sequence of them.",
        b: "The circuit must first be transpiled for a backend.",
        c: "Histograms require at least three qubits.",
        d: "The circuit is missing a Hadamard on qubit 1.",
      },
      answer: "a",
      explanation:
        "The histogram plots outcome frequencies and therefore expects a mapping keyed by bitstrings, not a circuit object; the circuit must be executed and its counts extracted first. Transpilation is about hardware compatibility rather than about plot input types, register width is irrelevant, and adding another Hadamard would not change the type mismatch at all.",
      mistake:
        "Passing a program object to a function that expects result data.",
      tags: ["histogram", "counts", "debugging"],
      concept: "Input types for result plots",
      objective: "Diagnose type errors in visualization calls.",
      refs: [HIST, VIS_RESULTS],
    },
    {
      id: "s2-023",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "In the figure this produces, what does the size of each square encode?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import DensityMatrix\nfrom qiskit.visualization import plot_state_hinton\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nplot_state_hinton(DensityMatrix(qc))",
      codeStatus: "executable",
      choices: {
        a: "The magnitude of the matrix element at that row and column",
        b: "The number of shots that produced that element",
        c: "The gate in the circuit that created that element",
        d: "The index of the qubit that element belongs to",
      },
      answer: "a",
      explanation:
        "Square area maps to element magnitude and color carries sign or phase, which makes sparse structure easy to spot at a glance. The figure is a rendering of the matrix, so no shot tally is involved, it carries no record of which gate produced which entry, and qubit indices are implicit in the row and column labels rather than in the square sizes.",
      tags: ["state-visualization", "density-matrix", "visualization"],
      concept: "Hinton diagrams",
      objective: "Interpret matrix-structure visualizations.",
      refs: [HINTON, PLOT_STATES],
      seconds: 50,
    },
    {
      id: "s2-024",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "Two counts dictionaries are passed to one histogram call as a list. How is the result displayed?",
      choices: {
        a: "Grouped bars per outcome, one bar per dataset, so the datasets can be compared side by side",
        b: "The two dictionaries are summed into a single set of bars",
        c: "Only the first dictionary is plotted and the second is ignored",
        d: "Two separate figures are opened",
      },
      answer: "a",
      explanation:
        "Passing a sequence produces a grouped comparison chart, which is the intended way to place an ideal baseline next to hardware data. The datasets are kept distinct rather than summed or dropped, and everything is drawn on a single set of axes.",
      tags: ["histogram", "analysis", "visualization"],
      concept: "Comparing datasets in one plot",
      objective: "Predict how multi-dataset plots are laid out.",
      refs: [HIST, VIS_RESULTS],
    },
    {
      id: "s2-025",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "This comparison prints True. Which visualization would therefore fail to tell the two states apart?",
      code:
        "from qiskit.quantum_info import Statevector\n\na = Statevector.from_label(\"+\")\nb = Statevector.from_label(\"-\")\nprint(a.probabilities_dict() == b.probabilities_dict())",
      codeStatus: "executable",
      choices: {
        a: "A histogram of computational-basis measurement counts",
        b: "A Bloch-sphere plot of the single qubit",
        c: "A qsphere plot showing amplitude phases",
        d: "A bar chart of the Pauli-operator components",
      },
      answer: "a",
      explanation:
        "Both states give identical computational-basis statistics, which is exactly what the printed comparison confirms, so a counts histogram of that basis looks the same for each. The other three all encode the transverse axis or the phase: the two states sit at opposite poles of the Bloch sphere's first axis, they differ in qsphere color, and their Pauli components carry opposite signs.",
      mistake:
        "Assuming a single-basis histogram captures everything about a state.",
      tags: ["relative-phase", "histogram", "state-visualization"],
      concept: "Limits of single-basis plots",
      objective: "Know what each visualization can and cannot reveal.",
      refs: [PLOT_STATES, HIST],
    },
    {
      id: "s2-026",
      difficulty: "hard",
      type: "debugging",
      question:
        "A Matplotlib-based circuit drawing that works locally fails on a minimal server image. What is the most likely cause?",
      choices: {
        a: "The plotting dependency is not installed in that environment",
        b: "The drawing method was removed from the circuit class",
        c: "The circuit must be executed on hardware before it can be drawn",
        d: "Only OpenQASM programs can be rendered graphically",
      },
      answer: "a",
      explanation:
        "Graphical renderers are optional extras, so a slim install exposes the character-based drawer but not the Matplotlib one, and installing the visualization extra fixes it. The drawing method is still part of the circuit API rather than removed, drawing is a purely static operation that never touches a device, and Qiskit circuits are rendered directly without any serialization to another language first.",
      mistake:
        "Assuming a rendering failure means the API changed rather than that an optional dependency is missing.",
      tags: ["circuit-drawing", "visualization", "debugging"],
      concept: "Optional visualization dependencies",
      objective: "Troubleshoot environment-dependent rendering failures.",
      refs: [VIS_CIRCUITS, DRAWER],
    },
    {
      id: "s2-027",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "A hardware histogram shows small nonzero bars at outcomes that are impossible in the ideal circuit. What is the best interpretation?",
      choices: {
        a: "Gate error, readout error, and finite sampling all leak weight into forbidden outcomes",
        b: "The ideal analysis must be wrong, since the hardware is the ground truth here",
        c: "The plotting function invented categories that were not present in the data",
        d: "The circuit contains a syntax error that only the hardware is able to detect",
      },
      answer: "a",
      explanation:
        "Real devices have imperfect gates and readout, so a small fraction of shots lands outside the ideal support; this is expected rather than a defect. The ideal prediction remains the correct baseline against which that leakage is measured. Plotting utilities render only the categories present in the data, and syntax problems surface at build or submission time, not as stray bars.",
      mistake:
        "Discarding the ideal prediction as soon as hardware data deviates from it.",
      tags: ["hardware-results", "histogram", "analysis", "noise"],
      concept: "Reading noisy result distributions",
      objective: "Interpret deviations between ideal and device data.",
      refs: [VIS_RESULTS, guide("error-mitigation-overview")],
    },
    {
      id: "s2-028",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A circuit prepares a state, a phase gate is applied, and the results are plotted only as a computational-basis histogram. The histogram is unchanged. What can you conclude?",
      choices: {
        a: "Nothing about the phase, because this plot cannot detect a diagonal phase at all",
        b: "That the phase gate had no effect whatsoever on the state it was applied to",
        c: "That the phase applied must have been an unobservable global phase",
        d: "That the phase gate failed to compile and was dropped during transpilation",
      },
      answer: "a",
      explanation:
        "A diagonal phase gate never moves probability between computational-basis states, so this histogram cannot detect whether one was applied. Revealing it requires converting phase into amplitude, typically with a Hadamard before measurement, or inspecting a phase-aware state plot. Concluding the gate had no effect, or that the phase was global, over-reads a plot that is blind to the question, and a silently dropped gate would be a compilation bug rather than the expected behavior.",
      mistake:
        "Treating an unchanged single-basis histogram as evidence that nothing happened.",
      tags: ["relative-phase", "histogram", "interference", "analysis"],
      concept: "Choosing a measurement that can see the effect",
      objective: "Reason about what a chosen visualization can detect.",
      refs: [PLOT_STATES, HIST],
    },
    {
      id: "s2-029",
      difficulty: "hard",
      type: "code-output",
      question:
        "How does this drawing argument change the diagram compared with the default?",
      code: 'qc.draw(output="text", reverse_bits=True)',
      codeStatus: "illustrative",
      choices: {
        a: "The wire order flips so the highest-index qubit is drawn on the top line",
        b: "The gates are applied to the qubits in the opposite order at run time",
        c: "The circuit is inverted, so the diagram shows the adjoint instead",
        d: "The classical bits are written in reverse order when the circuit runs",
      },
      answer: "a",
      explanation:
        "This option affects only how wires are stacked in the rendering, aligning the picture with the left-to-right order of a printed outcome. It is purely cosmetic: the instruction order at run time is untouched, the circuit is not inverted into its adjoint, which would require an explicit inverse operation, and nothing changes about which classical bits are written.",
      mistake:
        "Believing a wire-ordering display option reverses or inverts the circuit.",
      tags: ["circuit-drawing", "little-endian", "qubit-ordering"],
      concept: "Reversing displayed wire order",
      objective: "Predict the effect of drawing-order options.",
      refs: [DRAWER, BIT_ORDERING],
    },
    {
      id: "s2-030",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You need to see how long each instruction occupies its qubit after scheduling, to judge whether idle windows justify dynamical decoupling. Which view helps?",
      choices: {
        a: "A timeline drawing of the scheduled circuit",
        b: "A gate map of the processor",
        c: "A histogram of the measurement outcomes",
        d: "A state city plot",
      },
      answer: "a",
      explanation:
        "Only a timeline view places instructions on a real time axis per qubit, which is what exposes the idle gaps a decoupling sequence would fill. A gate map shows connectivity with no timing information at all, a histogram reports measurement outcome frequencies, and a state city plot renders a density matrix; none of them say anything about when an instruction runs.",
      tags: ["circuit-timing", "visualization", "scheduling"],
      concept: "Timeline visualization",
      objective: "Select a view for scheduled-circuit analysis.",
      refs: [TIMING, TIMELINE],
    },
    {
      id: "s2-031",
      difficulty: "hard",
      type: "concept",
      question:
        "Why is a Bloch-sphere representation adequate for any single-qubit state, pure or mixed?",
      choices: {
        a: "Three real expectation values fix the state, and mixedness shortens the vector",
        b: "Every single-qubit state is pure, so the sphere's surface is always enough",
        c: "The sphere stores the full complex amplitude of each computational-basis state",
        d: "Mixed states are approximated by rounding them to the nearest pure state",
      },
      answer: "a",
      explanation:
        "A single-qubit density matrix has exactly three independent real parameters, and those are the expectation values along the three axes; pure states land on the surface and mixed states strictly inside, with the fully mixed state at the origin. Single-qubit states are certainly not all pure, the plot stores expectation values rather than raw complex amplitudes, and nothing is rounded or approximated away.",
      tags: ["bloch-sphere", "density-matrix", "state-visualization"],
      concept: "Completeness of the Bloch picture",
      objective: "Explain why one sphere captures a full single-qubit state.",
      refs: [BLOCH_VEC, DM],
    },
    {
      id: "s2-032",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "Two labs report counts for the same three-qubit circuit, but their histograms disagree on which outcomes are frequent, and one lab reversed bit order before plotting. What is the first check?",
      choices: {
        a: "Confirm both used the same bit-ordering convention before comparing outcome labels",
        b: "Assume one device is faulty and rerun on new hardware",
        c: "Increase the shot count until the histograms converge",
        d: "Switch both plots to a state city view",
      },
      answer: "a",
      explanation:
        "Reversing the label order permutes which bitstring each bar belongs to, so a purely cosmetic difference can look like a physics disagreement; aligning conventions is cheap and must come first. Blaming a faulty device and rerunning elsewhere cannot fix a labeling mismatch, raising the shot count only sharpens both of the mismatched pictures, and a state city view is unavailable because only classical counts were exchanged.",
      mistake:
        "Comparing outcome labels across tools without checking their bit-order conventions.",
      tags: ["histogram", "little-endian", "analysis", "qubit-ordering"],
      concept: "Label conventions in cross-tool comparison",
      objective: "Diagnose disagreements caused by ordering conventions.",
      refs: [BIT_ORDERING, VIS_RESULTS],
    },
    {
      id: "s2-033",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "A distribution plot of mitigated results shows a bar extending below zero. What does that indicate?",
      choices: {
        a: "The values are quasi-probabilities produced by mitigation, which may be negative",
        b: "A negative number of shots was recorded",
        c: "The plotting function has a rendering defect",
        d: "The circuit measured an undefined qubit",
      },
      answer: "a",
      explanation:
        "Some mitigation methods invert a noise model, and the corrected weights form a quasi-probability distribution that can dip below zero while still summing to one. Raw shot tallies are non-negative integers by construction, so a negative bar cannot mean negative shots were recorded, and it signals post-processing rather than a rendering defect or an undefined qubit in the circuit.",
      tags: ["quasi-probabilities", "error-mitigation", "visualization"],
      concept: "Quasi-probability plots",
      objective: "Interpret negative values in mitigated result plots.",
      refs: [DIST, guide("error-mitigation-overview")],
    },
    {
      id: "s2-034",
      difficulty: "hard",
      type: "concept",
      question:
        "A state visualization is requested for a 12-qubit register. What is the practical limitation?",
      choices: {
        a: "The amplitude count grows exponentially, so the figure becomes unreadable and costly",
        b: "State plots are capped at five qubits and raise an error beyond that limit",
        c: "Only circuits that end in measurements can be visualized at that register size",
        d: "The register must be split into single-qubit plots, which loses nothing at all",
      },
      answer: "a",
      explanation:
        "A twelve-qubit state has 4096 amplitudes and its density matrix has millions of entries, so both memory use and visual density explode; these plots are diagnostic tools for small registers. There is no fixed qubit cap that raises an error, measurement is irrelevant to state plots, and splitting into per-qubit views discards every correlation, so that route is emphatically not lossless.",
      tags: ["state-visualization", "scalability", "visualization"],
      concept: "Scaling limits of state plots",
      objective: "Judge when state visualizations stop being practical.",
      refs: [PLOT_STATES, SV],
    },
    {
      id: "s2-035",
      difficulty: "hard",
      type: "documentation-navigation",
      question:
        "You need the complete list of state-plot functions along with the state types each accepts. Which source is most direct?",
      choices: {
        a: "The visualization module's API reference",
        b: "The transpiler stages guide",
        c: "The execution modes guide",
        d: "The OpenQASM feature table",
      },
      answer: "a",
      explanation:
        "The visualization module reference enumerates every plotting function with its accepted argument types, which is precisely the question asked. The transpiler stages guide covers compilation phases, the execution modes guide covers runtime scheduling, and the feature table records language support; none of them document plotting signatures.",
      tags: ["documentation", "visualization"],
      concept: "Locating visualization API documentation",
      objective: "Find the authoritative reference for plotting functions.",
      refs: [VIS_MODULE, PLOT_STATES],
    },
  ],
);
