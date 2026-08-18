import { defineSection } from "./define";
import { OPENQASM_SPEC, api, guide } from "./refs";

const INTRO_QASM = guide("introduction-to-qasm");
const QASM3_INTEROP = guide("interoperate-qiskit-qasm3");
const QASM2_INTEROP = guide("interoperate-qiskit-qasm2");
const FEATURE_TABLE = guide("qasm-feature-table");
const CONTROL_FLOW = guide("classical-feedforward-and-control-flow");
const BIT_ORDERING = guide("bit-ordering");
const QASM3_API = api("qiskit/qasm3");
const QASM2_API = api("qiskit/qasm2");

/**
 * Section 8 — Operate with OpenQASM (official weight 6%).
 * Target: 20 questions.
 */
export const SECTION_8_QUESTIONS = defineSection(
  { section: 8, reviewedOn: "2026-08-18", qiskitVersion: "2.x" },
  [
    {
      id: "s8-001",
      difficulty: "easy",
      type: "concept",
      question:
        "A quantum assembly program opens with a statement declaring which version of the language it is written in. What does that statement look like?",
      choices: {
        a: "A bare version keyword followed by the major version number and a semicolon",
        b: "A Python import of the parsing package used to read the file",
        c: "A comment line giving the file name and the author",
        d: "A declaration of how many qubits the program will use",
      },
      answer: "a",
      explanation:
        "The header is a single statement naming the language and its major version, terminated like any other statement, so a parser can select the right grammar before reading anything else. A Python import belongs to host code rather than to the assembly language itself, comments carry no semantic weight, and register declarations come after the header rather than replacing it.",
      tags: ["openqasm-3", "syntax"],
      concept: "Version header",
      objective: "Recognize the structure of a quantum assembly program.",
      refs: [INTRO_QASM, OPENQASM_SPEC],
    },
    {
      id: "s8-002",
      difficulty: "easy",
      type: "debugging",
      question:
        "This program is rejected by a version 3 parser. Which lines are the problem?",
      code:
        "OPENQASM 3;\ninclude \"stdgates.inc\";\n\nqreg q[2];\ncreg c[2];\nh q[0];",
      codeStatus: "intentional-error",
      language: "openqasm",
      choices: {
        a: "The two register declarations, which use keywords from the earlier version",
        b: "The include line, which the newer version no longer supports",
        c: "The version header, which must name a minor version as well",
        d: "The gate call, which must name its argument without an index",
      },
      answer: "a",
      explanation:
        "The newer language treats quantum and classical storage as first-class types with their own declarations, replacing the older register keywords. The standard gate library is still included the same way, the header names only a major version, and indexing into a declared array is exactly how individual elements are addressed.",
      tags: ["openqasm-3", "data-types", "syntax", "debugging"],
      concept: "Quantum declarations",
      objective: "Compare declaration syntax across language versions.",
      refs: [INTRO_QASM, OPENQASM_SPEC],
      seconds: 50,
    },
    {
      id: "s8-003",
      difficulty: "easy",
      type: "concept",
      question:
        "Which Qiskit submodule provides the functions for reading and writing programs in the newer quantum assembly language?",
      choices: {
        a: "A submodule named after the language and its major version",
        b: "The visualization submodule",
        c: "The fake provider submodule",
        d: "The transpiler passes submodule",
      },
      answer: "a",
      explanation:
        "Serialization for each language version lives in its own submodule named after that version, so the older and newer grammars are handled by separate namespaces. The visualization submodule renders circuits, the fake provider supplies device snapshots for local testing, and transpiler passes transform circuits during compilation; none of them parse or emit assembly text.",
      tags: ["openqasm-3", "interoperability"],
      concept: "OpenQASM submodules",
      objective: "Locate the OpenQASM interoperability API.",
      refs: [QASM3_API, QASM3_INTEROP],
    },
    {
      id: "s8-004",
      difficulty: "easy",
      type: "code-behavior",
      question: "What distinguishes the two calls below?",
      code:
        "from qiskit import qasm3\n\ntext = qasm3.dumps(qc)\n\nwith open(\"program.qasm\", \"w\") as handle:\n    qasm3.dump(qc, handle)",
      codeStatus: "illustrative",
      choices: {
        a: "The first returns the program as a string; the second writes it to an open stream",
        b: "The first reads a program in; the second writes one out",
        c: "The first targets the older language version and the second the newer one",
        d: "They behave identically, and one is kept only for backward compatibility",
      },
      answer: "a",
      explanation:
        "The naming follows the long-standing Python serialization convention, where the trailing letter marks the string variant while the plain name targets a file or stream. Reading a program in is expressed by a different verb entirely, the language version is selected by which submodule you import, and the two variants genuinely differ in where the output goes.",
      mistake:
        "Reading the trailing letter as marking import rather than string output.",
      tags: ["openqasm-3", "export", "interoperability"],
      concept: "Serialization naming convention",
      objective: "Choose between string and stream serialization.",
      refs: [QASM3_API, QASM3_INTEROP],
    },
    {
      id: "s8-005",
      difficulty: "easy",
      type: "code-behavior",
      question:
        "What does the second line supply that the language core does not?",
      code: "OPENQASM 3;\ninclude \"stdgates.inc\";\n\nqubit q;\nh q;",
      codeStatus: "illustrative",
      language: "openqasm",
      choices: {
        a: "Definitions for the familiar named gates, only a few of which are built in",
        b: "The choice of backend on which the program will be executed",
        c: "The number of repetitions the program should be run for",
        d: "The declarations of the classical registers the program will use",
      },
      answer: "a",
      explanation:
        "Only a very small set of primitives is built into the language itself, so the standard library provides the gates programs actually use. Backend selection and repetition counts are execution concerns expressed outside the program text, and classical storage is declared explicitly in the program rather than pulled in by an include.",
      tags: ["openqasm-3", "gate-declarations", "syntax"],
      concept: "Standard gate library",
      objective: "Explain why programs include a gate library.",
      refs: [INTRO_QASM, OPENQASM_SPEC],
    },
    {
      id: "s8-006",
      difficulty: "easy",
      type: "code-behavior",
      question: "What does this OpenQASM 3 fragment do?",
      code: 'OPENQASM 3;\ninclude "stdgates.inc";\n\nqubit q;\nbit c;\nh q;\nc = measure q;\nif (c) {\n  x q;\n}',
      codeStatus: "illustrative",
      choices: {
        a: "Prepares a superposition, measures it, and flips the qubit only when the bit is set",
        b: "Prepares a superposition, measures it, and flips the qubit on every single shot",
        c: "Declares a second qubit named c and entangles it with the first qubit",
        d: "Measures the same qubit twice in a row and keeps only the second outcome",
      },
      answer: "a",
      explanation:
        "The conditional tests a classical bit written by the measurement, so the correction runs only on the branch where that bit is set, leaving the qubit in the ground state either way. It does not fire on every shot regardless of the outcome, the name used in the condition denotes classical storage rather than a second qubit to entangle with, and only one measurement appears anywhere in the program.",
      tags: ["openqasm-3", "classical-control", "dynamic-circuits"],
      concept: "Classical conditionals in OpenQASM 3",
      objective: "Read conditional execution in OpenQASM 3.",
      refs: [CONTROL_FLOW, OPENQASM_SPEC],
      seconds: 50,
    },
    {
      id: "s8-007",
      difficulty: "medium",
      type: "concept",
      question:
        "Which classical features does OpenQASM 3 add that OpenQASM 2 lacks?",
      choices: {
        a: "Richer classical types together with loops and multi-way branches",
        b: "The ability to declare quantum storage, which was previously impossible",
        c: "Support for measuring a qubit into classical storage",
        d: "The ability to define a named gate from a body of other gates",
      },
      answer: "a",
      explanation:
        "The newer version introduces sized integers, floats, booleans, angles, durations, and real control-flow constructs, which is what makes it suitable for dynamic circuits. Qubit declaration, measurement, and user-defined gates all existed in the earlier version.",
      tags: ["openqasm-3", "data-types", "classical-control"],
      concept: "OpenQASM 3 additions",
      objective: "Contrast the two OpenQASM versions.",
      refs: [INTRO_QASM, FEATURE_TABLE],
    },
    {
      id: "s8-008",
      difficulty: "medium",
      type: "code-completion",
      question:
        "The program should apply a Hadamard to each of the three qubits using a loop rather than three separate statements. Which construct belongs in the blank?",
      code: 'OPENQASM 3;\ninclude "stdgates.inc";\n\nqubit[3] q;\n_____ {\n  h q[i];\n}',
      codeStatus: "partial-completion",
      choices: {
        a: "for int i in [0:2]",
        b: "while (i < 3)",
        c: "if (i < 3)",
        d: "repeat 3 times",
      },
      answer: "a",
      explanation:
        "A typed loop variable ranging over an interval is the language's iteration construct and is the natural fit for a fixed count. A conditional loop would require the counter to be declared and updated by hand, a single conditional executes at most once, and no repeat keyword exists in the grammar.",
      tags: ["openqasm-3", "classical-control", "syntax"],
      concept: "Loops in OpenQASM 3",
      objective: "Select the correct iteration construct.",
      refs: [OPENQASM_SPEC, CONTROL_FLOW],
    },
    {
      id: "s8-009",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "What does this declaration establish?",
      code: "qubit[4] q;\nbit[4] c;",
      codeStatus: "illustrative",
      language: "openqasm",
      choices: {
        a: "A four-qubit array and a separate four-bit classical array, indexed independently",
        b: "Four qubits that are automatically measured into the bits",
        c: "A single qubit and a single bit, each repeated four times at run time",
        d: "Four qubits whose classical values are aliases of the qubit states",
      },
      answer: "a",
      explanation:
        "These are two independent sized arrays: one of quantum storage and one of classical storage, each addressed by index. No implicit measurement links them, the sizes are compile-time array lengths rather than repetitions, and classical bits hold measured outcomes rather than aliasing quantum state.",
      tags: ["openqasm-3", "data-types", "syntax"],
      concept: "Sized arrays",
      objective: "Read array declarations in OpenQASM 3.",
      refs: [OPENQASM_SPEC, INTRO_QASM],
    },
    {
      id: "s8-010",
      difficulty: "medium",
      type: "concept",
      question:
        "How is a custom gate defined in OpenQASM 3?",
      choices: {
        a: "A declaration naming its formal qubit arguments, followed by a body of statements",
        b: "A Python class that subclasses the framework's gate base class",
        c: "An assignment binding a matrix literal to a name in the program",
        d: "An import that pulls the definition in from the standard library only",
      },
      answer: "a",
      explanation:
        "The language provides a gate declaration form with named parameters and qubit arguments whose body is expressed in terms of other gates. Python class syntax belongs to Qiskit rather than to the assembly language, matrix literals are not part of a gate declaration, and user-defined gates need not come from the standard library.",
      tags: ["openqasm-3", "gate-declarations", "syntax"],
      concept: "User-defined gates",
      objective: "Recognize gate declaration syntax.",
      refs: [OPENQASM_SPEC, INTRO_QASM],
    },
    {
      id: "s8-011",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "A collaborator sends you an OpenQASM 3 program as a text string, and you want to run it through a Qiskit pass manager. What is the first step?",
      choices: {
        a: "Parse the string into a QuantumCircuit with the OpenQASM 3 importer",
        b: "Pass the string directly to the pass manager",
        c: "Convert the string to OpenQASM 2 first",
        d: "Send the string to the backend, which parses it",
      },
      answer: "a",
      explanation:
        "Qiskit tooling operates on circuit objects, so the text must be parsed before any pass manager can act on it. Downgrading to the older language would lose features, and the compilation step happens locally rather than on the device.",
      tags: ["openqasm-3", "import", "interoperability", "transpilation"],
      concept: "Importing before compiling",
      objective: "Sequence import and compilation correctly.",
      refs: [QASM3_INTEROP, QASM3_API],
      seconds: 70,
    },
    {
      id: "s8-012",
      difficulty: "medium",
      type: "concept",
      question:
        "Why does a program starting with a valid OpenQASM 3 version header still sometimes fail to import into Qiskit?",
      choices: {
        a: "The importer covers a subset, so unsupported constructs still cause failures",
        b: "Qiskit is unable to parse any program written in the newer language at all",
        c: "Every program must contain a measurement before it can be imported",
        d: "The header guarantees support, so a failure means the file is corrupted",
      },
      answer: "a",
      explanation:
        "Declaring a language version says nothing about which features a particular tool implements, and coverage of the specification is partial and evolving. Qiskit parses a wide range of programs rather than none, measurements are not required for a program to be importable, and a valid file can still use constructs the importer does not handle, so the header is no guarantee against a corrupted-looking failure.",
      mistake:
        "Treating the version header as a guarantee of full feature support.",
      tags: ["openqasm-3", "interoperability", "import", "debugging"],
      concept: "Partial language support",
      objective: "Explain why valid programs may not import.",
      refs: [FEATURE_TABLE, QASM3_INTEROP],
    },
    {
      id: "s8-013",
      difficulty: "medium",
      type: "workflow-selection",
      question:
        "When is exporting through this submodule, rather than the newer one, the right choice?",
      code: "from qiskit import qasm2\n\ntext = qasm2.dumps(qc)",
      codeStatus: "illustrative",
      choices: {
        a: "When an external tool accepts only that grammar and the circuit uses no newer features",
        b: "When the circuit relies on classical control flow, which this grammar handles better",
        c: "When the circuit carries free parameters, which only this grammar preserves",
        d: "When the circuit is destined for hardware, which requires this grammar",
      },
      answer: "a",
      explanation:
        "Compatibility with an existing toolchain is the usual motivation, and it is safe only when the circuit stays within the older language's expressive range. That grammar has weaker classical typing and control flow rather than stronger, it is the poorer choice for symbolic values, and hardware submission through Qiskit uses circuit objects rather than any particular text format.",
      tags: ["openqasm-3", "interoperability", "export"],
      concept: "Choosing an export format",
      objective: "Decide when the older language version is appropriate.",
      refs: [QASM2_INTEROP, QASM2_API],
    },
    {
      id: "s8-014",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A dynamic Qiskit circuit with a mid-circuit measurement and a conditional block is exported and then re-imported. The result differs structurally from the original. What is the most likely explanation?",
      choices: {
        a: "Control flow maps differently on each side, so semantics survive better than shape",
        b: "Export drops conditional blocks entirely, so the branch is lost on the way out",
        c: "Re-importing merges every classical register in the program into a single one",
        d: "The original circuit must have been invalid, since valid ones round-trip exactly",
      },
      answer: "a",
      explanation:
        "Serialization maps Qiskit's control-flow instructions onto language constructs and back, and the two representations do not correspond one to one, so the rebuilt circuit can differ in nesting or register handling while computing the same thing. Conditional blocks are exported rather than dropped entirely, classical registers are not silently merged into one, and a valid circuit is under no obligation to round-trip byte for byte.",
      mistake:
        "Expecting an exact structural round trip through a text format.",
      tags: ["openqasm-3", "interoperability", "dynamic-circuits", "export"],
      concept: "Semantic versus structural round trips",
      objective: "Reason about the fidelity of circuit serialization.",
      refs: [QASM3_INTEROP, FEATURE_TABLE],
    },
    {
      id: "s8-015",
      difficulty: "medium",
      type: "code-behavior",
      question:
        "Which convention governs how the keys of the returned mapping are written?",
      code:
        "from qiskit import qasm3\n\nqc = qasm3.loads(source)\nisa = pm.run(qc)\ncounts = sampler.run([(isa,)]).result()[0].data.c.get_counts()",
      codeStatus: "illustrative",
      choices: {
        a: "Qiskit's little-endian convention, whatever the source program looked like",
        b: "The order in which the source program declared its measurements",
        c: "Alphabetical order of the classical register names in the source",
        d: "The order in which the device physically performed the measurements",
      },
      answer: "a",
      explanation:
        "Once parsed, the program is an ordinary circuit, and its results follow Qiskit's display rules, so the lowest classical bit appears rightmost. Declaration order in the source decides which bit is which rather than how the string is rendered, register names affect where the data lives rather than its layout, and the physical measurement order has no effect on the printed form.",
      mistake:
        "Assuming an imported program keeps its source language's display conventions.",
      tags: ["openqasm-3", "little-endian", "result-interpretation", "import"],
      concept: "Conventions after import",
      objective: "Connect imported programs to Qiskit result conventions.",
      refs: [BIT_ORDERING, QASM3_INTEROP],
      seconds: 70,
    },
    {
      id: "s8-016",
      difficulty: "hard",
      type: "debugging",
      question:
        "This program fails to import. What is the defect?",
      code: 'OPENQASM 3;\n\nqubit q;\nbit c;\nh q;\nc = measure q;',
      codeStatus: "intentional-error",
      choices: {
        a: "The standard gate library is never included, so the named gate is undefined",
        b: "Classical bits must be declared before qubits",
        c: "Measurement results cannot be assigned to a bit",
        d: "A program must declare at least two qubits",
      },
      answer: "a",
      explanation:
        "Only a minimal set of operations is built into the language, so the familiar named gates must be brought in from the standard library; without the include, the gate name has no definition. Declaration order between classical and quantum storage is unconstrained, assignment-style measurement is the normal form, and single-qubit programs are legal.",
      mistake:
        "Omitting the standard gate include and then blaming the gate syntax.",
      tags: ["openqasm-3", "gate-declarations", "debugging", "import"],
      concept: "Missing gate library",
      objective: "Diagnose an undefined-gate import failure.",
      refs: [INTRO_QASM, OPENQASM_SPEC],
    },
    {
      id: "s8-017",
      difficulty: "medium",
      type: "debugging",
      question:
        "What should you check before relying on the text this produces?",
      code:
        "from qiskit import QuantumCircuit, qasm3\nfrom qiskit.circuit import Parameter\n\ntheta = Parameter(\"theta\")\nqc = QuantumCircuit(1)\nqc.ry(theta, 0)\ntext = qasm3.dumps(qc)",
      codeStatus: "illustrative",
      choices: {
        a: "Whether the format and the consuming tool can express a symbolic value at all",
        b: "Nothing, because symbolic values are always replaced by zero on export",
        c: "Nothing, because export assigns a random value to each free symbol",
        d: "Nothing, because a circuit carrying free symbols can never be exported",
      },
      answer: "a",
      explanation:
        "Whether a symbolic angle survives depends on the language version and on what the receiving tool accepts, so binding first is the safe route when in doubt. Values are never silently replaced by zero or by a random number, and export of a symbolic circuit is possible where the format and consumer support it, so it is not categorically forbidden.",
      tags: ["openqasm-3", "export", "parameterized-circuits", "interoperability"],
      concept: "Parameters across formats",
      objective: "Anticipate limits when exporting parameterized circuits.",
      refs: [QASM3_INTEROP, FEATURE_TABLE],
      seconds: 70,
    },
    {
      id: "s8-018",
      difficulty: "hard",
      type: "multi-step-reasoning",
      question:
        "A team wants OpenQASM 3 as the interchange format between their compiler and Qiskit, round-tripping circuits repeatedly. What is the strongest engineering caution?",
      choices: {
        a: "Check on each round trip that the circuit still computes the same thing",
        b: "Treat round trips as lossless, so no verification of any kind is needed",
        c: "Avoid entangling gates, which a text interchange format cannot represent",
        d: "Keep every circuit under ten qubits, the limit for serializing a program",
      },
      answer: "a",
      explanation:
        "Each tool implements a subset of the specification, and those subsets change with releases, so repeated conversion can accumulate silent differences unless equivalence is checked each time. Losslessness cannot be assumed, entangling gates serialize perfectly normally, and there is no small qubit limit above which serialization stops working.",
      tags: ["openqasm-3", "interoperability", "reproducibility", "workflow"],
      concept: "Verifying interchange round trips",
      objective: "Design a safe interchange workflow.",
      refs: [FEATURE_TABLE, QASM3_INTEROP],
    },
    {
      id: "s8-019",
      difficulty: "medium",
      type: "documentation-navigation",
      question:
        "You need to know precisely which quantum assembly constructs Qiskit's importer and exporter currently handle. Which source answers this most directly?",
      choices: {
        a: "The feature-support table in the IBM Quantum documentation",
        b: "The bit-ordering guide",
        c: "The Sampler options reference",
        d: "The transpiler stages guide",
      },
      answer: "a",
      explanation:
        "A dedicated table enumerates language features against the support status of each tool, which is exactly the question. The bit-ordering guide covers display conventions, the Sampler options reference documents execution settings, and the transpiler stages guide describes compilation phases; none of them record parser feature coverage.",
      tags: ["documentation", "openqasm-3", "interoperability"],
      concept: "Locating feature-support documentation",
      objective: "Find authoritative language support information.",
      refs: [FEATURE_TABLE, QASM3_INTEROP],
    },
    {
      id: "s8-020",
      difficulty: "hard",
      type: "code-behavior",
      question:
        "In this fragment, what does the conditional test compare?",
      code: 'OPENQASM 3;\ninclude "stdgates.inc";\n\nqubit[2] q;\nbit[2] c;\nh q[0];\nh q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];\nif (c == 3) {\n  x q[0];\n}',
      codeStatus: "illustrative",
      choices: {
        a: "The two-bit register read as an integer, so the branch needs both bits set",
        b: "The number of qubits that were measured before the branch was reached",
        c: "The index of the single classical bit that the branch should test",
        d: "The number of shots that have been executed so far in the run",
      },
      answer: "a",
      explanation:
        "A sized classical register can be compared against an integer, and the value 3 is binary 11, so the branch fires only when both bits are set. The comparison is over the register's contents rather than over a count of measurements, an index, or a shot tally.",
      mistake:
        "Reading an integer comparison against a register as a bit index.",
      tags: ["openqasm-3", "classical-control", "data-types"],
      concept: "Integer comparison on classical registers",
      objective: "Interpret register-wide conditions in OpenQASM 3.",
      refs: [OPENQASM_SPEC, CONTROL_FLOW],
    },
  ],
);
