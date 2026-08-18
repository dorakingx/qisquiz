import { defineSection } from "./define";
import { api, guide } from "./refs";

const MONITOR = guide("monitor-job");
const SAVE_JOBS = guide("save-jobs");
const PRIMITIVE_IO = guide("primitive-input-output");
const SAMPLER_IO = guide("sampler-input-output");
const ESTIMATOR_IO = guide("estimator-input-output");
const VIS_RESULTS = guide("visualize-results");
const DEBUG_TOOLS = guide("debugging-tools");
const DEBUG_JOBS = guide("debug-qiskit-runtime-jobs");
const POST_SELECTION = guide("post-selection");
const MITIGATION_OVERVIEW = guide("error-mitigation-overview");
const JOB_TAGS = guide("add-job-tags");
const BIT_ORDERING = guide("bit-ordering");
const LOCAL_SIM = guide("local-simulators");
const TRANSPILE = guide("transpile");
const QPU_INFO = guide("qpu-information");
const SERVICE = api("qiskit-ibm-runtime/qiskit-runtime-service");
const JOB_API = api("qiskit-ibm-runtime/runtime-job-v2");
const SPANS = api("qiskit-ibm-runtime/execution-span-execution-spans");
const NEAT = api("qiskit-ibm-runtime/debug-tools-neat");
const BIT_ARRAY = api("qiskit/qiskit.primitives.BitArray");
const DATA_BIN = api("qiskit/qiskit.primitives.DataBin");
const PRIM_RESULT = api("qiskit/qiskit.primitives.PrimitiveResult");

/**
 * Section 7 — Retrieve and analyze the results of quantum circuits (weight 10%).
 * Target: 32 questions.
 */
export const SECTION_7_QUESTIONS = defineSection(
  { section: 7, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s7-001",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does this snippet need in order to work in a process started a week after the job was submitted?",
      code:
        "service = QiskitRuntimeService()\njob = service.job(stored_id)\nresult = job.result()",
      codeStatus: "illustrative",
      choices: {
        a: "Only valid credentials and the stored identifier",
        b: "The original circuit object and the machine that submitted it",
        c: "The device calibration data captured on the day the job ran",
        d: "The submitting process, kept alive until the results are read",
      },
      answer: "a",
      explanation:
        "Results are stored server-side and keyed by identifier, so any authenticated client can fetch them from anywhere. The circuit object, the original machine, the calibration snapshot, and the submitting process are all unnecessary for retrieval, although the calibration data is worth recording separately for interpreting the numbers.",
      tags: ["job-retrieval", "runtime-jobs"],
      concept: "Retrieving a stored job",
      objective: "Recover results after a session ends.",
      refs: [SAVE_JOBS, SERVICE],
    },
    {
      id: "s7-002",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "Why is the loop below cheap to run, while calling for the data instead would not be?",
      code:
        "while job.status() not in (\"DONE\", \"ERROR\", \"CANCELLED\"):\n    time.sleep(5)",
      codeStatus: "illustrative",
      choices: {
        a: "It queries lifecycle position only, without transferring any result data",
        b: "It transfers the results but caches them locally after the first call",
        c: "It cancels and resubmits the job on every iteration of the loop",
        d: "It reads the backend's target rather than contacting the job at all",
      },
      answer: "a",
      explanation:
        "A status query is a lightweight lifecycle check, whereas fetching results blocks until completion and downloads the data. Nothing is cached locally by polling, no cancellation or resubmission happens, and the backend's target describes hardware capabilities rather than the state of a submitted job.",
      tags: ["job-monitoring", "job-lifecycle"],
      concept: "Non-blocking status checks",
      objective: "Monitor a job without waiting for results.",
      refs: [MONITOR, JOB_API],
      seconds: 50,
    },
    {
      id: "s7-003",
      difficulty: "easy",
      type: "result-interpretation",
      question:
        "In a fixed-shot experiment, what does a higher tally for the outcome 11 mean?",
      choices: {
        a: "More of the shots produced that classical outcome",
        b: "The circuit contains eleven qubits",
        c: "The expectation value equals eleven",
        d: "The device measured qubit 11",
      },
      answer: "a",
      explanation:
        "Counts are integer tallies of how many repetitions gave each outcome. The label is a bitstring rather than a decimal number, a qubit index, or an expectation value.",
      tags: ["counts", "result-interpretation"],
      concept: "Reading count tallies",
      objective: "Interpret a counts dictionary.",
      refs: [SAMPLER_IO, VIS_RESULTS],
    },
    {
      id: "s7-004",
      difficulty: "easy",
      type: "result-interpretation",
      question: "What kind of information does the printed mapping contain?",
      code: "result = job.result()\nprint(result[0].metadata)",
      codeStatus: "illustrative",
      choices: {
        a: "How the numbers were produced: shots used, options in effect, and timing",
        b: "A rendered plot of the outcomes, ready to display without re-analysis",
        c: "A replacement for the numerical data whenever mitigation was enabled",
        d: "The qubits the circuit was written for before it was compiled",
      },
      answer: "a",
      explanation:
        "Metadata makes results interpretable and reproducible by documenting the execution conditions. It never replaces the numerical data, mitigated or otherwise, and it holds no rendered plots, since visualization is done separately. The circuit's original qubit assignment lives with the compiled circuit's layout rather than in the result.",
      tags: ["metadata", "result-object", "analysis"],
      concept: "Result metadata",
      objective: "Explain why result metadata matters.",
      refs: [PRIMITIVE_IO, PRIM_RESULT],
    },
    {
      id: "s7-005",
      difficulty: "easy",
      type: "concept",
      question:
        "When validating a hardware run against a simulator, what should be compared?",
      choices: {
        a: "The outcome distributions or expectation values, allowing for noise and finite-shot variation",
        b: "The total wall-clock time each of the two runs took from submission to result",
        c: "The number of instructions each version of the circuit contains after compilation",
        d: "The order in which the two backends appear in the service's backend listing",
      },
      answer: "a",
      explanation:
        "Validation means asking whether the measured statistics match the predicted ones within the expected variation. Wall-clock time is dominated by queueing and says nothing about correctness, compiled instruction counts describe the program rather than its output, and the listing order of backends is an arbitrary presentation detail.",
      tags: ["hardware-results", "analysis", "simulation"],
      concept: "What to compare in validation",
      objective: "Design a meaningful result comparison.",
      refs: [LOCAL_SIM, VIS_RESULTS],
    },
    {
      id: "s7-006",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "What makes this query the right way to gather one campaign's jobs out of hundreds?",
      code:
        "jobs = service.jobs(\n    backend_name=\"ibm_example\",\n    job_tags=[\"vqe-sweep-7\"],\n    created_after=start_of_run,\n)",
      codeStatus: "illustrative",
      choices: {
        a: "Filtering happens server-side on metadata recorded when each job was submitted",
        b: "It downloads every job so the circuits can be compared by hand afterwards",
        c: "It orders the jobs by the magnitude of the results they produced",
        d: "It relies on the order in which the results happened to be retrieved",
      },
      answer: "a",
      explanation:
        "Filtering on labels, backend, and creation time is done by the service before anything is transferred, which is why tagging at submission pays off later. Downloading everything and inspecting circuits by hand does not scale, result magnitude is unrelated to provenance, and retrieval order is not a durable record of anything.",
      tags: ["job-retrieval", "job-monitoring", "workflow"],
      concept: "Filtering job history",
      objective: "Find related jobs efficiently.",
      refs: [SERVICE, JOB_TAGS],
      seconds: 50,
    },
    {
      id: "s7-007",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "A primitive result is indexed and its data container inspected. What determines which fields exist?",
      choices: {
        a: "The primitive used and, for sampled data, the circuit's classical register names",
        b: "The name of the backend the workload was dispatched to for execution",
        c: "The number of shots that were requested for the submitted workload",
        d: "The position the workload occupied in the list that was submitted",
      },
      answer: "a",
      explanation:
        "An Estimator result exposes expectation values and their uncertainties, while a Sampler result exposes one field per classical register. Backend identity, shot budget, and submission order do not change which fields exist.",
      tags: ["result-object", "sampler-v2", "estimator-v2"],
      concept: "Result field structure",
      objective: "Predict the fields of a primitive result.",
      refs: [DATA_BIN, PRIMITIVE_IO],
    },
    {
      id: "s7-008",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You have per-shot data from a three-register circuit and want the joint distribution of only two of those registers. What is the direct approach?",
      choices: {
        a: "Combine the per-shot entries of the two registers of interest and tally the resulting pairs",
        b: "Re-run the circuit with the third register removed",
        c: "Add the two registers' separate counts dictionaries together",
        d: "Divide the full counts by the number of registers",
      },
      answer: "a",
      explanation:
        "Because the registers are recorded shot by shot and stay aligned, the joint distribution is recovered by pairing entries index by index. Re-running wastes device time, adding separate tallies destroys the correlation you asked for, and dividing counts is meaningless.",
      tags: ["result-interpretation", "bit-arrays", "analysis"],
      concept: "Joint distributions from per-shot data",
      objective: "Derive marginal and joint statistics from shot data.",
      refs: [BIT_ARRAY, SAMPLER_IO],
      seconds: 70,
    },
    {
      id: "s7-009",
      difficulty: "medium",
      type: "result-interpretation",
      question: "What do the intervals printed here describe?",
      code:
        "spans = job.result().metadata[\"execution\"][\"execution_spans\"]\nprint(spans)",
      codeStatus: "illustrative",
      choices: {
        a: "When the device produced each slice of the returned data",
        b: "The smallest and largest estimates the workload returned",
        c: "The range of qubit indices the compiled circuit occupied",
        d: "How long the job waited in the queue before it started",
      },
      answer: "a",
      explanation:
        "These map slices of the returned data onto the wall-clock intervals in which they were collected, which is what makes drift within a long job detectable. They describe timing rather than the range of estimated values, they say nothing about which qubit indices were used, and queue waiting is excluded from execution reporting.",
      tags: ["metadata", "analysis", "runtime"],
      concept: "Execution spans",
      objective: "Interpret execution timing metadata.",
      refs: [SPANS, PRIMITIVE_IO],
      seconds: 70,
    },
    {
      id: "s7-010",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "An ideal simulation predicts a 50/50 split, and hardware with 1000 shots reports 550/450. What is the most reasonable first conclusion?",
      choices: {
        a: "A five-point shift is about three standard errors, so readout bias is a likely contributor",
        b: "The circuit certainly contains a logic error that produced the wrong distribution",
        c: "The simulator cannot be trusted as a baseline for hardware comparisons",
        d: "The result is exactly what pure sampling noise alone would predict here",
      },
      answer: "a",
      explanation:
        "With 1000 shots the standard error on a probability near one half is about 1.6 percentage points, so a five-point shift is roughly three standard errors: too large to dismiss as chance but entirely typical of readout asymmetry. A logic error would usually produce a qualitatively different distribution, and the ideal prediction remains the correct baseline.",
      mistake:
        "Labeling any deviation as sampling noise without estimating its size.",
      tags: ["hardware-results", "analysis", "shots", "noise"],
      concept: "Sizing a deviation against sampling error",
      objective: "Judge whether hardware data is consistent with prediction.",
      refs: [MITIGATION_OVERVIEW, VIS_RESULTS],
    },
    {
      id: "s7-011",
      difficulty: "medium",
      type: "concept",
      question:
        "Why is comparing raw counts from two runs with different shot budgets misleading?",
      choices: {
        a: "Tallies scale with the repetitions, so the larger run's bars are systematically taller",
        b: "Counts are normalized to probabilities before they are returned to the caller",
        c: "The number of shots requested has no bearing on the tallies that come back",
        d: "The two runs would have used different bit-ordering conventions for the labels",
      },
      answer: "a",
      explanation:
        "Raw counts are absolute frequencies, so they must be divided by their own totals before comparison. They are not normalized automatically, they clearly depend on the budget, and bit ordering is a convention that does not change between runs.",
      tags: ["counts", "shots", "analysis"],
      concept: "Normalizing before comparison",
      objective: "Compare results from unequal shot budgets.",
      refs: [VIS_RESULTS, SAMPLER_IO],
    },
    {
      id: "s7-012",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want to know which exam-relevant areas of a circuit family your device struggles with most. Which analysis is most informative?",
      choices: {
        a: "Group results by a structural property such as depth, then compare within each group",
        b: "Look only at the single worst-performing result in the whole collection",
        c: "Sort the circuits alphabetically by name and inspect them in that order",
        d: "Count how many circuits were submitted in total during the campaign",
      },
      answer: "a",
      explanation:
        "Grouping by a structural property that plausibly drives error reveals a trend rather than an anecdote, and it points at a specific cause. A single worst case can be an outlier, and naming or submission counts carry no signal.",
      tags: ["analysis", "hardware-results", "workflow"],
      concept: "Grouped error analysis",
      objective: "Identify systematic weaknesses from result data.",
      refs: [DEBUG_TOOLS, QPU_INFO],
    },
    {
      id: "s7-013",
      difficulty: "medium",
      type: "debugging",
      question:
        "Retrieving a job's result raises an exception. What should you inspect first?",
      choices: {
        a: "The job's status and the failure message the service recorded",
        b: "The circuit's drawing",
        c: "The local Python version",
        d: "The number of tags applied to the job",
      },
      answer: "a",
      explanation:
        "Status distinguishes a genuine failure from a cancellation, and the recorded message names the specific fault, which is where diagnosis starts. A drawing describes the program rather than the failure, the client version rarely causes server-side faults, and tags are only labels.",
      tags: ["debugging", "job-monitoring", "runtime-jobs"],
      concept: "Diagnosing failed retrieval",
      objective: "Troubleshoot an exception when fetching results.",
      refs: [DEBUG_JOBS, MONITOR],
      seconds: 70,
    },
    {
      id: "s7-014",
      difficulty: "medium",
      type: "concept",
      question:
        "Why can mitigated output contain values that a raw shot tally never could?",
      choices: {
        a: "Mitigation inverts a noise model, so corrected values may fall outside the raw range",
        b: "Devices are able to record a negative number of shots for some outcomes",
        c: "Mitigation multiplies the tallies by a randomly chosen scaling factor",
        d: "Negative values are the signal that the job was cancelled before finishing",
      },
      answer: "a",
      explanation:
        "Correcting for noise involves subtracting estimated contributions, so a corrected weight can go slightly negative or an expectation value can overshoot its physical bound while remaining a valid estimate. Raw counts are nonnegative integers by construction, and cancellation produces no data at all.",
      tags: ["quasi-probabilities", "error-mitigation", "result-interpretation"],
      concept: "Corrected values versus raw tallies",
      objective: "Interpret out-of-range mitigated output.",
      refs: [MITIGATION_OVERVIEW, VIS_RESULTS],
    },
    {
      id: "s7-015",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "What does this report add that the result object does not already carry?",
      code: "print(job.metrics())",
      codeStatus: "illustrative",
      choices: {
        a: "Timing and usage figures, such as when the job ran and how much device time it used",
        b: "The estimated values the workload produced during execution",
        c: "The compiled circuit exactly as it was submitted to the device",
        d: "The coupling map of the backend the job was dispatched to",
      },
      answer: "a",
      explanation:
        "These figures document the execution itself, which is what cost accounting and correlating results with device conditions require. The numerical estimates live in the result object, the submitted circuit is kept alongside the job payload, and the device's coupling map belongs to the backend's target.",
      tags: ["metadata", "job-monitoring", "usage"],
      concept: "Job metrics",
      objective: "Distinguish job metrics from result data.",
      refs: [JOB_API, MONITOR],
    },
    {
      id: "s7-016",
      difficulty: "medium",
      type: "result-interpretation",
      question:
        "A three-qubit result reports the outcome 110 most often. Under the standard mapping, which qubits were excited?",
      choices: {
        a: "Qubits 1 and 2",
        b: "Qubits 0 and 1",
        c: "Qubit 2 only",
        d: "All three qubits",
      },
      answer: "a",
      explanation:
        "The rightmost character corresponds to the lowest classical bit, so the trailing 0 means qubit 0 was not excited while the two leading ones correspond to qubits 1 and 2. Reading left to right gives the tempting answer of qubits 0 and 1.",
      mistake: "Reading result bitstrings left to right as qubits 0, 1, 2.",
      tags: ["little-endian", "result-interpretation", "counts"],
      concept: "Outcome bit order",
      objective: "Map outcome characters to qubits.",
      refs: [BIT_ORDERING, SAMPLER_IO],
      seconds: 70,
    },
    {
      id: "s7-017",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want to check whether a compiled circuit behaves as intended before spending device time, using the same primitive interface and an ideal reference. What tooling is designed for this?",
      choices: {
        a: "Debugging tools that compare a workload against an efficient ideal reference",
        b: "The circuit drawer, which renders the compiled program as a diagram",
        c: "The job tagging system, which labels submissions for later retrieval",
        d: "The credential store, which holds the account token between sessions",
      },
      answer: "a",
      explanation:
        "Dedicated debugging tools run the same PUBs against an efficient ideal reference and report figures of merit, which is exactly the intended pre-flight check. Drawing shows structure rather than behavior, and tagging and credentials are organizational and authentication concerns.",
      tags: ["debugging", "analysis", "workflow", "simulation"],
      concept: "Ideal-reference debugging",
      objective: "Validate a workload before hardware execution.",
      refs: [NEAT, DEBUG_TOOLS],
    },
    {
      id: "s7-018",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "Why is it worth recording these two values alongside the numbers a job returned?",
      code:
        "record = {\n    \"backend\": job.backend().name,\n    \"ran_at\": job.metrics()[\"timestamps\"][\"running\"],\n}",
      codeStatus: "illustrative",
      choices: {
        a: "Calibration drifts, so results are only interpretable in the context of where and when",
        b: "The service deletes any results whose submission carried no timestamp",
        c: "The recorded time determines how the outcome bitstrings are ordered",
        d: "The recorded name is needed before the returned counts can be decoded",
      },
      answer: "a",
      explanation:
        "Error rates change between calibrations, so two runs of the same circuit on the same device weeks apart are not directly comparable without that context. Results are retained regardless of local bookkeeping, bit ordering follows a fixed convention rather than a timestamp, and counts decode without needing the backend's name.",
      tags: ["metadata", "reproducibility", "analysis", "hardware-results"],
      concept: "Provenance of results",
      objective: "Explain what context results require.",
      refs: [QPU_INFO, MONITOR],
      seconds: 70,
    },
    {
      id: "s7-019",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "Two backends run the same compiled circuit; one gives the ideal outcome 82 percent of the time, the other 79 percent, each with 4096 shots. Can you conclude the first device is better for this circuit?",
      choices: {
        a: "Not from this alone: the gap clears sampling noise but one circuit proves little",
        b: "Yes, because 82 percent is plainly larger than 79 percent on the same workload",
        c: "No, because a three-point gap is smaller than the sampling uncertainty here",
        d: "Yes, because raising the shot count would resolve any remaining ambiguity",
      },
      answer: "a",
      explanation:
        "The standard error on each proportion is under one percentage point, so the three-point gap does clear sampling noise and is not smaller than the uncertainty. What it does not establish is a general ranking: one circuit at one moment reflects that circuit's layout and the current calibration, so concluding simply that 82 percent beats 79 percent overreaches. Raising the shot count would sharpen this particular comparison without making it representative of the devices.",
      mistake:
        "Generalizing from a single circuit on a single calibration to a claim about device quality.",
      tags: ["analysis", "hardware-results", "shots", "reproducibility"],
      concept: "Statistical versus scientific significance",
      objective: "Draw appropriately limited conclusions from comparisons.",
      refs: [MITIGATION_OVERVIEW, QPU_INFO],
    },
    {
      id: "s7-020",
      difficulty: "hard",
      type: "concept",
      question:
        "Why is a compiled circuit, rather than the original abstract circuit, the right reference when explaining hardware results?",
      choices: {
        a: "Compilation permutes qubits and inserts routing, so that form is what actually ran",
        b: "The abstract circuit cannot be simulated once it has been compiled once",
        c: "Compiled circuits always contain fewer gates than the version written by hand",
        d: "The abstract circuit contains no measurements until compilation adds them",
      },
      answer: "a",
      explanation:
        "Layout and routing change which physical qubits hold which logical values and add extra entangling operations, so only the compiled form explains both the observed bit mapping and the observed error level. The abstract circuit simulates perfectly well, compilation usually adds gates rather than removing them, and measurements are preserved.",
      tags: ["analysis", "transpilation", "hardware-results"],
      concept: "Compiled circuit as the reference",
      objective: "Choose the correct baseline for explaining results.",
      refs: [TRANSPILE, LOCAL_SIM],
    },
    {
      id: "s7-021",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A long job's execution spans show that the first quarter of the shots produced noticeably different statistics than the rest. What is the most useful interpretation?",
      choices: {
        a: "Conditions may have changed mid-run, so each span should be examined before pooling",
        b: "The spans are a rendering artifact of the metadata and can safely be ignored",
        c: "The submitted circuit changed part way through the job's execution",
        d: "The shot budget was exceeded, which truncated the later part of the run",
      },
      answer: "a",
      explanation:
        "Spans exist precisely so that time-dependent behavior such as drift or a recalibration boundary can be detected, and pooling across a change would hide it. The circuit is fixed at submission and cannot change mid-job, and exceeding the budget would end the job rather than shift its statistics.",
      tags: ["metadata", "analysis", "hardware-results", "noise"],
      concept: "Detecting drift within a job",
      objective: "Use timing metadata to diagnose non-stationarity.",
      refs: [SPANS, MONITOR],
    },
    {
      id: "s7-022",
      difficulty: "hard",
      type: "debugging",
      question:
        "Results from a mid-circuit measurement register look uncorrelated with the final register, though the circuit should correlate them. What is a likely cause?",
      choices: {
        a: "The registers were aggregated separately, which discards the shot-by-shot pairing",
        b: "Mid-circuit measurement outcomes are never recorded in the returned data",
        c: "The device is unable to correlate outcomes across two classical registers",
        d: "The two registers must be merged into one before the circuit is submitted",
      },
      answer: "a",
      explanation:
        "Aggregating each register on its own throws away which shot produced which pair, so any correlation vanishes by construction; the per-shot arrays must be combined index by index instead. Mid-circuit results are recorded in their own register, and no device-side or submission-side restriction prevents the correlation.",
      mistake:
        "Computing marginal counts separately and then trying to infer a joint distribution.",
      tags: ["result-interpretation", "bit-arrays", "debugging", "dynamic-circuits"],
      concept: "Preserving shot alignment",
      objective: "Diagnose lost correlations in multi-register results.",
      refs: [BIT_ARRAY, POST_SELECTION],
    },
    {
      id: "s7-023",
      difficulty: "hard",
      type: "concept",
      question:
        "What is the main limitation of using an ideal simulation as the sole reference for a large hardware experiment?",
      choices: {
        a: "Exact simulation becomes intractable exactly where verification matters most",
        b: "Simulations are unable to include measurements in the circuits they run",
        c: "Simulators use a different bit-ordering convention than the hardware does",
        d: "Simulated results are not reproducible from one run to the next",
      },
      answer: "a",
      explanation:
        "Simulation cost grows exponentially with qubit count, which is why large experiments rely on structured checks such as Clifford references, mirror circuits, or known symmetries instead. Simulators handle measurements, share Qiskit's ordering conventions, and are highly reproducible.",
      tags: ["simulation", "analysis", "hardware-results"],
      concept: "Limits of exact verification",
      objective: "Recognize when ideal simulation stops being available.",
      refs: [LOCAL_SIM, DEBUG_TOOLS],
    },
    {
      id: "s7-024",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "A result's metadata records a target precision that was not met for one estimate. What is the appropriate response?",
      choices: {
        a: "Report the achieved uncertainty, and rerun with a tighter target if needed",
        b: "Report the requested target as though it were the achieved uncertainty",
        c: "Discard the whole result, since one estimate fell short of its target",
        d: "Assume the reported metadata is wrong and ignore the shortfall entirely",
      },
      answer: "a",
      explanation:
        "The achieved standard error describes the data you actually have, so it is what should be reported and what determines whether a rerun is warranted. Quoting the requested target instead would overstate the accuracy, discarding the entire result throws away valid data for one shortfall, and dismissing the metadata as wrong ignores the very reporting that made the shortfall visible.",
      tags: ["metadata", "standard-errors", "analysis", "estimator-v2"],
      concept: "Achieved versus requested precision",
      objective: "Report uncertainty honestly from metadata.",
      refs: [ESTIMATOR_IO, PRIMITIVE_IO],
    },
    {
      id: "s7-025",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A team reports that mitigation improved their result from 0.61 to 0.79 against an ideal value of 0.80, using one circuit. What caveat matters most before generalizing?",
      choices: {
        a: "One circuit with a known answer cannot show mitigation works where it is unknown",
        b: "No caveat is needed, because mitigation improves accuracy in every situation",
        c: "The improvement is far too small to be worth the extra device time it costs",
        d: "Mitigated values may not be compared against ideal values at all",
      },
      answer: "a",
      explanation:
        "Validating on a case whose answer you already know is necessary but not sufficient: mitigation quality depends on circuit structure, depth, and how well the learned noise model transfers. The improvement here is large rather than too small to matter, and comparing a mitigated value against an ideal one is entirely legitimate, so neither of those is the caveat; the limitation is the scope of the evidence, which is why claiming mitigation always works is unjustified.",
      mistake:
        "Generalizing mitigation accuracy from a single verifiable circuit.",
      tags: ["error-mitigation", "analysis", "hardware-results"],
      concept: "Scope of mitigation validation",
      objective: "Reason about the limits of a validation experiment.",
      refs: [MITIGATION_OVERVIEW, DEBUG_TOOLS],
    },
    {
      id: "s7-026",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You must archive an experiment so a colleague can reproduce your analysis without device access. What should the archive contain?",
      choices: {
        a: "Job ids, compiled circuits, options, backend and timestamp, and the downloaded data",
        b: "Only the final plot, since it summarizes everything the analysis concluded",
        c: "Only the abstract circuits together with the final reported numbers",
        d: "Only the job identifiers, since everything else can be regenerated later",
      },
      answer: "a",
      explanation:
        "Reproducing an analysis needs the raw data plus enough provenance to interpret it, and identifiers alone are insufficient for a colleague without access to the same account. A plot or a summary number cannot be re-analyzed, and abstract circuits omit the compilation that determined what ran.",
      tags: ["reproducibility", "workflow", "analysis", "metadata"],
      concept: "Archiving an experiment",
      objective: "Determine what a reproducible archive requires.",
      refs: [SAVE_JOBS, MONITOR],
    },
    {
      id: "s7-027",
      difficulty: "hard",
      type: "concept",
      question:
        "Why does averaging results from two runs on the same backend not remove systematic device error?",
      choices: {
        a: "Systematic error is a bias shared by both runs, so averaging reduces only the random component",
        b: "Averaging is not defined for quantum results",
        c: "The two runs would use different circuits",
        d: "Systematic error cancels only if the runs use different shot counts",
      },
      answer: "a",
      explanation:
        "Repetition reduces variance because random fluctuations are independent, but a bias present in every run survives averaging unchanged; removing it requires mitigation or a different device configuration. Averaging is perfectly well defined, and shot budgets have no bearing on bias.",
      tags: ["analysis", "noise", "error-mitigation", "hardware-results"],
      concept: "Averaging reduces variance, not bias",
      objective: "Explain why repetition cannot fix systematic error.",
      refs: [MITIGATION_OVERVIEW, LOCAL_SIM],
    },
    {
      id: "s7-028",
      difficulty: "hard",
      type: "result-interpretation",
      question:
        "Post-selecting on a heralding register keeps 15 percent of shots, and the retained distribution matches the ideal one far better than the full data. What conclusion is warranted?",
      choices: {
        a: "A failure mode was filtered out, but uncertainty must be recomputed from what remains",
        b: "The device behaved noiselessly for the subset of shots that were retained",
        c: "The discarded shots are proven to have been readout errors specifically",
        d: "Selecting a subset of shots leaves the reported uncertainty unchanged",
      },
      answer: "a",
      explanation:
        "Selecting on a herald removes shots where a detectable failure occurred, which genuinely improves the retained distribution, but the uncertainty must now be computed from 15 percent of the original sample. Residual undetected error remains, and the herald does not identify the specific cause of the discarded shots.",
      mistake:
        "Reporting post-selected results with the uncertainty of the full shot count.",
      tags: ["post-selection", "analysis", "shots", "hardware-results"],
      concept: "Uncertainty after post-selection",
      objective: "Interpret post-selected data correctly.",
      refs: [POST_SELECTION, SAMPLER_IO],
    },
    {
      id: "s7-029",
      difficulty: "hard",
      type: "debugging",
      question:
        "A stored job identifier returns results whose register field names do not match the analysis script. What is the most likely cause?",
      choices: {
        a: "That job's circuit declared its classical registers under different names",
        b: "The service renamed the stored result fields some time after the job ran",
        c: "The identifier was mistyped, yet still resolved to a different stored job",
        d: "Field names depend on the version of the client doing the retrieval",
      },
      answer: "a",
      explanation:
        "Results are frozen snapshots of what was submitted, so an archived job reflects the circuit as it was then, and later refactoring of register names breaks scripts written for the new form. The service does not rename fields in stored results, a mistyped identifier fails to resolve rather than resolving to something else, and field names come from the stored data rather than from the retrieving client's version.",
      mistake:
        "Assuming archived results follow the current version of the circuit code.",
      tags: ["job-retrieval", "debugging", "result-object", "registers"],
      concept: "Archived results are immutable snapshots",
      objective: "Diagnose mismatches between old results and new code.",
      refs: [SAVE_JOBS, DATA_BIN],
    },
    {
      id: "s7-030",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative description of how to retrieve and inspect previously submitted jobs. Which source is most direct?",
      choices: {
        a: "The job monitoring and saved-jobs guides",
        b: "The circuit library reference",
        c: "The bit-ordering guide",
        d: "The transpiler stages guide",
      },
      answer: "a",
      explanation:
        "Those guides cover querying, monitoring, and retrieving jobs, which is exactly what was asked. The other three cover prebuilt circuits, ordering conventions, and compilation stages.",
      tags: ["documentation", "job-retrieval"],
      concept: "Locating job-retrieval documentation",
      objective: "Find authoritative documentation on job handling.",
      refs: [MONITOR, SAVE_JOBS],
    },
    {
      id: "s7-031",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "An analysis pools results from three jobs that ran on the same backend over two weeks. What is the strongest objection?",
      choices: {
        a: "Calibration may have changed, so the samples may not share one distribution",
        b: "Results produced by separate jobs can never be combined into one dataset",
        c: "The three jobs would each have used a different bit-ordering convention",
        d: "Combining datasets always reduces the statistical power of the analysis",
      },
      answer: "a",
      explanation:
        "Pooling assumes the samples share a distribution, and recalibration over two weeks makes that questionable, so per-job statistics should be compared before combining. Combining is legitimate when the assumption holds, ordering conventions are stable, and pooling normally increases rather than decreases statistical power.",
      tags: ["analysis", "reproducibility", "hardware-results", "noise"],
      concept: "Pooling across calibrations",
      objective: "Evaluate the validity of combining datasets.",
      refs: [QPU_INFO, MONITOR],
    },
    {
      id: "s7-032",
      difficulty: "hard",
      type: "concept",
      question:
        "What does it mean that primitive results preserve the order of submitted workloads even when some fail?",
      choices: {
        a: "Indexed access stays reliable, so a failure raises rather than shifting entries",
        b: "Failed workloads are removed, so later results shift up one position each",
        c: "Results come back sorted so that the successful workloads appear first",
        d: "Failures are replaced by zeros, with nothing to indicate the substitution",
      },
      answer: "a",
      explanation:
        "Positional correspondence is a contract, which is what makes indexing safe: a failure surfaces as an error for the job rather than silently shifting later entries up one position. Nothing is sorted by success status, and substituting zeros without any indication would be worse still, since the corruption would be invisible to the analysis that follows.",
      tags: ["result-object", "pubs", "analysis"],
      concept: "Order preservation in results",
      objective: "Rely on result ordering when analyzing multi-PUB jobs.",
      refs: [PRIMITIVE_IO, PRIM_RESULT],
    },
  ],
);
