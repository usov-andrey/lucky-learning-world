/**
 * Spelling Curriculum Catalog for Lucky's Learning World
 * Supports multi-lesson spelling decks:
 *  - Page 22 (Schwa ‹or›)
 *  - Schwa ‹er›
 *  - 'or' saying /er/
 *  - 'ear' saying /er/ (current default)
 *  - 'u' saying long /oo/
 *  - ‹ough›, ‹gh› and ‹augh›
 */

export const STORAGE_KEY_SELECTED_LESSON = "lmm3s:selected_spelling_lesson";
export const DEFAULT_SPELLING_LESSON_ID = "ear-saying-er";

export const PAGE_22_LESSON = {
  id: "page-22",
  title: "Spelling Test",
  pageLabel: "Page 22",
  topic: "Schwa ‹or›",
  wordCount: 18,
  words: [
    {
      word: "author",
      definition: "A person who writes books, stories, or articles.",
      extendedExplanation: "An author plans a storyline, creates memorable characters, and writes words to share ideas with readers.",
      exampleSentence: "The author visited our school to talk about her new adventure book.",
      image: "content/page-22/images/author.svg",
      imageAlt: "A hand writing with a pen",
      audio: "content/page-22/audio/01_author.wav",
      definitionAudio: "content/page-22/audio/definitions/01_author.wav",
      hint: "A person who writes books or stories"
    },
    {
      word: "error",
      definition: "A mistake; something that is not correct.",
      extendedExplanation: "When something does not go as planned or a calculation is wrong, it is called an error.",
      exampleSentence: "Lucky spotted a small spelling error and corrected it with an eraser.",
      image: "content/page-22/images/error.svg",
      imageAlt: "A red cross mark showing an error",
      audio: "content/page-22/audio/02_error.wav",
      definitionAudio: "content/page-22/audio/definitions/02_error.wav",
      hint: "A mistake or wrong answer"
    },
    {
      word: "doctor",
      definition: "A person who helps sick or injured people get better.",
      extendedExplanation: "A doctor examines patients, checks their health, and prescribes medicine so they feel well again.",
      exampleSentence: "The doctor listened to Lucky's heartbeat with a stethoscope.",
      image: "content/page-22/images/doctor.svg",
      imageAlt: "A doctor wearing a stethoscope",
      audio: "content/page-22/audio/03_doctor.wav",
      definitionAudio: "content/page-22/audio/definitions/03_doctor.wav",
      hint: "Helps sick people get better"
    },
    {
      word: "motor",
      definition: "A machine that makes something move.",
      extendedExplanation: "A motor turns electrical or fuel energy into mechanical movement to power cars, fans, and toys.",
      exampleSentence: "The quiet electric motor powered the toy boat across the pond.",
      image: "content/page-22/images/motor.svg",
      imageAlt: "A mechanical gear representing a motor",
      audio: "content/page-22/audio/04_motor.wav",
      definitionAudio: "content/page-22/audio/definitions/04_motor.wav",
      hint: "Machine that makes things move"
    },
    {
      word: "actor",
      definition: "A person who performs a character in a play, film, or show.",
      extendedExplanation: "An actor puts on costumes, learns lines, and performs on stage or screen to bring stories to life.",
      exampleSentence: "The actor put on a funny hat and made the audience laugh.",
      image: "content/page-22/images/actor.svg",
      imageAlt: "Theatre masks representing an actor",
      audio: "content/page-22/audio/05_actor.wav",
      definitionAudio: "content/page-22/audio/definitions/05_actor.wav",
      hint: "Performs in plays or movies"
    },
    {
      word: "terror",
      definition: "A feeling of very great fear.",
      extendedExplanation: "Terror is a strong emotion felt when facing sudden danger or something extremely scary.",
      exampleSentence: "The loud thunderclap filled the kitten with terror for a brief moment.",
      image: "content/page-22/images/terror.svg",
      imageAlt: "A face showing great fear",
      audio: "content/page-22/audio/06_terror.wav",
      definitionAudio: "content/page-22/audio/definitions/06_terror.wav",
      hint: "Great fear"
    },
    {
      word: "comfort",
      definition: "A feeling of being safe, calm, and free from pain.",
      extendedExplanation: "Comfort comes from being in a pleasant environment or receiving kind words from a friend.",
      exampleSentence: "Snuggling under a warm blanket brought her complete comfort.",
      image: "content/page-22/images/comfort.svg",
      imageAlt: "A comfortable sofa",
      audio: "content/page-22/audio/07_comfort.wav",
      definitionAudio: "content/page-22/audio/definitions/07_comfort.wav",
      hint: "Feeling safe, calm, and cozy"
    },
    {
      word: "senior",
      definition: "An older person, or someone at a higher level.",
      extendedExplanation: "A senior has more experience or age, like an older student in Grade 5 or a respected elder.",
      exampleSentence: "The senior students helped organize the annual school sports day.",
      image: "content/page-22/images/senior.svg",
      imageAlt: "An older person",
      audio: "content/page-22/audio/08_senior.wav",
      definitionAudio: "content/page-22/audio/definitions/08_senior.wav",
      hint: "Older or at a higher level"
    },
    {
      word: "razor",
      definition: "A small tool with a sharp blade used for shaving hair.",
      extendedExplanation: "A razor is carefully designed with a guarded blade to cut hair close to the skin safely.",
      exampleSentence: "Dad placed his razor neatly inside his washbag.",
      image: "content/page-22/images/razor.svg",
      imageAlt: "A shaving razor",
      audio: "content/page-22/audio/09_razor.wav",
      definitionAudio: "content/page-22/audio/definitions/09_razor.wav",
      hint: "Tool with sharp blade for shaving"
    },
    {
      word: "mirror",
      definition: "A smooth surface that shows your reflection.",
      extendedExplanation: "Light bounces off a glass mirror so you can clearly see your face and surroundings.",
      exampleSentence: "Lucky smiled at her reflection in the bedroom mirror.",
      image: "content/page-22/images/mirror.svg",
      imageAlt: "A standing mirror",
      audio: "content/page-22/audio/10_mirror.wav",
      definitionAudio: "content/page-22/audio/definitions/10_mirror.wav",
      hint: "Shows your reflection"
    },
    {
      word: "memory",
      definition: "Something you remember, or the ability to remember.",
      extendedExplanation: "Your memory stores thoughts, facts, and special moments so you can recall them later.",
      exampleSentence: "Building a sandcastle with her friends was a happy memory.",
      image: "content/page-22/images/memory.svg",
      imageAlt: "A brain representing memory",
      audio: "content/page-22/audio/11_memory.wav",
      definitionAudio: "content/page-22/audio/definitions/11_memory.wav",
      hint: "Ability to remember things"
    },
    {
      word: "stubborn",
      definition: "Not willing to change your mind or do what others ask.",
      extendedExplanation: "A stubborn person or animal holds onto their decision firmly, even when persuaded.",
      exampleSentence: "The stubborn little donkey refused to cross the wooden bridge.",
      image: "content/page-22/images/stubborn.svg",
      imageAlt: "A person refusing to change their mind",
      audio: "content/page-22/audio/12_stubborn.wav",
      definitionAudio: "content/page-22/audio/definitions/12_stubborn.wav",
      hint: "Not willing to change your mind"
    },
    {
      word: "calculator",
      definition: "A device used to work out numbers.",
      extendedExplanation: "A calculator uses electronic buttons to quickly add, subtract, multiply, and divide math problems.",
      exampleSentence: "She checked her math homework answers using a pocket calculator.",
      image: "content/page-22/images/calculator.svg",
      imageAlt: "A calculator",
      audio: "content/page-22/audio/13_calculator.wav",
      definitionAudio: "content/page-22/audio/definitions/13_calculator.wav",
      hint: "Device used to calculate numbers"
    },
    {
      word: "visitor",
      definition: "A person who comes to see a place or another person.",
      extendedExplanation: "A visitor travels to a friend's house, a museum, or a school to meet people and explore.",
      exampleSentence: "Our class welcomed a guest visitor from the local science center.",
      image: "content/page-22/images/visitor.svg",
      imageAlt: "A visitor waving hello",
      audio: "content/page-22/audio/14_visitor.wav",
      definitionAudio: "content/page-22/audio/definitions/14_visitor.wav",
      hint: "Person who comes to visit"
    },
    {
      word: "collector",
      definition: "A person who gathers and keeps a group of similar things.",
      extendedExplanation: "A collector enjoys searching for items like stamps, cards, or coins to complete a set.",
      exampleSentence: "As a pet collector, Lucky loved rescuing new characters in Pokédex.",
      image: "content/page-22/images/collector.svg",
      imageAlt: "A box holding collected things",
      audio: "content/page-22/audio/15_collector.wav",
      definitionAudio: "content/page-22/audio/definitions/15_collector.wav",
      hint: "Gathers and keeps items"
    },
    {
      word: "escalator",
      definition: "Moving stairs that carry people up or down.",
      extendedExplanation: "An escalator is a continuous motorized staircase that carries passengers between building floors.",
      exampleSentence: "We rode the escalator up to the top floor of the shopping mall.",
      image: "content/page-22/images/escalator.jpg",
      imageAlt: "An escalator next to a flight of stairs",
      audio: "content/page-22/audio/16_escalator.wav",
      definitionAudio: "content/page-22/audio/definitions/16_escalator.wav",
      hint: "Moving stairs in a building"
    },
    {
      word: "decoration",
      definition: "Something used to make a place or object look nicer.",
      extendedExplanation: "Decorations like lights, ribbons, and posters make rooms bright and festive for celebrations.",
      exampleSentence: "They hung colorful balloon decorations for the birthday party.",
      image: "content/page-22/images/decoration.svg",
      imageAlt: "A colourful balloon decoration",
      audio: "content/page-22/audio/17_decoration.wav",
      definitionAudio: "content/page-22/audio/definitions/17_decoration.wav",
      hint: "Makes a room or object look nice"
    },
    {
      word: "opportunity",
      definition: "A good chance to do or achieve something.",
      extendedExplanation: "An opportunity gives you a positive moment to learn a new skill, join a game, or succeed.",
      exampleSentence: "Joining the chess club was a wonderful opportunity to make new friends.",
      image: "content/page-22/images/opportunity.svg",
      imageAlt: "An open door representing an opportunity",
      audio: "content/page-22/audio/18_opportunity.wav",
      definitionAudio: "content/page-22/audio/definitions/18_opportunity.wav",
      hint: "A good chance to do something"
    }
  ]
};

export const SCHWA_ER_LESSON = {
  id: "schwa-er",
  title: "Spelling Test",
  pageLabel: "Schwa ‹er›",
  topic: "Schwa ‹er›",
  wordCount: 18,
  words: [
    {
      word: "pattern",
      definition: "A design or arrangement that repeats in a regular way.",
      extendedExplanation: "When shapes, colors, or numbers repeat over and over in the same order, they make a pattern.",
      exampleSentence: "Lucky drew a colorful pattern of stars and circles on her notebook.",
      image: "content/schwa-er/images/pattern.svg",
      imageAlt: "A repeating pattern of colorful geometric shapes",
      audio: "content/schwa-er/audio/01_pattern.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/01_pattern.mp3",
      hint: "A repeating design or arrangement"
    },
    {
      word: "referee",
      definition: "An official who makes sure players follow the rules in a game or sport.",
      extendedExplanation: "The referee watches the game closely, blows a whistle, and makes sure everyone plays fairly.",
      exampleSentence: "The referee blew his whistle to mark the start of the football match.",
      image: "content/schwa-er/images/referee.svg",
      imageAlt: "A sports referee blowing a whistle",
      audio: "content/schwa-er/audio/02_referee.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/02_referee.mp3",
      hint: "Official who enforces sports rules"
    },
    {
      word: "opera",
      definition: "A story told through music and singing on a stage.",
      extendedExplanation: "In an opera, performers sing their lines on stage accompanied by an orchestra to tell a dramatic story.",
      exampleSentence: "We went to the theater to watch a magical opera with beautiful singing.",
      image: "content/schwa-er/images/opera.svg",
      imageAlt: "A singer performing on stage in an opera",
      audio: "content/schwa-er/audio/03_opera.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/03_opera.mp3",
      hint: "A story told through singing on stage"
    },
    {
      word: "cavern",
      definition: "A large cave or a large hollow space inside the ground.",
      extendedExplanation: "A cavern is a giant underground room made of rock, often filled with stalactites hanging from the ceiling.",
      exampleSentence: "The explorers turned on their flashlights as they stepped into the dark cavern.",
      image: "content/schwa-er/images/cavern.svg",
      imageAlt: "A large underground cave or cavern",
      audio: "content/schwa-er/audio/04_cavern.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/04_cavern.mp3",
      hint: "A large cave underground"
    },
    {
      word: "modern",
      definition: "Related to the present time or using new ideas and methods.",
      extendedExplanation: "Something modern uses up-to-date technology and fresh designs created recently.",
      exampleSentence: "The new library has modern computers and comfortable study pods.",
      image: "content/schwa-er/images/modern.svg",
      imageAlt: "A modern futuristic building design",
      audio: "content/schwa-er/audio/05_modern.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/05_modern.mp3",
      hint: "New, recent, or present-day"
    },
    {
      word: "manners",
      definition: "Polite ways of behaving toward other people.",
      extendedExplanation: "Good manners include saying 'please' and 'thank you' and treating everyone with respect.",
      exampleSentence: "Lucky showed great manners by holding the door open for her teacher.",
      image: "content/schwa-er/images/manners.svg",
      imageAlt: "Two children politely shaking hands",
      audio: "content/schwa-er/audio/06_manners.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/06_manners.mp3",
      hint: "Polite behavior toward others"
    },
    {
      word: "general",
      definition: "About many people or things, rather than one particular one.",
      extendedExplanation: "A general statement covers the main idea or the whole group instead of tiny specific details.",
      exampleSentence: "In general, cats enjoy taking warm naps in the sunshine.",
      image: "content/schwa-er/images/general.svg",
      imageAlt: "An overview icon showing a broad general group",
      audio: "content/schwa-er/audio/07_general.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/07_general.mp3",
      hint: "Broad or affecting most things"
    },
    {
      word: "interest",
      definition: "A feeling of wanting to know or learn more about something.",
      extendedExplanation: "When you have an interest in a topic, you feel curious and excited to discover more about it.",
      exampleSentence: "Her interest in space grew after she looked through a telescope.",
      image: "content/schwa-er/images/interest.svg",
      imageAlt: "A child exploring with a magnifying glass",
      audio: "content/schwa-er/audio/08_interest.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/08_interest.mp3",
      hint: "Wanting to know or learn more"
    },
    {
      word: "average",
      definition: "A number that shows the typical value in a group of numbers.",
      extendedExplanation: "To find an average, you combine all the values and divide by how many there are to get a typical middle score.",
      exampleSentence: "The average score on the spelling quiz was fifteen out of eighteen.",
      image: "content/schwa-er/images/average.svg",
      imageAlt: "A chart displaying an average baseline",
      audio: "content/schwa-er/audio/09_average.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/09_average.mp3",
      hint: "Typical value of a set of numbers"
    },
    {
      word: "weather",
      definition: "The condition of the air outside, such as sun, rain, wind, or temperature.",
      extendedExplanation: "Weather describes whether it is rainy, sunny, windy, snowy, or hot outdoors right now.",
      exampleSentence: "The weather was bright and sunny during our weekend picnic.",
      image: "content/schwa-er/images/weather.svg",
      imageAlt: "Sun and raincloud representing outdoor weather",
      audio: "content/schwa-er/audio/10_weather.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/10_weather.mp3",
      hint: "Outdoor condition like sun, rain, or wind"
    },
    {
      word: "different",
      definition: "Not the same as someone or something else.",
      extendedExplanation: "When two objects or ideas are different, they have distinct features that set them apart.",
      exampleSentence: "Each snowflake has a different, unique pattern.",
      image: "content/schwa-er/images/different.svg",
      imageAlt: "Shapes of different colors and sizes",
      audio: "content/schwa-er/audio/11_different.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/11_different.mp3",
      hint: "Not the same; distinct"
    },
    {
      word: "interrupt",
      definition: "To stop someone while they are speaking or doing something.",
      extendedExplanation: "Interrupting means breaking into a conversation before the other person finishes talking.",
      exampleSentence: "Please do not interrupt while your classmate is giving their presentation.",
      image: "content/schwa-er/images/interrupt.svg",
      imageAlt: "A hand signal raising to speak politely without interrupting",
      audio: "content/schwa-er/audio/12_interrupt.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/12_interrupt.mp3",
      hint: "To break into a speaker's turn"
    },
    {
      word: "exaggerate",
      definition: "To make something seem bigger, better, worse, or more important than it really is.",
      extendedExplanation: "When you exaggerate, you stretch the truth to make a story sound more exciting or dramatic.",
      exampleSentence: "He exaggerated when he said he caught a fish as big as a boat!",
      image: "content/schwa-er/images/exaggerate.svg",
      imageAlt: "A cartoon fish shown giant in scale",
      audio: "content/schwa-er/audio/13_exaggerate.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/13_exaggerate.mp3",
      hint: "To stretch the truth to sound bigger"
    },
    {
      word: "whether",
      definition: "Used when talking about a choice between two possibilities.",
      extendedExplanation: "We use 'whether' when deciding between two options, like whether to play inside or outside.",
      exampleSentence: "I cannot decide whether to choose chocolate or vanilla ice cream.",
      image: "content/schwa-er/images/whether.svg",
      imageAlt: "A signpost pointing left or right representing a choice",
      audio: "content/schwa-er/audio/14_whether.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/14_whether.mp3",
      hint: "Expressing a choice between options"
    },
    {
      word: "caterpillar",
      definition: "A small, soft animal that will grow into a butterfly or moth.",
      extendedExplanation: "A caterpillar crawls on leaves, eats green plants, spins a cocoon, and transforms into a butterfly.",
      exampleSentence: "A fuzzy green caterpillar was munching on a fresh leaf.",
      image: "content/schwa-er/images/caterpillar.svg",
      imageAlt: "A green caterpillar crawling on a leaf",
      audio: "content/schwa-er/audio/15_caterpillar.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/15_caterpillar.mp3",
      hint: "Crawling insect that becomes a butterfly"
    },
    {
      word: "desperate",
      definition: "Feeling that you need something very badly and are willing to do almost anything.",
      extendedExplanation: "When someone is desperate, they feel an urgent need to solve a problem right away.",
      exampleSentence: "The lost puppy was desperate to find its way back home.",
      image: "content/schwa-er/images/desperate.svg",
      imageAlt: "A character seeking urgent help",
      audio: "content/schwa-er/audio/16_desperate.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/16_desperate.mp3",
      hint: "Needing something very urgently"
    },
    {
      word: "rhinoceros",
      definition: "A very large animal with thick skin and one or two horns on its nose.",
      extendedExplanation: "A rhinoceros is a heavy wild mammal that lives in Africa and Asia, famous for its tough skin and nose horns.",
      exampleSentence: "We spotted a majestic rhinoceros resting in the shade at the wildlife park.",
      image: "content/schwa-er/images/rhinoceros.svg",
      imageAlt: "A large rhinoceros with a prominent nose horn",
      audio: "content/schwa-er/audio/17_rhinoceros.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/17_rhinoceros.mp3",
      hint: "Large horned wild mammal"
    },
    {
      word: "temperature",
      definition: "A measure of how hot or cold something is.",
      extendedExplanation: "We measure temperature using a thermometer to see if the air or water is cold, warm, or hot.",
      exampleSentence: "The thermometer showed an outdoor temperature of thirty degrees.",
      image: "content/schwa-er/images/temperature.svg",
      imageAlt: "A thermometer measuring temperature",
      audio: "content/schwa-er/audio/18_temperature.mp3",
      definitionAudio: "content/schwa-er/audio/definitions/18_temperature.mp3",
      hint: "Measure of how hot or cold something is"
    }
  ]
};

export const OR_SAYING_ER_LESSON = {
  id: "or-saying-er",
  title: "Spelling Test",
  pageLabel: "'or' saying /er/",
  topic: "'or' saying /er/",
  wordCount: 18,
  words: [
    {
      word: "worm",
      definition: "A long, thin animal with no legs that often lives in soil.",
      extendedExplanation: "A worm moves by stretching and squeezing its soft body, and many worms help keep garden soil healthy.",
      exampleSentence: "A small worm wriggled through the damp soil after the rain.",
      image: "content/or-saying-er/images/worm.svg",
      imageAlt: "A pink earthworm wriggling through soil",
      audio: "content/or-saying-er/audio/01_worm.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/01_worm.mp3",
      hint: "A long, legless animal that lives in soil"
    },
    {
      word: "word",
      definition: "A sound or group of letters that has meaning.",
      extendedExplanation: "Words are the building blocks we join together to share ideas in speech and writing.",
      exampleSentence: "Lucky learned how to spell a new word in class.",
      image: "content/or-saying-er/images/word.svg",
      imageAlt: "Letter blocks forming a word",
      audio: "content/or-saying-er/audio/02_word.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/02_word.mp3",
      hint: "Letters or sounds joined to make meaning"
    },
    {
      word: "world",
      definition: "The Earth and all the people, places, and things on it.",
      extendedExplanation: "The world includes every continent, ocean, living thing, and community on planet Earth.",
      exampleSentence: "People around the world celebrate many different festivals.",
      image: "content/or-saying-er/images/world.svg",
      imageAlt: "Planet Earth with blue oceans and green continents",
      audio: "content/or-saying-er/audio/03_world.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/03_world.mp3",
      hint: "Earth and everything on it"
    },
    {
      word: "worst",
      definition: "The least good or most unpleasant of all.",
      extendedExplanation: "Worst compares three or more things and identifies the one with the lowest quality or hardest result.",
      exampleSentence: "The worst part of the storm was the loud thunder.",
      image: "content/or-saying-er/images/worst.svg",
      imageAlt: "Three rating cards with the lowest one highlighted",
      audio: "content/or-saying-er/audio/04_worst.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/04_worst.mp3",
      hint: "The least good of all"
    },
    {
      word: "worker",
      definition: "A person who does a job or performs useful work.",
      extendedExplanation: "A worker uses effort and skills to complete tasks in places such as schools, farms, shops, or offices.",
      exampleSentence: "The construction worker wore a bright safety helmet.",
      image: "content/or-saying-er/images/worker.svg",
      imageAlt: "A construction worker wearing a safety helmet",
      audio: "content/or-saying-er/audio/05_worker.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/05_worker.mp3",
      hint: "A person who does a job"
    },
    {
      word: "worse",
      definition: "More bad, difficult, or unpleasant than something else.",
      extendedExplanation: "Worse compares two things and tells us that one has a lower quality or a less pleasant result.",
      exampleSentence: "The traffic became worse when the heavy rain began.",
      image: "content/or-saying-er/images/worse.svg",
      imageAlt: "Two weather cards showing one condition becoming worse",
      audio: "content/or-saying-er/audio/06_worse.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/06_worse.mp3",
      hint: "More bad or unpleasant than another"
    },
    {
      word: "workable",
      definition: "Able to be done successfully or used effectively.",
      extendedExplanation: "A workable idea is practical enough to put into action and has a good chance of succeeding.",
      exampleSentence: "The team found a workable plan for finishing the project on time.",
      image: "content/or-saying-er/images/workable.svg",
      imageAlt: "A checklist beside a working gear",
      audio: "content/or-saying-er/audio/07_workable.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/07_workable.mp3",
      hint: "Practical and able to succeed"
    },
    {
      word: "worthy",
      definition: "Deserving respect, attention, or support.",
      extendedExplanation: "Something worthy has enough value or good qualities to deserve our time, praise, or care.",
      exampleSentence: "Protecting sea turtles is a worthy cause.",
      image: "content/or-saying-er/images/worthy.svg",
      imageAlt: "A gold medal with a star for a worthy achievement",
      audio: "content/or-saying-er/audio/08_worthy.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/08_worthy.mp3",
      hint: "Deserving respect or support"
    },
    {
      word: "worship",
      definition: "To show deep love, honor, or respect, especially to a god.",
      extendedExplanation: "People may worship by praying, singing, gathering together, or following the traditions of their faith.",
      exampleSentence: "Families gathered at the temple to worship together.",
      image: "content/or-saying-er/images/worship.svg",
      imageAlt: "Hands joined respectfully beneath a glowing heart",
      audio: "content/or-saying-er/audio/09_worship.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/09_worship.mp3",
      hint: "To show deep honor or religious devotion"
    },
    {
      word: "fireworks",
      definition: "Explosive devices that make bright colors and patterns in the sky.",
      extendedExplanation: "Fireworks are safely launched during celebrations and burst high above the ground into sparkling shapes.",
      exampleSentence: "Colorful fireworks lit up the night sky at the festival.",
      image: "content/or-saying-er/images/fireworks.svg",
      imageAlt: "Colorful fireworks bursting in a night sky",
      audio: "content/or-saying-er/audio/10_fireworks.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/10_fireworks.mp3",
      hint: "Bright celebration displays in the sky"
    },
    {
      word: "worksheet",
      definition: "A page of questions or activities for a learner to complete.",
      extendedExplanation: "A worksheet gives practice with a topic by providing spaces to write answers, solve problems, or match ideas.",
      exampleSentence: "Lucky completed the math worksheet before lunch.",
      image: "content/or-saying-er/images/worksheet.svg",
      imageAlt: "A worksheet page with questions and a pencil",
      audio: "content/or-saying-er/audio/11_worksheet.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/11_worksheet.mp3",
      hint: "A school page with activities to complete"
    },
    {
      word: "worthless",
      definition: "Having no useful purpose or value.",
      extendedExplanation: "An object may be called worthless when it cannot be used, sold, repaired, or recycled for anything helpful.",
      exampleSentence: "The broken token was worthless in the arcade machine.",
      image: "content/or-saying-er/images/worthless.svg",
      imageAlt: "A broken token marked with zero value",
      audio: "content/or-saying-er/audio/12_worthless.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/12_worthless.mp3",
      hint: "Having no use or value"
    },
    {
      word: "workmanship",
      definition: "The skill and care shown in making something.",
      extendedExplanation: "Good workmanship can be seen in neat details, strong construction, and careful choices made by the creator.",
      exampleSentence: "The smooth wooden toy showed excellent workmanship.",
      image: "content/or-saying-er/images/workmanship.svg",
      imageAlt: "Careful hands crafting a wooden object with tools",
      audio: "content/or-saying-er/audio/13_workmanship.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/13_workmanship.mp3",
      hint: "Skill and care used to make something"
    },
    {
      word: "worldliness",
      definition: "Experience and practical knowledge about life and the world.",
      extendedExplanation: "Worldliness can describe knowing how people and places work because of travel, reading, and many life experiences.",
      exampleSentence: "Her travels gave her a worldliness that helped her understand new customs.",
      image: "content/or-saying-er/images/worldliness.svg",
      imageAlt: "A globe surrounded by books and travel symbols",
      audio: "content/or-saying-er/audio/14_worldliness.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/14_worldliness.mp3",
      hint: "Practical knowledge gained from life experience"
    },
    {
      word: "workforce",
      definition: "All the people who work for a company, industry, or country.",
      extendedExplanation: "A workforce includes everyone whose different jobs and skills help an organization or economy operate.",
      exampleSentence: "The hospital workforce includes doctors, nurses, cooks, and cleaners.",
      image: "content/or-saying-er/images/workforce.svg",
      imageAlt: "A diverse group of workers standing together",
      audio: "content/or-saying-er/audio/15_workforce.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/15_workforce.mp3",
      hint: "All the people working for an organization"
    },
    {
      word: "worldwide",
      definition: "Happening or existing in every part of the world.",
      extendedExplanation: "Something worldwide reaches many countries and continents instead of staying in one local area.",
      exampleSentence: "The song became popular worldwide.",
      image: "content/or-saying-er/images/worldwide.svg",
      imageAlt: "Planet Earth connected by lines around the globe",
      audio: "content/or-saying-er/audio/16_worldwide.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/16_worldwide.mp3",
      hint: "Across the whole world"
    },
    {
      word: "worthwhile",
      definition: "Worth the time, effort, or money spent on it.",
      extendedExplanation: "An activity is worthwhile when the benefit, learning, or enjoyment you gain makes the effort a good choice.",
      exampleSentence: "Practising every day was worthwhile when Lucky played the song beautifully.",
      image: "content/or-saying-er/images/worthwhile.svg",
      imageAlt: "A path leading to a shining star and finish flag",
      audio: "content/or-saying-er/audio/17_worthwhile.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/17_worthwhile.mp3",
      hint: "Worth the time or effort"
    },
    {
      word: "worthlessness",
      definition: "The state of having no useful purpose or value.",
      extendedExplanation: "Worthlessness describes a lack of practical value in a thing; it should never be used to judge a person's importance.",
      exampleSentence: "The expired coupon's worthlessness became clear at the checkout.",
      image: "content/or-saying-er/images/worthlessness.svg",
      imageAlt: "An expired coupon marked with zero value",
      audio: "content/or-saying-er/audio/18_worthlessness.mp3",
      definitionAudio: "content/or-saying-er/audio/definitions/18_worthlessness.mp3",
      hint: "The state of having no practical value"
    }
  ]
};

export const EAR_SAYING_ER_LESSON = {
  id: "ear-saying-er",
  title: "Spelling Test",
  pageLabel: "'ear' saying /er/",
  topic: "'ear' saying /er/",
  wordCount: 18,
  words: [
    {
      word: "earn",
      definition: "To get money or a reward by working for it.",
      extendedExplanation: "When you earn something, you work for it first, like doing chores or a job, and then you receive money or a reward.",
      exampleSentence: "Lucky helped water the plants every day to earn extra playtime.",
      image: "content/ear-saying-er/images/earn.svg",
      imageAlt: "A hand holding a shiny gold coin",
      audio: "content/ear-saying-er/audio/01_earn.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/01_earn.mp3",
      hint: "To get money or a reward by working"
    },
    {
      word: "learn",
      definition: "To get new knowledge or a new skill.",
      extendedExplanation: "Learning happens when you practise, read, or listen carefully so you understand something you did not know before.",
      exampleSentence: "Lucky wants to learn ten new spelling words every week.",
      image: "content/ear-saying-er/images/learn.svg",
      imageAlt: "Two open books with a glowing lightbulb",
      audio: "content/ear-saying-er/audio/02_learn.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/02_learn.mp3",
      hint: "To get new knowledge or a skill"
    },
    {
      word: "heard",
      definition: "Noticed a sound with your ears; the past tense of hear.",
      extendedExplanation: "Heard describes something that already happened in the past, when a sound reached your ears and your brain noticed it.",
      exampleSentence: "Lucky heard the school bell ring from across the playground.",
      image: "content/ear-saying-er/images/heard.svg",
      imageAlt: "An ear with sound waves reaching it",
      audio: "content/ear-saying-er/audio/03_heard.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/03_heard.mp3",
      hint: "Past tense of hear"
    },
    {
      word: "earth",
      definition: "The planet that we live on.",
      extendedExplanation: "Earth is a huge round planet covered with oceans, land, mountains, and forests, and it is the only planet we know of with people, animals, and plants.",
      exampleSentence: "In science class, Lucky learned that Earth travels around the Sun.",
      image: "content/ear-saying-er/images/earth.svg",
      imageAlt: "Planet Earth with blue oceans and green continents",
      audio: "content/ear-saying-er/audio/04_earth.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/04_earth.mp3",
      hint: "The planet we live on"
    },
    {
      word: "search",
      definition: "To look carefully for something.",
      extendedExplanation: "When you search, you look in different places, one by one, until you find what you are looking for.",
      exampleSentence: "Lucky had to search her backpack for the missing pencil case.",
      image: "content/ear-saying-er/images/search.svg",
      imageAlt: "A magnifying glass",
      audio: "content/ear-saying-er/audio/05_search.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/05_search.mp3",
      hint: "To look carefully for something"
    },
    {
      word: "earnings",
      definition: "The money that someone earns from working.",
      extendedExplanation: "Earnings are the total amount of money a person receives after doing a job over a certain amount of time.",
      exampleSentence: "Dad put his weekly earnings into a savings account.",
      image: "content/ear-saying-er/images/earnings.svg",
      imageAlt: "A stack of gold coins",
      audio: "content/ear-saying-er/audio/06_earnings.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/06_earnings.mp3",
      hint: "Money earned from working"
    },
    {
      word: "yearn",
      definition: "To want something very much.",
      extendedExplanation: "When you yearn for something, you feel a strong, deep wish for it, almost like your heart is reaching out for it.",
      exampleSentence: "During the rainy season, Lucky would yearn for a sunny day at the beach.",
      image: "content/ear-saying-er/images/yearn.svg",
      imageAlt: "A heart reaching toward a sparkling star",
      audio: "content/ear-saying-er/audio/07_yearn.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/07_yearn.mp3",
      hint: "To want something very much"
    },
    {
      word: "early",
      definition: "Before the usual or expected time.",
      extendedExplanation: "Early means something happens sooner than planned, like waking up before the alarm or arriving before everyone else.",
      exampleSentence: "Lucky woke up early to watch the sunrise before school.",
      image: "content/ear-saying-er/images/early.svg",
      imageAlt: "A clock with the sun rising beside it",
      audio: "content/ear-saying-er/audio/08_early.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/08_early.mp3",
      hint: "Before the usual or expected time"
    },
    {
      word: "pearl",
      definition: "A small, shiny white ball found inside some shells, used for jewellery.",
      extendedExplanation: "A pearl forms slowly inside an oyster shell and can be strung together to make necklaces and bracelets.",
      exampleSentence: "Grandma wore a necklace made of smooth white pearls.",
      image: "content/ear-saying-er/images/pearl.svg",
      imageAlt: "A shiny white pearl inside an open shell",
      audio: "content/ear-saying-er/audio/09_pearl.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/09_pearl.mp3",
      hint: "Shiny white gem found in a shell"
    },
    {
      word: "dearth",
      definition: "A lack of something; not having enough of something.",
      extendedExplanation: "A dearth means there is far too little of something available, like a dearth of rain during a dry season.",
      exampleSentence: "There was a dearth of fresh vegetables at the market after the storm.",
      image: "content/ear-saying-er/images/dearth.svg",
      imageAlt: "An empty plate with a question mark",
      audio: "content/ear-saying-er/audio/10_dearth.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/10_dearth.mp3",
      hint: "Not having enough of something"
    },
    {
      word: "hearse",
      definition: "A special car used to carry a coffin at a funeral.",
      extendedExplanation: "A hearse is a long, quiet car that carries a coffin to a funeral so family and friends can say goodbye.",
      exampleSentence: "The hearse moved slowly at the front of the funeral procession.",
      image: "content/ear-saying-er/images/hearse.svg",
      imageAlt: "A long black car used at funerals",
      audio: "content/ear-saying-er/audio/11_hearse.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/11_hearse.mp3",
      hint: "A car that carries a coffin"
    },
    {
      word: "earnest",
      definition: "Serious and sincere about what you say or do.",
      extendedExplanation: "Being earnest means you truly mean what you say, without joking, and you put real effort and honesty into it.",
      exampleSentence: "Lucky made an earnest promise to practise the piano every day.",
      image: "content/ear-saying-er/images/earnest.svg",
      imageAlt: "A sincere face with a hand over the heart",
      audio: "content/ear-saying-er/audio/12_earnest.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/12_earnest.mp3",
      hint: "Serious and sincere"
    },
    {
      word: "rehearse",
      definition: "To practise something, like a play or a speech, before doing it for real.",
      extendedExplanation: "When you rehearse, you repeat your lines, songs, or moves so that you feel confident before the real performance.",
      exampleSentence: "The class had to rehearse the school play every afternoon this week.",
      image: "content/ear-saying-er/images/rehearse.svg",
      imageAlt: "A small stage with a spotlight for practising a play",
      audio: "content/ear-saying-er/audio/13_rehearse.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/13_rehearse.mp3",
      hint: "To practise before the real performance"
    },
    {
      word: "overheard",
      definition: "Heard something by accident that other people were saying.",
      extendedExplanation: "You overhear something when you were not part of the conversation but happened to catch what was said.",
      exampleSentence: "Lucky overheard her parents planning a surprise birthday party.",
      image: "content/ear-saying-er/images/overheard.svg",
      imageAlt: "Two speech bubbles being listened to by an ear",
      audio: "content/ear-saying-er/audio/14_overheard.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/14_overheard.mp3",
      hint: "Heard something by accident"
    },
    {
      word: "researcher",
      definition: "A person who studies a subject carefully to find out new information.",
      extendedExplanation: "A researcher asks questions, reads carefully, runs experiments, and collects facts to learn something new.",
      exampleSentence: "The researcher studied how sea turtles find their way back to the beach.",
      image: "content/ear-saying-er/images/researcher.svg",
      imageAlt: "A researcher holding a magnifying glass beside a book",
      audio: "content/ear-saying-er/audio/15_researcher.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/15_researcher.mp3",
      hint: "A person who studies a subject carefully"
    },
    {
      word: "searchlight",
      definition: "A powerful light used to search the sky or a large area at night.",
      extendedExplanation: "A searchlight sends out a very strong, focused beam of light that can sweep across the sky or the ground in the dark.",
      exampleSentence: "The searchlight swept across the night sky during the festival.",
      image: "content/ear-saying-er/images/searchlight.svg",
      imageAlt: "A powerful searchlight beaming into the night sky",
      audio: "content/ear-saying-er/audio/16_searchlight.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/16_searchlight.mp3",
      hint: "A powerful light used to search in the dark"
    },
    {
      word: "earthworm",
      definition: "A long, thin worm that lives in the soil.",
      extendedExplanation: "An earthworm wriggles through the ground, eating tiny bits of soil, and helps make the earth healthier for plants to grow.",
      exampleSentence: "After the rain, Lucky spotted an earthworm crossing the garden path.",
      image: "content/ear-saying-er/images/earthworm.svg",
      imageAlt: "A pink earthworm wriggling through soil",
      audio: "content/ear-saying-er/audio/17_earthworm.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/17_earthworm.mp3",
      hint: "A long, thin worm that lives in soil"
    },
    {
      word: "earthquake",
      definition: "A sudden shaking of the ground caused by movement deep in the earth.",
      extendedExplanation: "An earthquake happens when huge rocky plates deep underground suddenly shift, making the ground above shake.",
      exampleSentence: "The small earthquake rattled the windows but nobody was hurt.",
      image: "content/ear-saying-er/images/earthquake.svg",
      imageAlt: "Cracked ground with houses shaking",
      audio: "content/ear-saying-er/audio/18_earthquake.mp3",
      definitionAudio: "content/ear-saying-er/audio/definitions/18_earthquake.mp3",
      hint: "A sudden shaking of the ground"
    }
  ]
};

export const U_SAYING_OO_LESSON = {
  id: "u-saying-oo",
  title: "Spelling Test",
  pageLabel: "'u' saying long /oo/",
  topic: "'u' saying long /oo/",
  wordCount: 18,
  words: [
    {
      word: "super",
      definition: "Amazing, wonderful, or better than usual.",
      extendedExplanation: "People say something is super when it is very good, exciting, or impressive, often used to praise someone or something.",
      exampleSentence: "Lucky felt super happy when she finished all her homework early.",
      image: "content/u-saying-oo/images/super.svg",
      imageAlt: "A large glowing gold star surrounded by small sparkles",
      audio: "content/u-saying-oo/audio/01_super.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/01_super.mp3",
      hint: "Amazing or better than usual"
    },
    {
      word: "ruin",
      definition: "To spoil or destroy something completely.",
      extendedExplanation: "When something is ruined, it is damaged so badly that it can no longer be used or enjoyed the way it should be.",
      exampleSentence: "The heavy rain nearly ruined the paper decorations for the party.",
      image: "content/u-saying-oo/images/ruin.svg",
      imageAlt: "A cracked stone column, broken and toppled over",
      audio: "content/u-saying-oo/audio/02_ruin.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/02_ruin.mp3",
      hint: "To spoil or destroy something"
    },
    {
      word: "flu",
      definition: "An illness caused by a virus that gives you a fever, cough, and aches.",
      extendedExplanation: "The flu, short for influenza, spreads easily between people and often makes you feel tired, achy, and unwell for several days.",
      exampleSentence: "Lucky stayed home from school because she had the flu.",
      image: "content/u-saying-oo/images/flu.svg",
      imageAlt: "A medical thermometer next to a box of tissues",
      audio: "content/u-saying-oo/audio/03_flu.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/03_flu.mp3",
      hint: "A common illness with fever and cough"
    },
    {
      word: "fluid",
      definition: "A liquid that flows and takes the shape of its container.",
      extendedExplanation: "Fluid is any substance, like water or juice, that can flow freely and is not solid or rigid.",
      exampleSentence: "The scientist poured the blue fluid carefully into the glass beaker.",
      image: "content/u-saying-oo/images/fluid.svg",
      imageAlt: "A glass laboratory beaker filled with blue liquid",
      audio: "content/u-saying-oo/audio/04_fluid.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/04_fluid.mp3",
      hint: "A liquid that flows"
    },
    {
      word: "gnu",
      definition: "A large African animal with horns, also called a wildebeest.",
      extendedExplanation: "A gnu is a big, strong animal that lives in herds on the grasslands of Africa and has curved horns and a shaggy mane.",
      exampleSentence: "The gnu ran across the plain with the rest of its herd.",
      image: "content/u-saying-oo/images/gnu.svg",
      imageAlt: "A gnu, a large horned African animal, standing on grassland",
      audio: "content/u-saying-oo/audio/05_gnu.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/05_gnu.mp3",
      hint: "A large African animal, also called a wildebeest"
    },
    {
      word: "truth",
      definition: "Something that is true and correct; not a lie.",
      extendedExplanation: "The truth is what really happened or what is really the case, even if it is difficult to say out loud.",
      exampleSentence: "Lucky always tells the truth, even when she makes a mistake.",
      image: "content/u-saying-oo/images/truth.svg",
      imageAlt: "A speech bubble with a green checkmark inside",
      audio: "content/u-saying-oo/audio/06_truth.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/06_truth.mp3",
      hint: "Something that is true, not a lie"
    },
    {
      word: "truly",
      definition: "In a real, sincere, or complete way.",
      extendedExplanation: "When you do something truly, you do it with honest, genuine feeling, not just pretending.",
      exampleSentence: "Lucky was truly grateful for the surprise birthday gift.",
      image: "content/u-saying-oo/images/truly.svg",
      imageAlt: "A glowing pink heart with a soft sparkle",
      audio: "content/u-saying-oo/audio/07_truly.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/07_truly.mp3",
      hint: "In a real or sincere way"
    },
    {
      word: "cruel",
      definition: "Unkind and causing pain or suffering on purpose.",
      extendedExplanation: "A cruel person deliberately hurts or upsets others and shows no care about their feelings.",
      exampleSentence: "It was cruel of the boy to laugh at his friend's mistake.",
      image: "content/u-saying-oo/images/cruel.svg",
      imageAlt: "A sad face beside a small broken heart",
      audio: "content/u-saying-oo/audio/08_cruel.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/08_cruel.mp3",
      hint: "Unkind and causing pain on purpose"
    },
    {
      word: "lunar",
      definition: "Relating to the moon.",
      extendedExplanation: "Lunar describes anything connected to the moon, such as a lunar eclipse or a lunar calendar based on the moon's cycles.",
      exampleSentence: "The class watched a video about the first lunar landing.",
      image: "content/u-saying-oo/images/lunar.svg",
      imageAlt: "A crescent moon glowing among small stars",
      audio: "content/u-saying-oo/audio/09_lunar.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/09_lunar.mp3",
      hint: "Relating to the moon"
    },
    {
      word: "ruby",
      definition: "A red gemstone; a precious jewel.",
      extendedExplanation: "A ruby is a hard, sparkling red stone that is cut and polished to be used in rings, necklaces, and other jewellery.",
      exampleSentence: "Grandma's ring has a bright red ruby in the middle.",
      image: "content/u-saying-oo/images/ruby.svg",
      imageAlt: "A sparkling red gemstone cut into facets",
      audio: "content/u-saying-oo/audio/10_ruby.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/10_ruby.mp3",
      hint: "A red gemstone"
    },
    {
      word: "fluent",
      definition: "Able to speak or write a language easily and smoothly.",
      extendedExplanation: "Someone who is fluent in a language can talk, read, and write it quickly and correctly without having to stop and think.",
      exampleSentence: "After years of practice, Lucky's cousin became fluent in Thai.",
      image: "content/u-saying-oo/images/fluent.svg",
      imageAlt: "Two speech bubbles with different flag colours, showing two languages",
      audio: "content/u-saying-oo/audio/11_fluent.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/11_fluent.mp3",
      hint: "Able to speak a language smoothly"
    },
    {
      word: "superb",
      definition: "Excellent; extremely good.",
      extendedExplanation: "Something superb is of very high quality and impresses everyone who sees or experiences it.",
      exampleSentence: "The gymnast gave a superb performance and scored top marks.",
      image: "content/u-saying-oo/images/superb.svg",
      imageAlt: "A gold trophy with a ribbon on a small podium",
      audio: "content/u-saying-oo/audio/12_superb.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/12_superb.mp3",
      hint: "Excellent; extremely good"
    },
    {
      word: "crucial",
      definition: "Extremely important; necessary.",
      extendedExplanation: "Something crucial is so important that everything else depends on it, and things could go wrong without it.",
      exampleSentence: "Wearing a helmet is crucial when you ride a bike.",
      image: "content/u-saying-oo/images/crucial.svg",
      imageAlt: "A bicycle safety helmet with an important warning mark",
      audio: "content/u-saying-oo/audio/13_crucial.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/13_crucial.mp3",
      hint: "Extremely important; necessary"
    },
    {
      word: "frugal",
      definition: "Careful not to waste money or resources.",
      extendedExplanation: "A frugal person spends money wisely, saves what they can, and avoids buying things they do not really need.",
      exampleSentence: "Dad is frugal and always compares prices before buying anything.",
      image: "content/u-saying-oo/images/frugal.svg",
      imageAlt: "A pink piggy bank with a coin dropping into the slot",
      audio: "content/u-saying-oo/audio/14_frugal.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/14_frugal.mp3",
      hint: "Careful not to waste money"
    },
    {
      word: "glucose",
      definition: "A type of sugar found in plants and used by the body for energy.",
      extendedExplanation: "Glucose is a simple sugar that gives the body energy to move, think, and grow, and it is found in many foods like fruit.",
      exampleSentence: "The science lesson explained how plants make glucose from sunlight.",
      image: "content/u-saying-oo/images/glucose.svg",
      imageAlt: "A green leaf with a bright sun and an energy spark",
      audio: "content/u-saying-oo/audio/15_glucose.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/15_glucose.mp3",
      hint: "A sugar that gives the body energy"
    },
    {
      word: "superior",
      definition: "Better in quality than something else.",
      extendedExplanation: "When something is superior, it is of a higher standard or quality compared with another thing it is measured against.",
      exampleSentence: "The new bike helmet offered superior protection compared to the old one.",
      image: "content/u-saying-oo/images/superior.svg",
      imageAlt: "Two shields side by side, one taller and glowing brighter than the other",
      audio: "content/u-saying-oo/audio/16_superior.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/16_superior.mp3",
      hint: "Better in quality than something else"
    },
    {
      word: "plumage",
      definition: "The feathers covering a bird.",
      extendedExplanation: "Plumage is the layer of feathers that covers a bird's body, often colourful and used to attract mates or stay warm.",
      exampleSentence: "The peacock's bright blue and green plumage caught everyone's eye.",
      image: "content/u-saying-oo/images/plumage.svg",
      imageAlt: "A colourful peacock feather with an eye-shaped pattern",
      audio: "content/u-saying-oo/audio/17_plumage.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/17_plumage.mp3",
      hint: "The feathers covering a bird"
    },
    {
      word: "translucent",
      definition: "Allowing light to pass through, but not clear enough to see through sharply.",
      extendedExplanation: "A translucent material lets light shine through it softly, but you cannot see a clear picture of what is on the other side.",
      exampleSentence: "Sunlight glowed through the translucent curtains in the morning.",
      image: "content/u-saying-oo/images/translucent.svg",
      imageAlt: "A frosted glass window pane with soft light glowing through it",
      audio: "content/u-saying-oo/audio/18_translucent.mp3",
      definitionAudio: "content/u-saying-oo/audio/definitions/18_translucent.mp3",
      hint: "Lets light through but is not fully clear"
    }
  ]
};

export const OUGH_GH_AUGH_LESSON = {
  id: "ough-gh-augh",
  title: "Spelling Test",
  pageLabel: "‹ough› ‹gh› ‹augh›",
  topic: "‹ough›, ‹gh› and ‹augh›",
  wordCount: 18,
  words: [
    {
      word: "ought",
      definition: "Used to say that something is the right thing to do.",
      extendedExplanation: "Ought is similar to should. It helps us talk about a sensible action, a duty, or something we expect to happen.",
      exampleSentence: "You ought to wear a sun hat when you play outside at lunchtime.",
      image: "content/ough-gh-augh/images/ought.svg",
      imageAlt: "A checklist with a green tick showing the right thing to do",
      audio: "content/ough-gh-augh/audio/01_ought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/01_ought.mp3",
      hint: "Another way to say should"
    },
    {
      word: "bought",
      definition: "Paid money to get something; the past tense of buy.",
      extendedExplanation: "If you bought something, you gave money for it in the past and it became yours.",
      exampleSentence: "Lucky bought a new sketchbook with her birthday money.",
      image: "content/ough-gh-augh/images/bought.svg",
      imageAlt: "A shopping bag beside coins and a receipt",
      audio: "content/ough-gh-augh/audio/02_bought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/02_bought.mp3",
      hint: "Past tense of buy"
    },
    {
      word: "brought",
      definition: "Carried or took something to a place; the past tense of bring.",
      extendedExplanation: "Brought tells us that someone moved an object or person with them to another place in the past.",
      exampleSentence: "Mali brought her favourite book to share with the class.",
      image: "content/ough-gh-augh/images/brought.svg",
      imageAlt: "A child carrying a wrapped parcel towards a school",
      audio: "content/ough-gh-augh/audio/03_brought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/03_brought.mp3",
      hint: "Past tense of bring"
    },
    {
      word: "fought",
      definition: "Took part in a fight or struggled against something; the past tense of fight.",
      extendedExplanation: "Fought can describe a physical battle, but it can also mean trying very hard to stop a problem or support a cause.",
      exampleSentence: "The brave firefighters fought the forest fire through the night.",
      image: "content/ough-gh-augh/images/fought.svg",
      imageAlt: "Two padded boxing gloves meeting in a sports match",
      audio: "content/ough-gh-augh/audio/04_fought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/04_fought.mp3",
      hint: "Past tense of fight"
    },
    {
      word: "nought",
      definition: "The number zero, or nothing at all.",
      extendedExplanation: "Nought is a British word for zero. It is often used when reading numbers, scores, or years.",
      exampleSentence: "The football score was two–nought at the end of the match.",
      image: "content/ough-gh-augh/images/nought.svg",
      imageAlt: "A large colourful zero on a score card",
      audio: "content/ough-gh-augh/audio/05_nought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/05_nought.mp3",
      hint: "A British word for zero"
    },
    {
      word: "thought",
      definition: "An idea or picture that forms in your mind.",
      extendedExplanation: "A thought can be an idea, memory, plan, or opinion that you are thinking about inside your mind.",
      exampleSentence: "Lucky had a clever thought for solving the tricky puzzle.",
      image: "content/ough-gh-augh/images/thought.svg",
      imageAlt: "A child thinking with a glowing idea bubble overhead",
      audio: "content/ough-gh-augh/audio/06_thought.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/06_thought.mp3",
      hint: "An idea in your mind"
    },
    {
      word: "ghostly",
      definition: "Looking, sounding, or feeling like a ghost.",
      extendedExplanation: "Something ghostly may look pale, move silently, make an eerie sound, or create a spooky feeling.",
      exampleSentence: "A ghostly shape appeared when the curtain moved in the moonlight.",
      image: "content/ough-gh-augh/images/ghostly.svg",
      imageAlt: "A friendly pale ghost floating in moonlight",
      audio: "content/ough-gh-augh/audio/07_ghostly.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/07_ghostly.mp3",
      hint: "Spooky or like a ghost"
    },
    {
      word: "dinghy",
      definition: "A small open boat, often carried by a larger boat.",
      extendedExplanation: "A dinghy can be rowed, sailed, or powered by a small motor and is useful for short trips across water.",
      exampleSentence: "We rowed the dinghy gently from the yacht to the quiet beach.",
      image: "content/ough-gh-augh/images/dinghy.svg",
      imageAlt: "A small red dinghy floating on blue waves",
      audio: "content/ough-gh-augh/audio/08_dinghy.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/08_dinghy.mp3",
      hint: "A small open boat"
    },
    {
      word: "ghoul",
      definition: "A frightening creature from old stories that is linked with graveyards.",
      extendedExplanation: "A ghoul is an imaginary monster from folklore. It often appears in spooky tales and Halloween stories.",
      exampleSentence: "The costume had a green mask that made Ben look like a silly ghoul.",
      image: "content/ough-gh-augh/images/ghoul.svg",
      imageAlt: "A cartoon green ghoul with a surprised expression",
      audio: "content/ough-gh-augh/audio/09_ghoul.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/09_ghoul.mp3",
      hint: "A monster from spooky stories"
    },
    {
      word: "aghast",
      definition: "Filled with shock, fear, or horror.",
      extendedExplanation: "If you are aghast, something has surprised or upset you so much that you may freeze or gasp.",
      exampleSentence: "We were aghast when the tower of blocks suddenly crashed to the floor.",
      image: "content/ough-gh-augh/images/aghast.svg",
      imageAlt: "A shocked face with wide eyes and hands on its cheeks",
      audio: "content/ough-gh-augh/audio/10_aghast.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/10_aghast.mp3",
      hint: "Very shocked or horrified"
    },
    {
      word: "gherkin",
      definition: "A small cucumber, often preserved in vinegar and eaten as a pickle.",
      extendedExplanation: "A gherkin is picked while it is small, then often placed in a jar with vinegar and herbs to give it a sharp taste.",
      exampleSentence: "Dad added a crunchy gherkin to the sandwich.",
      image: "content/ough-gh-augh/images/gherkin.svg",
      imageAlt: "A small green gherkin beside an open pickle jar",
      audio: "content/ough-gh-augh/audio/11_gherkin.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/11_gherkin.mp3",
      hint: "A small cucumber used as a pickle"
    },
    {
      word: "yoghurt",
      definition: "A thick, creamy food made from milk using helpful bacteria.",
      extendedExplanation: "Yoghurt is made when friendly bacteria change milk, making it thicker and giving it a slightly tangy taste.",
      exampleSentence: "Lucky mixed mango and banana into a bowl of plain yoghurt.",
      image: "content/ough-gh-augh/images/yoghurt.svg",
      imageAlt: "A bowl of yoghurt topped with mango and banana pieces",
      audio: "content/ough-gh-augh/audio/12_yoghurt.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/12_yoghurt.mp3",
      hint: "A creamy food made from milk"
    },
    {
      word: "naughty",
      definition: "Behaving badly or not doing what you have been told.",
      extendedExplanation: "Naughty describes behaviour that breaks a rule or causes trouble, usually in a small rather than dangerous way.",
      exampleSentence: "The naughty puppy ran away with one of Dad's slippers.",
      image: "content/ough-gh-augh/images/naughty.svg",
      imageAlt: "A playful puppy holding a slipper in its mouth",
      audio: "content/ough-gh-augh/audio/13_naughty.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/13_naughty.mp3",
      hint: "Behaving badly or breaking a rule"
    },
    {
      word: "fraught",
      definition: "Filled with worry, difficulty, or problems.",
      extendedExplanation: "A fraught situation feels tense and stressful because many things could go wrong or people are very worried.",
      exampleSentence: "The journey became fraught when the storm blocked the mountain road.",
      image: "content/ough-gh-augh/images/fraught.svg",
      imageAlt: "A worried traveller facing a storm cloud and a blocked road",
      audio: "content/ough-gh-augh/audio/14_fraught.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/14_fraught.mp3",
      hint: "Full of worry or difficulty"
    },
    {
      word: "caught",
      definition: "Captured, stopped, or held something; the past tense of catch.",
      extendedExplanation: "Caught can mean that you grabbed something moving, found someone, or became trapped in a situation.",
      exampleSentence: "Lucky caught the bright red ball with both hands.",
      image: "content/ough-gh-augh/images/caught.svg",
      imageAlt: "Two hands catching a bright red ball",
      audio: "content/ough-gh-augh/audio/15_caught.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/15_caught.mp3",
      hint: "Past tense of catch"
    },
    {
      word: "daughter",
      definition: "A person's female child.",
      extendedExplanation: "A daughter is a girl or woman in relation to her parents, whether she is young or grown up.",
      exampleSentence: "Their daughter proudly showed them the medal she won at school.",
      image: "content/ough-gh-augh/images/daughter.svg",
      imageAlt: "A smiling girl standing between her two parents",
      audio: "content/ough-gh-augh/audio/16_daughter.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/16_daughter.mp3",
      hint: "A parent's female child"
    },
    {
      word: "distraught",
      definition: "Extremely worried, upset, or unable to think calmly.",
      extendedExplanation: "Someone who is distraught feels such powerful worry or sadness that it is hard for them to focus on anything else.",
      exampleSentence: "Mina was distraught until she found her missing kitten asleep in a box.",
      image: "content/ough-gh-augh/images/distraught.svg",
      imageAlt: "An upset child looking for a missing kitten",
      audio: "content/ough-gh-augh/audio/17_distraught.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/17_distraught.mp3",
      hint: "Extremely worried or upset"
    },
    {
      word: "onslaught",
      definition: "A strong, fierce attack or a sudden rush of difficult things.",
      extendedExplanation: "An onslaught is a powerful attack, or a large number of things arriving with so much force that they are hard to handle.",
      exampleSentence: "The sea wall protected the village from the onslaught of huge waves.",
      image: "content/ough-gh-augh/images/onslaught.svg",
      imageAlt: "Powerful ocean waves crashing against a strong sea wall",
      audio: "content/ough-gh-augh/audio/18_onslaught.mp3",
      definitionAudio: "content/ough-gh-augh/audio/definitions/18_onslaught.mp3",
      hint: "A strong attack or sudden powerful rush"
    }
  ]
};

export const IVE_SAYING_IV_LESSON = {
  id: "ive-saying-iv",
  title: "Spelling Test",
  pageLabel: "‹ive› saying /iv/",
  topic: "‹ive› saying /iv/",
  wordCount: 18,
  words: [
    ["festive", "Cheerful and connected with a celebration.", "Festive things help make a special day feel bright, happy, and exciting.", "The festive lights sparkled around the school hall.", "Cheerful and ready for a celebration", "A party hat and colourful lights"],
    ["positive", "Showing hopefulness or saying yes.", "A positive person looks for good possibilities and uses encouraging words.", "Lucky kept a positive attitude when the puzzle was tricky.", "Hopeful or saying yes", "A smiling face with a bright sun"],
    ["active", "Moving around or taking part in something.", "Someone active enjoys moving, playing, helping, or joining in with activities.", "Lucky stayed active by running and jumping in the playground.", "Busy moving or joining in", "A child running with a ball"],
    ["massive", "Very large and heavy.", "Massive describes something much bigger and heavier than most things of the same kind.", "A massive whale rose gently beside the boat.", "Very big and heavy", "A huge whale beside a tiny boat"],
    ["negative", "Saying no, or showing an unpleasant idea.", "A negative answer says no, while a negative idea focuses on problems instead of possibilities.", "The sign gave a negative answer to the question.", "Saying no or focusing on problems", "A red no symbol"],
    ["motive", "The reason why someone does something.", "A motive is the purpose or reason behind an action.", "Her motive for helping was to make her friend feel better.", "The reason for an action", "A question mark beside a thought bubble"],
    ["adjective", "A word that describes a person, place, thing, or idea.", "Adjectives add detail by telling us what something is like, such as bright, soft, or enormous.", "In 'the blue kite', the word blue is an adjective.", "A describing word", "A word card with colourful describing labels"],
    ["impressive", "Making people admire or feel surprised.", "Something impressive is so skilful, beautiful, or excellent that it catches people's attention.", "The gymnast made an impressive jump above the mat.", "Amazing enough to admire", "A gymnast receiving a gold star"],
    ["explosive", "Able to burst or cause a sudden blast.", "Explosive materials can release energy quickly, so they must be handled by trained adults.", "The science teacher showed an explosive reaction safely behind a screen.", "Able to burst suddenly", "A safe science flask with a burst star"],
    ["elusive", "Difficult to find, catch, or understand.", "Something elusive keeps getting away or remains hard to discover.", "The elusive butterfly disappeared behind a leaf.", "Hard to find or catch", "A butterfly hiding behind leaves"],
    ["expensive", "Costing a lot of money.", "An expensive item needs more money to buy than a cheaper item of the same kind.", "The expensive telescope was carefully kept in its case.", "Costing lots of money", "A price tag with many coins"],
    ["superlative", "The form of an adjective that shows the highest degree.", "A superlative compares three or more things and shows the greatest amount, such as biggest or fastest.", "Fastest is the superlative form of fast.", "The highest form of a describing word", "A winners podium with a number one badge"],
    ["constructive", "Useful and helpful for improving something.", "Constructive ideas or comments help build, repair, or improve rather than simply complain.", "Mia gave constructive advice that improved the group project.", "Helpful for making something better", "A child building with colourful blocks"],
    ["destructive", "Causing damage or destruction.", "Destructive actions break, harm, or knock down things instead of caring for them.", "The strong storm was destructive to the old wooden fence.", "Causing damage", "A fallen wall beside a warning sign"],
    ["exclusive", "Limited to a particular person or group.", "Exclusive means that something is reserved for certain people and others cannot join or use it.", "The winners received an exclusive golden badge.", "For a special group only", "A golden ticket behind a velvet rope"],
    ["inclusive", "Making sure everyone can join or be included.", "An inclusive group welcomes people with different skills, ideas, and backgrounds.", "Our inclusive team made sure every player had a turn.", "Welcoming everyone", "Children of different backgrounds holding hands"],
    ["alliterative", "Using words that start with the same sound.", "Alliterative phrases repeat an opening sound, like 'silly snakes slide'.", "'Friendly frogs fly' is an alliterative phrase.", "Repeating the first sound", "Three word cards sharing the same first letter"],
    ["imaginative", "Having exciting and creative ideas.", "An imaginative person can invent unusual stories, pictures, games, and solutions.", "Lucky told an imaginative story about a castle on the Moon.", "Full of creative ideas", "A child imagining a colourful moon castle"]
  ].map(([word, definition, extendedExplanation, exampleSentence, hint, imageAlt], index) => ({
    word, definition, extendedExplanation, exampleSentence, hint, imageAlt,
    image: `content/ive-saying-iv/images/${String(index + 1).padStart(2, "0")}_${word}.svg`,
    audio: `content/ive-saying-iv/audio/${String(index + 1).padStart(2, "0")}_${word}.mp3`,
    definitionAudio: `content/ive-saying-iv/audio/definitions/${String(index + 1).padStart(2, "0")}_${word}.mp3`
  }))
};

export const SPELLING_LESSONS = [PAGE_22_LESSON, SCHWA_ER_LESSON, OR_SAYING_ER_LESSON, EAR_SAYING_ER_LESSON, U_SAYING_OO_LESSON, OUGH_GH_AUGH_LESSON, IVE_SAYING_IV_LESSON];

export function getSpellingLesson(id) {
  return (
    SPELLING_LESSONS.find(l => l.id === id) ||
    SPELLING_LESSONS.find(l => l.id === DEFAULT_SPELLING_LESSON_ID) ||
    PAGE_22_LESSON
  );
}

export function getSelectedSpellingLessonId() {
  if (typeof localStorage === "undefined") return DEFAULT_SPELLING_LESSON_ID;
  const stored = localStorage.getItem(STORAGE_KEY_SELECTED_LESSON);
  if (!stored) return DEFAULT_SPELLING_LESSON_ID;
  const found = SPELLING_LESSONS.find(l => l.id === stored);
  return found ? found.id : DEFAULT_SPELLING_LESSON_ID;
}

export function setSelectedSpellingLessonId(id) {
  if (typeof localStorage === "undefined") return;
  const lesson = getSpellingLesson(id);
  localStorage.setItem(STORAGE_KEY_SELECTED_LESSON, lesson.id);
}

// Backward compatibility exports
export const PAGE_22_DECK = PAGE_22_LESSON;
export const SPELLING_DECKS = SPELLING_LESSONS;

export function getDeckById(deckId) {
  return getSpellingLesson(deckId);
}
