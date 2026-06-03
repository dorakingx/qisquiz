export type ResourceCategory =
  | "Official IBM / Qiskit resources"
  | "Community tutorials"
  | "Practice exams"
  | "Slides"
  | "Qiskit API documentation"
  | "Runtime / Sampler / Estimator references"
  | "OpenQASM references";

export type StudyResource = {
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
};

export const STUDY_RESOURCES: StudyResource[] = [
  {
    title: "IBM Certified Quantum Computation using Qiskit v2.X Developer - Associate",
    description:
      "Official IBM certification page for the Qiskit v2.X Developer Associate credential. The exam code is C1000-179; C9008400 is the certification page identifier.",
    url: "https://www.ibm.com/training/certification/ibm-certified-quantum-computation-using-qiskit-v2x-developer-associate-C9008400",
    category: "Official IBM / Qiskit resources",
  },
  {
    title: "Qiskit Documentation",
    description:
      "Primary reference for Qiskit APIs, Runtime, primitives, transpilation, and OpenQASM interoperability.",
    url: "https://docs.quantum.ibm.com/",
    category: "Official IBM / Qiskit resources",
  },
  {
    title: "Qiskit API Reference",
    description:
      "API reference for QuantumCircuit, quantum_info, visualization, transpiler, and other Qiskit modules.",
    url: "https://docs.quantum.ibm.com/api/qiskit",
    category: "Qiskit API documentation",
  },
  {
    title: "Qiskit Bit Ordering Guide",
    description:
      "Official explanation of Qiskit's bit, qubit, and string ordering conventions.",
    url: "https://quantum.cloud.ibm.com/docs/en/guides/bit-ordering",
    category: "Qiskit API documentation",
  },
  {
    title: "Qiskit Runtime Documentation",
    description:
      "Runtime service, jobs, sessions, batches, hardware execution, and backend workflows.",
    url: "https://docs.quantum.ibm.com/guides/execute-on-hardware",
    category: "Runtime / Sampler / Estimator references",
  },
  {
    title: "Sampler Primitive Guide",
    description:
      "Official guide for SamplerV2 inputs, outputs, shots, bit arrays, and result interpretation.",
    url: "https://docs.quantum.ibm.com/guides/sampler",
    category: "Runtime / Sampler / Estimator references",
  },
  {
    title: "Estimator Primitive Guide",
    description:
      "Official guide for EstimatorV2 observables, PUBs, precision, and expectation values.",
    url: "https://docs.quantum.ibm.com/guides/estimator",
    category: "Runtime / Sampler / Estimator references",
  },
  {
    title: "OpenQASM 3 Interoperability",
    description:
      "Importing and exporting OpenQASM 3 with Qiskit, including qasm3.loads and qasm3.dumps.",
    url: "https://docs.quantum.ibm.com/guides/interoperate-qiskit-qasm3",
    category: "OpenQASM references",
  },
  {
    title: "Qiskit v2.X Certification Exam Tutorial",
    description:
      "Community tutorial repository covering Qiskit v2.X concepts aligned with the developer certification exam.",
    url: "https://github.com/kibrahim757/qiskit_2x_certification_exam_tutorial",
    category: "Community tutorials",
  },
  {
    title: "Qiskit Advocate-Created Practice Exams",
    description:
      "Curated list of advocate-created practice materials and study references for Qiskit certification prep.",
    url: "https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/advocate_created_practice_exams.md",
    category: "Practice exams",
  },
  {
    title: "Qiskit Study Group Kickoff Slides",
    description:
      "PDF slides from the Qiskit Study Group kickoff covering certification domains and study strategies.",
    url: "https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/SG_kickoff_slides.pdf",
    category: "Slides",
  },
];
