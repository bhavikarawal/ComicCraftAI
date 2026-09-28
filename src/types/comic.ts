export type GenreOption =
  | "Adventure"
  | "Fantasy"
  | "Science Fiction"
  | "Mystery"
  | "Comedy"
  | "Superhero";

export type ComicStyleOption =
  | "Manga"
  | "Anime"
  | "Cartoon"
  | "Comic Book"
  | "Watercolor"
  | "Cyberpunk";

export type StoryToneOption =
  | "Funny"
  | "Emotional"
  | "Exciting"
  | "Serious"
  | "Dark"
  | "Inspirational";

export type PanelCountOption = 4 | 6 | 8 | 10;

export type AppScreen =
  | "home"
  | "create"
  | "generating"
  | "story-plan"
  | "comic-viewer"
  | "final-comic";

export interface CharacterProfile {
  id: string;
  name: string;
  age?: string;
  role: string;
  description: string;
}

export interface ComicPanel {
  id: string;
  panelNumber: number;
  planSummary: string;
  sceneDescription: string;
  dialogue: string;
  narration: string;
  character: string;
  artStyle: ComicStyleOption;
  imageUrl: string;
  visualTheme:
    | "lab_entry"
    | "robot_pod"
    | "robot_awaken"
    | "city_hologram"
    | "enemy_breach"
    | "tunnel_escape";
  variationSeed?: number;
}

export interface ComicStoryProject {
  title: string;
  summary: string;
  storyIdea: string;
  genre: GenreOption;
  comicStyle: ComicStyleOption;
  panelCount: PanelCountOption;
  storyTone: StoryToneOption;
  mainCharacterInput: {
    name: string;
    age: string;
    description: string;
  };
  characters: CharacterProfile[];
  panels: ComicPanel[];
}
