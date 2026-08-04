/**
 * Spelling Curriculum Catalog for Lucky's Learning World
 * Supports multi-lesson spelling decks:
 *  - Page 22 (Schwa ‹or›)
 *  - Schwa ‹er›
 */

export const STORAGE_KEY_SELECTED_LESSON = "lmm3s:selected_spelling_lesson";
export const DEFAULT_SPELLING_LESSON_ID = "page-22";

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
      audio: "content/or-saying-er/audio/01_worm.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/01_worm.wav",
      hint: "A long, legless animal that lives in soil"
    },
    {
      word: "word",
      definition: "A sound or group of letters that has meaning.",
      extendedExplanation: "Words are the building blocks we join together to share ideas in speech and writing.",
      exampleSentence: "Lucky learned how to spell a new word in class.",
      image: "content/or-saying-er/images/word.svg",
      imageAlt: "Letter blocks forming a word",
      audio: "content/or-saying-er/audio/02_word.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/02_word.wav",
      hint: "Letters or sounds joined to make meaning"
    },
    {
      word: "world",
      definition: "The Earth and all the people, places, and things on it.",
      extendedExplanation: "The world includes every continent, ocean, living thing, and community on planet Earth.",
      exampleSentence: "People around the world celebrate many different festivals.",
      image: "content/or-saying-er/images/world.svg",
      imageAlt: "Planet Earth with blue oceans and green continents",
      audio: "content/or-saying-er/audio/03_world.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/03_world.wav",
      hint: "Earth and everything on it"
    },
    {
      word: "worst",
      definition: "The least good or most unpleasant of all.",
      extendedExplanation: "Worst compares three or more things and identifies the one with the lowest quality or hardest result.",
      exampleSentence: "The worst part of the storm was the loud thunder.",
      image: "content/or-saying-er/images/worst.svg",
      imageAlt: "Three rating cards with the lowest one highlighted",
      audio: "content/or-saying-er/audio/04_worst.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/04_worst.wav",
      hint: "The least good of all"
    },
    {
      word: "worker",
      definition: "A person who does a job or performs useful work.",
      extendedExplanation: "A worker uses effort and skills to complete tasks in places such as schools, farms, shops, or offices.",
      exampleSentence: "The construction worker wore a bright safety helmet.",
      image: "content/or-saying-er/images/worker.svg",
      imageAlt: "A construction worker wearing a safety helmet",
      audio: "content/or-saying-er/audio/05_worker.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/05_worker.wav",
      hint: "A person who does a job"
    },
    {
      word: "worse",
      definition: "More bad, difficult, or unpleasant than something else.",
      extendedExplanation: "Worse compares two things and tells us that one has a lower quality or a less pleasant result.",
      exampleSentence: "The traffic became worse when the heavy rain began.",
      image: "content/or-saying-er/images/worse.svg",
      imageAlt: "Two weather cards showing one condition becoming worse",
      audio: "content/or-saying-er/audio/06_worse.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/06_worse.wav",
      hint: "More bad or unpleasant than another"
    },
    {
      word: "workable",
      definition: "Able to be done successfully or used effectively.",
      extendedExplanation: "A workable idea is practical enough to put into action and has a good chance of succeeding.",
      exampleSentence: "The team found a workable plan for finishing the project on time.",
      image: "content/or-saying-er/images/workable.svg",
      imageAlt: "A checklist beside a working gear",
      audio: "content/or-saying-er/audio/07_workable.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/07_workable.wav",
      hint: "Practical and able to succeed"
    },
    {
      word: "worthy",
      definition: "Deserving respect, attention, or support.",
      extendedExplanation: "Something worthy has enough value or good qualities to deserve our time, praise, or care.",
      exampleSentence: "Protecting sea turtles is a worthy cause.",
      image: "content/or-saying-er/images/worthy.svg",
      imageAlt: "A gold medal with a star for a worthy achievement",
      audio: "content/or-saying-er/audio/08_worthy.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/08_worthy.wav",
      hint: "Deserving respect or support"
    },
    {
      word: "worship",
      definition: "To show deep love, honor, or respect, especially to a god.",
      extendedExplanation: "People may worship by praying, singing, gathering together, or following the traditions of their faith.",
      exampleSentence: "Families gathered at the temple to worship together.",
      image: "content/or-saying-er/images/worship.svg",
      imageAlt: "Hands joined respectfully beneath a glowing heart",
      audio: "content/or-saying-er/audio/09_worship.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/09_worship.wav",
      hint: "To show deep honor or religious devotion"
    },
    {
      word: "fireworks",
      definition: "Explosive devices that make bright colors and patterns in the sky.",
      extendedExplanation: "Fireworks are safely launched during celebrations and burst high above the ground into sparkling shapes.",
      exampleSentence: "Colorful fireworks lit up the night sky at the festival.",
      image: "content/or-saying-er/images/fireworks.svg",
      imageAlt: "Colorful fireworks bursting in a night sky",
      audio: "content/or-saying-er/audio/10_fireworks.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/10_fireworks.wav",
      hint: "Bright celebration displays in the sky"
    },
    {
      word: "worksheet",
      definition: "A page of questions or activities for a learner to complete.",
      extendedExplanation: "A worksheet gives practice with a topic by providing spaces to write answers, solve problems, or match ideas.",
      exampleSentence: "Lucky completed the math worksheet before lunch.",
      image: "content/or-saying-er/images/worksheet.svg",
      imageAlt: "A worksheet page with questions and a pencil",
      audio: "content/or-saying-er/audio/11_worksheet.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/11_worksheet.wav",
      hint: "A school page with activities to complete"
    },
    {
      word: "worthless",
      definition: "Having no useful purpose or value.",
      extendedExplanation: "An object may be called worthless when it cannot be used, sold, repaired, or recycled for anything helpful.",
      exampleSentence: "The broken token was worthless in the arcade machine.",
      image: "content/or-saying-er/images/worthless.svg",
      imageAlt: "A broken token marked with zero value",
      audio: "content/or-saying-er/audio/12_worthless.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/12_worthless.wav",
      hint: "Having no use or value"
    },
    {
      word: "workmanship",
      definition: "The skill and care shown in making something.",
      extendedExplanation: "Good workmanship can be seen in neat details, strong construction, and careful choices made by the creator.",
      exampleSentence: "The smooth wooden toy showed excellent workmanship.",
      image: "content/or-saying-er/images/workmanship.svg",
      imageAlt: "Careful hands crafting a wooden object with tools",
      audio: "content/or-saying-er/audio/13_workmanship.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/13_workmanship.wav",
      hint: "Skill and care used to make something"
    },
    {
      word: "worldliness",
      definition: "Experience and practical knowledge about life and the world.",
      extendedExplanation: "Worldliness can describe knowing how people and places work because of travel, reading, and many life experiences.",
      exampleSentence: "Her travels gave her a worldliness that helped her understand new customs.",
      image: "content/or-saying-er/images/worldliness.svg",
      imageAlt: "A globe surrounded by books and travel symbols",
      audio: "content/or-saying-er/audio/14_worldliness.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/14_worldliness.wav",
      hint: "Practical knowledge gained from life experience"
    },
    {
      word: "workforce",
      definition: "All the people who work for a company, industry, or country.",
      extendedExplanation: "A workforce includes everyone whose different jobs and skills help an organization or economy operate.",
      exampleSentence: "The hospital workforce includes doctors, nurses, cooks, and cleaners.",
      image: "content/or-saying-er/images/workforce.svg",
      imageAlt: "A diverse group of workers standing together",
      audio: "content/or-saying-er/audio/15_workforce.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/15_workforce.wav",
      hint: "All the people working for an organization"
    },
    {
      word: "worldwide",
      definition: "Happening or existing in every part of the world.",
      extendedExplanation: "Something worldwide reaches many countries and continents instead of staying in one local area.",
      exampleSentence: "The song became popular worldwide.",
      image: "content/or-saying-er/images/worldwide.svg",
      imageAlt: "Planet Earth connected by lines around the globe",
      audio: "content/or-saying-er/audio/16_worldwide.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/16_worldwide.wav",
      hint: "Across the whole world"
    },
    {
      word: "worthwhile",
      definition: "Worth the time, effort, or money spent on it.",
      extendedExplanation: "An activity is worthwhile when the benefit, learning, or enjoyment you gain makes the effort a good choice.",
      exampleSentence: "Practising every day was worthwhile when Lucky played the song beautifully.",
      image: "content/or-saying-er/images/worthwhile.svg",
      imageAlt: "A path leading to a shining star and finish flag",
      audio: "content/or-saying-er/audio/17_worthwhile.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/17_worthwhile.wav",
      hint: "Worth the time or effort"
    },
    {
      word: "worthlessness",
      definition: "The state of having no useful purpose or value.",
      extendedExplanation: "Worthlessness describes a lack of practical value in a thing; it should never be used to judge a person's importance.",
      exampleSentence: "The expired coupon's worthlessness became clear at the checkout.",
      image: "content/or-saying-er/images/worthlessness.svg",
      imageAlt: "An expired coupon marked with zero value",
      audio: "content/or-saying-er/audio/18_worthlessness.wav",
      definitionAudio: "content/or-saying-er/audio/definitions/18_worthlessness.wav",
      hint: "The state of having no practical value"
    }
  ]
};

export const SPELLING_LESSONS = [PAGE_22_LESSON, SCHWA_ER_LESSON, OR_SAYING_ER_LESSON];

export function getSpellingLesson(id) {
  return SPELLING_LESSONS.find(l => l.id === id) || PAGE_22_LESSON;
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
