export type ResourceCategory = "Official" | "Community" | "Practice" | "Slides";

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
    category: "Official",
  },
  {
    title: "Qiskit Documentation",
    description:
      "Primary reference for Qiskit APIs, Runtime, primitives, transpilation, and OpenQASM interoperability.",
    url: "https://docs.quantum.ibm.com/",
    category: "Official",
  },
  {
    title: "Qiskit v2.X Certification Exam Tutorial",
    description:
      "Community tutorial repository covering Qiskit v2.X concepts aligned with the developer certification exam.",
    url: "https://github.com/kibrahim757/qiskit_2x_certification_exam_tutorial",
    category: "Community",
  },
  {
    title: "Qiskit Advocate-Created Practice Exams",
    description:
      "Curated list of advocate-created practice materials and study references for Qiskit certification prep.",
    url: "https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/advocate_created_practice_exams.md",
    category: "Practice",
  },
  {
    title: "Qiskit Study Group Kickoff Slides",
    description:
      "PDF slides from the Qiskit Study Group kickoff covering certification domains and study strategies.",
    url: "https://github.com/qiskit-advocate/qiskit-advocate-library/blob/main/advocate-resources/qiskit-cert-study-resources/SG_kickoff_slides.pdf",
    category: "Slides",
  },
];
