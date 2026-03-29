// Configuration for dynamic form fields
export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: 'radio' | 'checkbox' | 'text' | 'textarea' | 'select';
  label: string;
  name: string;
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
}

export const feedbackConfig = {
  // API endpoint
  apiUrl: 'http://localhost:5000/api/feedback',
  
  // Form fields configuration
  fields: {
    numericRating: {
      id: 'numericRating',
      type: 'radio' as const,
      name: 'rating',
      label: 'Kalaqawwan teeknoolojii hara asitti argitan keessaa inni caalaatti isin ajaaibe ykn yaada haaraa isiniif kenne isa kami?',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' }
      ],
      required: true
    },
    
    wordRating: {
      id: 'wordRating',
      type: 'radio' as const,
      name: 'wordRating',
      label: 'Teeknolojiin asitti dhiyaatan kunniin, rakkoolee hawaasaa hiikuu fi tajaajila ammayyeessuu keessatti gahee akkamii ni qabaatu jettee amanta?',
      options: [
        { value: 'Giddu-galeessa', label: 'Giddu-galeessa' },
        { value: 'Gaarii', label: 'Gaarii' },
        { value: 'Quubsaa', label: 'Quubsaa' },
        { value: 'Baayee Gaarii', label: 'Baayee Gaarii' },
        { value: 'Ol-aanaa', label: 'Ol-aanaa' }
      ],
      required: true
    },
    
    topics: {
      id: 'topics',
      type: 'checkbox' as const,
      name: 'topics',
      label: 'Teeknoolojiin hara argitan kunniin, jireenya hawaasa keenyaa fi adeemsa hojii keessatti dameewwan kam keessatti jijjiirama guddaa fiduu dandau jettee amanta?',
      options: [
        { value: 'Saffisa tajaajila mootummaa fi hojii daldalaa fooyyessuu', label: 'Saffisa tajaajila mootummaa fi hojii daldalaa fooyyessuu' },
        { value: 'Hojii haaraa uumuu fi dinagdee naannoo guddisuu', label: 'Hojii haaraa uumuu fi dinagdee naannoo guddisuu' },
        { value: 'Malaammaltummaa hirisuu fi iftoomina dabaluu', label: 'Malaammaltummaa hirisuu fi iftoomina dabaluu' },
        { value: 'Jireenya qotee bulaa ammayyeessuu fi omishaa dabaluu', label: 'Jireenya qotee bulaa ammayyeessuu fi omishaa dabaluu' }
      ],
      required: true
    }
  },
  
  // Success message
  successMessage: 'Feedback submitted successfully!',
  
  // Error message
  errorMessage: 'Error submitting feedback.',
  
  // Validation message
  validationMessage: 'Please complete all fields (numeric rating, word rating, and at least one topic).'
};