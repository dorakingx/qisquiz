export type Difficulty = "easy" | "medium" | "hard";

export type QuizQuestion = {
  id: string;
  section: number;
  sectionTitle: string;
  difficulty: Difficulty;
  question: string;
  code?: string;
  choices: string[];
  correctAnswerIndex: number;
  explanation: string;
  tags: string[];
  sourceReference?: string;
  relatedDocsUrl?: string;
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export type StudyConfig = {
  section: number | "all";
  difficulty: Difficulty | "all";
  order: "sequential" | "random";
};

export type ExamSection = {
  number: number;
  title: string;
  description: string;
};

export const EXAM_SECTIONS: ExamSection[] = [
  {
    number: 1,
    title: "Perform quantum operations",
    description:
      "Pauli operators, standard gates, quantum operations, qubit ordering, global vs relative phase.",
  },
  {
    number: 2,
    title: "Visualize quantum circuits, measurements, and states",
    description:
      "Circuit drawing, measurement visualization, statevector and Bloch sphere, histogram interpretation.",
  },
  {
    number: 3,
    title: "Create quantum circuits",
    description:
      "QuantumCircuit construction, parameterized circuits, transpilation, ISA circuits, dynamic circuits.",
  },
  {
    number: 4,
    title: "Run quantum circuits",
    description:
      "Qiskit Runtime, BackendV2, sessions, batch mode, job submission, hardware execution.",
  },
  {
    number: 5,
    title: "Use the Sampler primitive",
    description:
      "SamplerV2, PUBs, sampler options, result navigation, measurement sampling.",
  },
  {
    number: 6,
    title: "Use the Estimator primitive",
    description:
      "EstimatorV2, observables, expectation values, PUB format, precision vs shots.",
  },
  {
    number: 7,
    title: "Retrieve and analyze results of quantum circuits",
    description:
      "Retrieving past jobs, analyzing result objects, counts, quasi-distributions, data extraction.",
  },
  {
    number: 8,
    title: "Operate with OpenQASM",
    description:
      "OpenQASM 3 syntax, data types, Qiskit interoperability, import/export, semantic interpretation.",
  },
];
