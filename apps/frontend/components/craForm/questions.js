const steps = [
  {
    id: 1,
    question: 'What type of product is being assessed?',
    answers: [
      { text: 'Software', isEliminatory: false },
      { text: 'Hardware', isEliminatory: false },
      { text: 'IoT Device', isEliminatory: false },
      { text: 'Other', isEliminatory: true },
    ],
  },
  {
    id: 2,
    question: 'What is the intended use of the product?',
    answers: [
      { text: 'Consumer Use', isEliminatory: false },
      { text: 'Industrial Use', isEliminatory: false },
      { text: 'Critical Infrastructure', isEliminatory: true },
      { text: 'Other', isEliminatory: true },
    ],
  },
  {
    id: 3,
    question: 'Does the product handle personal data?',
    answers: [
      { text: 'Yes, extensively', isEliminatory: true },
      { text: 'Yes, minimally', isEliminatory: false },
      { text: 'No', isEliminatory: false },
    ],
  },
  {
    id: 4,
    question: 'What level of cybersecurity measures are implemented?',
    answers: [
      { text: 'High', isEliminatory: false },
      { text: 'Moderate', isEliminatory: false },
      { text: 'Low', isEliminatory: true },
      { text: 'None', isEliminatory: true },
    ],
  },
  {
    id: 5,
    question: 'Is the product subject to regulatory compliance?',
    answers: [
      { text: 'Yes, fully compliant', isEliminatory: false },
      { text: 'Partially compliant', isEliminatory: true },
      { text: 'Not compliant', isEliminatory: true },
    ],
  },
  {
    id: 6,
    question: "What is the product's expected lifecycle?",
    answers: [
      { text: 'Short-term (1-3 years)', isEliminatory: false },
      { text: 'Medium-term (3-7 years)', isEliminatory: false },
      { text: 'Long-term (7+ years)', isEliminatory: false },
      { text: 'Unknown', isEliminatory: true },
    ],
  },
  {
    id: 7,
    question: 'Does the product include third-party components?',
    answers: [
      { text: 'Yes, fully vetted', isEliminatory: false },
      { text: 'Yes, partially vetted', isEliminatory: true },
      { text: 'No', isEliminatory: false },
    ],
  },
  {
    id: 8,
    question: 'What is the primary market for the product?',
    answers: [
      { text: 'EU Market', isEliminatory: false },
      { text: 'Global Market', isEliminatory: false },
      { text: 'Non-EU Market', isEliminatory: true },
    ],
  },
  {
    id: 9,
    question: 'Does the product require regular updates?',
    answers: [
      { text: 'Yes, frequent updates', isEliminatory: false },
      { text: 'Yes, occasional updates', isEliminatory: false },
      { text: 'No updates required', isEliminatory: true },
    ],
  },
  {
    id: 10,
    question: 'Is the product designed for secure communication?',
    answers: [
      { text: 'Yes, end-to-end encryption', isEliminatory: false },
      { text: 'Yes, basic encryption', isEliminatory: false },
      { text: 'No encryption', isEliminatory: true },
    ],
  },
];

export default steps;
