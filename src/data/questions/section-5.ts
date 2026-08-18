import { defineSection } from "./define";
import { api, guide } from "./refs";

const GET_STARTED = guide("get-started-with-sampler");
const SAMPLER_IO = guide("sampler-input-output");
const SAMPLER_OPTIONS = guide("sampler-options");
const SAMPLER_EXAMPLES = guide("sampler-examples");
const SAMPLER_NOISE = guide("sampler-noise-management");
const PRIMITIVE_IO = guide("primitive-input-output");
const PRIMITIVES = guide("primitives");
const POST_SELECTION = guide("post-selection");
const MEASURE = guide("measure-qubits");
const BIT_ORDERING = guide("bit-ordering");
const TRANSPILE = guide("transpile");
const SAMPLER_OPT_API = api("qiskit-ibm-runtime/options-sampler-options");
const DD_OPT = api("qiskit-ibm-runtime/options-dynamical-decoupling-options");
const TWIRL_OPT = api("qiskit-ibm-runtime/options-twirling-options");
const BIT_ARRAY = api("qiskit/qiskit.primitives.BitArray");
const DATA_BIN = api("qiskit/qiskit.primitives.DataBin");
const PRIM_RESULT = api("qiskit/qiskit.primitives.PrimitiveResult");
const PUB_RESULT = api("qiskit/qiskit.primitives.SamplerPubResult");
const SAMPLER_PUB = api("qiskit/qiskit.primitives.SamplerPub");

/**
 * Section 5 — Use the sampler primitive (official weight 12%).
 * Target: 38 questions.
 */
export const SECTION_5_QUESTIONS = defineSection(
  { section: 5, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s5-001",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does the returned object contain after this workload finishes?",
      code:
        "from qiskit_ibm_runtime import SamplerV2 as Sampler\n\nsampler = Sampler(mode=backend)\nresult = sampler.run([(isa_circuit,)], shots=1024).result()",
      codeStatus: "illustrative",
      choices: {
        a: "Per-shot outcomes read from the circuit's classical registers",
        b: "Expectation values for a set of observables supplied with the circuit",
        c: "The exact statevector the circuit prepares before measurement",
        d: "A compiled version of the circuit, ready to submit to hardware",
      },
      answer: "a",
      explanation:
        "Sampling executes the circuit repeatedly and reports the classical outcomes, from which counts or individual bitstrings can be derived. Expectation values come from the Estimator, an exact statevector requires simulation rather than sampling, and compilation is a separate transpiler step that happens before submission.",
      tags: ["sampler-v2", "measurement-sampling", "result-object"],
      concept: "Sampler output",
      objective: "Identify what the Sampler primitive produces.",
      refs: [GET_STARTED, PRIMITIVES],
    },
    {
      id: "s5-002",
      difficulty: "easy",
      type: "concept",
      question:
        "What does the abbreviation PUB stand for in the version 2 primitives?",
      choices: {
        a: "Primitive Unified Bloc",
        b: "Parameterized Unitary Batch",
        c: "Probability Update Buffer",
        d: "Pauli Uncertainty Bound",
      },
      answer: "a",
      explanation:
        "A Primitive Unified Bloc is the tuple that bundles everything one execution needs, which for the Sampler is a circuit plus optional parameter values and shots. The other expansions are invented and correspond to no part of the interface.",
      tags: ["pubs", "sampler-v2"],
      concept: "PUB terminology",
      objective: "Recall the vocabulary of the version 2 primitives.",
      refs: [PRIMITIVE_IO, PRIMITIVES],
    },
    {
      id: "s5-003",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "The circuit here has no unbound parameters. What does this one-element workload specify?",
      code: "pub = (isa_circuit,)\njob = sampler.run([pub])",
      codeStatus: "illustrative",
      choices: {
        a: "Only the circuit; shots fall back to the run-level or default value",
        b: "Only the circuit; shots therefore default to a single repetition",
        c: "A circuit paired with an implicit observable inferred from its measurements",
        d: "A circuit paired with the backend it should be dispatched to",
      },
      answer: "a",
      explanation:
        "With nothing left to bind, the circuit alone is a complete workload, and the shot budget resolves from the run call or the configured default rather than dropping to one repetition. No observable is inferred, since that belongs to the Estimator, and the backend is fixed when the primitive is constructed rather than carried in the workload.",
      tags: ["pubs", "sampler-v2", "shots"],
      concept: "Minimal Sampler workload",
      objective: "Construct a basic Sampler workload.",
      refs: [SAMPLER_IO, SAMPLER_PUB],
      seconds: 50,
    },
    {
      id: "s5-004",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the numeric argument on the second line control?",
      code:
        "sampler = Sampler(mode=backend)\njob = sampler.run([(isa_circuit,)], shots=4096)",
      codeStatus: "illustrative",
      choices: {
        a: "How many times the circuit is repeated to build up measurement statistics",
        b: "The standard error the returned estimates are required to reach",
        c: "The optimization level used when the circuit was compiled",
        d: "How aggressively error mitigation is applied to the returned data",
      },
      answer: "a",
      explanation:
        "Shots are the number of repetitions, and sampling uncertainty falls roughly as one over the square root of that number. A target standard error is the Estimator's accuracy control rather than the Sampler's, the optimization level governs compilation and was fixed earlier, and mitigation strength is configured through separate options.",
      tags: ["sampler-v2", "shots", "options"],
      concept: "Shots as the sampling budget",
      objective: "Identify the Sampler's statistical control.",
      refs: [SAMPLER_OPTIONS, SAMPLER_IO],
    },
    {
      id: "s5-005",
      difficulty: "medium",
      type: "debugging",
      question:
        "This runs without error but the returned data container is empty. Why?",
      code:
        "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nisa = pm.run(qc)\nresult = sampler.run([(isa,)]).result()",
      codeStatus: "intentional-error",
      choices: {
        a: "Nothing was ever measured, so no classical register holds any data",
        b: "The shot count was left unset, so zero repetitions were executed",
        c: "Entangled circuits return their data under a reserved field name",
        d: "The circuit must be compiled after measurement rather than before",
      },
      answer: "a",
      explanation:
        "Sampler results are organized by classical register, so a circuit that never writes to one produces an empty container even though the job succeeds. An unset shot count falls back to a default rather than to zero, entanglement has no bearing on field naming, and compiling before measuring is not the problem: the measurements are simply absent.",
      mistake:
        "Removing measurements while refactoring and then expecting sampled data.",
      tags: ["sampler-v2", "measurement", "debugging", "result-object"],
      concept: "Measurements produce Sampler data",
      objective: "Explain what makes a circuit samplable.",
      refs: [SAMPLER_IO, MEASURE],
      seconds: 70,
    },
    {
      id: "s5-006",
      difficulty: "easy",
      type: "result-interpretation",
      question:
        "Three workloads went out together. How do you know which returned entry belongs to the middle one?",
      code: "job = sampler.run([pub_a, pub_b, pub_c])\nresult = job.result()",
      codeStatus: "illustrative",
      choices: {
        a: "result[1], because entries keep the order in which the workloads were submitted",
        b: "The entry whose circuit name sorts second alphabetically",
        c: "The entry with the second largest total measurement count",
        d: "Whichever entry remains after the failed workloads are dropped",
      },
      answer: "a",
      explanation:
        "The result sequence preserves input order, which is the contract that makes indexed access reliable. Nothing is sorted by circuit name or by the size of the data, and the list is never filtered, so a failure surfaces as an error rather than silently shifting later entries into the wrong positions.",
      tags: ["pubs", "result-object", "sampler-v2"],
      concept: "Result-to-workload correspondence",
      objective: "Navigate primitive results by index.",
      refs: [PRIMITIVE_IO, PRIM_RESULT],
    },
    {
      id: "s5-007",
      difficulty: "easy",
      type: "concept",
      question:
        "Which choice best describes the difference between the Sampler and the Estimator?",
      choices: {
        a: "Sampler returns measurement outcomes; Estimator returns expectation values of observables",
        b: "Sampler runs on hardware and Estimator only on simulators",
        c: "Sampler works with parameterized circuits and Estimator does not",
        d: "Sampler returns exact probabilities and Estimator returns samples",
      },
      answer: "a",
      explanation:
        "The two primitives differ in what they compute: raw classical outcomes versus expectation values for supplied observables. Both run on hardware and simulators, both accept parameterized circuits, and neither returns exact probabilities from a finite number of shots.",
      tags: ["sampler-v2", "estimator-v2"],
      concept: "Choosing between primitives",
      objective: "Distinguish the two version 2 primitives.",
      refs: [PRIMITIVES, PRIMITIVE_IO],
    },
    {
      id: "s5-008",
      difficulty: "easy",
      type: "code-behavior",
      question: "What decides the attribute used on the last line?",
      code:
        "from qiskit import ClassicalRegister, QuantumCircuit\n\ncr = ClassicalRegister(2, \"readout\")\nqc = QuantumCircuit(2, cr)\nqc.measure([0, 1], [0, 1])\n\ncounts = result[0].data.readout.get_counts()",
      codeStatus: "illustrative",
      choices: {
        a: "The name given to the classical register when the circuit was built",
        b: "The order in which the gates were applied to the qubits",
        c: "The name of the backend the workload was dispatched to",
        d: "The position of the workload within the submitted list",
      },
      answer: "a",
      explanation:
        "Each classical register becomes its own field in the result's data container, which is what keeps multi-register circuits readable and shot-aligned. Gate order, backend identity, and the workload's position in the submission all leave field naming untouched, which is why hard-coding one field name breaks on circuits built differently.",
      mistake: "Assuming every circuit produces the same result field name.",
      tags: ["sampler-v2", "result-object", "registers"],
      concept: "Register-named result fields",
      objective: "Locate measurement data inside a Sampler result.",
      refs: [SAMPLER_IO, DATA_BIN],
      seconds: 50,
    },
    {
      id: "s5-009",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "Both lines succeed on the same object. What does that tell you about how the measurement data is stored?",
      code:
        "data = result[0].data.meas\nprint(data.get_counts())\nprint(data.get_bitstrings()[:5])",
      codeStatus: "illustrative",
      choices: {
        a: "Every shot is retained, so aggregated tallies are derived rather than stored",
        b: "Only the aggregated tallies are stored, and individual shots are reconstructed",
        c: "The data is an exact statevector from which both views are computed",
        d: "The data holds one expectation value per measured classical bit",
      },
      answer: "a",
      explanation:
        "The container keeps the outcome of every repetition, so counts, ordered bitstrings, and post-selected subsets can all be derived from the same underlying array. Aggregated tallies discard shot order irrecoverably and could not be expanded back into individual shots, a statevector is not what sampling produces, and expectation values belong to the Estimator.",
      tags: ["sampler-v2", "bit-arrays", "result-object"],
      concept: "Per-shot measurement container",
      objective: "Describe how Sampler measurement data is stored.",
      refs: [BIT_ARRAY, SAMPLER_IO],
      seconds: 70,
    },
    {
      id: "s5-010",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this Sampler PUB describe?",
      code: "pub = (isa_circuit, [0.25, 0.5])",
      codeStatus: "illustrative",
      choices: {
        a: "One evaluation, with the circuit's two parameters bound to the two supplied values",
        b: "Two evaluations, one for each of the two values in the list",
        c: "A circuit paired with an observable expressed as a pair of coefficients",
        d: "A circuit run with 0.25 precision and half the default shot budget",
      },
      answer: "a",
      explanation:
        "The second element supplies parameter values, and a flat list of length two binds a circuit with two parameters for a single evaluation. Producing two evaluations would require a two-dimensional array with one row per set. Observables belong to the Estimator, and neither element configures precision or shots.",
      mistake:
        "Reading a flat parameter list as a sweep over several single-parameter evaluations.",
      tags: ["pubs", "sampler-v2", "parameterized-circuits"],
      concept: "Parameter values in a PUB",
      objective: "Interpret the parameter element of a Sampler PUB.",
      refs: [SAMPLER_IO, SAMPLER_PUB],
    },
    {
      id: "s5-011",
      difficulty: "medium",
      type: "broadcasting-shape",
      question:
        "A circuit has three parameters, and a PUB supplies an array of shape (5, 3). How many result entries does that PUB produce, and what shape does its measurement data have?",
      choices: {
        a: "One PUB result, whose measurement data has leading shape (5,)",
        b: "Five separate PUB results, each with scalar measurement data",
        c: "One PUB result with leading shape (5, 3)",
        d: "Fifteen PUB results, one per value",
      },
      answer: "a",
      explanation:
        "The trailing axis is consumed by the parameter binding, so its length must match the parameter count and it disappears from the output shape. The remaining leading axes describe how many bound circuits were evaluated, giving one result whose data carries shape (5,). Producing five separate results would require five submitted workloads, keeping the shape (5, 3) would leave the consumed parameter axis in place, and fifteen results would count individual values rather than workloads.",
      mistake:
        "Expecting the parameter axis to survive into the result's shape.",
      tags: ["array-broadcasting", "pubs", "sampler-v2"],
      concept: "Parameter array shapes",
      objective: "Predict result shape from a parameter array.",
      refs: [PRIMITIVE_IO, SAMPLER_IO],
    },
    {
      id: "s5-012",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "For a circuit built as QuantumCircuit(2, 2) whose measurements target its default classical register, how is the measurement data reached in the result?",
      code: "result = job.result()\ndata = result[0].data",
      codeStatus: "illustrative",
      choices: {
        a: "Through the field named after that register, not through a fixed name such as meas",
        b: "Through a field always named meas",
        c: "Through the top-level result object rather than the data container",
        d: "Through an expectation-value field",
      },
      answer: "a",
      explanation:
        "Field names mirror the circuit's register names, and a circuit built with a bare bit count gets a default register name rather than the one the bulk measurement helper creates. Hard-coding a single field name is a frequent source of attribute errors when circuits are constructed differently. Expectation-value fields belong to the Estimator.",
      mistake:
        "Hard-coding one register field name across circuits built in different ways.",
      tags: ["sampler-v2", "result-object", "registers"],
      concept: "Register-dependent field names",
      objective: "Access measurement data for arbitrary register names.",
      refs: [SAMPLER_IO, DATA_BIN],
    },
    {
      id: "s5-013",
      difficulty: "medium",
      type: "code-behavior",
      question: "How many shots does each of these two workloads receive?",
      code:
        "sampler.options.default_shots = 1024\njob = sampler.run([(isa_a,), (isa_b, None, 8192)], shots=2048)",
      codeStatus: "illustrative",
      choices: {
        a: "The first gets 2048 and the second gets 8192",
        b: "The first gets 1024 and the second gets 8192",
        c: "Both get 2048, because a run-level value overrides everything else",
        d: "The first gets 2048 and the second gets 10240, since the values are added",
      },
      answer: "a",
      explanation:
        "Shot counts resolve from most specific to least: a value carried by the workload itself wins, then the run-level argument, then the configured default. So the workload that names 8192 keeps it while the other falls back to the run-level 2048; the default of 1024 is used by neither. Nothing is summed, and the run-level value does not override a per-workload one.",
      tags: ["sampler-v2", "shots", "pubs", "options"],
      concept: "Shot resolution order",
      objective: "Reason about layered shot configuration.",
      refs: [SAMPLER_IO, SAMPLER_OPTIONS],
    },
    {
      id: "s5-014",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "A circuit measures only qubit 0 into a one-bit register. Why do the reported outcomes contain a single character rather than one per qubit?",
      choices: {
        a: "Results report classical register contents, and only one bit was ever written",
        b: "Unmeasured qubits are reported as zero by default",
        c: "The result was truncated because the circuit was too small",
        d: "The Sampler always reports one bit regardless of the register width",
      },
      answer: "a",
      explanation:
        "Only measured data exists; qubits that were never measured contribute nothing, so the string length matches the register width. There is no implicit zero padding, no truncation, and wider registers certainly produce wider strings.",
      tags: ["sampler-v2", "measurement", "registers"],
      concept: "Register width determines outcome width",
      objective: "Explain the width of reported bitstrings.",
      refs: [SAMPLER_IO, MEASURE],
      seconds: 70,
    },
    {
      id: "s5-015",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "A noiseless simulation of a Bell circuit with 1000 shots reports 507 counts for 00 and 493 for 11. Why is the split not exactly even?",
      choices: {
        a: "Finite sampling fluctuates around the true probabilities by about the square root of the count",
        b: "The local simulator injected a hardware noise model into the run",
        c: "The circuit was compiled incorrectly and no longer prepares the intended state",
        d: "The two outcomes genuinely have unequal probabilities in this state",
      },
      answer: "a",
      explanation:
        "Even with exact probabilities, drawing a finite sample produces binomial fluctuation, and a deviation of about seven in a thousand is well within the expected range. A noiseless simulator adds no error, correct compilation preserves the distribution, and the underlying probabilities really are equal.",
      mistake:
        "Treating small deviations from ideal probabilities as evidence of a bug.",
      tags: ["sampler-v2", "shots", "analysis", "measurement-sampling"],
      concept: "Sampling variance",
      objective: "Interpret finite-shot deviations from ideal values.",
      refs: [SAMPLER_IO, PRIMITIVES],
    },
    {
      id: "s5-016",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You need the outcome of every individual shot in submission order, not just aggregated tallies. What does the Sampler let you do?",
      choices: {
        a: "Read the per-shot outcomes directly from the returned bit-array container",
        b: "Nothing; only aggregated counts are available",
        c: "Re-run with one shot at a time and collect the results",
        d: "Reconstruct shot order from the counts dictionary",
      },
      answer: "a",
      explanation:
        "The container stores every shot, so ordered bitstrings are available alongside the aggregated view, which matters for post-selection and for correlating mid-circuit measurements. Aggregation is a convenience derived from that data, single-shot re-runs would be enormously wasteful, and counts discard ordering irrecoverably.",
      tags: ["sampler-v2", "bit-arrays", "result-object"],
      concept: "Per-shot access",
      objective: "Retrieve individual shot outcomes.",
      refs: [BIT_ARRAY, SAMPLER_IO],
      seconds: 70,
    },
    {
      id: "s5-017",
      difficulty: "medium",
      type: "concept",
      question:
        "What does enabling dynamical decoupling in the Sampler options do?",
      choices: {
        a: "Pulse sequences are inserted into idle qubit windows to suppress decoherence during execution",
        b: "Measurement results are corrected after the run using a noise model",
        c: "The circuit is re-transpiled at a higher optimization level",
        d: "Shots are distributed across several backends",
      },
      answer: "a",
      explanation:
        "Decoupling is an error-suppression technique applied at execution time: idle qubits receive echo pulses that refocus slow dephasing. It acts before and during execution rather than as post-processing, it does not change the optimization level, and it involves one backend only.",
      tags: ["sampler-v2", "dynamical-decoupling", "error-suppression"],
      concept: "Dynamical decoupling",
      objective: "Explain what decoupling options do.",
      refs: [DD_OPT, SAMPLER_NOISE],
    },
    {
      id: "s5-018",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does enabling these options change about how the workload runs?",
      code:
        "sampler.options.twirling.enable_gates = True\nsampler.options.twirling.enable_measure = True",
      codeStatus: "illustrative",
      choices: {
        a: "Randomized frames are inserted so coherent errors average into a stochastic form",
        b: "The shot count is raised automatically to compensate for device noise",
        c: "All device noise is removed from the returned measurement data",
        d: "The circuit is re-routed onto a lower-error region of the processor",
      },
      answer: "a",
      explanation:
        "Randomization inserts compensating Pauli frames around operations so structured, coherent errors are converted into stochastic ones that behave more predictably and are easier to mitigate. It changes the character of the noise rather than removing it, leaves the requested shot budget alone, and performs no re-routing, which is a compilation decision.",
      tags: ["sampler-v2", "twirling", "error-suppression", "noise"],
      concept: "Pauli twirling",
      objective: "Explain the role of twirling options.",
      refs: [TWIRL_OPT, SAMPLER_NOISE],
    },
    {
      id: "s5-019",
      difficulty: "medium",
      type: "debugging",
      question:
        "Accessing the measurement field of a Sampler result raises an attribute error. What is the most likely cause?",
      choices: {
        a: "The circuit's classical register has a different name than the one being accessed",
        b: "The job has not finished, so the result is empty",
        c: "The shot count was too low to create the field",
        d: "The result must be converted to a dictionary before access",
      },
      answer: "a",
      explanation:
        "Field names follow the circuit's registers, so code written for one naming convention fails on a circuit built differently; inspecting the available field names resolves it immediately. Fetching a result blocks until completion, shot counts never remove fields, and the data container is accessed by attribute directly.",
      mistake:
        "Assuming every circuit produces the same result field name.",
      tags: ["sampler-v2", "result-object", "debugging", "registers"],
      concept: "Diagnosing result field errors",
      objective: "Troubleshoot access to Sampler measurement data.",
      refs: [DATA_BIN, SAMPLER_IO],
    },
    {
      id: "s5-020",
      difficulty: "medium",
      type: "broadcasting-shape",
      question:
        "The first item carries no free values; the second supplies an array of shape (4, 2) for a circuit with two of them. What comes back?",
      choices: {
        a: "Two results: the first with scalar-shaped data, the second with leading shape (4,)",
        b: "Five results in total, one for each bound circuit that was evaluated",
        c: "One result, combining both workloads into a single shared data container",
        d: "Two results, both carrying the same leading shape of (4,)",
      },
      answer: "a",
      explanation:
        "There is exactly one result per PUB, and each carries the shape implied by its own parameter array; a PUB with no parameters yields a scalar shape. Counting bound circuits rather than PUBs gives five, and the two PUBs are independent, so neither is merged nor forced to share a shape.",
      tags: ["array-broadcasting", "pubs", "sampler-v2"],
      concept: "Independent shapes per PUB",
      objective: "Predict result structure for mixed PUB submissions.",
      refs: [PRIMITIVE_IO, SAMPLER_IO],
    },
    {
      id: "s5-021",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "A dynamic circuit measures an ancilla mid-circuit into one register and the data qubits into another at the end. You want only the shots where the ancilla read zero. What is the direct approach?",
      choices: {
        a: "Use the per-shot data to select the matching shots from the data register",
        b: "Re-run the circuit until every ancilla reads zero",
        c: "Read the aggregated counts of the data register and divide by two",
        d: "Ask the backend to discard the unwanted shots before returning results",
      },
      answer: "a",
      explanation:
        "Because both registers are recorded per shot and stay aligned, filtering on one register and keeping the corresponding entries of the other is straightforward post-processing. Re-running does not control a random outcome, dividing aggregated counts assumes an independence that post-selection specifically breaks, and the device returns all shots.",
      tags: ["sampler-v2", "post-selection", "bit-arrays", "dynamic-circuits"],
      concept: "Post-selection on a register",
      objective: "Filter shots using a companion register.",
      refs: [POST_SELECTION, BIT_ARRAY],
    },
    {
      id: "s5-022",
      difficulty: "medium",
      type: "code-output",
      question: "Roughly what value does this print?",
      code:
        "import numpy as np\n\nbase = 1 / np.sqrt(2000)\ndoubled = 1 / np.sqrt(4000)\nprint(round(doubled / base, 2))",
      codeStatus: "executable",
      choices: {
        a: "0.71",
        b: "0.5",
        c: "1.0",
        d: "2.0",
      },
      answer: "a",
      explanation:
        "Sampling error scales as one over the square root of the shot count, so doubling the budget multiplies the uncertainty by one over the square root of two, about 0.71. A factor of 0.5 would require quadrupling the shots, 1.0 would mean the budget has no effect at all, and 2.0 would mean uncertainty grows as more data is collected.",
      tags: ["sampler-v2", "shots", "analysis"],
      concept: "Square-root scaling of sampling error",
      objective: "Reason about the cost of reducing statistical error.",
      refs: [SAMPLER_IO, PRIMITIVES],
    },
    {
      id: "s5-023",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "What information does a Sampler result's metadata typically carry?",
      choices: {
        a: "Execution details such as the shots actually used and the options in effect",
        b: "The full source of the submitted circuit",
        c: "The account's remaining allocation",
        d: "A rendered histogram of the outcomes",
      },
      answer: "a",
      explanation:
        "Metadata documents how the numbers were produced, which is what makes them interpretable and reproducible later. The circuit source, account accounting, and any plots live outside the result object.",
      tags: ["sampler-v2", "metadata", "result-object"],
      concept: "Result metadata",
      objective: "Describe what primitive metadata records.",
      refs: [PRIMITIVE_IO, PUB_RESULT],
      seconds: 70,
    },
    {
      id: "s5-024",
      difficulty: "medium",
      type: "concept",
      question:
        "Why is the Sampler a poor choice for estimating the expectation value of a many-term observable?",
      choices: {
        a: "Non-diagonal terms need separate basis changes and shot allocation, which Estimator handles",
        b: "This primitive cannot execute any circuit that contains entangling gates",
        c: "Expectation values cannot be computed from measurement outcomes at all",
        d: "This primitive always executes exactly one shot per submitted circuit",
      },
      answer: "a",
      explanation:
        "Each Pauli term that is not diagonal requires its own basis rotation and its own measurements, and combining the pieces with sensible shot budgets and uncertainty estimates is exactly what the Estimator implements. It is possible to do by hand, just laborious and error-prone. The Sampler runs any circuit and honors whatever shot budget is configured.",
      tags: ["sampler-v2", "estimator-v2", "observables", "workflow"],
      concept: "When to prefer the Estimator",
      objective: "Choose the appropriate primitive for a task.",
      refs: [PRIMITIVES, GET_STARTED],
    },
    {
      id: "s5-025",
      difficulty: "medium",
      type: "code-completion",
      question:
        "Every PUB in this submission should use 8192 shots unless it says otherwise. Which line belongs in the blank?",
      code: "sampler = Sampler(mode=backend)\n_____\njob = sampler.run(pubs)",
      codeStatus: "partial-completion",
      choices: {
        a: "sampler.options.default_shots = 8192",
        b: "sampler.options.precision = 8192",
        c: "sampler.options.resilience_level = 8192",
        d: "sampler.shots = 8192",
      },
      answer: "a",
      explanation:
        "The options object carries a default shot count that applies whenever neither the run call nor an individual workload supplies one. A precision setting and a resilience_level are Estimator controls that this primitive does not accept, and the budget is not exposed as a bare attribute on the primitive object itself.",
      tags: ["sampler-v2", "shots", "options"],
      concept: "Default shot configuration",
      objective: "Configure a submission-wide shot budget.",
      refs: [SAMPLER_OPT_API, SAMPLER_OPTIONS],
    },
    {
      id: "s5-026",
      difficulty: "easy",
      type: "concept",
      question:
        "What does a Sampler result contain when the submitted circuit has two separate classical registers?",
      choices: {
        a: "One data field per register, each holding that register's per-shot outcomes",
        b: "A single field with the two registers concatenated into one string",
        c: "Only the register written to last",
        d: "Two separate PUB results, one per register",
      },
      answer: "a",
      explanation:
        "Registers stay separate in the result, which keeps mid-circuit and final measurements distinguishable and shot-aligned. Concatenation would destroy that separation, nothing is dropped, and the number of PUB results depends on PUBs rather than registers.",
      tags: ["sampler-v2", "registers", "result-object"],
      concept: "Multiple registers in results",
      objective: "Predict result structure for multi-register circuits.",
      refs: [SAMPLER_IO, DATA_BIN],
      seconds: 50,
    },
    {
      id: "s5-027",
      difficulty: "hard",
      type: "broadcasting-shape",
      question:
        "A two-parameter circuit is submitted with a parameter array of shape (3, 4, 2) and 1000 shots. What is the shape of the resulting measurement data, and how many total shots are executed?",
      choices: {
        a: "Leading shape (3, 4), with 12000 shots in total",
        b: "Leading shape (3, 4, 2), with 24000 shots in total",
        c: "Leading shape (12,), with 1000 shots in total",
        d: "Leading shape (3,), with 3000 shots in total",
      },
      answer: "a",
      explanation:
        "The trailing axis matches the parameter count and is consumed by binding, leaving the leading axes (3, 4) as the grid of bound circuits, so twelve circuits each receive the 1000-shot budget for 12000 in total. Keeping the shape (3, 4, 2) with 24000 shots double-counts the consumed parameter axis, flattening to (12,) with 1000 shots treats the budget as per workload rather than per bound circuit, and (3,) with 3000 shots drops one sweep dimension entirely.",
      mistake:
        "Forgetting that the shot budget applies per bound circuit, not per PUB.",
      tags: ["array-broadcasting", "pubs", "shots", "sampler-v2"],
      concept: "Multi-dimensional parameter sweeps",
      objective: "Compute result shape and total shots for a sweep.",
      refs: [PRIMITIVE_IO, SAMPLER_IO],
    },
    {
      id: "s5-028",
      difficulty: "hard",
      type: "debugging",
      question:
        "A parameter array of shape (5,) is supplied for a circuit with three parameters, and the submission is rejected. Why?",
      choices: {
        a: "The trailing axis must match the number of parameters, so its length has to be three",
        b: "Parameter arrays must always be two-dimensional",
        c: "Five is larger than the maximum sweep size",
        d: "Parameter values must be supplied as a dictionary keyed by parameter name",
      },
      answer: "a",
      explanation:
        "Binding consumes the last axis and matches it against the circuit's parameters, so a trailing length of five against three parameters is a hard error. A one-dimensional array is perfectly valid when its length equals the parameter count, so being two-dimensional is not required; no maximum sweep size is involved, since five is tiny; and a dictionary keyed by parameter name is one accepted form rather than the only one.",
      mistake:
        "Supplying one value per sweep point when the circuit expects one value per parameter.",
      tags: ["array-broadcasting", "pubs", "debugging", "parameterized-circuits"],
      concept: "Parameter axis validation",
      objective: "Diagnose parameter shape mismatches.",
      refs: [SAMPLER_IO, SAMPLER_PUB],
    },
    {
      id: "s5-029",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A circuit prepares an equal superposition on three qubits and measures all of them with 800 shots. Roughly how many counts should each of the eight outcomes receive, and what spread is typical?",
      choices: {
        a: "About 100 each, with typical fluctuations of roughly ten counts",
        b: "Exactly 100 each, since the state is uniform",
        c: "About 100 each, with typical fluctuations of roughly 100 counts",
        d: "About 267 each, since only three outcomes are possible",
      },
      answer: "a",
      explanation:
        "Eight equally likely outcomes over 800 shots give a mean of 100, and the binomial standard deviation is close to the square root of the mean, so roughly ten counts. Exactly 100 each is not what random sampling produces even from a perfectly uniform state, fluctuations of roughly 100 would be as large as the mean itself, and 267 each assumes only three outcomes are possible when three qubits give eight.",
      tags: ["sampler-v2", "shots", "analysis", "measurement-sampling"],
      concept: "Expected counts and spread",
      objective: "Estimate statistical spread in sampled counts.",
      refs: [SAMPLER_IO, PRIMITIVES],
    },
    {
      id: "s5-030",
      difficulty: "hard",
      type: "concept",
      question:
        "Post-selecting on an ancilla outcome that occurs 10 percent of the time reduces a 10000-shot run to about 1000 usable shots. What is the practical consequence?",
      choices: {
        a: "Uncertainty on the retained shots grows by about a factor of three",
        b: "The retained data becomes exact, because the unwanted branch was removed",
        c: "There is no statistical cost, since the discarded shots were never wanted",
        d: "Uncertainty grows by a factor of ten, in proportion to the discarded fraction",
      },
      answer: "a",
      explanation:
        "Uncertainty scales inversely with the square root of the retained sample, and the square root of ten is about 3.2, so the budget must grow roughly tenfold to recover the original precision. Discarding shots never makes the remainder exact, the cost is real, and it grows with the square root rather than linearly.",
      mistake:
        "Ignoring the shot cost of post-selection when planning a run.",
      tags: ["post-selection", "shots", "analysis", "sampler-v2"],
      concept: "Statistical cost of post-selection",
      objective: "Quantify the cost of discarding shots.",
      refs: [POST_SELECTION, SAMPLER_IO],
    },
    {
      id: "s5-031",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "A three-qubit circuit measures all qubits, and the most frequent outcome string is 001. Which qubit was most often excited?",
      choices: {
        a: "Qubit 0",
        b: "Qubit 2",
        c: "Qubit 1",
        d: "It cannot be determined without the register name",
      },
      answer: "a",
      explanation:
        "Outcome strings place the lowest-index classical bit rightmost, and with a straight qubit-to-bit mapping that bit holds qubit 0. Reading the string left to right gives the tempting answer of qubit 2. The register name affects where the data lives, not how the bits are ordered within it.",
      mistake: "Reading result bitstrings left to right as qubits 0, 1, 2.",
      tags: ["sampler-v2", "little-endian", "result-interpretation"],
      concept: "Bit order in sampled outcomes",
      objective: "Map outcome characters back to qubits.",
      refs: [BIT_ORDERING, SAMPLER_IO],
    },
    {
      id: "s5-032",
      difficulty: "hard",
      type: "concept",
      question:
        "Why can enabling twirling change the shape or size of the data the Sampler executes, even though your circuit is unchanged?",
      choices: {
        a: "The shot budget is divided among randomized variants, each executed separately",
        b: "Extra classical registers are appended to the circuit before execution",
        c: "The number of returned results is doubled, one per randomization pass",
        d: "The circuit is widened onto additional qubits to host the randomization",
      },
      answer: "a",
      explanation:
        "Randomization works by running many differently twirled versions and combining them, so the requested shots are spread across those variants and the execution metadata reflects it. The user-visible result structure still has one entry per PUB, and neither registers nor qubit counts change.",
      tags: ["twirling", "sampler-v2", "noise", "metadata"],
      concept: "Randomized variants under twirling",
      objective: "Explain how twirling affects execution.",
      refs: [TWIRL_OPT, SAMPLER_NOISE],
    },
    {
      id: "s5-033",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "An ideal simulation of a compiled circuit gives outcome 010 with probability 0.5, but hardware reports 0.42 with 4096 shots. Is this consistent with statistical fluctuation alone?",
      choices: {
        a: "No: the expected spread is under one percentage point, so an eight-point gap points to device error",
        b: "Yes: with a few thousand shots, deviations of ten points are routine",
        c: "It cannot be assessed without knowing the backend name",
        d: "No, and it proves the compiled circuit is functionally wrong",
      },
      answer: "a",
      explanation:
        "The standard deviation of an estimated probability near one half with 4096 shots is about 0.008, so an eight-point discrepancy is roughly ten standard deviations and cannot be chance. That points to gate and readout error rather than a logic fault, since the ideal simulation of the same compiled circuit was correct. Backend identity helps explain the size of the error but is not needed to conclude it exceeds sampling noise.",
      mistake:
        "Attributing a large systematic gap to shot noise without estimating the expected spread.",
      tags: ["analysis", "shots", "hardware-results", "sampler-v2"],
      concept: "Separating statistical and systematic deviation",
      objective: "Judge whether a deviation exceeds sampling noise.",
      refs: [SAMPLER_IO, guide("error-mitigation-overview")],
    },
    {
      id: "s5-034",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You need to sweep 50 parameter settings of one compiled ansatz and compare their measured distributions. Which submission shape is most efficient?",
      choices: {
        a: "One PUB whose parameter array has 50 rows, so a single workload covers the sweep",
        b: "Fifty separate PUBs, one per setting, in one run call",
        c: "Fifty separate jobs, one per setting",
        d: "Fifty separate circuits, each with its parameter pre-bound",
      },
      answer: "a",
      explanation:
        "Broadcasting a parameter array over one compiled circuit expresses the sweep in a single workload, with the results returned in a structured array that is easy to index. Splitting into many PUBs works but adds bookkeeping, separate jobs add queueing overhead per setting, and pre-binding forfeits the compile-once advantage.",
      tags: ["array-broadcasting", "pubs", "workflow", "sampler-v2"],
      concept: "Expressing a sweep as one PUB",
      objective: "Design an efficient parameter sweep.",
      refs: [SAMPLER_EXAMPLES, PRIMITIVE_IO],
    },
    {
      id: "s5-035",
      difficulty: "hard",
      type: "debugging",
      question:
        "A Sampler run returns a result whose data container has no fields at all. What explains this?",
      choices: {
        a: "The submitted circuit contained no measurements, so no classical data was produced",
        b: "The shot count was set to zero",
        c: "The job failed silently and returned a placeholder",
        d: "The result must be indexed twice before fields appear",
      },
      answer: "a",
      explanation:
        "Data fields come from classical registers that were written to, so a circuit that never measures yields an empty container even though the job succeeds; this often happens when measurements are lost during circuit editing. A zero shot count would be rejected, a failed job raises rather than returning a placeholder, and the container is accessed once.",
      mistake:
        "Removing measurements while refactoring and then expecting sampled data.",
      tags: ["sampler-v2", "debugging", "measurement", "result-object"],
      concept: "Empty result containers",
      objective: "Diagnose a Sampler result with no data.",
      refs: [SAMPLER_IO, MEASURE],
    },
    {
      id: "s5-036",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative list of every Sampler option along with its accepted values. Which source is most direct?",
      choices: {
        a: "The Sampler options reference in the runtime API documentation",
        b: "The bit-ordering guide",
        c: "The transpiler stages guide",
        d: "The circuit library reference",
      },
      answer: "a",
      explanation:
        "The options reference enumerates each field, its type, and its permitted values, which is exactly what is being asked. The other sources cover conventions, compilation, and prebuilt circuits respectively.",
      tags: ["documentation", "sampler-v2", "options"],
      concept: "Locating primitive option documentation",
      objective: "Find authoritative option references.",
      refs: [SAMPLER_OPT_API, SAMPLER_OPTIONS],
    },
    {
      id: "s5-037",
      difficulty: "hard",
      type: "concept",
      question:
        "Why does the Sampler not accept a resilience level the way the Estimator does?",
      choices: {
        a: "Resilience levels target bias in expectation values, which is not what a raw outcome distribution reports",
        b: "The Sampler runs only on simulators, where mitigation is unnecessary",
        c: "Resilience is applied automatically to every Sampler run",
        d: "The Sampler has no options at all",
      },
      answer: "a",
      explanation:
        "Mitigation methods such as zero-noise extrapolation correct an estimated quantity, which presupposes an expectation value; the Sampler returns per-shot classical data instead, so error suppression there takes the form of twirling and decoupling rather than a resilience level. The Sampler runs on hardware and has a full options object.",
      tags: ["sampler-v2", "estimator-v2", "error-mitigation", "options"],
      concept: "Why mitigation levels are Estimator-specific",
      objective: "Contrast error handling across the two primitives.",
      refs: [SAMPLER_NOISE, SAMPLER_OPTIONS],
    },
    {
      id: "s5-038",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A compiled circuit routes logical qubit 0 onto physical qubit 42. When you read the sampled outcomes, which index should you use to recover logical qubit 0's value?",
      choices: {
        a: "The classical bit the measurement wrote to, which routing leaves untouched",
        b: "Bit 42 of the outcome string, matching the physical qubit that was used",
        c: "The leftmost bit, because compilation reorders the classical data as well",
        d: "None of them, because routing makes the original mapping unrecoverable",
      },
      answer: "a",
      explanation:
        "Compilation remaps qubits but preserves each measurement's classical destination, so results are reported in the circuit's own classical-bit order and the logical value stays where the program put it. Indexing bit 42 of the outcome string confuses the physical qubit number with the classical register, taking the leftmost bit assumes compilation reorders the classical data, and the value is certainly not unrecoverable, which is why the layout is retained alongside the compiled circuit.",
      mistake:
        "Indexing sampled outcomes by physical qubit number after routing.",
      tags: ["sampler-v2", "transpilation", "little-endian", "result-interpretation"],
      concept: "Classical bit order survives routing",
      objective: "Map compiled-circuit results back to logical qubits.",
      refs: [TRANSPILE, SAMPLER_IO],
    },
    {
      id: "s5-039",
      difficulty: "hard",
      type: "broadcasting-shape",
      question:
        "A sweep was submitted as one workload with a parameter array of shape (6, 2). Which expression selects the measurement data for the fourth parameter setting?",
      code: "result = job.result()\ndata = result[0].data.meas\nprint(data.shape)  # (6,)",
      codeStatus: "illustrative",
      choices: {
        a: "data[3], because the leading axis indexes the bound circuits",
        b: "result[3].data.meas, because each setting becomes its own workload result",
        c: "data[3, 1], because the parameter axis survives into the result",
        d: "data.get_counts()[3], because counts are indexed by setting",
      },
      answer: "a",
      explanation:
        "Binding consumes the trailing parameter axis, leaving a leading axis of length six that indexes the bound circuits, so the fourth setting is at position three of that axis. Indexing the result list instead would require six separate workloads to have been submitted, keeping a second axis assumes the consumed parameter axis survives, and aggregated counts are a mapping keyed by bitstring rather than an indexable sequence of settings.",
      mistake:
        "Confusing the number of submitted workloads with the number of bound circuits inside one workload.",
      tags: ["array-broadcasting", "sampler-v2", "bit-arrays", "result-object"],
      concept: "Indexing a broadcast result",
      objective: "Select one sweep point out of a broadcast Sampler result.",
      refs: [PRIMITIVE_IO, BIT_ARRAY],
    },
  ],
);
