/* =====================================================================
   CONTENT: this is the only file you edit to change what the site says.
   (How pages LOOK is in pages.js and styles.css. You do not need those.)

   Each entry in BOOKS is one book on the shelf.
     title   text on the spine and cover
     hint    short label (bottom navigation and cover)
     say     what the character says when you point at the book
     color   cover colour      ink   lettering colour on the cover
     tint    background colour behind illustrations inside the book
     theme   which page style the book uses (styles.css has one per book)
     motif   cover artwork: 'burst' | 'scatter' | 'bars' | 'rings' | 'orbit' | 'arrow'
     t, h    thickness and height of the book on the shelf
     pages   the pages, in reading order. Pages are shown two at a time
             (left, right), so keep the number of pages even.

   A page is { kicker:'small label top right', blocks:[ ... ] }.
   A block is one piece of the page. The kinds you can use:

     { title:'Big headline' }               add small:true for a smaller one
     { lead:'One or two sentences.' }
     { text:'A paragraph. HTML is allowed.' }
     { bubble:'A speech bubble said by you.' }
     { caption:'Yellow narrator box.' }
     { callout:'One huge statement.' }
     { stats:[{ n:'63/104', l:'what the number means' }] }
     { timeline:[{ when:'2019', what:'What happened', note:'detail' }] }
     { panels:[{ cap:'Label', h:'Heading', p:'Text' }], cols:2 }
     { art:'football', sfx:'GOAL!' }        a drawing from art.js
     { img:'assets/shot.png', alt:'What it shows' }   your own picture
     { flow:['Step', 'Step', 'Step'] }      boxes joined by arrows
     { chips:['Python', 'SQL'], label:'Built with' }
     { links:[{ label:'GitHub', url:'https://...' }] }
     { list:['Point', 'Point'] }
     { job:{ role:'', company:'', dates:'', place:'' } }
     { groups:[{ icon:'brackets', name:'Programming', items:['Python'] }] }
     { paper:{ status:'Completed', h:'Title', p:'Summary' } }
     { todo:'What still needs to be written here.' }   a visible gap to fill later

   TO ADD A PROJECT: copy the two pages marked "FILE 05" in The Project
   Files, paste them after it, and change the text.
   ===================================================================== */
export const BOOKS = [
  /* ------------------------------------------------------------------ */
  {
    title: 'The Origin Story', hint: 'About me', say: 'How it all started.',
    color: '#8a1c2e', ink: '#f3e6c4', tint: '#c9a063', theme: 'origin', motif: 'burst', t: .6, h: 2.55,
    pages: [
      { kicker: 'Meet the hero', blocks: [
        { title: 'Hi, I\'m Nanda.' },
        { bubble: 'I\'m a Master of Data Science student at Monash University in Melbourne. Before this I spent two years as an engineer keeping production systems running. I like models that leave the notebook and do a job.' },
        { stats: [{ n: '2 yrs', l: 'in industry before the Masters' }, { n: '78.25', l: 'WAM at Monash (Distinction)' }, { n: '9.39', l: 'CGPA out of 10, B.Tech' }] },
        { panels: [
          { cap: 'What I do', p: 'Build and evaluate machine learning models, then wrap them in an API so other people can use them.' },
          { cap: 'Where I come from', p: 'Electronics engineering, then two years of Java and SQL on live government systems.' },
        ], cols: 2 },
        { caption: 'Based in Melbourne. Open to internships for summer 2026/27.' },
      ] },
      { kicker: 'The story so far', blocks: [
        { title: 'From circuits to data', small: true },
        { timeline: [
          { when: '2019', what: 'Starts a B.Tech in Electronics and Communication', note: 'TKM College of Engineering, Kollam, India' },
          { when: '2020', what: 'First industry code: Frontend Developer at Evoura', note: 'A two-month internship in Kochi' },
          { when: '2023', what: 'Graduates with Honours and joins TCS', note: 'Systems Engineer on a UK Government client' },
          { when: '2025', what: 'Moves to Melbourne for the Master of Data Science', note: 'Monash University' },
          { when: '2026', what: 'Leads a 7-person team at KitaHQ and ships a World Cup predictor', note: 'The predictor ran live through the tournament' },
          { when: '2027', what: 'Final semester, then graduate roles', note: 'Finishing mid-2027' },
        ] },
      ] },
      { kicker: 'Education', blocks: [
        { title: 'The training arc', small: true },
        { panels: [
          { cap: '2025 to 2027 · Melbourne', h: 'Master of Data Science, Monash University',
            p: 'WAM 78.25 (Distinction). High Distinctions in Foundations of Data Science (85), Python Programming (83) and Databases (80). Studying machine learning, big data processing and data visualisation.' },
          { cap: '2019 to 2023 · Kollam, India', h: 'B.Tech (Honours), Electronics and Communication Engineering',
            p: 'TKM College of Engineering. CGPA 9.39/10, with a minor in Computer Science. Co-authored a research paper published in IEEE Xplore.' },
        ] },
        { stats: [{ n: '85', l: 'Foundations of Data Science (HD)' }, { n: '83', l: 'Python Programming (HD)' }, { n: '80', l: 'Databases (HD)' }] },
        { chips: ['Machine learning', 'Statistical modelling', 'Data wrangling', 'Databases', 'Data visualisation'], label: 'Studied' },
      ] },
      { kicker: 'Why data', blocks: [
        { title: 'How I got hooked', small: true },
        { art: 'network' },
        { caption: 'The World Cup predictor began as an idea from a Statistical Data Modelling assignment. I kept building after the marks were in.' },
        { todo: 'Two or three sentences in your own words: what pulled you from electronics toward data science?' },
      ] },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    title: 'The Project Files', hint: 'Projects', say: 'My favourite shelf. Open it!',
    color: '#e0a526', ink: '#1e1b18', tint: '#e0a526', theme: 'files', motif: 'scatter', t: .74, h: 2.85,
    pages: [
      /* ---- FILE 01 ---- */
      { kicker: 'File 01', layout: 'hero', blocks: [
        { title: 'FIFA World Cup 2026 Predictor' },
        { lead: 'Can 150 years of football results call a World Cup, match by match?' },
        { art: 'football', sfx: 'GOAL!' },
        { stats: [{ n: '63/104', l: 'live 2026 matches called correctly' }, { n: '4/4', l: 'quarter-finals called' }] },
      ] },
      { kicker: 'File 01 · Case notes', blocks: [
        { panels: [
          { cap: 'Problem', p: 'Predict win, draw or loss for international matches, with probabilities you can trust, and without leaking future information into the features.' },
          { cap: 'Approach', p: 'A calibrated XGBoost classifier trained on 47,000+ matches (1872 to 2026). Features include time-decayed form, head-to-head record, strength of schedule and FIFA ranking points. Matches are weighted by recency and by how much the competition matters.' },
          { cap: 'Result', dark: true, p: '62.5% accuracy on the held-out 2022 World Cup, against a baseline of about 45% for always picking the home side. Live in 2026: 60.6% overall and 75% when draws are excluded.' },
        ] },
        { flow: ['47k matches', 'Features', 'XGBoost + calibration', 'FastAPI', 'Monte Carlo'] },
        { chips: ['Python', 'XGBoost', 'SHAP', 'FastAPI', 'Railway'] },
        { links: [{ label: 'GitHub', url: 'https://github.com/Nanda777-max/wc26-predictor' }] },
      ] },
      /* ---- FILE 02 ---- */
      { kicker: 'File 02', layout: 'hero', blocks: [
        { title: 'The Shrinking Stage' },
        { lead: 'An interactive story about where Melbourne\'s live music venues went.' },
        { img: 'assets/shrinking-stage.png', alt: 'Screenshot of The Shrinking Stage' },
        { stats: [{ n: '92', l: 'venues traced through the city census' }, { n: '76%', l: 'of them in the CBD' }] },
      ] },
      { kicker: 'File 02 · Case notes', blocks: [
        { panels: [
          { cap: 'Problem', p: 'Venue closures make headlines, but the pattern behind them is hard to see. Which areas held on to their venues, and what set the survivors apart?' },
          { cap: 'Approach', p: 'A guided narrative visualisation, built by hand in D3, that walks through venue concentration, how long venues persisted, and how licence turnover moved with hospitality spending. A free-exploration view follows the story.' },
          { cap: 'Finding', dark: true, p: 'CBD venues lasted longer: a median of 12 years in the census, against 8 years elsewhere. Venue type and capacity showed no significant link to survival.' },
        ] },
        { chips: ['JavaScript', 'D3', 'Narrative visualisation', 'Statistical testing'] },
        { links: [{ label: 'Live demo' }] },
      ] },
      /* ---- FILE 03 ---- */
      { kicker: 'File 03', layout: 'hero', blocks: [
        { title: 'Ocean Odyssey Database' },
        { lead: 'A cruise booking system, designed from the schema up.' },
        { art: 'ship' },
        { stats: [{ n: '2', l: 'database engines: Oracle SQL and MongoDB' }] },
      ] },
      { kicker: 'File 03 · Case notes', blocks: [
        { panels: [
          { cap: 'Problem', p: 'Model a cruise company\'s ships, voyages, passengers and bookings so the data stays consistent as it grows.' },
          { cap: 'Approach', p: 'Relational schema design and SQL programming in Oracle, with a NoSQL layer in MongoDB for the parts that suit documents better.' },
        ] },
        { todo: 'One result or thing you learnt from this project.' },
        { chips: ['Oracle SQL', 'MongoDB', 'Schema design'] },
        { links: [{ label: 'GitHub', url: 'https://github.com/Nanda777-max/ocean-odyssey-database' }] },
      ] },
      /* ---- FILE 04 ---- */
      { kicker: 'File 04', layout: 'hero', blocks: [
        { title: 'Conversational AI Chatbot' },
        { lead: 'A chatbot that knows when it does not know.' },
        { art: 'chat' },
        { caption: 'Team project. I co-authored the report.' },
      ] },
      { kicker: 'File 04 · Case notes', blocks: [
        { panels: [
          { cap: 'Problem', p: 'Work out what a user is asking for, and only answer when the model is confident enough to be useful.' },
          { cap: 'Approach', p: 'A PyTorch feedforward network classifies intent from text prepared with an NLTK pipeline (tokenising, stemming, bag of words). A confidence threshold decides whether to reply. The interface is built in Streamlit.' },
          { cap: 'Outcome', dark: true, p: 'A full pipeline from training to live replies, plus a report comparing architectures, activation functions and confidence thresholds.' },
        ] },
        { flow: ['Message', 'NLTK pipeline', 'Intent network', 'Confidence check', 'Reply'] },
        { chips: ['PyTorch', 'NLTK', 'Streamlit', 'Flask'] },
      ] },
      /* ---- FILE 05 ---- */
      { kicker: 'File 05', layout: 'hero', blocks: [
        { title: 'IoT Health Monitor' },
        { lead: 'Heart rate, blood oxygen and an estimate of blood pressure from one small device.' },
        { art: 'heart' },
        { caption: 'Undergraduate project.' },
      ] },
      { kicker: 'File 05 · Case notes', blocks: [
        { panels: [
          { cap: 'Problem', p: 'Build a low-cost monitor for heart rate and SpO2, and estimate blood pressure without a cuff.' },
          { cap: 'Approach', p: 'An ESP8266 reads a MAX30100 sensor, shows readings on an LCD, sends them over WiFi and logs them. An SVM regression model estimates blood pressure from the live signal.' },
          { cap: 'Debugging', dark: true, p: 'The sensor would not talk to the board at first. I traced it to an I2C logic-level fault and fixed it.' },
        ] },
        { flow: ['Sensor', 'ESP8266', 'WiFi', 'SVM model', 'Reading'] },
        { chips: ['ESP8266', 'MAX30100', 'Python', 'scikit-learn'] },
      ] },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    title: 'The Experience', hint: 'Work history', say: 'Where I learnt to ship.',
    color: '#1f5f5b', ink: '#f3e6c4', tint: '#7fb0a4', theme: 'career', motif: 'bars', t: .58, h: 2.4,
    pages: [
      { kicker: 'Career so far', blocks: [
        { title: 'Three stops, one habit: ship it.' },
        { timeline: [
          { when: '2026', what: 'KitaHQ · Team Lead, Business Development', note: 'Jun to Jul 2026 · remote' },
          { when: '2023', what: 'Tata Consultancy Services · Systems Engineer', note: 'Aug 2023 to Jun 2025 · Kolkata' },
          { when: '2020', what: 'Evoura Technologies · Frontend Developer', note: 'Dec 2020 to Jan 2021 · Kochi' },
        ] },
        { stats: [{ n: '2 yrs', l: 'production engineering' }, { n: '7', l: 'people led across 4 countries' }] },
      ] },
      { kicker: 'Milestone 01', blocks: [
        { job: { role: 'Team Lead, Business Development', company: 'KitaHQ', dates: 'Jun to Jul 2026', place: 'remote' } },
        { callout: '5,000+ leads' },
        { text: 'Led a 7-person team spread across Australia, the UK, Indonesia and Malaysia, coordinating B2B lead generation in four markets for an AI recruitment platform. Part of the Monash–Warwick Alliance TeaMWork internship.' },
        { stats: [{ n: '1,700+', l: 'outreach messages sent' }, { n: '4', l: 'markets covered' }] },
        { chips: ['Team leadership', 'Apollo.io', 'FrappeCRM'] },
      ] },
      { kicker: 'Milestone 02', blocks: [
        { job: { role: 'Systems Engineer', company: 'Tata Consultancy Services', dates: 'Aug 2023 to Jun 2025', place: 'Kolkata, India' } },
        { caption: 'Client: a UK Government department. The systems were live, so reliability came first.' },
        { list: [
          'Developed and maintained Java APIs and SQL batch data processes that kept data moving across production systems.',
          'Worked with cross-functional and third-party teams to integrate external systems.',
          'Resolved data-exchange and reliability issues under live operational constraints.',
        ] },
        { chips: ['Java', 'SQL', 'API integration', 'Production support'] },
      ] },
      { kicker: 'Milestone 03', blocks: [
        { job: { role: 'Frontend Developer', company: 'Evoura Technologies', dates: 'Dec 2020 to Jan 2021', place: 'Kochi, India' } },
        { art: 'browser' },
        { text: 'Built responsive web interfaces for evoura.in in HTML, CSS and JavaScript, on a React project, working with the design and backend teams to tight deadlines.' },
        { chips: ['React', 'JavaScript', 'HTML/CSS'] },
      ] },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    title: 'The Toolbox', hint: 'Skills', say: 'Every hero needs gadgets.',
    color: '#f3e6c4', ink: '#6e1423', tint: '#d9b06a', theme: 'tools', motif: 'rings', t: .68, h: 2.7,
    pages: [
      { kicker: 'What I build with', blocks: [
        { title: 'The Toolbox' },
        { lead: 'Grouped by the job each tool does. Everything here has been used in a project or at work.' },
        { groups: [
          { icon: 'brackets', name: 'Programming', items: ['Python', 'SQL', 'Java', 'JavaScript', 'HTML/CSS'] },
          { icon: 'network', name: 'Machine learning', items: ['scikit-learn', 'XGBoost', 'PyTorch', 'NLTK', 'SHAP'], note: 'Feature engineering, probability calibration, model evaluation, Monte Carlo simulation.' },
          { icon: 'server', name: 'Data handling', items: ['pandas', 'NumPy', 'SQL batch processing'] },
        ] },
      ] },
      { kicker: 'What I ship with', blocks: [
        { groups: [
          { icon: 'browser', name: 'Visualisation', items: ['D3', 'Tableau', 'Matplotlib', 'Excel'] },
          { icon: 'wrench', name: 'Deployment and tools', items: ['FastAPI', 'Flask', 'Streamlit', 'REST APIs', 'Railway', 'Git and GitHub'] },
          { icon: 'team', name: 'Working with people', items: ['Stakeholder communication', 'Cross-functional delivery', 'Team leadership'] },
        ] },
        { todo: 'Anything you are learning right now that you want listed as "in progress".' },
      ] },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    title: 'The Research Lab', hint: 'Research', say: 'Careful, experiments inside.',
    color: '#ff5a1f', ink: '#1e1b18', tint: '#f0a37c', theme: 'lab', motif: 'orbit', t: .6, h: 2.5,
    pages: [
      { kicker: 'Completed work', blocks: [
        { title: 'The Research Lab' },
        { paper: { status: 'Completed', h: 'Research paper in IEEE Xplore (WAMS 2024)',
          p: 'Co-authored during my undergraduate degree and presented at WAMS 2024.' } },
        { todo: 'The paper\'s title and one sentence on what it found.' },
        { links: [{ label: 'Read on IEEE Xplore', url: 'https://ieeexplore.ieee.org/document/10528136' }] },
        { art: 'paper', sfx: 'PUBLISHED!' },
      ] },
      { kicker: 'Areas of interest', blocks: [
        { title: 'What I want to investigate', small: true },
        { paper: { status: 'Area of interest', h: 'Research interests', p: 'These are directions I want to explore, not completed work.' } },
        { todo: 'List two to four research interests, one line each.' },
        { art: 'flask' },
      ] },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    title: 'The Next Chapter', hint: 'Contact', say: 'Let\'s write the next one together.',
    color: '#1e1b18', ink: '#e0a526', tint: '#6e1423', theme: 'next', motif: 'arrow', t: .64, h: 2.62, lean: .11,
    pages: [
      { kicker: 'Availability', blocks: [
        { title: 'To be continued…' },
        { callout: 'Open to internships, summer 2026/27' },
        { stats: [{ n: 'Mid-2027', l: 'graduating, then open to graduate roles' }, { n: 'Melbourne', l: 'based here' }] },
        { caption: 'Data, machine learning and AI roles.' },
      ] },
      { kicker: 'Get in touch', blocks: [
        { title: 'Write the next page with me', small: true },
        { bubble: 'The quickest way to reach me is a message on LinkedIn.' },
        { links: [
          { label: 'LinkedIn', url: 'https://www.linkedin.com/in/nanda-kishor-s-3286381b4' },
          { label: 'GitHub', url: 'https://github.com/Nanda777-max' },
          { label: 'Download CV' },      /* add  url:'assets/Nanda_Kishor_Sajeev_Resume.pdf'  once the PDF is in assets/ */
          { label: 'Email' },            /* add  url:'mailto:you@example.com'  if you want your email public */
        ] },
        { art: 'envelope' },
      ] },
    ],
  },
];

/* Short lines the character says. Edit freely. */
export const LINES = {
  hello: 'Hey! Pick a book.',
  idle: 'Pick a book, or throw the ball.',
  opened: 'Good pick!',
  closed: 'What next?',
  grab: 'Hey, that\'s my ball!',
  hit: 'Oof!',
  kick: 'Catch!',
  yourTurn: 'Your turn.',
  lampOn: 'Ooh, mood lighting.',
  lampOff: 'Saving power. Smart.',
};
