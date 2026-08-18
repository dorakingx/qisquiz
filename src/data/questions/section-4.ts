import { defineSection } from "./define";
import { api, guide } from "./refs";

const EXEC_MODES = guide("execution-modes");
const CHOOSE_MODE = guide("choose-execution-mode");
const SESSION_GUIDE = guide("run-jobs-session");
const BATCH_GUIDE = guide("run-jobs-batch");
const MODES_FAQ = guide("execution-modes-faq");
const RUNTIME_PRIMITIVES = guide("qiskit-runtime-primitives");
const MONITOR = guide("monitor-job");
const JOB_LIMITS = guide("job-limits");
const MAX_TIME = guide("max-execution-time");
const MINIMIZE = guide("minimize-time");
const ESTIMATE_TIME = guide("estimate-job-run-time");
const QPU_INFO = guide("qpu-information");
const REPRESENT = guide("represent-quantum-computers");
const BACKEND_V2 = guide("qiskit-backendv1-to-v2");
const LOCAL_TESTING = guide("local-testing-mode");
const AER = guide("simulate-with-qiskit-aer");
const LOCAL_SIM = guide("local-simulators");
const FAIR_SHARE = guide("fair-share-scheduler");
const JOB_TAGS = guide("add-job-tags");
const SAVE_JOBS = guide("save-jobs");
const CLOUD_SETUP = guide("cloud-setup");
const SAVE_CREDS = guide("save-credentials");
const DEBUG_JOBS = guide("debug-qiskit-runtime-jobs");
const DYNAMIC = guide("execute-dynamic-circuits");
const TRANSPILE = guide("transpile");
const SERVICE = api("qiskit-ibm-runtime/qiskit-runtime-service");
const SESSION_API = api("qiskit-ibm-runtime/session");
const BATCH_API = api("qiskit-ibm-runtime/batch");
const JOB_API = api("qiskit-ibm-runtime/runtime-job-v2");
const SAMPLER_API = api("qiskit-ibm-runtime/sampler-v2");
const FAKE_PROVIDER = api("qiskit-ibm-runtime/fake-provider");
const TARGET = api("qiskit/qiskit.transpiler.Target");

/**
 * Section 4 — Run quantum circuits (official weight 15%).
 * Target: 48 questions.
 */
export const SECTION_4_QUESTIONS = defineSection(
  { section: 4, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s4-001",
      difficulty: "easy",
      type: "concept",
      question:
        "Which object is the entry point for listing IBM Quantum backends, submitting primitive workloads, and retrieving past jobs?",
      choices: {
        a: "The Qiskit Runtime service client",
        b: "A QuantumCircuit instance",
        c: "A SparsePauliOp observable",
        d: "A transpiler pass manager",
      },
      answer: "a",
      explanation:
        "The service client authenticates against the platform and exposes backends, jobs, and account information. A circuit is a program, an observable describes a measurement quantity, and a pass manager compiles circuits; none of them talk to the service.",
      tags: ["runtime", "service"],
      concept: "Runtime service entry point",
      objective: "Identify the client used to reach IBM Quantum resources.",
      refs: [SERVICE, CLOUD_SETUP],
    },
    {
      id: "s4-002",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "Which part of the backend does this pipeline read in order to decide which instructions it is allowed to emit?",
      code:
        "from qiskit.transpiler import generate_preset_pass_manager\n\npm = generate_preset_pass_manager(optimization_level=1, backend=backend)\nisa = pm.run(qc)",
      codeStatus: "illustrative",
      choices: {
        a: "Its target, which lists supported instructions and the qubits each may act on",
        b: "Its name, from which the compiler infers a standard gate set",
        c: "Its job history, which records what previous circuits used",
        d: "Its shot limit, which bounds how many instructions a circuit may contain",
      },
      answer: "a",
      explanation:
        "The target is the machine-readable description of instructions, connectivity, and calibrated properties, and it is exactly what the compiler consumes. A name is only an identifier and implies no gate set, job history is execution metadata reached through the service, and a shot limit bounds repetitions rather than instructions.",
      tags: ["backend-v2", "target", "transpilation"],
      concept: "Backend capability description",
      objective: "Locate a backend's instruction and connectivity data.",
      refs: [TARGET, REPRESENT],
      seconds: 50,
    },
    {
      id: "s4-003",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "The job is still queued when the second line runs. What happens?",
      code: "job = sampler.run([pub])\nresult = job.result()",
      codeStatus: "illustrative",
      choices: {
        a: "The call blocks until the job finishes and then returns the data",
        b: "The call returns immediately with whatever partial data exists so far",
        c: "The call cancels the queued job and discards it",
        d: "The call resubmits the workload as a fresh job with the same inputs",
      },
      answer: "a",
      explanation:
        "Fetching a result waits for completion and then returns the data, raising if the job failed. No partial data is exposed while a job is pending, cancelling is a separate method that must be called explicitly, and nothing is resubmitted on your behalf.",
      tags: ["runtime-jobs", "job-lifecycle"],
      concept: "Blocking result retrieval",
      objective: "Describe how job results are obtained.",
      refs: [JOB_API, MONITOR],
    },
    {
      id: "s4-004",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does the object being inspected here represent?",
      code:
        "backend = service.backend(\"ibm_example\")\nprint(backend.name, backend.num_qubits)",
      codeStatus: "illustrative",
      choices: {
        a: "An execution target: a processor or simulator able to run supported circuits",
        b: "A rendering theme applied whenever circuits are drawn",
        c: "A container that stores the free parameters of a circuit",
        d: "A serialized program awaiting translation into a circuit",
      },
      answer: "a",
      explanation:
        "A backend represents something that can execute circuits, whether physical hardware or a simulator, and it carries the target describing what it supports. A drawing theme belongs to the visualization tools, parameter containers live on the circuit, and a serialized program is text that must be parsed before anything can run it.",
      tags: ["backend-v2", "hardware-execution", "service"],
      concept: "Backend definition",
      objective: "Define what a backend represents.",
      refs: [REPRESENT, QPU_INFO],
    },
    {
      id: "s4-005",
      difficulty: "easy",
      type: "concept",
      question:
        "Which execution mode groups several independent jobs so they can be scheduled together without a dedicated interactive window?",
      choices: {
        a: "Batch mode",
        b: "Session mode",
        c: "Job mode",
        d: "Local testing mode",
      },
      answer: "a",
      explanation:
        "Batch mode submits a collection of jobs that do not depend on one another, letting the scheduler pipeline them efficiently. Session mode reserves an interactive window for dependent iterations, plain job mode submits one workload at a time, and local testing mode runs nothing on real hardware.",
      tags: ["batch-mode", "execution-modes"],
      concept: "Batch execution",
      objective: "Identify the mode for independent workloads.",
      refs: [BATCH_GUIDE, EXEC_MODES],
    },
    {
      id: "s4-006",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What kind of information does the second line print while the workload is still pending?",
      code: "job = sampler.run([pub])\nprint(job.status())",
      codeStatus: "illustrative",
      choices: {
        a: "Where the job sits in its lifecycle, such as queued, running, done, or failed",
        b: "The measurement counts collected so far during partial execution",
        c: "The number of instructions in the circuits that were submitted",
        d: "The usage allocation the account still has available this month",
      },
      answer: "a",
      explanation:
        "Status describes lifecycle position only, which is why it is cheap to poll. Partial measurement data is never exposed while a job runs, circuit metrics come from the circuit object rather than from the job, and the account's remaining allocation is separate billing information.",
      tags: ["job-monitoring", "job-lifecycle"],
      concept: "Job status semantics",
      objective: "Describe what job status reports.",
      refs: [MONITOR, JOB_API],
    },
    {
      id: "s4-007",
      difficulty: "easy",
      type: "concept",
      question:
        "What is the purpose of saving credentials to a local configuration file?",
      choices: {
        a: "Later sessions can construct the service client without passing a token in code",
        b: "It caches job results so they never need to be downloaded again",
        c: "It reserves dedicated hardware time",
        d: "It compiles circuits ahead of time",
      },
      answer: "a",
      explanation:
        "Saving an account stores the channel, token, and instance so scripts can create the client with no arguments, which keeps secrets out of source code. It does not cache results, reserve hardware, or perform compilation.",
      tags: ["runtime", "service", "setup"],
      concept: "Saved account configuration",
      objective: "Explain the role of stored credentials.",
      refs: [SAVE_CREDS, CLOUD_SETUP],
    },
    {
      id: "s4-008",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this call return?",
      code: 'from qiskit_ibm_runtime import QiskitRuntimeService\n\nservice = QiskitRuntimeService()\nbackend = service.least_busy(operational=True, simulator=False)',
      codeStatus: "illustrative",
      choices: {
        a: "The operational hardware backend with the shortest pending queue that the account can access",
        b: "The backend with the largest qubit count",
        c: "A simulator, because hardware is excluded by the arguments",
        d: "A list of every backend sorted by queue length",
      },
      answer: "a",
      explanation:
        "This helper filters to backends matching the criteria and returns the single one with the fewest pending jobs, which is the usual way to avoid a long wait. Excluding simulators means hardware is what remains rather than what is filtered out, qubit count is not the selection key, and a single backend is returned rather than a list.",
      tags: ["backend-selection", "runtime", "service"],
      concept: "Selecting a backend by queue",
      objective: "Choose a backend programmatically.",
      refs: [SERVICE, QPU_INFO],
    },
    {
      id: "s4-009",
      difficulty: "medium",
      type: "debugging",
      question: "This raises instead of running. What is wrong?",
      code:
        "from qiskit import QuantumCircuit\nfrom qiskit_ibm_runtime import SamplerV2 as Sampler\n\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()\n\nsampler = Sampler(mode=backend)\njob = sampler.run([(qc,)])",
      codeStatus: "intentional-error",
      choices: {
        a: "The circuit was never compiled, so its gates and wiring may not match the device",
        b: "The workload is missing a shot count, which every submission must state",
        c: "The circuit uses a bulk measurement helper, which hardware rejects",
        d: "The primitive needs an observable alongside the circuit in every workload",
      },
      answer: "a",
      explanation:
        "A device implements only its calibrated operations on coupled qubit pairs, so an abstract circuit must be run through a pass manager for that backend first. Shots fall back to a default when omitted, bulk measurement is entirely routine on hardware, and observables belong to the Estimator rather than to this primitive.",
      tags: ["isa-circuits", "runtime", "transpilation", "debugging"],
      concept: "ISA requirement for primitives",
      objective: "Diagnose a submission rejected for uncompiled circuits.",
      refs: [TRANSPILE, RUNTIME_PRIMITIVES],
      seconds: 70,
    },
    {
      id: "s4-010",
      difficulty: "medium",
      type: "code-behavior",
      question: "What difference should you expect between the two results?",
      code:
        "from qiskit.primitives import StatevectorSampler\nfrom qiskit_ibm_runtime import SamplerV2 as Sampler\n\nideal = StatevectorSampler().run([(isa,)]).result()\ndevice = Sampler(mode=backend).run([(isa,)]).result()",
      codeStatus: "illustrative",
      choices: {
        a: "The device data carries noise and device constraints; the ideal run is a clean baseline",
        b: "The device data matches the ideal distribution exactly once enough shots are used",
        c: "The ideal run needs a hardware target before it can produce any output",
        d: "The device run skips compilation, so only the ideal run needs a compiled circuit",
      },
      answer: "a",
      explanation:
        "A local simulation gives a controllable reference, while the device adds gate and readout error on top of sampling noise. Those systematic errors do not vanish with more shots, so an exact match is not expected. The local reference needs no hardware target at all, and hardware is the side that strictly requires a compiled circuit.",
      tags: ["hardware-execution", "simulation", "analysis", "noise"],
      concept: "Simulator versus hardware roles",
      objective: "Compare execution targets.",
      refs: [LOCAL_SIM, AER],
      seconds: 70,
    },
    {
      id: "s4-011",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does keeping the value produced on the first line make possible?",
      code:
        "job_id = job.job_id()\n\n# ... later, in a completely different process ...\nrecovered = service.job(job_id)\nresult = recovered.result()",
      codeStatus: "illustrative",
      choices: {
        a: "Fetching the results later from any authenticated session, once the job finishes",
        b: "Re-running the same workload automatically on a different backend",
        c: "Editing the circuits that were submitted before the job starts running",
        d: "Extending the execution time limit the job was submitted with",
      },
      answer: "a",
      explanation:
        "The identifier is a durable handle, so results survive a lost process or a browser reload and can be fetched from anywhere the account is authenticated. A submitted job is immutable: it cannot be moved to another backend, its circuits cannot be edited, and its limits are fixed at submission time.",
      tags: ["job-retrieval", "runtime-jobs"],
      concept: "Durable job handles",
      objective: "Explain why job identifiers should be stored.",
      refs: [SAVE_JOBS, MONITOR],
    },
    {
      id: "s4-012",
      difficulty: "easy",
      type: "workflow-selection",
      question:
        "What does running a workload this way let you do before touching real hardware?",
      code:
        "from qiskit_ibm_runtime import SamplerV2 as Sampler\nfrom qiskit_ibm_runtime.fake_provider import FakeAlgiers\n\nsampler = Sampler(mode=FakeAlgiers())\njob = sampler.run([(isa,)])",
      codeStatus: "executable",
      choices: {
        a: "Exercise the same primitive interface locally, against a snapshot of a real device",
        b: "Reserve a window of hardware time in advance of the real run",
        c: "Submit a job that jumps ahead of other users in the queue",
        d: "Compile circuits without needing any device description at all",
      },
      answer: "a",
      explanation:
        "A device snapshot carries a captured target and error model, so the workflow behaves much as it would on hardware while running on your own machine and consuming no quota. It reserves nothing and grants no queue priority, and compilation still needs a target, which the snapshot conveniently supplies.",
      tags: ["local-testing", "simulation", "runtime"],
      concept: "Local testing mode",
      objective: "Describe how to develop without hardware access.",
      refs: [LOCAL_TESTING, FAKE_PROVIDER],
    },
    {
      id: "s4-013",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "A variational algorithm submits an Estimator workload, waits for the result, updates its parameters, and repeats hundreds of times. Which execution mode fits best?",
      choices: {
        a: "Session mode",
        b: "Batch mode",
        c: "Plain job mode with one submission per iteration",
        d: "Local testing mode",
      },
      answer: "a",
      explanation:
        "Each iteration depends on the previous result, so the workload is inherently serial and benefits from a reserved interactive window that avoids re-queuing between steps. Batch mode assumes the jobs are independent and can be pipelined, which is false here. Plain job mode means queuing again every iteration, and local testing does not run on hardware at all.",
      mistake:
        "Choosing batch mode for iterations that depend on one another.",
      tags: ["session-mode", "execution-modes", "estimator-v2"],
      concept: "Sessions for iterative workloads",
      objective: "Match execution modes to workload dependency structure.",
      refs: [SESSION_GUIDE, CHOOSE_MODE],
    },
    {
      id: "s4-014",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You have 40 unrelated circuits, all ready to run, and want the shortest total wall-clock time. Which execution mode fits best?",
      choices: {
        a: "Batch mode",
        b: "Session mode",
        c: "One job per circuit submitted serially, waiting for each result",
        d: "A single job with all 40 circuits regardless of the backend's per-job limit",
      },
      answer: "a",
      explanation:
        "Independent workloads are exactly what batch mode is for: the scheduler can overlap classical processing of one job with quantum execution of the next. A session reserves an interactive window that serial dependency would justify but this workload does not need. Waiting for each result serializes everything, and ignoring the per-job circuit limit causes a rejection.",
      tags: ["batch-mode", "execution-modes", "workflow"],
      concept: "Batching independent workloads",
      objective: "Select the mode that minimizes total wall-clock time.",
      refs: [BATCH_GUIDE, MINIMIZE],
    },
    {
      id: "s4-015",
      difficulty: "medium",
      type: "concept",
      question:
        "Within an active session, how do your jobs interact with other users' jobs on the same backend?",
      choices: {
        a: "Your session holds the device for its window, so your jobs queue only against each other while it is active",
        b: "Your jobs are interleaved one for one with other users' jobs",
        c: "Your jobs bypass the queue permanently, even after the session ends",
        d: "Sessions have no effect on scheduling and only group jobs for reporting",
      },
      answer: "a",
      explanation:
        "A session grants an interactive window during which the device serves that session's jobs, so consecutive iterations avoid re-entering the general queue. The privilege lasts only while the session is active and is subject to timeouts. Sessions are a real scheduling construct, not merely a reporting label.",
      tags: ["session-mode", "execution-modes", "scheduling"],
      concept: "Session scheduling semantics",
      objective: "Explain how sessions affect queueing.",
      refs: [SESSION_GUIDE, EXEC_MODES],
    },
    {
      id: "s4-016",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does the mode argument establish in this construction?",
      code: "from qiskit_ibm_runtime import SamplerV2 as Sampler\n\nsampler = Sampler(mode=backend)",
      codeStatus: "illustrative",
      choices: {
        a: "Where and how the workload executes; a session or batch may be supplied instead",
        b: "Which optimization level the submitted circuits were compiled with",
        c: "Whether results come back as raw counts or as normalized probabilities",
        d: "How many shots each circuit in the workload should receive",
      },
      answer: "a",
      explanation:
        "The mode argument is the execution context: passing a backend runs in plain job mode, while passing a session or batch object places the work inside that context. Compilation happens beforehand, output format is fixed by the primitive, and shot counts are set through options or per-PUB values.",
      tags: ["runtime", "execution-modes", "sampler-v2"],
      concept: "Primitive execution context",
      objective: "Explain how a primitive is bound to an execution mode.",
      refs: [SAMPLER_API, EXEC_MODES],
      seconds: 50,
    },
    {
      id: "s4-017",
      difficulty: "medium",
      type: "code-behavior",
      question: "Why does a backend publish the number this prints?",
      code: "print(backend.max_circuits)",
      codeStatus: "illustrative",
      choices: {
        a: "Each job is a bounded unit of work, so oversized submissions are rejected and must be split",
        b: "It caps how many qubits any single circuit in the job may use",
        c: "It caps how many shots each circuit in the job may request",
        d: "It caps how many free parameters a submitted circuit may declare",
      },
      answer: "a",
      explanation:
        "This bound limits what the control electronics load and execute in one pass; exceeding it fails the submission, so large workloads are split across jobs, often inside a batch. Qubit width is bounded by the device size, shot budgets are governed by separate limits, and parameter counts are not restricted this way.",
      tags: ["job-limits", "runtime", "hardware-execution"],
      concept: "Per-job circuit limits",
      objective: "Explain backend submission limits.",
      refs: [JOB_LIMITS, QPU_INFO],
    },
    {
      id: "s4-018",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does this setting protect against?",
      code: "estimator.options.max_execution_time = 1800",
      codeStatus: "illustrative",
      choices: {
        a: "A job occupying the device indefinitely; it is terminated once the limit is reached",
        b: "The queue in front of the job growing beyond a fixed length",
        c: "Circuits that exceed the number of qubits the device provides",
        d: "Results being downloaded more than once from the same job",
      },
      answer: "a",
      explanation:
        "The limit bounds how long a workload may hold the device, after which it is cancelled, which protects both your allocation and shared access. Queue length is a scheduling matter outside your control, circuit width is validated at submission, and results may be downloaded as often as you like.",
      tags: ["max-execution-time", "job-limits", "runtime"],
      concept: "Execution time limits",
      objective: "Explain the purpose of execution time caps.",
      refs: [MAX_TIME, JOB_LIMITS],
    },
    {
      id: "s4-019",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this filtered query return?",
      code: 'backends = service.backends(min_num_qubits=100, operational=True, simulator=False)',
      codeStatus: "illustrative",
      choices: {
        a: "Accessible hardware backends with at least 100 qubits that are currently operational",
        b: "A single backend, selected by whichever has the shortest pending queue",
        c: "Every backend on the platform, because the filters are only advisory hints",
        d: "The jobs that have most recently run on large operational backends",
      },
      answer: "a",
      explanation:
        "This lists backends matching all supplied filters, restricted to what the account's instance can access. Selecting one by queue length is a different helper, filters are honored rather than ignored, and jobs are queried through a separate method.",
      tags: ["backend-selection", "runtime", "service"],
      concept: "Filtering available backends",
      objective: "Query backends by capability.",
      refs: [SERVICE, QPU_INFO],
      seconds: 50,
    },
    {
      id: "s4-020",
      difficulty: "medium",
      type: "concept",
      question:
        "How does the transition from the older backend interface to the version 2 interface change how circuits are compiled?",
      choices: {
        a: "Compilation reads a single target object instead of separate configuration and properties structures",
        b: "Compilation no longer needs any device information",
        c: "Circuits must be written directly in the native gate set by hand",
        d: "Only simulators can be compiled against",
      },
      answer: "a",
      explanation:
        "The newer interface consolidates gates, connectivity, durations, and error rates into one target that the transpiler consumes directly, replacing the older split between a configuration object and a properties object. Device information is still essential, hand-writing native gates is unnecessary, and hardware targets are fully supported.",
      tags: ["backend-v2", "target", "transpilation"],
      concept: "Version 2 backend interface",
      objective: "Describe how backend metadata reaches the transpiler.",
      refs: [BACKEND_V2, TARGET],
    },
    {
      id: "s4-021",
      difficulty: "medium",
      type: "debugging",
      question:
        "A submission is rejected with a message about unsupported instructions. What is the first thing to check?",
      choices: {
        a: "Whether the circuit was compiled against this specific backend's target",
        b: "Whether the shot count is too high",
        c: "Whether the observable uses too many Pauli terms",
        d: "Whether the account has saved credentials",
      },
      answer: "a",
      explanation:
        "Unsupported instructions mean the circuit contains gates the device does not implement, which is precisely what compiling against that backend's target fixes; note that a circuit compiled for a different device can fail the same way. Shot counts and observable size produce different errors, and missing credentials would prevent submission entirely rather than reject the circuit's contents.",
      mistake:
        "Reusing a circuit compiled for one backend on a different backend.",
      tags: ["isa-circuits", "debugging", "runtime", "transpilation"],
      concept: "Diagnosing instruction-set errors",
      objective: "Troubleshoot rejected hardware submissions.",
      refs: [TRANSPILE, DEBUG_JOBS],
    },
    {
      id: "s4-022",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You want to validate a full Runtime workflow, including realistic gate errors and connectivity, without consuming hardware time. What should you use?",
      choices: {
        a: "A device snapshot with realistic errors, driven through the same primitive interface",
        b: "A hardware backend configured to run the workload with a single shot",
        c: "An exact statevector calculation with the measurements removed",
        d: "A character-based drawing of the circuit after it has been compiled",
      },
      answer: "a",
      explanation:
        "Device snapshots carry a real target and noise characteristics, so compilation and execution behave much as they would on hardware while running locally. Submitting to hardware still consumes quota, an ideal statevector omits the very effects being tested, and a drawing cannot exercise the workflow.",
      tags: ["local-testing", "simulation", "workflow"],
      concept: "Snapshot-based testing",
      objective: "Validate a workflow without hardware access.",
      refs: [FAKE_PROVIDER, LOCAL_TESTING],
    },
    {
      id: "s4-023",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "Classical post-processing after the marked line runs for far longer than the interactive timeout. What happens to the reserved window?",
      code:
        "with Session(backend=backend) as session:\n    sampler = Sampler(mode=session)\n    result = sampler.run([pub]).result()\n\n    # ... twenty minutes of classical analysis, no submissions ...\n\n    sampler.run([next_pub])",
      codeStatus: "illustrative",
      choices: {
        a: "It closes, so the later submission goes back through the ordinary queue",
        b: "It stays reserved until the block exits, however long the pause lasts",
        c: "It is automatically converted into a batch for the remaining work",
        d: "Results already returned inside the window are discarded when it lapses",
      },
      answer: "a",
      explanation:
        "Idle windows are released so the device is not held while nothing runs; later work then queues normally. Reserving indefinitely would waste shared capacity, no automatic conversion to a batch occurs, and results already produced remain retrievable by their job identifiers.",
      tags: ["session-mode", "execution-modes", "job-lifecycle"],
      concept: "Session timeouts",
      objective: "Explain what ends a reserved execution window.",
      refs: [SESSION_GUIDE, MODES_FAQ],
    },
    {
      id: "s4-024",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does using a session as a context manager guarantee about the jobs inside it?",
      code: "from qiskit_ibm_runtime import Session, SamplerV2 as Sampler\n\nwith Session(backend=backend) as session:\n    sampler = Sampler(mode=session)\n    job = sampler.run([pub])\n    result = job.result()",
      codeStatus: "illustrative",
      choices: {
        a: "They run within one interactive window, and the session is closed when the block exits",
        b: "They are automatically retried on failure",
        c: "They are guaranteed to produce identical results",
        d: "They are compiled automatically for the backend",
      },
      answer: "a",
      explanation:
        "The context manager scopes the session's lifetime: work submitted inside shares the window, and leaving the block closes it so the device is released promptly. No retry, determinism, or compilation behavior is implied; circuits must still arrive already compiled.",
      tags: ["session-mode", "runtime", "execution-modes"],
      concept: "Session lifetime management",
      objective: "Describe how session scope is managed in code.",
      refs: [SESSION_API, SESSION_GUIDE],
      seconds: 70,
    },
    {
      id: "s4-025",
      difficulty: "medium",
      type: "concept",
      question:
        "Why can a job's queue position change over time even when nothing about the job changes?",
      choices: {
        a: "Scheduling balances usage across accounts, so relative priority shifts over time",
        b: "Queued jobs are deliberately reordered at random on a fixed interval",
        c: "Queue position is recomputed from the depth of the submitted circuits",
        d: "Position moves only when the submitted circuits are recompiled",
      },
      answer: "a",
      explanation:
        "A fair-share scheduler weighs recent usage across users and instances, so a position is a snapshot rather than a fixed slot. It is not random, circuit depth does not drive priority, and a submitted job cannot be recompiled.",
      tags: ["scheduling", "job-monitoring", "runtime"],
      concept: "Fair-share scheduling",
      objective: "Explain variability in queue position.",
      refs: [FAIR_SHARE, MONITOR],
    },
    {
      id: "s4-026",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does setting this make possible later?",
      code:
        "sampler.options.environment.job_tags = [\"vqe-sweep-7\"]\njob = sampler.run(pubs)",
      codeStatus: "illustrative",
      choices: {
        a: "Filtering job history so every submission from one campaign can be found again",
        b: "Raising the scheduling priority of the labelled submissions",
        c: "Changing the structure in which the results are returned",
        d: "Extending the execution time limit for the labelled submissions",
      },
      answer: "a",
      explanation:
        "These labels are searchable metadata, which makes it practical to find all jobs belonging to one study among hundreds of submissions. They carry no scheduling weight, do not alter result structure, and have no bearing on execution limits.",
      tags: ["job-monitoring", "runtime-jobs", "workflow"],
      concept: "Job tagging",
      objective: "Explain how job metadata supports organization.",
      refs: [JOB_TAGS, MONITOR],
      seconds: 50,
    },
    {
      id: "s4-027",
      difficulty: "medium",
      type: "code-behavior",
      question: "What does the figure printed here account for?",
      code: "job = sampler.run(pubs)\nprint(job.usage_estimation)",
      codeStatus: "illustrative",
      choices: {
        a: "Circuits, shot counts, and per-shot overheads, but not time spent waiting in the queue",
        b: "Total wall-clock time from submission to result, including any queue wait",
        c: "The time already spent compiling the circuits on the local machine",
        d: "When the device's next scheduled calibration window will begin",
      },
      answer: "a",
      explanation:
        "The estimate covers quantum execution time, which is what counts against usage, and deliberately excludes queueing because that depends on other users. Local compilation happens before submission and is never billed, and calibration schedules are separate operational information.",
      tags: ["runtime", "job-monitoring", "usage"],
      concept: "Run-time estimation",
      objective: "Interpret pre-submission time estimates.",
      refs: [ESTIMATE_TIME, MAX_TIME],
    },
    {
      id: "s4-028",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this retrieval pattern accomplish in a fresh Python process?",
      code: 'service = QiskitRuntimeService()\njob = service.job("d1abc2def3gh4ijk5lmn")\nresult = job.result()',
      codeStatus: "illustrative",
      choices: {
        a: "It reconnects to a previously submitted job and downloads its stored result",
        b: "It resubmits the same circuits and waits for a fresh execution",
        c: "It creates a new job with the given name",
        d: "It only works while the original process is still running",
      },
      answer: "a",
      explanation:
        "Results are stored server-side and keyed by job identifier, so any authenticated process can fetch them later. Nothing is re-executed, no job is created, and the original process need not be alive.",
      tags: ["job-retrieval", "runtime-jobs"],
      concept: "Retrieving stored results",
      objective: "Recover results after a process ends.",
      refs: [SERVICE, SAVE_JOBS],
    },
    {
      id: "s4-029",
      difficulty: "medium",
      type: "concept",
      question:
        "Which capability must a backend advertise before a circuit with mid-circuit conditional branches can run on it?",
      choices: {
        a: "Support for classical control flow in its target",
        b: "A minimum of 100 qubits",
        c: "Fractional gate support",
        d: "An available session window",
      },
      answer: "a",
      explanation:
        "Feed-forward requires the control electronics to evaluate a measurement and act within coherence time, and that capability is advertised through the target's supported operations. Qubit count, fractional gates, and session availability are unrelated to whether branching is possible.",
      tags: ["dynamic-circuits", "backend-v2", "target"],
      concept: "Control-flow capability",
      objective: "Check backend support for dynamic circuits.",
      refs: [DYNAMIC, TARGET],
    },
    {
      id: "s4-030",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "You must reproduce a colleague's hardware run as closely as possible. Which details matter most to record alongside the results?",
      choices: {
        a: "Backend name, compiled circuit, transpiler seed, shot count, and the primitive options used",
        b: "The exact wall-clock time each stage of the local script took to run",
        c: "The order in which the circuits were drawn before submission",
        d: "The number of times the analysis notebook was re-executed locally",
      },
      answer: "a",
      explanation:
        "Reproducibility depends on which device ran the work, exactly which compiled circuit was submitted, how the stochastic compilation was seeded, and the statistical and mitigation settings. Local wall-clock timings, drawing order, and how often a notebook was re-executed describe the host session rather than what the device executed, so none of them let a colleague reconstruct the run. Even with all of this recorded, calibration drift leaves some residual variation.",
      tags: ["reproducibility", "runtime", "workflow", "analysis"],
      concept: "Recording an experiment",
      objective: "Identify what must be captured for reproducibility.",
      refs: [MONITOR, TRANSPILE],
    },
    {
      id: "s4-031",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does executing against this object give you that a hand-built noise model would not?",
      code:
        "from qiskit_ibm_runtime.fake_provider import FakeAlgiers\n\nbackend = FakeAlgiers()",
      codeStatus: "executable",
      choices: {
        a: "A captured real device's connectivity and calibration data as the noise source",
        b: "Execution on the corresponding real processor rather than on your own machine",
        c: "A guarantee that readout error is excluded from the simulated results",
        d: "A description usable for execution but not for compiling circuits",
      },
      answer: "a",
      explanation:
        "A snapshot bundles a target and error model captured from one specific processor, so it is a noisy simulation configured from reality rather than from guesswork. Nothing is sent to the real device, readout error is a standard part of such models rather than excluded, and snapshots are used precisely because they carry a compilable target.",
      tags: ["local-testing", "simulation", "noise", "target"],
      concept: "Snapshot backends",
      objective: "Compare local noise modeling approaches.",
      refs: [FAKE_PROVIDER, AER],
      seconds: 50,
    },
    {
      id: "s4-032",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What is the effect of opening a batch context and submitting several jobs inside it?",
      code: "from qiskit_ibm_runtime import Batch, SamplerV2 as Sampler\n\nwith Batch(backend=backend) as batch:\n    sampler = Sampler(mode=batch)\n    jobs = [sampler.run([pub]) for pub in pubs]",
      codeStatus: "illustrative",
      choices: {
        a: "The jobs are grouped so the scheduler can pipeline them, and each still returns its own result",
        b: "The jobs are merged into a single job with one combined result",
        c: "Each job waits for the previous one to finish",
        d: "The jobs run on different backends automatically",
      },
      answer: "a",
      explanation:
        "Batching keeps the jobs distinct, each with its own handle and result, while allowing the scheduler to overlap their classical and quantum phases. There is no merging, no forced serialization, and no cross-backend distribution: a batch targets one backend.",
      tags: ["batch-mode", "execution-modes", "runtime"],
      concept: "Batch semantics",
      objective: "Predict how batched jobs behave.",
      refs: [BATCH_API, BATCH_GUIDE],
    },
    {
      id: "s4-033",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A workload has 200 independent circuits, and the backend accepts at most 100 circuits per job. What is the most effective submission strategy?",
      choices: {
        a: "Split into jobs that respect the per-job limit and submit them inside one batch",
        b: "Submit all 200 in a single job and let the service split them",
        c: "Open a session and submit them one circuit at a time",
        d: "Reduce the shot count so all 200 fit in one job",
      },
      answer: "a",
      explanation:
        "Splitting satisfies the hard per-job limit, and batching lets the scheduler pipeline the resulting jobs, which is the fastest route for independent work. The service rejects rather than silently splits an oversized job. A session is designed for dependent iterations and gains nothing here, and shot counts do not affect the circuit-count limit.",
      tags: ["batch-mode", "job-limits", "workflow", "runtime"],
      concept: "Splitting oversized workloads",
      objective: "Design a submission strategy under backend limits.",
      refs: [JOB_LIMITS, BATCH_GUIDE],
    },
    {
      id: "s4-034",
      difficulty: "hard",
      type: "concept",
      question:
        "Why does opening a session for a workload that is actually independent sometimes make total throughput worse?",
      choices: {
        a: "A reserved window serializes work, so independent jobs lose the pipelining of a batch",
        b: "Reserved windows lower the maximum shots each submitted job may request",
        c: "Reserved windows force every circuit to be recompiled before each iteration",
        d: "Reserved windows disable the error mitigation options that were configured",
      },
      answer: "a",
      explanation:
        "Sessions optimize for low latency between dependent steps, holding the device while your classical processing runs; with independent work that idle time is wasted, whereas a batch overlaps it with other jobs. Sessions do not change shot limits, compilation, or mitigation settings.",
      mistake:
        "Treating sessions as a general speed-up rather than a latency optimization for dependent work.",
      tags: ["session-mode", "batch-mode", "execution-modes", "analysis"],
      concept: "Session versus batch trade-off",
      objective: "Reason about throughput consequences of mode choice.",
      refs: [CHOOSE_MODE, MODES_FAQ],
    },
    {
      id: "s4-035",
      difficulty: "hard",
      type: "debugging",
      question:
        "A long-running job ends before producing results, and its status indicates cancellation rather than an error. What is the most likely cause?",
      choices: {
        a: "It exceeded the configured maximum execution time and was terminated",
        b: "The circuits contained a syntax error",
        c: "The observable had too many terms",
        d: "The result object was garbage collected",
      },
      answer: "a",
      explanation:
        "Hitting the execution-time ceiling terminates the job, which is reported as a cancellation rather than a program fault. Malformed circuits or oversized observables are rejected earlier or surface as errors, and client-side object lifetimes have no effect on a server-side job.",
      tags: ["max-execution-time", "debugging", "job-lifecycle"],
      concept: "Diagnosing cancelled jobs",
      objective: "Distinguish time-limit cancellation from failure.",
      refs: [MAX_TIME, DEBUG_JOBS],
    },
    {
      id: "s4-036",
      difficulty: "hard",
      type: "concept",
      question:
        "Why can two runs of the same compiled circuit on the same backend, a week apart, give measurably different results?",
      choices: {
        a: "Device calibration drifts over time, so gate and readout error rates differ between runs",
        b: "The compiled circuit is recompiled differently on each submission",
        c: "The service applies random gate substitutions",
        d: "Job identifiers influence the qubits used",
      },
      answer: "a",
      explanation:
        "Physical parameters drift and devices are recalibrated regularly, so the same instructions can carry different error rates on different days, which is why calibration timestamps are worth recording. An already compiled circuit is executed as submitted, no random substitution occurs, and identifiers are just labels.",
      tags: ["hardware-execution", "noise", "reproducibility", "analysis"],
      concept: "Calibration drift",
      objective: "Explain run-to-run variation on hardware.",
      refs: [QPU_INFO, MONITOR],
    },
    {
      id: "s4-037",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "An optimizer loop spends 5 seconds of classical computation between quantum evaluations, each of which takes 2 seconds of device time. What does using a session mainly buy, and what does it cost?",
      choices: {
        a: "It removes the queue wait between iterations, but the device sits idle during the classical work",
        b: "It removes the classical computation time from the total",
        c: "It parallelizes the iterations so total time drops proportionally",
        d: "It guarantees the same physical qubits are used every iteration",
      },
      answer: "a",
      explanation:
        "The benefit is latency: without a reserved window each iteration would re-enter the queue, which usually dwarfs both the classical and the quantum phases. The cost is that the window includes the idle classical stretches, which is exactly why long classical steps weaken the case for one. Classical computation is not eliminated, dependent iterations cannot be parallelized to shrink the total proportionally, and which physical qubits are used is a compilation decision rather than a scheduling one.",
      tags: ["session-mode", "execution-modes", "analysis", "workflow"],
      concept: "Cost and benefit of reserved windows",
      objective: "Quantify the trade-off of session execution.",
      refs: [SESSION_GUIDE, MINIMIZE],
    },
    {
      id: "s4-038",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "You want to compare a hardware result against an ideal baseline for the same compiled circuit. Which baseline is the most faithful comparison?",
      choices: {
        a: "Simulate the compiled circuit, so both runs execute the identical instruction sequence",
        b: "Simulate the original abstract circuit before compilation",
        c: "Compare against a different circuit that computes the same function",
        d: "Compare against a hardware run on a different backend",
      },
      answer: "a",
      explanation:
        "Compilation can permute qubits and insert routing operations, so the compiled circuit is what actually ran; simulating exactly that isolates noise as the only difference. Simulating the abstract circuit from before compilation conflates noise with the layout permutation, comparing against a different circuit that computes the same function changes the gate structure as well, and a run on a second backend changes both the noise and the layout at once.",
      mistake:
        "Comparing hardware output against a simulation of the uncompiled circuit and attributing the mismatch to noise.",
      tags: ["analysis", "simulation", "transpilation", "hardware-execution"],
      concept: "Controlled baselines",
      objective: "Design a fair simulator-hardware comparison.",
      refs: [LOCAL_SIM, TRANSPILE],
    },
    {
      id: "s4-039",
      difficulty: "hard",
      type: "concept",
      question:
        "What does it mean that a submitted job is immutable?",
      choices: {
        a: "Circuits, backend, and options are fixed at submission; changing them needs a new job",
        b: "The results may be downloaded exactly once and are then deleted",
        c: "A job cannot be cancelled once it has entered the queue",
        d: "The job identifier is regenerated each time the job is retrieved",
      },
      answer: "a",
      explanation:
        "Submission freezes the payload, which is what makes a job identifier a reliable record of exactly what ran. Results may be fetched repeatedly, queued jobs can be cancelled, and identifiers are stable.",
      tags: ["runtime-jobs", "job-lifecycle", "reproducibility"],
      concept: "Job immutability",
      objective: "Explain what can and cannot change after submission.",
      refs: [JOB_API, MONITOR],
    },
    {
      id: "s4-040",
      difficulty: "hard",
      type: "debugging",
      question:
        "Calling for a job's result raises an exception. What sequence of checks best identifies the cause?",
      choices: {
        a: "The job's status, then the failure message the service recorded for it",
        b: "The drawing of the circuit that was originally submitted to the device",
        c: "The version of the client library installed in the local environment",
        d: "The number of descriptive tags that were attached at submission time",
      },
      answer: "a",
      explanation:
        "Status distinguishes a failure from a cancellation or an unfinished job, the recorded message names the specific fault, and execution metadata shows what the device attempted. Redrawing the circuit visually tells you nothing about a server-side failure, resubmitting blindly with more shots wastes quota without diagnosing anything, and recreating the client with a new token only helps for authentication problems, which fail in a distinct way.",
      tags: ["debugging", "job-monitoring", "runtime-jobs"],
      concept: "Systematic job failure diagnosis",
      objective: "Troubleshoot a failed result retrieval.",
      refs: [DEBUG_JOBS, MONITOR],
    },
    {
      id: "s4-041",
      difficulty: "hard",
      type: "concept",
      question:
        "Code validated against a stored device model still fails when the same workload is submitted to the corresponding processor. Why?",
      choices: {
        a: "A snapshot is frozen, so the live device may have been recalibrated or changed since",
        b: "Snapshot backends model a different physical theory than the real processors",
        c: "Live devices reject circuits that have already been compiled for a target",
        d: "Snapshots always report more qubits than the processor they were taken from",
      },
      answer: "a",
      explanation:
        "A snapshot captures a target and error model at one moment; real devices evolve, so connectivity, available qubits, and calibrated operations can differ later. The physics being modeled is the same, live devices require compiled circuits rather than reject them, and a snapshot mirrors the device's size at capture time.",
      tags: ["local-testing", "backend-v2", "debugging", "hardware-execution"],
      concept: "Snapshot staleness",
      objective: "Explain limits of testing against device snapshots.",
      refs: [FAKE_PROVIDER, QPU_INFO],
    },
    {
      id: "s4-042",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A batch of 20 jobs is submitted, and one fails. What happens to the rest, and what should you do?",
      choices: {
        a: "The others proceed independently; retrieve their results and resubmit only the failed workload",
        b: "The whole batch is cancelled and must be resubmitted entirely",
        c: "The failed job is retried automatically until it succeeds",
        d: "The remaining results are discarded once any job fails",
      },
      answer: "a",
      explanation:
        "Batched jobs stay independent, each with its own lifecycle, so a single failure does not invalidate the rest and their results remain retrievable by identifier. There is no all-or-nothing rollback that cancels the whole group, no automatic retry loop, and nothing discards the results that already completed successfully.",
      tags: ["batch-mode", "job-lifecycle", "debugging", "runtime"],
      concept: "Failure isolation in batches",
      objective: "Reason about partial failure in grouped submissions.",
      refs: [BATCH_GUIDE, DEBUG_JOBS],
    },
    {
      id: "s4-043",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "Which factor most directly determines how much quantum execution time this submission consumes?",
      code:
        "sampler = Sampler(mode=backend)\njob = sampler.run([(isa_a,), (isa_b,)], shots=20000)",
      codeStatus: "illustrative",
      choices: {
        a: "The total shots across both circuits and how long one repetition of each takes",
        b: "The number of lines of Python in the script that submitted the workload",
        c: "How long the job waited in the queue before the device picked it up",
        d: "The total number of qubits the chosen device provides",
      },
      answer: "a",
      explanation:
        "Device time scales with how many repetitions are executed and how long each one takes, including reset and readout overhead. Queue waiting is explicitly excluded from usage, the size of the submitting script is irrelevant, and the device's total qubit count does not enter the calculation.",
      tags: ["usage", "runtime", "shots", "analysis"],
      concept: "What drives execution time",
      objective: "Identify the drivers of quantum resource usage.",
      refs: [ESTIMATE_TIME, MAX_TIME],
    },
    {
      id: "s4-044",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need the authoritative comparison of when to use job, session, and batch execution. Which source is most direct?",
      choices: {
        a: "The guide on choosing an execution mode",
        b: "The bit-ordering guide",
        c: "The circuit library reference",
        d: "The OpenQASM feature table",
      },
      answer: "a",
      explanation:
        "A dedicated guide compares the modes and gives selection criteria, which is exactly the question. Bit ordering covers conventions, the circuit library catalogues constructions, and the feature table describes language support.",
      tags: ["documentation", "execution-modes"],
      concept: "Locating execution-mode guidance",
      objective: "Find authoritative documentation on execution modes.",
      refs: [CHOOSE_MODE, EXEC_MODES],
    },
    {
      id: "s4-045",
      difficulty: "medium",
      type: "concept",
      question:
        "What role does the instance associated with a service client play?",
      choices: {
        a: "It determines which backends and usage allocation the account can access",
        b: "It selects the transpiler optimization level",
        c: "It sets the default shot count",
        d: "It chooses the result data format",
      },
      answer: "a",
      explanation:
        "An instance scopes access: which devices are visible and what allocation the work draws on. Compilation settings, shot budgets, and result structure are all controlled in code rather than by the account scope.",
      tags: ["runtime", "service", "setup"],
      concept: "Instances and access scope",
      objective: "Explain how account scope affects available resources.",
      refs: [CLOUD_SETUP, SERVICE],
    },
    {
      id: "s4-046",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "A workload is run twice: once passing the backend directly and once inside a batch. What differs?",
      code: "sampler_a = Sampler(mode=backend)\n\nwith Batch(backend=backend) as batch:\n    sampler_b = Sampler(mode=batch)",
      codeStatus: "illustrative",
      choices: {
        a: "Only how the jobs are scheduled; the circuits executed and the result structure are the same",
        b: "The batched version returns results in a different format",
        c: "The batched version applies error mitigation automatically",
        d: "The direct version cannot return more than one result",
      },
      answer: "a",
      explanation:
        "Execution mode is a scheduling concern: it changes queueing and pipelining, not what the device computes or how results are shaped, so the returned format is identical. Mitigation is configured through options regardless of mode rather than being applied automatically by batching, and plain job mode handles multi-workload submissions perfectly well, so it is not limited to a single result.",
      tags: ["execution-modes", "batch-mode", "runtime", "sampler-v2"],
      concept: "Scheduling versus semantics",
      objective: "Separate execution-mode effects from result semantics.",
      refs: [EXEC_MODES, SAMPLER_API],
    },
    {
      id: "s4-047",
      difficulty: "hard",
      type: "workflow-selection",
      question:
        "A team wants nightly regression runs comparing a circuit's behavior across releases, without spending hardware time on every run. What is the most defensible design?",
      choices: {
        a: "Nightly runs against a pinned snapshot, with occasional hardware runs as a check",
        b: "Nightly runs on live hardware, accepting the cost and the calibration drift",
        c: "Comparing only compiled gate counts, and never executing anything at all",
        d: "An ideal simulation nightly, treating any hardware deviation as a regression",
      },
      answer: "a",
      explanation:
        "A pinned snapshot makes nightly results comparable because the noise model does not drift, while periodic hardware runs guard against the snapshot growing stale. Nightly hardware runs are expensive and confounded by calibration drift, gate counts miss behavioral regressions, and treating all hardware deviation as regression mistakes ordinary noise for a defect.",
      tags: ["local-testing", "reproducibility", "workflow", "analysis"],
      concept: "Regression testing strategy",
      objective: "Design a sustainable validation workflow.",
      refs: [LOCAL_TESTING, FAKE_PROVIDER],
    },
    {
      id: "s4-048",
      difficulty: "hard",
      type: "debugging",
      question:
        "Why is this sequence unsafe, even when both devices have the same number of qubits?",
      code:
        "pm = generate_preset_pass_manager(optimization_level=2, backend=backend_a)\nisa = pm.run(qc)\n\nsampler = Sampler(mode=backend_b)\njob = sampler.run([(isa,)])",
      codeStatus: "intentional-error",
      choices: {
        a: "Physical qubit indices and native gates are device-specific, so the circuit may be rejected or meaningless",
        b: "Compiled circuits may only be submitted from the process that produced them",
        c: "The service recompiles on submission, so the original compilation is wasted effort",
        d: "Standard gates survive compilation, so only custom instructions cause trouble",
      },
      answer: "a",
      explanation:
        "Compilation bakes in physical qubit assignments and a particular calibrated gate set, and both differ between processors, so at best the submission is rejected and at worst it runs on unintended qubits. Nothing ties a compiled circuit to the process that made it, the service does not silently recompile, and standard gates are exactly what compilation translates away.",
      mistake:
        "Reusing a compiled circuit across backends because both are the same size.",
      tags: ["isa-circuits", "transpilation", "hardware-execution", "debugging"],
      concept: "Target-specific compilation",
      objective: "Explain why compiled circuits are not portable.",
      refs: [TRANSPILE, REPRESENT],
    },
  ],
);
