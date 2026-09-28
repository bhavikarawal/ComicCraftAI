import {
  ComicPanel,
  ComicStoryProject,
  ComicStyleOption,
  GenreOption,
  PanelCountOption,
  StoryToneOption,
} from "../types/comic";

import panel1Img from "../assets/images/panel_1_abandoned_lab_1790590726169.jpg";
import panel2Img from "../assets/images/panel_2_discover_robot_1790590741765.jpg";
import panel3Img from "../assets/images/panel_3_robot_activates_1790590755864.jpg";
import panel4Img from "../assets/images/panel_4_city_in_danger_1790590770723.jpg";
import panel5Img from "../assets/images/panel_5_mysterious_enemy_1790590787470.jpg";
import panel6Img from "../assets/images/panel_6_escape_together_1790590799520.jpg";

export const PANEL_THEME_IMAGES: Record<ComicPanel["visualTheme"], string> = {
  lab_entry: panel1Img,
  robot_pod: panel2Img,
  robot_awaken: panel3Img,
  city_hologram: panel4Img,
  enemy_breach: panel5Img,
  tunnel_escape: panel6Img,
};

export const GENRE_OPTIONS: GenreOption[] = [
  "Adventure",
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Comedy",
  "Superhero",
];

export const COMIC_STYLE_OPTIONS: ComicStyleOption[] = [
  "Manga",
  "Anime",
  "Cartoon",
  "Comic Book",
  "Watercolor",
  "Cyberpunk",
];

export const PANEL_COUNT_OPTIONS: PanelCountOption[] = [4, 6, 8, 10];

export const STORY_TONE_OPTIONS: StoryToneOption[] = [
  "Funny",
  "Emotional",
  "Exciting",
  "Serious",
  "Dark",
  "Inspirational",
];

export const DEFAULT_COMIC_PROJECT: ComicStoryProject = {
  title: "The Robot Beneath the Lab",
  summary:
    "While exploring a sealed sub-basement beneath the university engineering hall, curious freshman Alex stumbles upon NOVA—a dormant guardian AI built to defend the city from an imminent subterranean breach.",
  storyIdea:
    "A college student discovers a mysterious robot in an abandoned laboratory.",
  genre: "Science Fiction",
  comicStyle: "Comic Book",
  panelCount: 6,
  storyTone: "Exciting",
  mainCharacterInput: {
    name: "Alex",
    age: "20",
    description: "Curious college student who discovers the laboratory.",
  },
  characters: [
    {
      id: "char-alex",
      name: "Alex",
      age: "20",
      role: "Protagonist",
      description: "Curious college student who discovers the laboratory.",
    },
    {
      id: "char-nova",
      name: "NOVA",
      role: "Guardian AI Unit",
      description: "An advanced AI robot protecting the city.",
    },
  ],
  panels: [
    {
      id: "panel-1",
      panelNumber: 1,
      planSummary: "Alex enters the abandoned laboratory.",
      sceneDescription:
        "Comic artwork of Alex stepping cautiously through heavy rusted blast doors into a shadowy, vine-choked underground science laboratory.",
      dialogue: "Why is this place completely abandoned?",
      narration: "Beneath the old engineering wing, Sub-Level 4 had been sealed for twenty years.",
      character: "Alex",
      artStyle: "Comic Book",
      imageUrl: panel1Img,
      visualTheme: "lab_entry",
    },
    {
      id: "panel-2",
      panelNumber: 2,
      planSummary: "Alex discovers a mysterious robot.",
      sceneDescription:
        "Close-up over-the-shoulder shot as Alex shines a flashlight beam onto a sleek humanoid robot dormant inside a cracked glass containment pod.",
      dialogue: "Wait... is that a robot?",
      narration: "In the center of the main chamber stood Project NOVA.",
      character: "Alex",
      artStyle: "Comic Book",
      imageUrl: panel2Img,
      visualTheme: "robot_pod",
    },
    {
      id: "panel-3",
      panelNumber: 3,
      planSummary: "The robot suddenly activates.",
      sceneDescription:
        "Dynamic burst of amber and cobalt energy as the robot's optical visor ignites and sparks shower the darkened laboratory floor.",
      dialogue: "Defense protocol online. Stand back, civilian!",
      narration: "A proximity sensor chimed—and the dormant core roared to life.",
      character: "NOVA",
      artStyle: "Comic Book",
      imageUrl: panel3Img,
      visualTheme: "robot_awaken",
    },
    {
      id: "panel-4",
      panelNumber: 4,
      planSummary: "NOVA reveals that the city is in danger.",
      sceneDescription:
        "NOVA projects a glowing 3D holographic map of the city skyline showing crimson seismic fault warnings while Alex studies the projection.",
      dialogue: "My sensors detect an automated syndicate drill targeting the city grid tonight.",
      narration: "The machine wasn't a relic—it was an early warning sentinel.",
      character: "NOVA",
      artStyle: "Comic Book",
      imageUrl: panel4Img,
      visualTheme: "city_hologram",
    },
    {
      id: "panel-5",
      panelNumber: 5,
      planSummary: "A mysterious enemy appears.",
      sceneDescription:
        "A dark armored mechanical enforcer smashes through the reinforced concrete ceiling in a cloud of smoke and debris, locking red optics onto them.",
      dialogue: "Target located. Surrender the NOVA core immediately!",
      narration: "Before Alex could answer, the ceiling gave way.",
      character: "Syndicate Enforcer",
      artStyle: "Comic Book",
      imageUrl: panel5Img,
      visualTheme: "enemy_breach",
    },
    {
      id: "panel-6",
      panelNumber: 6,
      planSummary: "Alex and NOVA escape together.",
      sceneDescription:
        "Alex and NOVA sprint up a collapsing subterranean service tunnel toward the moonlight of the city streets while NOVA's shield deflects falling rubble.",
      dialogue: "Hold on, Alex! We have a city to warn!",
      narration: "To be continued...",
      character: "NOVA",
      artStyle: "Comic Book",
      imageUrl: panel6Img,
      visualTheme: "tunnel_escape",
    },
  ],
};

export const PRESET_STORY_IDEAS = [
  {
    label: "The Robot Beneath the Lab",
    storyIdea:
      "A college student discovers a mysterious robot in an abandoned laboratory.",
    genre: "Science Fiction" as GenreOption,
    comicStyle: "Comic Book" as ComicStyleOption,
    panelCount: 6 as PanelCountOption,
    storyTone: "Exciting" as StoryToneOption,
    characterName: "Alex",
    characterAge: "20",
    characterDescription:
      "Curious college student who discovers the laboratory.",
  },
  {
    label: "Midnight Library Key",
    storyIdea:
      "A night-shift archivist finds a brass key that opens a portal inside restricted rare books.",
    genre: "Fantasy" as GenreOption,
    comicStyle: "Watercolor" as ComicStyleOption,
    panelCount: 6 as PanelCountOption,
    storyTone: "Inspirational" as StoryToneOption,
    characterName: "Elena",
    characterAge: "21",
    characterDescription:
      "Observant university archivist with a knack for ancient ciphers.",
  },
  {
    label: "Neon Rooftop Courier",
    storyIdea:
      "A rookie drone courier intercepts an encrypted memory drive across rain-slicked megacity rooftops.",
    genre: "Mystery" as GenreOption,
    comicStyle: "Cyberpunk" as ComicStyleOption,
    panelCount: 6 as PanelCountOption,
    storyTone: "Serious" as StoryToneOption,
    characterName: "Kai",
    characterAge: "19",
    characterDescription:
      "Fast-thinking parkour courier navigating Sector 9.",
  },
];

export const ALTERNATE_PANEL_VARIATIONS: Record<
  ComicPanel["visualTheme"],
  Array<{
    planSummary: string;
    sceneDescription: string;
    dialogue: string;
    narration: string;
    character: string;
  }>
> = {
  lab_entry: [
    {
      planSummary: "Alex forces open the rusted hatch to Sub-Level 4.",
      sceneDescription:
        "Wide angle of Alex stepping into the flooded corridor of the forgotten campus laboratory, flashlight cutting through thick mist.",
      dialogue: "No one has set foot down here since the 2006 blackout...",
      narration: "Campus blueprints claimed this basement didn't exist.",
      character: "Alex",
    },
  ],
  robot_pod: [
    {
      planSummary: "Alex uncovers the stasis chamber holding NOVA.",
      sceneDescription:
        "Alex wipes frost off the cylindrical glass pod, revealing a titanium-plated humanoid frame marked 'NOVA-01'.",
      dialogue: "Project NOVA? This chassis looks decades ahead of our robotics lab.",
      narration: "Beneath the dust lay a masterpiece of neural engineering.",
      character: "Alex",
    },
  ],
  robot_awaken: [
    {
      planSummary: "NOVA's quantum core ignites in a flash of blue light.",
      sceneDescription:
        "The containment glass retracts with a hiss as NOVA's eyes flare cobalt blue, diagnostic holograms swirling in the air.",
      dialogue: "Biometric scan complete. Thank goodness someone finally heard my beacon!",
      narration: "After seven thousand nights in standby, the guardian awoke.",
      character: "NOVA",
    },
  ],
  city_hologram: [
    {
      planSummary: "NOVA projects a live tactical map of the city grid.",
      sceneDescription:
        "Emerald and crimson wireframe buildings float between Alex and NOVA, highlighting three power stations under threat.",
      dialogue: "In forty minutes, the central fusion relay will be sabotaged unless we intervene.",
      narration: "Every second ticked closer to a city-wide collapse.",
      character: "NOVA",
    },
  ],
  enemy_breach: [
    {
      planSummary: "A heavy stalker mech breaches the ceiling vault.",
      sceneDescription:
        "Concrete beams shatter as a six-foot autonomous hunter unit drops into the chamber, laser sights sweeping the dark.",
      dialogue: "Anomaly detected. Eradicating witnesses.",
      narration: "They weren't the only ones tracking the signal.",
      character: "Hunter Unit",
    },
  ],
  tunnel_escape: [
    {
      planSummary: "Alex and NOVA blast their way toward the surface.",
      sceneDescription:
        "NOVA deploys a kinetic barrier while sprinting beside Alex up the steep ventilation ramp into the night air.",
      dialogue: "Lead the way to the campus radio tower, Alex—we're broadcasting the truth!",
      narration: "End of Issue #1.",
      character: "NOVA",
    },
  ],
};
