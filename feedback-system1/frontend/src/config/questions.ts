export interface Question {
  id: string;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'rating';
  label: string;
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const feedbackQuestions: Question[] = [
  {
    id: 'rating',
    type: 'rating',
    label: 'How would you rate your overall experience?',
    required: true,
    options: [
      { value: '1', label: '1 - Poor' },
      { value: '2', label: '2 - Fair' },
      { value: '3', label: '3 - Good' },
      { value: '4', label: '4 - Very Good' },
      { value: '5', label: '5 - Excellent' }
    ]
  },
  {
    id: 'wordRating',
    type: 'radio',
    label: 'How would you describe the quality of our service?',
    required: true,
    options: [
      { value: 'Giddu-galeessa', label: 'Giddu-galeessa (Fair)' },
      { value: 'Gaarii', label: 'Gaarii (Good)' },
      { value: 'Quubsaa', label: 'Quubsaa (Satisfactory)' },
      { value: 'Baayee Gaarii', label: 'Baayee Gaarii (Very Good)' },
      { value: 'Ol-aanaa', label: 'Ol-aanaa (Excellent)' }
    ]
  },
  {
    id: 'topics',
    type: 'checkbox',
    label: 'Which areas do you think will be most impacted by our technology? (Select all that apply)',
    required: true,
    options: [
      { value: 'Government Service Speed', label: 'Saffisa tajaajila mootummaa fi hojii daldalaa fooyyessuu' },
      { value: 'Job Creation', label: 'Hojii haaraa uumuu fi dinagdee naannoo guddisuu' },
      { value: 'Transparency', label: 'Malaammaltummaa hirisuu fi iftoomina dabaluu' },
      { value: 'Agricultural Innovation', label: 'Jireenya qotee bulaa ammayyeessuu fi omishaa dabaluu' }
    ]
  },
  {
    id: 'feedback',
    type: 'textarea',
    label: 'Any additional feedback or suggestions?',
    required: false,
    placeholder: 'Please share your thoughts...'
  }
];

export const wordRatings = ['Giddu-galeessa', 'Gaarii', 'Quubsaa', 'Baayee Gaarii', 'Ol-aanaa'];
export const topicsList = [
  'Saffisa tajaajila mootummaa fi hojii daldalaa fooyyessuu',
  'Hojii haaraa uumuu fi dinagdee naannoo guddisuu',
  'Malaammaltummaa hirisuu fi iftoomina dabaluu',
  'Jireenya qotee bulaa ammayyeessuu fi omishaa dabaluu'
];