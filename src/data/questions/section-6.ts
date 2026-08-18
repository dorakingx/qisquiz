import { defineSection } from "./define";
import { api, guide } from "./refs";

const GET_STARTED = guide("get-started-with-estimator");
const ESTIMATOR_IO = guide("estimator-input-output");
const ESTIMATOR_OPTIONS = guide("estimator-options");
const ESTIMATOR_EXAMPLES = guide("estimator-examples");
const ESTIMATOR_NOISE = guide("estimator-noise-management");
const PAULI_OBS = guide("specify-observables-pauli");
const OPERATORS = guide("operators-overview");
const MITIGATION = guide("error-mitigation-and-suppression-techniques");
const MITIGATION_OVERVIEW = guide("error-mitigation-overview");
const NOISE_LEARNING = guide("noise-learning");
const PRIMITIVE_IO = guide("primitive-input-output");
const PRIMITIVES = guide("primitives");
const TRANSPILE = guide("transpile");
const ESTIMATOR_OPT_API = api("qiskit-ibm-runtime/options-estimator-options");
const ZNE_OPT = api("qiskit-ibm-runtime/options-zne-options");
const PEC_OPT = api("qiskit-ibm-runtime/options-pec-options");
const TWIRL_OPT = api("qiskit-ibm-runtime/options-twirling-options");
const MEAS_LEARN_OPT = api(
  "qiskit-ibm-runtime/options-measure-noise-learning-options",
);
const SPO = api("qiskit/qiskit.quantum_info.SparsePauliOp");
const OBS_ARRAY = api("qiskit/qiskit.primitives.ObservablesArray");
const ESTIMATOR_PUB = api("qiskit/qiskit.primitives.EstimatorPub");
const PRIM_RESULT = api("qiskit/qiskit.primitives.PrimitiveResult");

/**
 * Section 6 — Use the estimator primitive (official weight 12%).
 * Target: 38 questions.
 */
export const SECTION_6_QUESTIONS = defineSection(
  { section: 6, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s6-001",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does the returned object contain after this workload finishes?",
      code:
        "from qiskit_ibm_runtime import EstimatorV2 as Estimator\n\nestimator = Estimator(mode=backend)\nresult = estimator.run([(isa_circuit, isa_observable)]).result()",
      codeStatus: "illustrative",
      choices: {
        a: "An estimate of the observable's average value, with its uncertainty",
        b: "The per-shot measurement bitstrings the device produced",
        c: "The compiled form of the circuit that was submitted",
        d: "The position the workload reached in the device queue",
      },
      answer: "a",
      explanation:
        "Estimation produces a number such as the average of a Pauli observable, together with a standard error. Raw bitstrings come from the Sampler instead, compilation is a transpiler task performed before submission, and queue position belongs to job monitoring rather than to result data.",
      tags: ["estimator-v2", "expectation-values", "result-object"],
      concept: "Estimator output",
      objective: "Identify what the Estimator produces.",
      refs: [GET_STARTED, PRIMITIVES],
    },
    {
      id: "s6-002",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this object represent?",
      code:
        "from qiskit.quantum_info import SparsePauliOp\n\nhamiltonian = SparsePauliOp([\"ZZ\", \"XI\", \"IX\"], coeffs=[1.0, -0.5, -0.5])",
      codeStatus: "executable",
      choices: {
        a: "One observable built as a weighted sum of three Pauli terms",
        b: "Three separate observables that will each be estimated on their own",
        c: "A circuit that prepares a state from three layers of gates",
        d: "A probability distribution over three measurement outcomes",
      },
      answer: "a",
      explanation:
        "A sparse Pauli representation stores a list of labels with coefficients and denotes a single operator formed by summing them, which is how Hamiltonians are expressed compactly. Supplying a list of separate observables is a different construction that yields one estimate per term, the object describes a measurement quantity rather than a state-preparing circuit, and the coefficients may be negative so they are not probabilities.",
      tags: ["estimator-v2", "observables", "pauli-operators"],
      concept: "Observable representation",
      objective: "Read a weighted Pauli sum.",
      refs: [SPO, PAULI_OBS],
      seconds: 50,
    },
    {
      id: "s6-003",
      difficulty: "easy",
      type: "debugging",
      question: "This submission is rejected. What is missing?",
      code:
        "estimator = Estimator(mode=backend)\njob = estimator.run([(isa_circuit,)])",
      codeStatus: "intentional-error",
      choices: {
        a: "The observable, without which there is no quantity to estimate",
        b: "The shot count, which this primitive requires explicitly",
        c: "The backend, which must be repeated inside each workload",
        d: "The final measurements, which the circuit must contain itself",
      },
      answer: "a",
      explanation:
        "Estimation needs both a state preparation and the quantity to measure, so the circuit alone is a Sampler workload rather than a valid one here. Accuracy falls back to a default when unspecified, the backend is fixed when the primitive is constructed, and the primitive appends whatever readout each observable requires, so the circuit need not measure anything itself.",
      tags: ["estimator-v2", "pubs", "debugging"],
      concept: "Minimal Estimator workload",
      objective: "Construct a valid Estimator workload.",
      refs: [ESTIMATOR_IO, ESTIMATOR_PUB],
      seconds: 50,
    },
    {
      id: "s6-004",
      difficulty: "easy",
      type: "code-output",
      question: "Ideally, what value does this estimate produce?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit.primitives import StatevectorEstimator\nfrom qiskit.quantum_info import SparsePauliOp\n\nqc = QuantumCircuit(1)\nobs = SparsePauliOp(\"Z\")\nprint(StatevectorEstimator().run([(qc, obs)]).result()[0].data.evs)",
      codeStatus: "executable",
      choices: {
        a: "+1",
        b: "0",
        c: "-1",
        d: "It varies with the shot count that was configured",
      },
      answer: "a",
      explanation:
        "The circuit applies no gates, so the qubit stays in the ground state, which is the eigenstate of this observable with eigenvalue +1. A value of 0 corresponds to an equal superposition and -1 to the excited state. The underlying value does not depend on the shot count, which affects only the uncertainty of a sampled estimate.",
      tags: ["expectation-values", "observables", "estimator-v2"],
      concept: "Pauli eigenvalues",
      objective: "Compute expectation values for basis states.",
      refs: [PAULI_OBS, OPERATORS],
    },
    {
      id: "s6-005",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the value set on the first line request?",
      code:
        "estimator.options.default_precision = 0.02\njob = estimator.run([(isa_circuit, isa_observable)])",
      codeStatus: "illustrative",
      choices: {
        a: "A target standard error for the returned estimates",
        b: "The optimization level used when compiling the circuit",
        c: "The maximum depth the submitted circuit may reach",
        d: "The fraction of shots reserved for calibration overhead",
      },
      answer: "a",
      explanation:
        "Precision states the standard error the caller is willing to accept, and the service allocates however many shots are needed to reach it. Optimization level governs compilation and was fixed before submission, circuit depth is a structural property rather than an accuracy control, and no shot fraction is reserved this way.",
      tags: ["estimator-v2", "precision", "options"],
      concept: "Precision as the accuracy control",
      objective: "Identify how Estimator accuracy is requested.",
      refs: [ESTIMATOR_IO, ESTIMATOR_OPTIONS],
    },
    {
      id: "s6-006",
      difficulty: "easy",
      type: "concept",
      question:
        "What does the standard error reported alongside an expectation value describe?",
      choices: {
        a: "The statistical uncertainty of the estimate",
        b: "The number of qubits the observable acts on",
        c: "The gate error rate of the backend",
        d: "The difference from the exact theoretical value",
      },
      answer: "a",
      explanation:
        "The reported error quantifies how much the estimate would vary if the experiment were repeated, given the finite sampling used. It does not measure observable size or device calibration, and it cannot report the distance from truth, because systematic device error contributes a bias the statistical error does not capture.",
      mistake:
        "Reading the standard error as a bound on the total distance from the true value.",
      tags: ["estimator-v2", "standard-errors", "analysis"],
      concept: "Statistical uncertainty",
      objective: "Interpret the uncertainty reported with an estimate.",
      refs: [ESTIMATOR_IO, MITIGATION_OVERVIEW],
    },
    {
      id: "s6-007",
      difficulty: "easy",
      type: "result-interpretation",
      question: "What do the two printed arrays contain?",
      code:
        "result = job.result()\nprint(result[0].data.evs)\nprint(result[0].data.stds)",
      codeStatus: "illustrative",
      choices: {
        a: "The estimated averages and their standard errors, one entry per observable",
        b: "The measured bitstrings and the number of shots that produced each",
        c: "The circuit's gate counts and its depth after compilation",
        d: "The device's calibrated error rates for the qubits that were used",
      },
      answer: "a",
      explanation:
        "Each workload result carries a data container whose fields hold the estimates and the uncertainty attached to each one, broadcast to the shape the observables implied. Measured bitstrings and their tallies belong to the Sampler, circuit metrics come from the circuit object, and calibrated device rates live in the backend's target.",
      tags: ["estimator-v2", "result-object", "standard-errors"],
      concept: "Locating estimates in results",
      objective: "Navigate an Estimator result object.",
      refs: [ESTIMATOR_IO, PRIM_RESULT],
      seconds: 50,
    },
    {
      id: "s6-008",
      difficulty: "medium",
      type: "debugging",
      question:
        "The circuit here ends without any measurement, yet the workload runs. Why is that valid?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nisa = pm.run(qc)\njob = estimator.run([(isa, isa_observable)])",
      codeStatus: "illustrative",
      choices: {
        a: "The primitive appends the basis changes and readout each observable needs",
        b: "Expectation values are computed without any measurement taking place",
        c: "Measurements are forbidden in circuits submitted to this primitive",
        d: "The device measures every qubit automatically for every job it runs",
      },
      answer: "a",
      explanation:
        "The circuit's job is to prepare a state; the primitive adds whatever rotations and readout each Pauli term requires. Measurement certainly does happen on the device, it is simply handled for you, and a circuit that ends in explicit final measurements is what the Sampler expects instead. Nothing measures every qubit automatically for every submitted job.",
      tags: ["estimator-v2", "observables", "measurement"],
      concept: "Automatic basis-change measurement",
      objective: "Explain what an Estimator circuit must contain.",
      refs: [GET_STARTED, PAULI_OBS],
      seconds: 70,
    },
    {
      id: "s6-009",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the setting on the first line turn off?",
      code:
        "estimator.options.resilience_level = 0\njob = estimator.run([(isa_circuit, isa_observable)])",
      codeStatus: "illustrative",
      choices: {
        a: "Error mitigation, so the raw estimate is returned as a baseline",
        b: "Sampling entirely, so an exact value is computed instead",
        c: "Compilation, so the circuit is submitted exactly as written",
        d: "The uncertainty report, so only a central value is returned",
      },
      answer: "a",
      explanation:
        "The lowest level turns mitigation off, which is useful for measuring how much mitigation shifts an answer. Sampling still happens, so the value remains a statistical estimate rather than an exact one; compilation happened before submission and is unaffected; and the standard error is still reported alongside the estimate.",
      tags: ["estimator-v2", "resilience", "error-mitigation", "options"],
      concept: "Resilience level baseline",
      objective: "Interpret the resilience level setting.",
      refs: [ESTIMATOR_OPTIONS, MITIGATION],
    },
    {
      id: "s6-010",
      difficulty: "medium",
      type: "code-output",
      question:
        "Ideally, what expectation value does this circuit give for the Z observable?",
      code: "from qiskit import QuantumCircuit\nfrom qiskit.quantum_info import SparsePauliOp\n\nqc = QuantumCircuit(1)\nqc.h(0)\nobs = SparsePauliOp(\"Z\")",
      codeStatus: "executable",
      choices: {
        a: "0",
        b: "+1",
        c: "-1",
        d: "+0.5",
      },
      answer: "a",
      explanation:
        "The Hadamard produces an equal superposition, whose Z-basis outcomes are equally likely, so the average of the +1 and -1 eigenvalues is zero. The value +1 would be the answer before the Hadamard, and -1 would require the excited state.",
      tags: ["estimator-v2", "expectation-values", "observables"],
      concept: "Expectation value of a superposition",
      objective: "Compute an expectation value from a circuit.",
      refs: [PAULI_OBS, GET_STARTED],
    },
    {
      id: "s6-011",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this Estimator PUB describe?",
      code: "pub = (isa_circuit, isa_observable, [0.5])",
      codeStatus: "illustrative",
      choices: {
        a: "One evaluation of the observable on the circuit with its single parameter bound to 0.5",
        b: "An evaluation with 0.5 as the target precision",
        c: "An evaluation using half the default shot count",
        d: "Two evaluations, one per element of the observable",
      },
      answer: "a",
      explanation:
        "The third element of an Estimator PUB holds parameter values, and a one-element list binds a circuit with one parameter. Precision, when supplied, comes after the parameter values as a fourth element. Shot counts are not set positionally, and one observable gives one estimate.",
      mistake:
        "Mistaking the parameter element of an Estimator PUB for a precision value.",
      tags: ["estimator-v2", "pubs", "parameterized-circuits"],
      concept: "Estimator PUB element order",
      objective: "Read the elements of an Estimator PUB.",
      refs: [ESTIMATOR_IO, ESTIMATOR_PUB],
    },
    {
      id: "s6-012",
      difficulty: "medium",
      type: "concept",
      question:
        "Why must an observable be mapped onto the compiled circuit's layout before submission?",
      choices: {
        a: "Compilation reassigns qubits, so the observable must be rewritten to match",
        b: "Observables must be converted into circuits before they can be executed",
        c: "The observable must be padded until it matches the compiled circuit's depth",
        d: "Observables are ignored unless they are themselves run through the compiler",
      },
      answer: "a",
      explanation:
        "A Pauli label refers to qubit positions, and after layout and routing those positions no longer correspond to the original indices, so an unmapped observable silently measures the wrong qubits. The mapping widens the label to the device's register and permutes it accordingly. Observables are not circuits and have no depth.",
      mistake:
        "Submitting an observable written for the abstract circuit alongside a compiled circuit.",
      tags: ["estimator-v2", "observables", "transpilation", "isa-circuits"],
      concept: "Applying a layout to an observable",
      objective: "Align observables with compiled circuits.",
      refs: [TRANSPILE, ESTIMATOR_IO],
    },
    {
      id: "s6-013",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What happens to the shot budget and the run time when the requested value is tightened this way?",
      code:
        "estimator.options.default_precision = 0.02\n# later, for a more demanding run:\nestimator.options.default_precision = 0.01",
      codeStatus: "illustrative",
      choices: {
        a: "Roughly four times as many shots are used, so the job takes correspondingly longer",
        b: "Roughly half as many shots are used, so the job finishes sooner",
        c: "The circuit is recompiled at a higher optimization level instead",
        d: "The observable is truncated to fewer terms to meet the new target",
      },
      answer: "a",
      explanation:
        "Statistical error falls as one over the square root of the sample size, so halving the target error costs about four times the shots and four times the device time. Fewer shots would raise the uncertainty rather than lower it, the target has no influence on compilation, and observable terms are never silently dropped to hit an accuracy goal.",
      tags: ["estimator-v2", "precision", "shots", "usage"],
      concept: "Precision costs shots",
      objective: "Reason about the cost of tighter precision.",
      refs: [ESTIMATOR_OPTIONS, ESTIMATOR_IO],
      seconds: 75,
    },
    {
      id: "s6-014",
      difficulty: "medium",
      type: "broadcasting-shape",
      question:
        "A PUB pairs one circuit with a list of three observables and no parameters. What shape do the returned expectation values have?",
      choices: {
        a: "Shape (3,), one estimate per observable",
        b: "A single scalar, because there is one circuit",
        c: "Shape (3, 3), one estimate per observable pair",
        d: "Three separate PUB results",
      },
      answer: "a",
      explanation:
        "Observables broadcast just as parameter values do, so a list of three produces an array of three estimates within a single PUB result. The number of PUB results always matches the number of PUBs submitted, and no pairwise product is formed.",
      tags: ["array-broadcasting", "estimator-v2", "observables"],
      concept: "Observable broadcasting",
      objective: "Predict result shape from an observable list.",
      refs: [PRIMITIVE_IO, OBS_ARRAY],
      seconds: 70,
    },
    {
      id: "s6-015",
      difficulty: "medium",
      type: "concept",
      question:
        "What does the default resilience level of the Runtime Estimator apply?",
      choices: {
        a: "Measurement error mitigation, correcting readout bias in the estimates",
        b: "No mitigation at all",
        c: "Probabilistic error cancellation",
        d: "A full noise-model inversion of every gate",
      },
      answer: "a",
      explanation:
        "The default level applies readout-focused mitigation, which is comparatively cheap and addresses one of the largest and most systematic error sources. Turning mitigation off entirely requires selecting the lowest level explicitly, and the heavier techniques such as probabilistic cancellation and full noise-model inversion are opt-in because of their sampling overhead.",
      tags: ["estimator-v2", "resilience", "error-mitigation"],
      concept: "Default mitigation level",
      objective: "Recall what the default resilience setting does.",
      refs: [ESTIMATOR_OPTIONS, MITIGATION],
    },
    {
      id: "s6-016",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does enabling this option make the service do?",
      code:
        "estimator.options.resilience.zne_mitigation = True\nestimator.options.resilience.zne.noise_factors = (1, 3, 5)",
      codeStatus: "illustrative",
      choices: {
        a: "Run at several amplified noise levels, then extrapolate the trend back to none",
        b: "Delete the noisiest gates from the circuit before it is executed",
        c: "Discard the individual shots whose outcomes look most affected by noise",
        d: "Average the results obtained from several different quantum processors",
      },
      answer: "a",
      explanation:
        "Noise is scaled up in a controlled way, often by folding gates, and a fit through the resulting estimates is evaluated where the scale would be zero. Deleting gates would change the computation being performed, discarding shots by appearance introduces bias rather than removing it, and no averaging across separate processors takes place.",
      tags: ["estimator-v2", "zne", "error-mitigation"],
      concept: "Zero-noise extrapolation",
      objective: "Explain how extrapolation-based mitigation works.",
      refs: [ZNE_OPT, MITIGATION],
      seconds: 75,
    },
    {
      id: "s6-017",
      difficulty: "medium",
      type: "code-completion",
      question:
        "Every PUB should target a standard error of 0.01 unless it specifies otherwise. Which line belongs in the blank?",
      code: "estimator = Estimator(mode=backend)\n_____\njob = estimator.run(pubs)",
      codeStatus: "partial-completion",
      choices: {
        a: "estimator.options.default_precision = 0.01",
        b: "estimator.options.default_shots = 0.01",
        c: "estimator.options.resilience_level = 0.01",
        d: "estimator.precision = 0.01",
      },
      answer: "a",
      explanation:
        "The options object holds a default accuracy target that applies when an individual workload does not supply its own. A default_shots setting is the Sampler's control rather than this primitive's, a resilience_level takes a small integer rather than a tolerance such as 0.01, and the target is not exposed as a bare attribute on the primitive object.",
      tags: ["estimator-v2", "precision", "options"],
      concept: "Default precision configuration",
      objective: "Configure a submission-wide accuracy target.",
      refs: [ESTIMATOR_OPT_API, ESTIMATOR_OPTIONS],
    },
    {
      id: "s6-018",
      difficulty: "medium",
      type: "concept",
      question:
        "Why does a Pauli-string label's character order matter when defining an observable?",
      choices: {
        a: "Characters map to qubit indices from the right, so reordering them targets different qubits",
        b: "The order determines the coefficient's sign",
        c: "Character order sets the measurement basis rotation angle",
        d: "It does not matter; labels are normalized automatically",
      },
      answer: "a",
      explanation:
        "The rightmost character applies to qubit 0, so two labels with the same letters in different positions describe genuinely different measurements on different qubits. Coefficients are supplied separately, basis rotations follow from which Pauli each qubit carries, and no normalization reorders labels.",
      mistake: "Assuming Pauli labels are order-insensitive.",
      tags: ["observables", "qubit-ordering", "estimator-v2"],
      concept: "Pauli label ordering",
      objective: "Map observable labels to the intended qubits.",
      refs: [PAULI_OBS, SPO],
    },
    {
      id: "s6-019",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You need the ground-state energy of a Hamiltonian written as a sum of 60 Pauli terms. What is the natural way to submit it?",
      choices: {
        a: "As a single weighted sum observable, so one estimate covers the whole Hamiltonian",
        b: "As 60 separate PUBs, one per term",
        c: "As a Sampler workload, reconstructing the sum from counts",
        d: "As 60 separate jobs, averaged afterwards",
      },
      answer: "a",
      explanation:
        "A weighted Pauli sum is one observable, so the primitive returns a single estimate with a single uncertainty and can allocate shots across commuting groups internally. Splitting into separate PUBs or jobs forfeits that grouping and forces manual error propagation, and reconstructing the sum from raw counts means reimplementing the primitive by hand.",
      tags: ["estimator-v2", "observables", "workflow"],
      concept: "Submitting a Hamiltonian",
      objective: "Express a many-term Hamiltonian as one observable.",
      refs: [PAULI_OBS, ESTIMATOR_EXAMPLES],
      seconds: 70,
    },
    {
      id: "s6-020",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "An estimate of a Z observable comes back as 1.04 with a standard error of 0.03. What is the most reasonable reading?",
      choices: {
        a: "Mitigation can push an estimate slightly outside the physical range, and the excess here is comparable to the uncertainty",
        b: "The observable was defined incorrectly, since Z can only give values in a small range",
        c: "The backend malfunctioned and the result must be discarded",
        d: "The value proves the state was outside the Bloch sphere",
      },
      answer: "a",
      explanation:
        "The true value of a Pauli observable lies between minus one and plus one, but a mitigated estimate is a corrected quantity carrying uncertainty and can overshoot the boundary, especially when the correction is large. Being about one standard error past the limit is unremarkable rather than proof that the observable was defined incorrectly, that the backend malfunctioned, or that the underlying state was somehow unphysical.",
      mistake:
        "Treating a slight overshoot beyond the physical range as proof of an error.",
      tags: ["estimator-v2", "error-mitigation", "standard-errors", "analysis"],
      concept: "Mitigated estimates can exceed physical bounds",
      objective: "Interpret out-of-range mitigated values.",
      refs: [MITIGATION_OVERVIEW, ESTIMATOR_IO],
    },
    {
      id: "s6-021",
      difficulty: "medium",
      type: "concept",
      question:
        "What distinguishes error suppression from error mitigation in an Estimator workflow?",
      choices: {
        a: "Suppression acts while the circuit runs; mitigation corrects the estimates afterwards",
        b: "Suppression is applied once the job completes and mitigation before it starts",
        c: "Suppression is available on simulators only and has no hardware equivalent",
        d: "They are two names for the same technique, kept for historical reasons",
      },
      answer: "a",
      explanation:
        "Techniques such as decoupling and twirling act on the executed circuit to make errors smaller or better behaved, while techniques such as extrapolation adjust the numbers afterwards using extra runs; the two are complementary rather than interchangeable. Suppression is not applied after the job, it is not restricted to simulators, and the two families are genuinely distinct rather than two names for one idea.",
      tags: ["estimator-v2", "error-mitigation", "error-suppression"],
      concept: "Suppression versus mitigation",
      objective: "Distinguish the two error-handling families.",
      refs: [MITIGATION, MITIGATION_OVERVIEW],
    },
    {
      id: "s6-022",
      difficulty: "medium",
      type: "debugging",
      question:
        "An Estimator submission is rejected because the observable's width does not match the circuit. What is the usual cause?",
      choices: {
        a: "The observable still refers to the abstract qubits rather than the physical register",
        b: "The observable contains more Pauli terms than a single workload may carry",
        c: "The circuit was compiled at an optimization level the primitive rejects",
        d: "The requested accuracy target was set below the service's minimum value",
      },
      answer: "a",
      explanation:
        "Compilation widens the circuit to the device's physical register, so a two-qubit observable no longer matches a circuit that now spans many qubits; applying the compiled circuit's layout to the observable resolves it. Term count, optimization level, and precision produce entirely different failures.",
      mistake:
        "Forgetting to widen and permute the observable after compiling the circuit.",
      tags: ["estimator-v2", "observables", "debugging", "transpilation"],
      concept: "Observable width after compilation",
      objective: "Diagnose observable and circuit mismatches.",
      refs: [TRANSPILE, ESTIMATOR_IO],
    },
    {
      id: "s6-023",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does enabling this alongside mitigation contribute?",
      code:
        "estimator.options.twirling.enable_gates = True\nestimator.options.resilience_level = 2",
      codeStatus: "illustrative",
      choices: {
        a: "It reshapes coherent errors into a stochastic form that mitigation models better",
        b: "It removes the need to spend any shots on the workload at all",
        c: "It guarantees the returned estimate matches the exact theoretical value",
        d: "It reduces the number of terms in the observable being estimated",
      },
      answer: "a",
      explanation:
        "Randomized compiling makes the effective noise closer to a simple stochastic channel, which is the assumption most mitigation techniques rest on, so it improves their reliability. It neither eliminates sampling nor guarantees exactness, and it leaves the observable and its term count entirely untouched.",
      tags: ["estimator-v2", "twirling", "error-suppression", "noise"],
      concept: "Twirling supports mitigation",
      objective: "Explain why twirling is paired with mitigation.",
      refs: [TWIRL_OPT, ESTIMATOR_NOISE],
    },
    {
      id: "s6-024",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "Two Estimator results differ by 0.02, and each carries a standard error of 0.05. What conclusion is justified?",
      choices: {
        a: "The difference is well within the uncertainty, so the data does not distinguish the two cases",
        b: "The first value is definitively larger",
        c: "The measurement failed, since the error exceeds the difference",
        d: "Averaging the two removes the uncertainty",
      },
      answer: "a",
      explanation:
        "A separation smaller than the uncertainty of either estimate is not evidence of a real difference; more shots or better mitigation would be needed to resolve one. Nothing failed, and averaging reduces uncertainty only by the square root of the number of independent samples, so it never removes it.",
      mistake:
        "Reporting a difference as real when it is smaller than the reported uncertainty.",
      tags: ["estimator-v2", "standard-errors", "analysis"],
      concept: "Statistically responsible comparison",
      objective: "Judge whether two estimates differ meaningfully.",
      refs: [ESTIMATOR_IO, MITIGATION_OVERVIEW],
      seconds: 70,
    },
    {
      id: "s6-025",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What do these settings cause to happen before the estimates are produced?",
      code:
        "estimator.options.resilience.measure_mitigation = True\nestimator.options.resilience.measure_noise_learning.num_randomizations = 32",
      codeStatus: "illustrative",
      choices: {
        a: "Characterization experiments run first, giving the correction a current noise model",
        b: "The noisiest qubits are removed from the device for the duration of the job",
        c: "The optimization level of the compiled circuit is chosen automatically",
        d: "The shot budget is replaced by an exact analytic calculation",
      },
      answer: "a",
      explanation:
        "Correcting readout needs a quantitative model of how each qubit currently misreports, and characterization experiments supply it at the cost of extra device time. No qubits are taken out of service, compilation settings are chosen before submission and are unaffected, and sampling is not replaced by any analytic shortcut.",
      tags: ["estimator-v2", "noise-learning", "error-mitigation"],
      concept: "Noise characterization",
      objective: "Explain the role of noise learning.",
      refs: [NOISE_LEARNING, ESTIMATOR_NOISE],
      seconds: 75,
    },
    {
      id: "s6-026",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative description of each Estimator resilience level and what it enables. Which source is most direct?",
      choices: {
        a: "The options reference together with the error-mitigation techniques guide",
        b: "The bit-ordering guide, which covers how outcomes are labelled",
        c: "The circuit library reference, which catalogues prebuilt constructions",
        d: "The interoperability guide, which covers converting programs between languages",
      },
      answer: "a",
      explanation:
        "The options reference lists the levels and the techniques guide explains what each enables, which together answer the question precisely. Conventions, prebuilt circuits, and language interoperability are unrelated topics.",
      tags: ["documentation", "estimator-v2", "resilience"],
      concept: "Locating mitigation documentation",
      objective: "Find authoritative references for resilience settings.",
      refs: [ESTIMATOR_OPT_API, MITIGATION],
    },
    {
      id: "s6-027",
      difficulty: "hard",
      type: "broadcasting-shape",
      question:
        "A PUB pairs one circuit with an observable array of shape (4, 1) and a parameter array of shape (1, 6, 2) for a two-parameter circuit. What shape do the expectation values have?",
      choices: {
        a: "(4, 6)",
        b: "(4, 1, 6)",
        c: "(4, 6, 2)",
        d: "(24,)",
      },
      answer: "a",
      explanation:
        "The parameter array's trailing axis is consumed by binding, leaving a shape of (1, 6), which broadcasts against the observable shape (4, 1) to give (4, 6). Keeping the parameter axis would leave a trailing 2 in the answer, and flattening the grid to 24 entries discards the two-dimensional structure the broadcast defines.",
      mistake:
        "Broadcasting the observable and parameter shapes without first removing the parameter axis.",
      tags: ["array-broadcasting", "estimator-v2", "observables", "pubs"],
      concept: "Broadcasting observables against parameters",
      objective: "Compute the broadcast shape of an Estimator PUB.",
      refs: [PRIMITIVE_IO, OBS_ARRAY],
    },
    {
      id: "s6-028",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A hardware estimate of an observable whose ideal value is +1 comes back as +0.62 with a standard error of 0.01. What does this most likely indicate?",
      choices: {
        a: "Systematic device error is damping the estimate; the gap is far too large for noise",
        b: "The observable was defined incorrectly and measures a different quantity",
        c: "The shot count was too low, so more repetitions would close the gap",
        d: "The result sits comfortably within the expected statistical variation",
      },
      answer: "a",
      explanation:
        "A gap of 0.38 against a reported uncertainty of 0.01 is nearly forty standard errors, so it is a bias rather than a fluctuation, and decoherence and gate error characteristically pull expectation values toward zero. Raising the shot count would shrink the uncertainty further without moving the central value, which is exactly why mitigation rather than a larger budget is the right response. A misdefined observable would typically give a qualitatively different value rather than a uniformly damped one, and the deviation is far too large to call ordinary statistical variation.",
      mistake:
        "Trying to fix a systematic bias by increasing the shot count.",
      tags: ["estimator-v2", "standard-errors", "noise", "analysis"],
      concept: "Bias versus variance",
      objective: "Distinguish systematic bias from statistical error.",
      refs: [MITIGATION_OVERVIEW, ESTIMATOR_NOISE],
    },
    {
      id: "s6-029",
      difficulty: "hard",
      type: "concept",
      question:
        "Why does probabilistic error cancellation carry a much larger sampling overhead than readout mitigation?",
      choices: {
        a: "It samples a signed decomposition whose variance grows exponentially with the noise",
        b: "It requires the workload to be executed on several processors at once",
        c: "It doubles the number of qubits the compiled circuit occupies",
        d: "It disables twirling, which would otherwise have reduced the shot cost",
      },
      answer: "a",
      explanation:
        "Inverting a noise channel requires sampling circuits with signed weights, and the variance of that estimator grows exponentially in the total error being cancelled, so the shot cost rises sharply with circuit size. Readout mitigation corrects a comparatively small, well-characterized effect. The method uses one backend, adds no qubits, and is typically combined with twirling rather than replacing it.",
      tags: ["estimator-v2", "pec", "error-mitigation", "analysis"],
      concept: "Cost of probabilistic error cancellation",
      objective: "Compare the overheads of mitigation techniques.",
      refs: [PEC_OPT, MITIGATION],
    },
    {
      id: "s6-030",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "What is the practical difference between these two observable definitions?",
      code: 'from qiskit.quantum_info import SparsePauliOp\n\nsingle = SparsePauliOp(["ZI", "IZ"], coeffs=[1.0, 1.0])\nseparate = [SparsePauliOp("ZI"), SparsePauliOp("IZ")]',
      codeStatus: "executable",
      choices: {
        a: "The first gives one estimate of the sum; the second gives one estimate per term",
        b: "They are identical in every respect, so either form may be used freely",
        c: "The first is invalid, because a weighted sum cannot itself be an observable",
        d: "The second raises an error, because a list of operators is not accepted",
      },
      answer: "a",
      explanation:
        "A weighted sum is a single observable, so it produces one number with one uncertainty, whereas a list broadcasts into an array of independent estimates. That distinction matters because the summed form lets the primitive group commuting terms and propagate error internally, while the list form gives per-term visibility, so the two are not identical in every respect. Both forms are valid inputs: a sum is a perfectly legitimate observable, and a list is an accepted way to request several estimates at once.",
      mistake:
        "Assuming a list of terms and their sum produce interchangeable results.",
      tags: ["estimator-v2", "observables", "array-broadcasting"],
      concept: "Summed versus listed observables",
      objective: "Choose between summed and separated observables.",
      refs: [SPO, OBS_ARRAY],
    },
    {
      id: "s6-031",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A variational loop requests precision 0.001 on every iteration, and the optimizer needs 500 iterations. What is the main practical problem?",
      choices: {
        a: "Tight precision on every iteration is enormously expensive, and early iterations do not need it",
        b: "Precision cannot be changed between iterations",
        c: "The optimizer cannot use estimates that carry uncertainty",
        d: "Precision below 0.01 is rejected by the service",
      },
      answer: "a",
      explanation:
        "Shot cost scales as the inverse square of the target, so demanding a thousandth on every iteration multiplies the budget enormously while early exploratory steps tolerate far coarser estimates; tightening as the optimizer converges is the standard remedy. The target is a per-workload value that can be varied freely between iterations, optimizers routinely handle objectives that carry uncertainty, and small values are permitted rather than rejected by the service.",
      tags: ["estimator-v2", "precision", "workflow", "usage"],
      concept: "Adaptive precision in variational loops",
      objective: "Design a cost-aware estimation schedule.",
      refs: [ESTIMATOR_OPTIONS, ESTIMATOR_EXAMPLES],
    },
    {
      id: "s6-032",
      difficulty: "hard",
      type: "concept",
      question:
        "Why can grouping commuting Pauli terms reduce the cost of estimating a Hamiltonian?",
      choices: {
        a: "Terms sharing a measurement basis are estimated from one round of shots",
        b: "Terms that commute can simply be dropped from the Hamiltonian entirely",
        c: "Grouping removes the need for any basis-change gates before readout",
        d: "Grouping converts the observable into a circuit that runs more cheaply",
      },
      answer: "a",
      explanation:
        "When several terms need the same per-qubit measurement basis, one round of measurements yields outcomes from which each term's average can be computed, cutting the number of distinct experiments substantially. No terms are dropped from the Hamiltonian, at least one basis change per group is still required so they are not eliminated entirely, and the observable remains an operator rather than being converted into a circuit.",
      tags: ["estimator-v2", "observables", "analysis", "usage"],
      concept: "Commuting-term grouping",
      objective: "Explain how term grouping saves shots.",
      refs: [PAULI_OBS, ESTIMATOR_EXAMPLES],
    },
    {
      id: "s6-033",
      difficulty: "hard",
      type: "debugging",
      question:
        "Estimates look plausible but are consistently wrong by a sign on some terms. What is a likely explanation?",
      choices: {
        a: "The observable's Pauli labels were written in the wrong qubit order",
        b: "The requested accuracy target was set far tighter than necessary",
        c: "The resilience level was left at zero, so no mitigation was applied",
        d: "The shot count was not chosen to be a power of two",
      },
      answer: "a",
      explanation:
        "Reversed labels apply Pauli factors to the wrong qubits, and on a correlated state that commonly flips the sign of specific correlators while leaving others intact, producing exactly this partially wrong pattern. Precision affects uncertainty rather than the central value, disabling mitigation shifts magnitudes rather than signs, and shot counts need not be powers of two.",
      mistake:
        "Writing Pauli labels left to right and only noticing on correlated observables.",
      tags: ["estimator-v2", "observables", "qubit-ordering", "debugging"],
      concept: "Sign errors from label ordering",
      objective: "Diagnose systematically wrong expectation values.",
      refs: [PAULI_OBS, SPO],
    },
    {
      id: "s6-034",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You want to quantify how much error mitigation is changing your answer on a given circuit. What is the most informative experiment?",
      choices: {
        a: "Run the identical workload at the lowest and at a higher resilience level and compare the two estimates with their uncertainties",
        b: "Run once with mitigation and compare against an ideal simulation of the abstract circuit",
        c: "Run twice at the same resilience level and average",
        d: "Increase shots until the estimates stop changing",
      },
      answer: "a",
      explanation:
        "Holding everything else fixed and varying only the mitigation setting isolates its effect, and comparing with uncertainties shows whether the shift is meaningful. Comparing against an ideal simulation of the uncompiled circuit mixes in layout differences, repeating at one setting measures only variance, and adding shots reduces uncertainty without revealing bias.",
      tags: ["estimator-v2", "error-mitigation", "analysis", "workflow"],
      concept: "Isolating the effect of mitigation",
      objective: "Design a controlled mitigation comparison.",
      refs: [MITIGATION, ESTIMATOR_NOISE],
    },
    {
      id: "s6-035",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "An Estimator result's metadata reports a target precision alongside the achieved standard errors, and one term's error exceeds the target. What does that indicate?",
      choices: {
        a: "Too few shots were allocated for that term, whose variance ran higher than assumed",
        b: "The job failed part way through, so the reported value should be discarded",
        c: "The target was applied only to the first term and ignored for the rest",
        d: "The metadata is internally inconsistent and should not be relied upon",
      },
      answer: "a",
      explanation:
        "Precision is a target rather than a guarantee: the service allocates shots from an assumed variance, and a term whose outcomes fluctuate more than expected can land short. The honest response is to rerun that term with a tighter target rather than to discard the whole job or dismiss the metadata as inconsistent, and the target certainly applies to every term rather than only the first.",
      tags: ["estimator-v2", "precision", "metadata", "analysis"],
      concept: "Target versus achieved precision",
      objective: "Interpret precision reporting in metadata.",
      refs: [ESTIMATOR_IO, ESTIMATOR_OPTIONS],
    },
    {
      id: "s6-036",
      difficulty: "hard",
      type: "concept",
      question:
        "Why does measurement noise learning improve readout mitigation compared with a fixed assumption?",
      choices: {
        a: "Readout error differs per qubit and drifts, so a current measurement fits better",
        b: "It removes readout error from the device entirely for the duration of the job",
        c: "It removes the need to measure the observable at all during execution",
        d: "It applies only on simulators, where readout is already exact",
      },
      answer: "a",
      explanation:
        "Assignment error differs between qubits and changes between calibrations, so characterizing it close to run time makes the inversion match reality. The correction reduces bias rather than removing readout error from the device entirely, the observable must still be measured rather than becoming unnecessary, and the technique exists precisely because real devices misreport, so it is not confined to simulators where readout would already be exact.",
      tags: ["estimator-v2", "noise-learning", "error-mitigation"],
      concept: "Learned readout correction",
      objective: "Explain why noise characterization is time-sensitive.",
      refs: [MEAS_LEARN_OPT, NOISE_LEARNING],
    },
    {
      id: "s6-037",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "Two teams estimate the same observable on the same backend. One reports 0.51 with error 0.02 at resilience level 0, the other 0.68 with error 0.04 at a higher level. What is the most defensible summary?",
      choices: {
        a: "The mitigated value is likely closer to the truth, at the cost of a wider error bar",
        b: "The unmitigated value is more trustworthy because its error bar is narrower",
        c: "The two results are irreconcilable, so one of the teams must have erred",
        d: "The two values should simply be averaged into a single reported figure",
      },
      answer: "a",
      explanation:
        "Mitigation trades variance for reduced bias, so a larger error bar accompanying a value shifted away from zero is the expected signature rather than a contradiction. A narrower error bar on a biased estimate does not make it more trustworthy, the two runs are entirely reconcilable so neither team need have erred, and averaging a biased value with a corrected one simply reintroduces the bias that mitigation removed.",
      mistake:
        "Preferring the estimate with the smaller error bar without considering bias.",
      tags: ["estimator-v2", "error-mitigation", "standard-errors", "analysis"],
      concept: "Bias-variance trade in mitigation",
      objective: "Reconcile mitigated and unmitigated estimates.",
      refs: [MITIGATION_OVERVIEW, ESTIMATOR_IO],
    },
    {
      id: "s6-038",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "What does the fourth element of this Estimator PUB set?",
      code: "pub = (isa_circuit, isa_observable, params, 0.005)",
      codeStatus: "illustrative",
      choices: {
        a: "The target standard error for this PUB, overriding the default precision",
        b: "The fraction of shots to discard",
        c: "The delay between shots in seconds",
        d: "The resilience level",
      },
      answer: "a",
      explanation:
        "Estimator PUB elements run circuit, observables, parameter values, and precision, so the trailing float is a per-PUB accuracy target that takes priority over the default. Shot pacing is an execution option, no shots are discarded, and resilience level is a small integer configured through options rather than positionally.",
      tags: ["estimator-v2", "pubs", "precision"],
      concept: "Per-PUB precision",
      objective: "Read every element of an Estimator PUB.",
      refs: [ESTIMATOR_IO, ESTIMATOR_PUB],
    },
  ],
);
