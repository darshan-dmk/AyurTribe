// apps/web/src/utils/questions.ts

export interface QuestionOption {
  id: string;
  text: string;
  trait: 'vata' | 'pitta' | 'kapha';
  weight: number;
}

export interface Question {
  id: string;
  category: string;
  text: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
}

export const prakritiQuestions: Question[] = [
  // Body Frame & Build
  {
    id: 'q1',
    category: 'Physical',
    text: 'questionnaire.questions.q1',
    type: 'single',
    options: [
      { id: 'q1_1', text: 'questionnaire.options.q1_1', trait: 'vata', weight: 1 },
      { id: 'q1_2', text: 'questionnaire.options.q1_2', trait: 'pitta', weight: 1 },
      { id: 'q1_3', text: 'questionnaire.options.q1_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q2',
    category: 'Physical',
    text: 'questionnaire.questions.q2',
    type: 'single',
    options: [
      { id: 'q2_1', text: 'questionnaire.options.q2_1', trait: 'vata', weight: 1 },
      { id: 'q2_2', text: 'questionnaire.options.q2_2', trait: 'pitta', weight: 1 },
      { id: 'q2_3', text: 'questionnaire.options.q2_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q3',
    category: 'Physical',
    text: 'questionnaire.questions.q3',
    type: 'single',
    options: [
      { id: 'q3_1', text: 'questionnaire.options.q3_1', trait: 'vata', weight: 1 },
      { id: 'q3_2', text: 'questionnaire.options.q3_2', trait: 'pitta', weight: 1 },
      { id: 'q3_3', text: 'questionnaire.options.q3_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Appetite & Digestion
  {
    id: 'q4',
    category: 'Physiological',
    text: 'questionnaire.questions.q4',
    type: 'single',
    options: [
      { id: 'q4_1', text: 'questionnaire.options.q4_1', trait: 'vata', weight: 1 },
      { id: 'q4_2', text: 'questionnaire.options.q4_2', trait: 'pitta', weight: 1 },
      { id: 'q4_3', text: 'questionnaire.options.q4_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q5',
    category: 'Physiological',
    text: 'questionnaire.questions.q5',
    type: 'single',
    options: [
      { id: 'q5_1', text: 'questionnaire.options.q5_1', trait: 'vata', weight: 1 },
      { id: 'q5_2', text: 'questionnaire.options.q5_2', trait: 'pitta', weight: 1 },
      { id: 'q5_3', text: 'questionnaire.options.q5_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q6',
    category: 'Physiological',
    text: 'questionnaire.questions.q6',
    type: 'single',
    options: [
      { id: 'q6_1', text: 'questionnaire.options.q6_1', trait: 'vata', weight: 1 },
      { id: 'q6_2', text: 'questionnaire.options.q6_2', trait: 'pitta', weight: 1 },
      { id: 'q6_3', text: 'questionnaire.options.q6_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Sleep Patterns
  {
    id: 'q7',
    category: 'Sleep',
    text: 'questionnaire.questions.q7',
    type: 'single',
    options: [
      { id: 'q7_1', text: 'questionnaire.options.q7_1', trait: 'vata', weight: 1 },
      { id: 'q7_2', text: 'questionnaire.options.q7_2', trait: 'pitta', weight: 1 },
      { id: 'q7_3', text: 'questionnaire.options.q7_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q8',
    category: 'Sleep',
    text: 'questionnaire.questions.q8',
    type: 'single',
    options: [
      { id: 'q8_1', text: 'questionnaire.options.q8_1', trait: 'vata', weight: 1 },
      { id: 'q8_2', text: 'questionnaire.options.q8_2', trait: 'pitta', weight: 1 },
      { id: 'q8_3', text: 'questionnaire.options.q8_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Temperature Preference
  {
    id: 'q9',
    category: 'Preferences',
    text: 'questionnaire.questions.q9',
    type: 'single',
    options: [
      { id: 'q9_1', text: 'questionnaire.options.q9_1', trait: 'vata', weight: 1 },
      { id: 'q9_2', text: 'questionnaire.options.q9_2', trait: 'pitta', weight: 1 },
      { id: 'q9_3', text: 'questionnaire.options.q9_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q10',
    category: 'Preferences',
    text: 'questionnaire.questions.q10',
    type: 'single',
    options: [
      { id: 'q10_1', text: 'questionnaire.options.q10_1', trait: 'vata', weight: 1 },
      { id: 'q10_2', text: 'questionnaire.options.q10_2', trait: 'pitta', weight: 1 },
      { id: 'q10_3', text: 'questionnaire.options.q10_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Mental & Emotional
  {
    id: 'q11',
    category: 'Mental',
    text: 'questionnaire.questions.q11',
    type: 'single',
    options: [
      { id: 'q11_1', text: 'questionnaire.options.q11_1', trait: 'vata', weight: 1 },
      { id: 'q11_2', text: 'questionnaire.options.q11_2', trait: 'pitta', weight: 1 },
      { id: 'q11_3', text: 'questionnaire.options.q11_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q12',
    category: 'Mental',
    text: 'questionnaire.questions.q12',
    type: 'single',
    options: [
      { id: 'q12_1', text: 'questionnaire.options.q12_1', trait: 'vata', weight: 1 },
      { id: 'q12_2', text: 'questionnaire.options.q12_2', trait: 'pitta', weight: 1 },
      { id: 'q12_3', text: 'questionnaire.options.q12_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q13',
    category: 'Mental',
    text: 'questionnaire.questions.q13',
    type: 'single',
    options: [
      { id: 'q13_1', text: 'questionnaire.options.q13_1', trait: 'vata', weight: 1 },
      { id: 'q13_2', text: 'questionnaire.options.q13_2', trait: 'pitta', weight: 1 },
      { id: 'q13_3', text: 'questionnaire.options.q13_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Physical Activity
  {
    id: 'q14',
    category: 'Activity',
    text: 'questionnaire.questions.q14',
    type: 'single',
    options: [
      { id: 'q14_1', text: 'questionnaire.options.q14_1', trait: 'vata', weight: 1 },
      { id: 'q14_2', text: 'questionnaire.options.q14_2', trait: 'pitta', weight: 1 },
      { id: 'q14_3', text: 'questionnaire.options.q14_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q15',
    category: 'Activity',
    text: 'questionnaire.questions.q15',
    type: 'single',
    options: [
      { id: 'q15_1', text: 'questionnaire.options.q15_1', trait: 'vata', weight: 1 },
      { id: 'q15_2', text: 'questionnaire.options.q15_2', trait: 'pitta', weight: 1 },
      { id: 'q15_3', text: 'questionnaire.options.q15_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Speech Patterns
  {
    id: 'q16',
    category: 'Communication',
    text: 'questionnaire.questions.q16',
    type: 'single',
    options: [
      { id: 'q16_1', text: 'questionnaire.options.q16_1', trait: 'vata', weight: 1 },
      { id: 'q16_2', text: 'questionnaire.options.q16_2', trait: 'pitta', weight: 1 },
      { id: 'q16_3', text: 'questionnaire.options.q16_3', trait: 'kapha', weight: 1 }
    ]
  },
  {
    id: 'q17',
    category: 'Communication',
    text: 'questionnaire.questions.q17',
    type: 'single',
    options: [
      { id: 'q17_1', text: 'questionnaire.options.q17_1', trait: 'vata', weight: 1 },
      { id: 'q17_2', text: 'questionnaire.options.q17_2', trait: 'pitta', weight: 1 },
      { id: 'q17_3', text: 'questionnaire.options.q17_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Bowel Habits
  {
    id: 'q18',
    category: 'Elimination',
    text: 'questionnaire.questions.q18',
    type: 'single',
    options: [
      { id: 'q18_1', text: 'questionnaire.options.q18_1', trait: 'vata', weight: 1 },
      { id: 'q18_2', text: 'questionnaire.options.q18_2', trait: 'pitta', weight: 1 },
      { id: 'q18_3', text: 'questionnaire.options.q18_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Weight Management
  {
    id: 'q19',
    category: 'Weight',
    text: 'questionnaire.questions.q19',
    type: 'single',
    options: [
      { id: 'q19_1', text: 'questionnaire.options.q19_1', trait: 'vata', weight: 1 },
      { id: 'q19_2', text: 'questionnaire.options.q19_2', trait: 'pitta', weight: 1 },
      { id: 'q19_3', text: 'questionnaire.options.q19_3', trait: 'kapha', weight: 1 }
    ]
  },

  // Perspiration
  {
    id: 'q20',
    category: 'Physiological',
    text: 'questionnaire.questions.q20',
    type: 'single',
    options: [
      { id: 'q20_1', text: 'questionnaire.options.q20_1', trait: 'vata', weight: 1 },
      { id: 'q20_2', text: 'questionnaire.options.q20_2', trait: 'pitta', weight: 1 },
      { id: 'q20_3', text: 'questionnaire.options.q20_3', trait: 'kapha', weight: 1 }
    ]
  }
];

// Mental Health Screening Questions
export const mentalHealthQuestions: Question[] = [
  {
    id: 'mh1',
    category: 'Mood',
    text: 'questionnaire.questions.mh1',
    type: 'single',
    options: [
      { id: 'mh1_1', text: 'questionnaire.options.mh1_1', trait: 'kapha', weight: 0 },
      { id: 'mh1_2', text: 'questionnaire.options.mh1_2', trait: 'vata', weight: 1 },
      { id: 'mh1_3', text: 'questionnaire.options.mh1_3', trait: 'vata', weight: 2 },
      { id: 'mh1_4', text: 'questionnaire.options.mh1_4', trait: 'vata', weight: 3 }
    ]
  },
  {
    id: 'mh2',
    category: 'Anxiety',
    text: 'questionnaire.questions.mh2',
    type: 'single',
    options: [
      { id: 'mh2_1', text: 'questionnaire.options.mh2_1', trait: 'kapha', weight: 0 },
      { id: 'mh2_2', text: 'questionnaire.options.mh2_2', trait: 'vata', weight: 1 },
      { id: 'mh2_3', text: 'questionnaire.options.mh2_3', trait: 'vata', weight: 2 },
      { id: 'mh2_4', text: 'questionnaire.options.mh2_4', trait: 'vata', weight: 3 }
    ]
  },
  {
    id: 'mh3',
    category: 'Sleep',
    text: 'questionnaire.questions.mh3',
    type: 'single',
    options: [
      { id: 'mh3_1', text: 'questionnaire.options.mh3_1', trait: 'kapha', weight: 0 },
      { id: 'mh3_2', text: 'questionnaire.options.mh3_2', trait: 'pitta', weight: 1 },
      { id: 'mh3_3', text: 'questionnaire.options.mh3_3', trait: 'vata', weight: 2 },
      { id: 'mh3_4', text: 'questionnaire.options.mh3_4', trait: 'vata', weight: 3 }
    ]
  },
  {
    id: 'mh4',
    category: 'Energy',
    text: 'questionnaire.questions.mh4',
    type: 'single',
    options: [
      { id: 'mh4_1', text: 'questionnaire.options.mh4_1', trait: 'pitta', weight: 0 },
      { id: 'mh4_2', text: 'questionnaire.options.mh4_2', trait: 'kapha', weight: 1 },
      { id: 'mh4_3', text: 'questionnaire.options.mh4_3', trait: 'kapha', weight: 2 },
      { id: 'mh4_4', text: 'questionnaire.options.mh4_4', trait: 'kapha', weight: 3 }
    ]
  },
  {
    id: 'mh5',
    category: 'Stress',
    text: 'questionnaire.questions.mh5',
    type: 'single',
    options: [
      { id: 'mh5_1', text: 'questionnaire.options.mh5_1', trait: 'kapha', weight: 0 },
      { id: 'mh5_2', text: 'questionnaire.options.mh5_2', trait: 'pitta', weight: 1 },
      { id: 'mh5_3', text: 'questionnaire.options.mh5_3', trait: 'vata', weight: 2 },
      { id: 'mh5_4', text: 'questionnaire.options.mh5_4', trait: 'vata', weight: 3 }
    ]
  }
];