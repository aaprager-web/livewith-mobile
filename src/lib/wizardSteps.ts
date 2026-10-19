// Onboarding step definitions, ported directly from the clickable
// prototype (landed_prototype.html — AP_STEPS / FAM_STEPS), including the
// au pair "Languages" step's per-language proficiency levels. Keeping the
// exact same keys, labels and options here means the real app asks
// families and au pairs the same questions, in the same order, that
// people already clicked through in the prototype.

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'chipSingle'
  | 'chipMulti'
  | 'strength'
  | 'languageLevels'
  | 'childList'
  | 'range';

export interface StrengthItem {
  key: string;
  label: string;
}

export interface StepField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  items?: StrengthItem[];
  // 'range' only — bounds and step size for the min/max sliders, plus how
  // to display each value (e.g. min:0/max:50/step:5/unitSuffix:' hrs/week'
  // for hours, or min:50/max:300/step:5/unitPrefix:'£'/unitSuffix:'/week'
  // for pay) so the same slider pair can represent hours, pay, or anything
  // else with a numeric range without hardcoding a unit in the component.
  min?: number;
  max?: number;
  step?: number;
  unitPrefix?: string;
  unitSuffix?: string;
  // 'range' only — literal overrides for the two ends of the slider, shown
  // instead of the usual prefix+value+suffix once dragged all the way to
  // that end. underMinLabel covers a lowest step that isn't really "0" of
  // something (e.g. "Under 1 month"); overMaxLabel signals "or more" rather
  // than a hard cap (e.g. "24m+", "£500+/week"). Written out in full here
  // rather than composed from unitPrefix/unitSuffix because where the "+"
  // reads naturally (before vs after the unit) differs per field.
  underMinLabel?: string;
  overMaxLabel?: string;
  // When true, Continue (and the final Review step) block progress until
  // this field is answered — see isFieldAnswered() in Wizard.tsx for what
  // "answered" means per field type. Off by default, so most fields stay
  // optional exactly as before.
  required?: boolean;
  // 'date' only — constrains the native date picker to today, in either
  // direction. 'dateMax: today' suits a date of birth (can't be in the
  // future); 'dateMin: today' suits a date someone can start (shouldn't be
  // in the past). Neither is set by default, i.e. no constraint.
  dateMin?: 'today';
  dateMax?: 'today';
}

export interface Step {
  title: string;
  sub?: string;
  type?: 'review';
  fields?: StepField[];
}

export const STRENGTH_LEVELS = [
  'Essential',
  'Preferred',
  "Don't mind",
  'Rather not',
  'Not acceptable',
];

export const LANGUAGE_LEVELS = ['Native', 'Fluent', 'Very Good', 'Good', 'Conversational', 'Basic'];

// Offered as a searchable dropdown (native <input list>) when someone picks
// "Other" on a languages question, so they can find and name the actual
// language rather than it just being recorded as "Other" with no detail.
export const WORLD_LANGUAGES = [
  'Mandarin Chinese', 'Cantonese', 'Hindi', 'Urdu', 'Bengali', 'Punjabi',
  'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam',
  'Vietnamese', 'Thai', 'Korean', 'Japanese', 'Indonesian', 'Malay',
  'Tagalog / Filipino', 'Turkish', 'Persian / Farsi', 'Arabic', 'Hebrew',
  'Swahili', 'Amharic', 'Hausa', 'Yoruba', 'Igbo', 'Zulu', 'Afrikaans',
  'Greek', 'Albanian', 'Serbian', 'Croatian', 'Bosnian', 'Bulgarian',
  'Macedonian', 'Slovenian', 'Slovak', 'Czech', 'Hungarian', 'Finnish',
  'Estonian', 'Latvian', 'Lithuanian', 'Ukrainian', 'Belarusian',
  'Georgian', 'Armenian', 'Azerbaijani', 'Kazakh', 'Uzbek', 'Mongolian',
  'Nepali', 'Sinhala', 'Burmese', 'Khmer', 'Lao', 'Danish', 'Norwegian',
  'Icelandic', 'Welsh', 'Irish (Gaelic)', 'Scottish Gaelic', 'Catalan',
  'Basque', 'Galician', 'Maltese', 'Somali', 'Tigrinya', 'Kurdish',
  'Pashto', 'Dari', 'British Sign Language',
];

// Used for the host family "second language" dropdown — WORLD_LANGUAGES
// plus the common European/global languages it deliberately leaves out
// (those already appear as their own chip options on the au pair side's
// Languages step), so a family picking a bonus language isn't limited to
// just the less-common ones. Sorted for a sane dropdown order.
export const SECOND_LANGUAGES = [
  ...new Set([
    'French', 'Spanish', 'German', 'Italian', 'Portuguese', 'Polish',
    'Romanian', 'Dutch', 'Russian', 'Swedish',
    ...WORLD_LANGUAGES,
  ]),
].sort((a, b) => a.localeCompare(b));

// A broad but non-exhaustive list of nationalities for the dropdown on the
// "About you" step. "Other" catches anyone not listed, consistent with how
// the Languages and "Who's in the home" steps handle the same problem.
export const NATIONALITIES = [
  'Albanian', 'Algerian', 'Argentinian', 'Armenian', 'Australian', 'Austrian',
  'Azerbaijani', 'Bangladeshi', 'Belarusian', 'Belgian', 'Bolivian',
  'Bosnian', 'Brazilian', 'British', 'Bulgarian', 'Cambodian', 'Cameroonian',
  'Canadian', 'Chilean', 'Chinese', 'Colombian', 'Costa Rican', 'Croatian',
  'Cuban', 'Cypriot', 'Czech', 'Danish', 'Dominican', 'Dutch', 'Ecuadorian',
  'Egyptian', 'Emirati', 'Estonian', 'Ethiopian', 'Filipino', 'Finnish',
  'French', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan',
  'Honduran', 'Hong Konger', 'Hungarian', 'Icelandic', 'Indian',
  'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian',
  'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan',
  'Korean (South)', 'Kosovan', 'Kuwaiti', 'Kyrgyz', 'Latvian', 'Lebanese',
  'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malaysian', 'Maltese',
  'Mexican', 'Moldovan', 'Mongolian', 'Montenegrin', 'Moroccan', 'Nepali',
  'New Zealander', 'Nicaraguan', 'Nigerian', 'Norwegian', 'Pakistani',
  'Panamanian', 'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari',
  'Romanian', 'Russian', 'Rwandan', 'Salvadoran', 'Saudi Arabian',
  'Senegalese', 'Serbian', 'Singaporean', 'Slovak', 'Slovenian',
  'South African', 'Spanish', 'Sri Lankan', 'Swedish', 'Swiss', 'Syrian',
  'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Tunisian', 'Turkish',
  'Turkmen', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbek', 'Venezuelan',
  'Vietnamese', 'Zambian', 'Zimbabwean', 'Other',
];

export const AP_STEPS: Step[] = [
  {
    title: 'About you',
    sub: 'The basics families will see first.',
    fields: [
      { key: 'fullName', label: 'Full name', type: 'text', placeholder: 'e.g. Giada Colombo', required: true },
      { key: 'nationality', label: 'Nationality', type: 'select', options: NATIONALITIES, required: true },
      {
        key: 'dob',
        label: 'Date of birth',
        type: 'date',
        dateMax: 'today',
        required: true,
      },
    ],
  },
  {
    title: 'Where are you now?',
    sub: 'This helps families understand your journey.',
    fields: [
      { key: 'homeCountry', label: 'Country', type: 'text', placeholder: 'e.g. Italy' },
      { key: 'homeCity', label: 'City', type: 'text', placeholder: 'e.g. Milan' },
    ],
  },
  {
    title: 'Where do you want to au pair?',
    sub: 'LiveWith is currently focused on London. Select all that apply.',
    fields: [
      {
        key: 'destination',
        label: 'Destination',
        type: 'chipMulti',
        options: [
          'Central London',
          'North London',
          'South London',
          'East London',
          'West London',
          'Greater London',
          'Flexible / any area',
          'Not sure yet',
        ],
      },
    ],
  },
  {
    title: 'Right to work',
    sub: 'This affects which families you can be matched with.',
    fields: [
      {
        key: 'visa',
        label: 'Which applies to you?',
        type: 'chipSingle',
        options: [
          'UK/Irish citizen',
          'EU settled or pre-settled status',
          'Youth Mobility Scheme visa',
          'Student visa',
          'Other visa',
          'Not sure — I need guidance',
          'N/A',
        ],
      },
    ],
  },
  {
    title: 'When can you start?',
    fields: [
      {
        key: 'earliestStart',
        label: 'Earliest start date',
        type: 'date',
        dateMin: 'today',
        required: true,
      },
    ],
  },
  {
    title: 'How long are you looking to stay?',
    sub: 'Drag to set the range of months you’re looking to stay.',
    fields: [
      {
        key: 'duration',
        label: 'Length of stay',
        type: 'range',
        min: 0,
        max: 24,
        step: 1,
        unitSuffix: 'm',
        underMinLabel: 'Under 1 month',
        overMaxLabel: '24m+',
        required: true,
      },
    ],
  },
  {
    title: 'Add a photo',
    sub: 'Profiles with a clear, friendly photo get far more responses.',
    fields: [
      {
        key: 'photo',
        label: 'Photo',
        type: 'chipSingle',
        options: ['Use suggested profile photo', "I'll add this later"],
      },
    ],
  },
  {
    title: 'Languages',
    sub: 'Select every language you speak.',
    fields: [
      {
        key: 'languages',
        label: 'Languages you speak',
        type: 'languageLevels',
        options: [
          'English',
          'Italian',
          'Spanish',
          'French',
          'German',
          'Portuguese',
          'Polish',
          'Romanian',
          'Other',
        ],
      },
    ],
  },
  {
    title: 'Childcare experience',
    sub: 'Select all that apply.',
    fields: [
      {
        key: 'experience',
        label: 'Experience type',
        type: 'chipMulti',
        options: [
          'Babysitting',
          'Nannying',
          'Previous au pair',
          'Camp counsellor / youth leader',
          'Teaching or tutoring',
          'Looking after younger siblings',
        ],
      },
    ],
  },
  {
    title: "Ages you're comfortable with",
    sub: 'Be honest — this keeps matches relevant.',
    fields: [
      {
        key: 'ageComfort',
        label: '',
        type: 'strength',
        items: [
          { key: '0-1', label: 'Newborns (0–1)' },
          { key: '1-3', label: 'Toddlers (1–3)' },
          { key: '3-5', label: 'Pre-school (3–5)' },
          { key: '5-8', label: 'Young school-age (5–8)' },
          { key: '8-12', label: 'Older children (8–12)' },
          { key: '12+', label: 'Teenagers (12+)' },
        ],
      },
    ],
  },
  {
    title: 'Driving',
    fields: [
      {
        key: 'driving',
        label: 'Driving',
        type: 'chipSingle',
        options: ['Full licence', 'Learning / provisional', 'No licence'],
      },
    ],
  },
  {
    title: 'Smoking',
    fields: [
      {
        key: 'smoking',
        label: 'Smoking',
        type: 'chipSingle',
        options: ['Non-smoker', 'Smoker (outside only)', 'Vaper'],
      },
    ],
  },
  {
    title: 'Working preferences',
    sub: 'Drag to set the range of hours per week you want to work.',
    fields: [
      {
        key: 'hours',
        label: 'Hours per week',
        type: 'range',
        min: 0,
        max: 50,
        step: 5,
        unitSuffix: ' hrs/week',
        overMaxLabel: '50+ hrs/week',
      },
      {
        key: 'flexibility',
        label: 'Evenings & weekends',
        type: 'chipMulti',
        options: [
          'Happy to help some evenings',
          'Happy to help occasional weekends',
          'Prefer evenings & weekends free',
        ],
      },
    ],
  },
  {
    title: 'Pay expectations',
    sub: 'Drag to set the range of weekly pay you’re looking for.',
    fields: [
      {
        key: 'payExpectation',
        label: 'Weekly pay',
        type: 'range',
        min: 0,
        max: 500,
        step: 5,
        unitPrefix: '£',
        unitSuffix: '/week',
        overMaxLabel: '£500+/week',
      },
    ],
  },
  {
    title: 'Family preferences',
    sub: 'How important is each of these to you?',
    fields: [
      {
        key: 'famPrefs',
        label: '',
        type: 'strength',
        items: [
          { key: 'pets', label: 'Family has pets' },
          { key: 'smokefree', label: 'Smoke-free household' },
          { key: 'ownroom', label: 'My own private room' },
          { key: 'ownbathroom', label: 'My own bathroom' },
          { key: 'values', label: 'Similar religion / values' },
        ],
      },
    ],
  },
  {
    title: 'Tell families about you',
    sub: 'A few honest sentences go a long way.',
    fields: [
      {
        key: 'bio',
        label: 'About you',
        type: 'textarea',
        placeholder:
          "e.g. I'm outgoing, love the outdoors and have looked after my three younger cousins since I was 14...",
      },
    ],
  },
  { title: 'Review your profile', type: 'review' },
];

export const FAM_STEPS: Step[] = [
  {
    title: 'Your family',
    sub: 'How should au pairs see you listed?',
    fields: [
      { key: 'familyName', label: 'Family name', type: 'text', placeholder: 'e.g. The Smith Family' },
      {
        key: 'adults',
        label: 'Which adults are in the home?',
        type: 'chipSingle',
        options: ['Two parents', 'One parent', 'Blended family', 'Grandparent living with us too', 'Other'],
      },
    ],
  },
  {
    title: 'Location',
    fields: [
      { key: 'area', label: 'Area / borough', type: 'text', placeholder: 'e.g. Hendon, North London' },
      { key: 'station', label: 'Nearest station (optional)', type: 'text', placeholder: 'e.g. Hendon Central' },
    ],
  },
  {
    title: 'Your children',
    sub: "Add each child you'd like the au pair to help care for.",
    fields: [{ key: 'children', label: '', type: 'childList' }],
  },
  {
    title: 'Photo & privacy',
    fields: [
      {
        key: 'photo',
        label: 'Photo',
        type: 'chipSingle',
        options: ['Use suggested family photo', "I'll add this later"],
      },
      {
        key: 'faceBlur',
        label: "Blur children's faces on public profile photos?",
        type: 'chipSingle',
        options: ['Yes, please blur faces', 'No, show faces as normal'],
      },
    ],
  },
  {
    title: 'Placement type',
    fields: [
      {
        key: 'placementType',
        label: 'Placement type',
        type: 'chipSingle',
        options: ['Live-in', 'Live-out', 'Either works'],
      },
    ],
  },
  {
    title: 'When do you need someone to start?',
    fields: [
      {
        key: 'startWindow',
        label: '',
        type: 'chipSingle',
        options: ['ASAP', 'Within 3 months', '3–6 months', 'Flexible / no fixed date'],
      },
    ],
  },
  {
    title: 'How long is the placement?',
    sub: 'Drag to set the range of months you need someone for.',
    fields: [
      {
        key: 'duration',
        label: 'Length of placement',
        type: 'range',
        min: 0,
        max: 24,
        step: 1,
        unitSuffix: 'm',
        underMinLabel: 'Under 1 month',
        overMaxLabel: '24m+',
      },
    ],
  },
  {
    title: 'Right to work',
    fields: [
      {
        key: 'visaReq',
        label: 'Requirement',
        type: 'chipSingle',
        options: [
          'Must already have the right to work in the UK',
          'Open to sponsoring a visa',
          'Not sure — need guidance',
          'Not fussed',
        ],
      },
    ],
  },
  {
    title: 'Working hours',
    sub: 'Drag to set the range of hours per week you need.',
    fields: [
      {
        key: 'hours',
        label: 'Hours per week',
        type: 'range',
        min: 0,
        max: 50,
        step: 5,
        unitSuffix: ' hrs/week',
        overMaxLabel: '50+ hrs/week',
      },
    ],
  },
  {
    title: 'Weekly pattern',
    sub: 'When do you need the most help?',
    fields: [
      {
        key: 'pattern',
        label: 'Typical pattern',
        type: 'chipMulti',
        options: ['Early mornings', 'School run', 'After school', 'Evenings', 'Occasional weekends'],
      },
    ],
  },
  {
    title: 'Core childcare duties',
    fields: [
      {
        key: 'coreDuties',
        label: 'Duties',
        type: 'chipMulti',
        options: [
          'School drop-off / pick-up',
          'Meal prep for children',
          'Homework help',
          'Bath & bedtime routine',
          'Activities & playdates',
          'Light babysitting in evenings',
        ],
      },
    ],
  },
  {
    title: 'Household duties',
    fields: [
      {
        key: 'houseDuties',
        label: 'Duties',
        type: 'chipMulti',
        options: [
          "Children's laundry",
          "Tidying children's rooms",
          'Light general housework',
          'No household duties beyond childcare',
        ],
      },
    ],
  },
  {
    title: 'Pay & benefits',
    sub: 'Drag to set the range of weekly pay you can offer.',
    fields: [
      {
        key: 'pay',
        label: 'Weekly pay',
        type: 'range',
        min: 0,
        max: 500,
        step: 5,
        unitPrefix: '£',
        unitSuffix: '/week',
        overMaxLabel: '£500+/week',
      },
      {
        key: 'benefits',
        label: 'Benefits offered',
        type: 'chipMulti',
        options: ['Private room', 'Own bathroom', 'Language course contribution', 'Travel card', 'Use of a car'],
      },
    ],
  },
  {
    title: 'Accommodation',
    fields: [
      {
        key: 'accommodation',
        label: 'Accommodation',
        type: 'chipSingle',
        options: ['Private room', 'Shared room', 'Self-contained annex / studio'],
      },
    ],
  },
  {
    title: 'Driving',
    fields: [
      {
        key: 'drivingReq',
        label: 'Driving requirement',
        type: 'chipSingle',
        options: ['Must be a confident driver', 'Driver preferred but not essential', "Don't mind either way"],
      },
    ],
  },
  {
    title: 'Language',
    fields: [
      {
        key: 'languageReq',
        label: 'English level needed',
        type: 'chipSingle',
        options: [
          'Good spoken English essential',
          'Conversational English is fine',
          "Don't mind — we'll help them learn",
        ],
      },
      {
        key: 'secondLanguagePref',
        label: 'A second language would be a bonus (optional)',
        type: 'select',
        options: SECOND_LANGUAGES,
      },
    ],
  },
  {
    title: 'Smoking & pets',
    fields: [
      {
        key: 'smokingReq',
        label: 'Smoking',
        type: 'chipSingle',
        options: ['Au pair must be a non-smoker', 'No preference'],
      },
      { key: 'pets', label: 'Do you have pets?', type: 'chipSingle', options: ['Yes', 'No'] },
    ],
  },
  {
    title: 'Introduce your family',
    sub: 'A few honest sentences help au pairs picture life with you.',
    fields: [
      {
        key: 'intro',
        label: 'About your family',
        type: 'textarea',
        placeholder: "e.g. We're a friendly, easy-going family of four in Hendon...",
      },
    ],
  },
  { title: 'Review your profile', type: 'review' },
];
