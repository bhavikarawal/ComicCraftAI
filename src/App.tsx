import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Eye,
  Printer,
  Download,
  X,
  Sliders,
  Layers,
  UserPlus,
} from "lucide-react";
import {
  AppScreen,
  ComicPanel,
  ComicStoryProject,
  ComicStyleOption,
  GenreOption,
  PanelCountOption,
  StoryToneOption,
  CharacterProfile,
} from "./types/comic";
import {
  DEFAULT_COMIC_PROJECT,
  GENRE_OPTIONS,
  COMIC_STYLE_OPTIONS,
  PANEL_COUNT_OPTIONS,
  STORY_TONE_OPTIONS,
  PRESET_STORY_IDEAS,
  PANEL_THEME_IMAGES,
  ALTERNATE_PANEL_VARIATIONS,
} from "./data/defaultComic";
import { PanelArtwork } from "./components/PanelArtwork";

const GENERATION_STEPS = [
  "Understanding your idea",
  "Creating characters",
  "Writing the story",
  "Creating panel descriptions",
  "Generating comic artwork",
  "Preparing final comic",
];

const VISUAL_THEMES: ComicPanel["visualTheme"][] = [
  "lab_entry",
  "robot_pod",
  "robot_awaken",
  "city_hologram",
  "enemy_breach",
  "tunnel_escape",
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("home");
  const [project, setProject] = useState<ComicStoryProject>(
    DEFAULT_COMIC_PROJECT
  );

  // Create Comic Form State
  const [storyIdea, setStoryIdea] = useState<string>(
    DEFAULT_COMIC_PROJECT.storyIdea
  );
  const [genre, setGenre] = useState<GenreOption>(DEFAULT_COMIC_PROJECT.genre);
  const [comicStyle, setComicStyle] = useState<ComicStyleOption>(
    DEFAULT_COMIC_PROJECT.comicStyle
  );
  const [panelCount, setPanelCount] = useState<PanelCountOption>(
    DEFAULT_COMIC_PROJECT.panelCount
  );
  const [charName, setCharName] = useState<string>(
    DEFAULT_COMIC_PROJECT.mainCharacterInput.name
  );
  const [charAge, setCharAge] = useState<string>(
    DEFAULT_COMIC_PROJECT.mainCharacterInput.age
  );
  const [charDesc, setCharDesc] = useState<string>(
    DEFAULT_COMIC_PROJECT.mainCharacterInput.description
  );
  const [storyTone, setStoryTone] = useState<StoryToneOption>(
    DEFAULT_COMIC_PROJECT.storyTone
  );

  // AI Processing Step State (0 to 6)
  const [generationStepIndex, setGenerationStepIndex] = useState<number>(0);
  const [isRegeneratingStory, setIsRegeneratingStory] =
    useState<boolean>(false);
  const [regeneratingPanelId, setRegeneratingPanelId] = useState<string | null>(
    null
  );

  // Edit Story Modal State
  const [isEditStoryOpen, setIsEditStoryOpen] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>("");
  const [draftSummary, setDraftSummary] = useState<string>("");
  const [draftCharacters, setDraftCharacters] = useState<CharacterProfile[]>(
    []
  );
  const [draftPlanSummaries, setDraftPlanSummaries] = useState<
    Record<string, string>
  >({});

  // Edit Panel Modal State
  const [editingPanel, setEditingPanel] = useState<ComicPanel | null>(null);
  const [isModalAiRewriting, setIsModalAiRewriting] = useState<boolean>(false);

  // Comic Viewer Layout State
  const [viewerColumns, setViewerColumns] = useState<"2col" | "3col">("2col");
  const [finalReaderMode, setFinalReaderMode] = useState<"spread" | "single">(
    "spread"
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Build tailored panels when count or inputs change
  const buildFallbackProjectFromInputs = (
    overrideStyle?: ComicStyleOption,
    useAlternateVariation?: boolean
  ): ComicStoryProject => {
    const chosenStyle = overrideStyle || comicStyle;
    const isDefaultRobotStory =
      storyIdea.toLowerCase().includes("robot") ||
      storyIdea.toLowerCase().includes("laboratory") ||
      storyIdea.trim() === "";

    const primaryName = charName.trim() || "Alex";
    const companionName = isDefaultRobotStory ? "NOVA" : "ARIA";

    const basePanels = DEFAULT_COMIC_PROJECT.panels;
    const targetCount = panelCount;
    const generatedPanels: ComicPanel[] = [];

    for (let i = 0; i < targetCount; i++) {
      const template = basePanels[i % basePanels.length];
      const theme = VISUAL_THEMES[i % VISUAL_THEMES.length];
      const altList = ALTERNATE_PANEL_VARIATIONS[theme];
      const useAlt = useAlternateVariation && altList && altList.length > 0;

      let planSummary = useAlt ? altList[0].planSummary : template.planSummary;
      let sceneDescription = useAlt
        ? altList[0].sceneDescription
        : template.sceneDescription;
      let dialogue = useAlt ? altList[0].dialogue : template.dialogue;
      let narration = useAlt ? altList[0].narration : template.narration;
      let speaker = useAlt ? altList[0].character : template.character;

      if (primaryName !== "Alex") {
        planSummary = planSummary.replace(/Alex/g, primaryName);
        sceneDescription = sceneDescription.replace(/Alex/g, primaryName);
        dialogue = dialogue.replace(/Alex/g, primaryName);
        narration = narration.replace(/Alex/g, primaryName);
        if (speaker === "Alex") speaker = primaryName;
      }

      if (i >= 6) {
        const extraIndex = i - 5;
        planSummary = `Extended Beat ${extraIndex}: ${primaryName} and ${companionName} confront the next obstacle.`;
        sceneDescription = `Dynamic comic frame of ${primaryName} and ${companionName} coordinating their strategy in ${chosenStyle} style.`;
        dialogue = `Stay sharp! The main relay is just ahead.`;
        narration = `Moments later, on the upper sector walkway...`;
      }

      generatedPanels.push({
        id: `panel-${i + 1}-${Date.now()}`,
        panelNumber: i + 1,
        planSummary,
        sceneDescription,
        dialogue,
        narration,
        character: speaker,
        artStyle: chosenStyle,
        imageUrl: PANEL_THEME_IMAGES[theme],
        visualTheme: theme,
      });
    }

    return {
      title: isDefaultRobotStory
        ? "The Robot Beneath the Lab"
        : `${primaryName} & The ${genre} Chronicle`,
      summary: isDefaultRobotStory
        ? `While exploring a sealed sub-basement beneath the university engineering hall, ${primaryName} discovers NOVA—an advanced guardian AI robot built to protect the city from an imminent subterranean threat.`
        : `${storyIdea} Guided by a ${storyTone.toLowerCase()} tone in a ${chosenStyle} aesthetic, ${primaryName} uncovers a mystery that changes everything.`,
      storyIdea:
        storyIdea ||
        "A college student discovers a mysterious robot in an abandoned laboratory.",
      genre,
      comicStyle: chosenStyle,
      panelCount: targetCount,
      storyTone,
      mainCharacterInput: {
        name: primaryName,
        age: charAge || "20",
        description:
          charDesc || "Curious college student who discovers the laboratory.",
      },
      characters: [
        {
          id: "char-1",
          name: primaryName,
          age: charAge || "20",
          role: "Main Character",
          description:
            charDesc || "Curious college student who discovers the laboratory.",
        },
        {
          id: "char-2",
          name: companionName,
          role: "AI Companion",
          description: "An advanced AI robot protecting the city.",
        },
      ],
      panels: generatedPanels,
    };
  };

  // Trigger full generation flow
  const handleStartGenerateComic = async () => {
    setGenerationStepIndex(1);
    setCurrentScreen("generating");

    // Call server-side Gemini API in parallel while step animation progresses
    const apiPromise = fetch("/api/comic/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyIdea,
        genre,
        comicStyle,
        panelCount,
        mainCharacter: {
          name: charName,
          age: charAge,
          description: charDesc,
        },
        storyTone,
      }),
    })
      .then((r) => r.json())
      .catch(() => ({ fallback: true }));

    // Step progression timer for smooth visual demonstration
    for (let step = 2; step <= 6; step++) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setGenerationStepIndex(step);
    }

    const result = await apiPromise;

    if (result && !result.fallback && result.story) {
      const apiStory = result.story;
      const mappedPanels: ComicPanel[] = (apiStory.panels || []).map(
        (p: any, idx: number) => {
          const validTheme: ComicPanel["visualTheme"] = VISUAL_THEMES.includes(
            p.visualTheme
          )
            ? p.visualTheme
            : VISUAL_THEMES[idx % VISUAL_THEMES.length];
          return {
            id: `panel-${idx + 1}-${Date.now()}`,
            panelNumber: idx + 1,
            planSummary: p.planSummary || `Panel ${idx + 1} action`,
            sceneDescription:
              p.sceneDescription || p.planSummary || "Comic scene illustration",
            dialogue: p.dialogue || "...",
            narration: p.narration || "",
            character: p.character || charName || "Alex",
            artStyle: comicStyle,
            imageUrl: PANEL_THEME_IMAGES[validTheme],
            visualTheme: validTheme,
          };
        }
      );

      const mappedCharacters: CharacterProfile[] = (
        apiStory.characters || []
      ).map((c: any, idx: number) => ({
        id: `char-${idx}-${Date.now()}`,
        name: c.name || "Character",
        role: c.role || "Key Role",
        description: c.description || "",
      }));

      setProject({
        title: apiStory.title || "The Robot Beneath the Lab",
        summary:
          apiStory.summary ||
          DEFAULT_COMIC_PROJECT.summary,
        storyIdea,
        genre,
        comicStyle,
        panelCount,
        storyTone,
        mainCharacterInput: {
          name: charName,
          age: charAge,
          description: charDesc,
        },
        characters:
          mappedCharacters.length > 0
            ? mappedCharacters
            : DEFAULT_COMIC_PROJECT.characters,
        panels:
          mappedPanels.length > 0
            ? mappedPanels
            : buildFallbackProjectFromInputs().panels,
      });
    } else {
      setProject(buildFallbackProjectFromInputs());
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    setCurrentScreen("story-plan");
  };

  // Regenerate Story on the Story Plan screen
  const handleRegenerateStoryPlan = async () => {
    setIsRegeneratingStory(true);
    try {
      const res = await fetch("/api/comic/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyIdea:
            project.storyIdea +
            " Give it a fresh dramatic twist and new dialogue.",
          genre: project.genre,
          comicStyle: project.comicStyle,
          panelCount: project.panelCount,
          mainCharacter: project.mainCharacterInput,
          storyTone: project.storyTone,
        }),
      });
      const data = await res.json();
      if (data && !data.fallback && data.story) {
        const apiStory = data.story;
        setProject((prev) => ({
          ...prev,
          title: apiStory.title || prev.title,
          summary: apiStory.summary || prev.summary,
          characters: (apiStory.characters || prev.characters).map(
            (c: any, i: number) => ({
              id: `char-regen-${i}-${Date.now()}`,
              name: c.name,
              role: c.role || "Character",
              description: c.description,
            })
          ),
          panels: (apiStory.panels || prev.panels).map(
            (p: any, idx: number) => {
              const validTheme: ComicPanel["visualTheme"] =
                VISUAL_THEMES.includes(p.visualTheme)
                  ? p.visualTheme
                  : VISUAL_THEMES[idx % VISUAL_THEMES.length];
              return {
                id: `panel-regen-${idx + 1}-${Date.now()}`,
                panelNumber: idx + 1,
                planSummary: p.planSummary,
                sceneDescription: p.sceneDescription,
                dialogue: p.dialogue,
                narration: p.narration || "",
                character: p.character,
                artStyle: prev.comicStyle,
                imageUrl: PANEL_THEME_IMAGES[validTheme],
                visualTheme: validTheme,
              };
            }
          ),
        }));
        showToast("Story plan regenerated with Gemini AI");
      } else {
        const altProject = buildFallbackProjectFromInputs(
          project.comicStyle,
          true
        );
        setProject(altProject);
        showToast("Story plan updated with fresh narrative beats");
      }
    } catch {
      const altProject = buildFallbackProjectFromInputs(
        project.comicStyle,
        true
      );
      setProject(altProject);
      showToast("Story plan updated with fresh narrative beats");
    } finally {
      setIsRegeneratingStory(false);
    }
  };

  // Open Edit Story Modal
  const openEditStoryModal = () => {
    setDraftTitle(project.title);
    setDraftSummary(project.summary);
    setDraftCharacters(project.characters.map((c) => ({ ...c })));
    const summaries: Record<string, string> = {};
    project.panels.forEach((p) => {
      summaries[p.id] = p.planSummary;
    });
    setDraftPlanSummaries(summaries);
    setIsEditStoryOpen(true);
  };

  const handleSaveStoryEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setProject((prev) => ({
      ...prev,
      title: draftTitle.trim() || prev.title,
      summary: draftSummary.trim() || prev.summary,
      characters: draftCharacters,
      panels: prev.panels.map((p) => ({
        ...p,
        planSummary: draftPlanSummaries[p.id]?.trim() || p.planSummary,
      })),
    }));
    setIsEditStoryOpen(false);
    showToast("Story plan changes saved");
  };

  // Regenerate single panel in Comic Viewer
  const handleRegenerateSinglePanel = async (panel: ComicPanel) => {
    setRegeneratingPanelId(panel.id);
    try {
      const res = await fetch("/api/comic/regenerate-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comicTitle: project.title,
          panelNumber: panel.panelNumber,
          currentPanel: panel,
          genre: project.genre,
          comicStyle: panel.artStyle,
          storyTone: project.storyTone,
        }),
      });
      const data = await res.json();
      if (data && !data.fallback && data.panel) {
        setProject((prev) => ({
          ...prev,
          panels: prev.panels.map((p) =>
            p.id === panel.id
              ? {
                  ...p,
                  planSummary: data.panel.planSummary || p.planSummary,
                  sceneDescription:
                    data.panel.sceneDescription || p.sceneDescription,
                  dialogue: data.panel.dialogue || p.dialogue,
                  narration: data.panel.narration ?? p.narration,
                  character: data.panel.character || p.character,
                  variationSeed: (p.variationSeed || 0) + 1,
                }
              : p
          ),
        }));
        showToast(`Panel ${panel.panelNumber} regenerated with Gemini AI`);
      } else {
        const alt = ALTERNATE_PANEL_VARIATIONS[panel.visualTheme]?.[0];
        setProject((prev) => ({
          ...prev,
          panels: prev.panels.map((p) =>
            p.id === panel.id
              ? {
                  ...p,
                  planSummary: alt?.planSummary || p.planSummary,
                  sceneDescription: alt?.sceneDescription || p.sceneDescription,
                  dialogue:
                    p.dialogue === alt?.dialogue
                      ? "Systems recalibrated—let's move before the sector locks down!"
                      : alt?.dialogue || p.dialogue,
                  narration: alt?.narration || p.narration,
                  character: alt?.character || p.character,
                  variationSeed: (p.variationSeed || 0) + 1,
                }
              : p
          ),
        }));
        showToast(`Panel ${panel.panelNumber} regenerated`);
      }
    } catch {
      const alt = ALTERNATE_PANEL_VARIATIONS[panel.visualTheme]?.[0];
      if (alt) {
        setProject((prev) => ({
          ...prev,
          panels: prev.panels.map((p) =>
            p.id === panel.id
              ? {
                  ...p,
                  sceneDescription: alt.sceneDescription,
                  dialogue: alt.dialogue,
                  narration: alt.narration,
                }
              : p
          ),
        }));
      }
      showToast(`Panel ${panel.panelNumber} regenerated`);
    } finally {
      setRegeneratingPanelId(null);
    }
  };

  // Delete Panel
  const handleDeletePanel = (panelId: string) => {
    if (project.panels.length <= 1) {
      showToast("A comic must have at least one panel.");
      return;
    }
    setProject((prev) => {
      const filtered = prev.panels.filter((p) => p.id !== panelId);
      const renumbered = filtered.map((p, idx) => ({
        ...p,
        panelNumber: idx + 1,
      }));
      return {
        ...prev,
        panels: renumbered,
      };
    });
    showToast("Panel removed and sequence renumbered");
  };

  // Add Panel
  const handleAddPanel = () => {
    const nextNum = project.panels.length + 1;
    const nextTheme = VISUAL_THEMES[(nextNum - 1) % VISUAL_THEMES.length];
    const newPanel: ComicPanel = {
      id: `panel-added-${Date.now()}`,
      panelNumber: nextNum,
      planSummary: `${project.characters[0]?.name || "Alex"} uncovers a hidden clue in Sector ${nextNum}.`,
      sceneDescription: `Dramatic wide shot of ${project.characters[0]?.name || "Alex"} and ${project.characters[1]?.name || "NOVA"} examining an illuminated console in the underground complex.`,
      dialogue: "Look at these coordinates—there's another vault beneath the city!",
      narration: "Just when they thought the mission was over...",
      character: project.characters[0]?.name || "Alex",
      artStyle: project.comicStyle,
      imageUrl: PANEL_THEME_IMAGES[nextTheme],
      visualTheme: nextTheme,
    };

    setProject((prev) => ({
      ...prev,
      panels: [...prev.panels, newPanel],
    }));
    setEditingPanel(newPanel);
    showToast(`Added Panel ${nextNum}`);
  };

  // Save Edited Panel from Modal
  const handleSaveEditedPanel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPanel) return;
    setProject((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === editingPanel.id ? editingPanel : p
      ),
    }));
    showToast(`Saved changes to Panel ${editingPanel.panelNumber}`);
    setEditingPanel(null);
  };

  // AI Rewrite inside Edit Panel Modal
  const handleModalAiRewrite = async () => {
    if (!editingPanel) return;
    setIsModalAiRewriting(true);
    try {
      const res = await fetch("/api/comic/regenerate-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comicTitle: project.title,
          panelNumber: editingPanel.panelNumber,
          currentPanel: editingPanel,
          genre: project.genre,
          comicStyle: editingPanel.artStyle,
          storyTone: project.storyTone,
        }),
      });
      const data = await res.json();
      if (data && !data.fallback && data.panel) {
        setEditingPanel({
          ...editingPanel,
          planSummary: data.panel.planSummary || editingPanel.planSummary,
          sceneDescription:
            data.panel.sceneDescription || editingPanel.sceneDescription,
          dialogue: data.panel.dialogue || editingPanel.dialogue,
          narration: data.panel.narration ?? editingPanel.narration,
          character: data.panel.character || editingPanel.character,
        });
      } else {
        const alt = ALTERNATE_PANEL_VARIATIONS[editingPanel.visualTheme]?.[0];
        if (alt) {
          setEditingPanel({
            ...editingPanel,
            planSummary: alt.planSummary,
            sceneDescription: alt.sceneDescription,
            dialogue: alt.dialogue,
            narration: alt.narration,
          });
        }
      }
    } catch {
      // fallback already handled
    } finally {
      setIsModalAiRewriting(false);
    }
  };

  // Apply Global Style Change in Viewer
  const handleGlobalStyleChange = (newStyle: ComicStyleOption) => {
    setComicStyle(newStyle);
    setProject((prev) => ({
      ...prev,
      comicStyle: newStyle,
      panels: prev.panels.map((p) => ({
        ...p,
        artStyle: newStyle,
      })),
    }));
    showToast(`Applied ${newStyle} art style across all panels`);
  };

  // Export Comic Script JSON
  const handleExportScript = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${project.title.toLowerCase().replace(/\s+/g, "-")}-comic-script.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported comic script JSON");
  };

  // Load Example Comic directly
  const handleViewExample = () => {
    setProject(DEFAULT_COMIC_PROJECT);
    setStoryIdea(DEFAULT_COMIC_PROJECT.storyIdea);
    setGenre(DEFAULT_COMIC_PROJECT.genre);
    setComicStyle(DEFAULT_COMIC_PROJECT.comicStyle);
    setPanelCount(DEFAULT_COMIC_PROJECT.panelCount);
    setCharName(DEFAULT_COMIC_PROJECT.mainCharacterInput.name);
    setCharAge(DEFAULT_COMIC_PROJECT.mainCharacterInput.age);
    setCharDesc(DEFAULT_COMIC_PROJECT.mainCharacterInput.description);
    setStoryTone(DEFAULT_COMIC_PROJECT.storyTone);
    setCurrentScreen("comic-viewer");
    showToast("Loaded example comic: “The Robot Beneath the Lab”");
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentScreen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-slate-900">
      {/* Top Bar Contract: Zone 1 (Single wordmark) — Zone 2 (5 clean nav links) — Zone 3 (Primary Actions) */}
      <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setCurrentScreen("home");
            }}
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-700"
          >
            AI Comic Story Creator
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => setCurrentScreen("home")}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                currentScreen === "home"
                  ? "border-blue-700 text-slate-900 font-semibold"
                  : "border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("create")}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                currentScreen === "create" || currentScreen === "generating"
                  ? "border-blue-700 text-slate-900 font-semibold"
                  : "border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Create Comic
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("story-plan")}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                currentScreen === "story-plan"
                  ? "border-blue-700 text-slate-900 font-semibold"
                  : "border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Story Plan
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("comic-viewer")}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                currentScreen === "comic-viewer"
                  ? "border-blue-700 text-slate-900 font-semibold"
                  : "border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Comic Viewer
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("final-comic")}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                currentScreen === "final-comic"
                  ? "border-blue-700 text-slate-900 font-semibold"
                  : "border-transparent hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Final Comic
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleViewExample}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              View Example
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("create")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              Create Your Comic
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Progress Breadcrumb Strip when inside the creation pipeline */}
      {currentScreen !== "home" && (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5">
          <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs">
            <div className="flex items-center gap-2 text-slate-500 whitespace-nowrap">
              <button
                type="button"
                onClick={() => setCurrentScreen("create")}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  currentScreen === "create"
                    ? "text-blue-700 font-semibold"
                    : ""
                }`}
              >
                01. Enter Story Details
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setCurrentScreen("generating")}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  currentScreen === "generating"
                    ? "text-blue-700 font-semibold"
                    : ""
                }`}
              >
                02. AI Processing
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setCurrentScreen("story-plan")}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  currentScreen === "story-plan"
                    ? "text-blue-700 font-semibold"
                    : ""
                }`}
              >
                03. Generated Story Plan
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setCurrentScreen("comic-viewer")}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  currentScreen === "comic-viewer"
                    ? "text-blue-700 font-semibold"
                    : ""
                }`}
              >
                04. Comic Viewer & Editor
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                onClick={() => setCurrentScreen("final-comic")}
                className={`hover:text-slate-900 transition-colors cursor-pointer ${
                  currentScreen === "final-comic"
                    ? "text-blue-700 font-semibold"
                    : ""
                }`}
              >
                05. Final Comic
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-slate-500 font-mono-tabular shrink-0">
              <span>{project.genre}</span>
              <span aria-hidden="true">·</span>
              <span>{project.comicStyle}</span>
              <span aria-hidden="true">·</span>
              <span>{project.panels.length} Panels</span>
              <span aria-hidden="true">·</span>
              <span>{project.storyTone} Tone</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* =========================================================
            1. HOME SCREEN
        ========================================================= */}
        {currentScreen === "home" && (
          <div>
            {/* Hero Section */}
            <section className="max-w-[1280px] mx-auto px-6 pt-12 pb-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Hero Copy & Actions */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide">
                    <span>Gemini Multimodal Narrative Studio</span>
                    <span aria-hidden="true">·</span>
                    <span>Interactive Prototype</span>
                  </div>

                  <h1
                    className="font-display text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.08] tracking-tight"
                    style={{ textWrap: "balance" }}
                  >
                    Turn Your Ideas Into Comics With AI
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                    Create stories, characters, dialogue, and comic panels using
                    Gemini AI. Go from a single sentence prompt to a complete,
                    editable graphic novel layout in seconds.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentScreen("create")}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Create Your Comic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleViewExample}
                      className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      <span>View Example</span>
                    </button>
                  </div>

                  {/* Clean unboxed metadata summary */}
                  <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>6 Art Styles</span>
                    <span aria-hidden="true">·</span>
                    <span>4 to 10 Panel Scripts</span>
                    <span aria-hidden="true">·</span>
                    <span>Real-Time Dialogue & Scene Editor</span>
                  </div>
                </div>

                {/* Right Column: Attractive Comic-Style Hero Visual Spread */}
                <div className="lg:col-span-6">
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                      <div>
                        <span className="font-display text-sm font-bold text-slate-900">
                          Featured Issue: “The Robot Beneath the Lab”
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono-tabular">
                        <span>Science Fiction</span>
                        <span className="mx-1.5" aria-hidden="true">
                          ·
                        </span>
                        <span>6 Panels</span>
                      </div>
                    </div>

                    {/* 2x2 Comic Page Preview Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        DEFAULT_COMIC_PROJECT.panels[0],
                        DEFAULT_COMIC_PROJECT.panels[1],
                        DEFAULT_COMIC_PROJECT.panels[2],
                        DEFAULT_COMIC_PROJECT.panels[5],
                      ].map((panel) => (
                        <div
                          key={panel.id}
                          onClick={handleViewExample}
                          className="group relative aspect-4/3 rounded-lg border-2 border-slate-900 overflow-hidden cursor-pointer bg-slate-900"
                        >
                          <PanelArtwork panel={panel} />

                          {/* Panel Number Corner Box */}
                          <div className="absolute top-2 left-2 bg-amber-400 text-slate-950 border border-slate-900 px-2 py-0.5 text-[11px] font-mono-tabular font-semibold">
                            Panel {panel.panelNumber}
                          </div>

                          {/* Speech Bubble Preview */}
                          <div className="absolute bottom-2 inset-x-2 bg-white/95 text-slate-900 border border-slate-900 rounded-md px-2.5 py-1.5 shadow-xs">
                            <p className="text-[10px] font-bold text-blue-700 leading-none mb-0.5">
                              {panel.character}
                            </p>
                            <p className="text-[11px] font-medium text-slate-900 leading-snug line-clamp-1">
                              “{panel.dialogue}”
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Characters: <strong>Alex</strong> ·{" "}
                        <strong>NOVA</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen("story-plan")}
                        className="font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Story Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Four Feature Cards Section — Asymmetric Bento Grid with Editorial Numbering */}
            <section className="bg-white border-y border-slate-200 py-16">
              <div className="max-w-[1280px] mx-auto px-6">
                <div className="max-w-2xl mb-10">
                  <p className="text-xs font-semibold text-blue-700 mb-2">
                    Core Capabilities
                  </p>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                    style={{ textWrap: "balance" }}
                  >
                    From Story Concept to Illustrated Panels in Four Steps
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Feature 1: AI Story Generation (col-span-7) */}
                  <div className="md:col-span-7 p-7 rounded-xl bg-[#F8F7F4] border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono-tabular text-slate-500 mb-2">
                        01. Narrative Engine · Gemini 3.8 Flash
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        AI Story Generation
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        Transform a one-sentence premise into a structured
                        multi-act comic plot. Gemini automatically paces dramatic
                        beats, cliffhangers, and scene transitions across 4, 6,
                        8, or 10 panels.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Supports Adventure · Fantasy · Sci-Fi · Mystery · Comedy
                        · Superhero
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen("create")}
                        className="font-semibold text-blue-700 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Try Story Builder →
                      </button>
                    </div>
                  </div>

                  {/* Feature 2: Character Creation (col-span-5) */}
                  <div className="md:col-span-5 p-7 rounded-xl bg-[#F8F7F4] border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono-tabular text-slate-500 mb-2">
                        02. Cast & Persona Design
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        Character Creation
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Define your protagonist’s name, age, and traits while
                        Gemini generates supporting allies, guardians, and
                        antagonists with distinct roles and visual profiles.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
                      Example Cast: <strong>Alex</strong> (Student) ·{" "}
                      <strong>NOVA</strong> (Guardian AI)
                    </div>
                  </div>

                  {/* Feature 3: Comic Panel Generation (col-span-5) */}
                  <div className="md:col-span-5 p-7 rounded-xl bg-[#F8F7F4] border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono-tabular text-slate-500 mb-2">
                        03. Visual Storyboarding
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        Comic Panel Generation
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Render cohesive panel artwork across Manga, Anime,
                        Cartoon, Comic Book, Watercolor, or Cyberpunk styles with
                        instant per-panel regeneration.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-slate-600">
                      Includes full scene composition & style switching
                    </div>
                  </div>

                  {/* Feature 4: AI Dialogue (col-span-7) */}
                  <div className="md:col-span-7 p-7 rounded-xl bg-[#F8F7F4] border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono-tabular text-slate-500 mb-2">
                        04. Script & Lettering Studio
                      </div>
                      <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
                        AI Dialogue
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        Every panel comes complete with character-specific
                        speech bubbles and atmospheric narration boxes. Click
                        any panel to edit lines manually or ask Gemini AI to
                        rewrite dialogue on the spot.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Interactive Speech Bubbles · Narrator Captions · Live
                        Modal Editor
                      </span>
                      <button
                        type="button"
                        onClick={handleViewExample}
                        className="font-semibold text-blue-700 hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Open Comic Viewer →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            2. CREATE COMIC SCREEN
        ========================================================= */}
        {currentScreen === "create" && (
          <section className="max-w-[960px] mx-auto px-6 py-10">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  Step 1 of 4 · Story Configuration
                </p>
                <h1 className="font-display text-3xl font-bold text-slate-900">
                  Create Your Comic
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Enter your story idea, choose a visual style, and define your
                  main character.
                </p>
              </div>

              {/* Preset Quick-Load Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-500 mr-1">Presets:</span>
                {PRESET_STORY_IDEAS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setStoryIdea(preset.storyIdea);
                      setGenre(preset.genre);
                      setComicStyle(preset.comicStyle);
                      setPanelCount(preset.panelCount);
                      setStoryTone(preset.storyTone);
                      setCharName(preset.characterName);
                      setCharAge(preset.characterAge);
                      setCharDesc(preset.characterDescription);
                      showToast(`Loaded preset: ${preset.label}`);
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartGenerateComic();
              }}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8"
            >
              {/* Story Idea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="story-idea-input"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    Story Idea
                  </label>
                  <span className="text-xs text-slate-500">
                    Prompt for Gemini Story Engine
                  </span>
                </div>
                <textarea
                  id="story-idea-input"
                  rows={3}
                  value={storyIdea}
                  onChange={(e) => setStoryIdea(e.target.value)}
                  placeholder="A college student discovers a mysterious robot in an abandoned laboratory."
                  className="w-full rounded-xl border border-slate-300 bg-[#F8F7F4] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Genre, Comic Style, and Number of Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-100">
                {/* Genre Dropdown */}
                <div>
                  <label
                    htmlFor="genre-select"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Genre
                  </label>
                  <select
                    id="genre-select"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value as GenreOption)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none cursor-pointer"
                  >
                    {GENRE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comic Style Dropdown */}
                <div>
                  <label
                    htmlFor="style-select"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Comic Style
                  </label>
                  <select
                    id="style-select"
                    value={comicStyle}
                    onChange={(e) =>
                      setComicStyle(e.target.value as ComicStyleOption)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none cursor-pointer"
                  >
                    {COMIC_STYLE_OPTIONS.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Panels Buttons: 4, 6, 8, 10 */}
                <div>
                  <span className="block text-sm font-semibold text-slate-900 mb-2">
                    Number of Panels
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {PANEL_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setPanelCount(count)}
                        className={`py-2.5 text-sm font-mono-tabular font-semibold rounded-xl border transition-colors cursor-pointer ${
                          panelCount === count
                            ? "bg-blue-700 text-white border-blue-700 shadow-xs"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Character Section */}
              <div className="pt-6 border-t border-slate-200">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                  Main Character
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="char-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Character Name
                    </label>
                    <input
                      id="char-name"
                      type="text"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      placeholder="Alex"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="char-age"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Age
                    </label>
                    <input
                      id="char-age"
                      type="text"
                      value={charAge}
                      onChange={(e) => setCharAge(e.target.value)}
                      placeholder="20"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono-tabular text-slate-900 focus:border-blue-700 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label
                      htmlFor="char-desc"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Character Description
                    </label>
                    <input
                      id="char-desc"
                      type="text"
                      value={charDesc}
                      onChange={(e) => setCharDesc(e.target.value)}
                      placeholder="Curious college student who discovers the laboratory."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Story Tone */}
              <div className="pt-6 border-t border-slate-200">
                <span className="block text-sm font-semibold text-slate-900 mb-3">
                  Story Tone
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {STORY_TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setStoryTone(tone)}
                      className={`px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer whitespace-nowrap ${
                        storyTone === tone
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-[#F8F7F4] text-slate-700 border-slate-300 hover:bg-slate-200/70"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button: ✨ Generate Comic */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Gemini will generate the story summary, cast profiles, panel
                  plan, and comic artwork.
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <span>✨ Generate Comic</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =========================================================
            3. AI GENERATION SCREEN
        ========================================================= */}
        {currentScreen === "generating" && (
          <section className="max-w-[680px] mx-auto px-6 py-16">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Gemini AI Pipeline Active
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    Creating Your Comic...
                  </h1>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-blue-700 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((generationStepIndex / 6) * 100)
                    )}%`,
                  }}
                />
              </div>

              {/* 6 Required Progress Steps */}
              <div className="space-y-3.5">
                {GENERATION_STEPS.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted = generationStepIndex > stepNum;
                  const isCurrent = generationStepIndex === stepNum;

                  return (
                    <div
                      key={label}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                        isCompleted
                          ? "bg-emerald-50/50 border-emerald-200 text-slate-900"
                          : isCurrent
                          ? "bg-blue-50/70 border-blue-300 text-slate-900 font-semibold"
                          : "bg-[#F8F7F4] border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 text-center font-mono-tabular text-sm"
                          aria-hidden="true"
                        >
                          {isCompleted ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : isCurrent ? (
                            <span className="text-amber-600 font-bold">⏳</span>
                          ) : (
                            <span>○</span>
                          )}
                        </span>
                        <span className="text-sm">{label}</span>
                      </div>

                      <span className="text-xs font-mono-tabular text-slate-500">
                        {isCompleted
                          ? "Complete"
                          : isCurrent
                          ? "In Progress"
                          : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Target: {panelCount} Panels · {comicStyle} Style
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("story-plan")}
                  className="font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Skip to Generated Story →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            4. GENERATED STORY SCREEN (Story Plan)
        ========================================================= */}
        {currentScreen === "story-plan" && (
          <section className="max-w-[1040px] mx-auto px-6 py-10 space-y-8">
            {/* Header Bar with Title & Top Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-blue-700">
                      Generated Story Plan
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{project.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.comicStyle} Style</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.storyTone} Tone</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
                    “{project.title}”
                  </h1>
                </div>

                {/* Action Buttons: Edit Story | Regenerate | Generate Comic */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={openEditStoryModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Story</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRegenerateStoryPlan}
                    disabled={isRegeneratingStory}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isRegeneratingStory ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {isRegeneratingStory ? "Regenerating..." : "Regenerate"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentScreen("comic-viewer")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Comic</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Story Summary */}
              <div className="py-6 border-b border-slate-200">
                <h2 className="text-xs font-semibold text-slate-500 mb-2">
                  Story Summary
                </h2>
                <p className="text-base text-slate-800 leading-relaxed max-w-3xl">
                  {project.summary}
                </p>
              </div>

              {/* Characters Section */}
              <div className="py-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Characters
                  </h2>
                  <button
                    type="button"
                    onClick={openEditStoryModal}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Edit Cast
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.characters.map((char) => (
                    <div
                      key={char.id}
                      className="p-4 rounded-xl bg-[#F8F7F4] border border-slate-200"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="font-display text-base font-bold text-slate-900">
                          {char.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {char.role}
                          {char.age ? ` · Age ${char.age}` : ""}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {char.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Panel Plan */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Generated Panel Plan
                  </h2>
                  <span className="text-xs font-mono-tabular text-slate-500">
                    {project.panels.length} Panels Sequence
                  </span>
                </div>

                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {project.panels.map((panel) => (
                    <div
                      key={panel.id}
                      className="p-4 bg-white hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="font-mono-tabular text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md shrink-0">
                          Panel {panel.panelNumber}:
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {panel.planSummary}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {panel.character}: “{panel.dialogue}”
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPanel(panel);
                        }}
                        className="self-end sm:self-center text-xs font-medium text-slate-600 hover:text-blue-700 px-2.5 py-1 rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer shrink-0"
                      >
                        Customize Panel
                      </button>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA Bar */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("create")}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Story Settings</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={openEditStoryModal}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Edit Story
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerateStoryPlan}
                      disabled={isRegeneratingStory}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen("comic-viewer")}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Comic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            5. COMIC VIEWER & 6. PANEL CONTROLS
        ========================================================= */}
        {currentScreen === "comic-viewer" && (
          <section className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
            {/* Studio Header & Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-blue-700">
                    Comic Viewer & Panel Studio
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{project.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    {project.panels.length} Panels
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {project.title}
                </h1>
              </div>

              {/* Studio Toolbar: Global Art Style Switcher, Grid Toggle, Add Panel, Final Comic */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Art Style Switcher */}
                <div className="flex items-center gap-2 bg-[#F8F7F4] border border-slate-200 rounded-xl px-3 py-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <label
                    htmlFor="viewer-style-select"
                    className="text-xs font-medium text-slate-600"
                  >
                    Style:
                  </label>
                  <select
                    id="viewer-style-select"
                    value={project.comicStyle}
                    onChange={(e) =>
                      handleGlobalStyleChange(
                        e.target.value as ComicStyleOption
                      )
                    }
                    className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {COMIC_STYLE_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid Layout Switcher */}
                <div className="hidden sm:flex items-center gap-1 bg-[#F8F7F4] border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setViewerColumns("2col")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      viewerColumns === "2col"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    2-Column Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewerColumns("3col")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      viewerColumns === "3col"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    3-Column Strip
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddPanel}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Panel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSlideIndex(0);
                    setCurrentScreen("final-comic");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Final Comic</span>
                </button>
              </div>
            </div>

            {/* Professional Comic-Book Page Canvas */}
            <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 sm:p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              <div
                className={`grid grid-cols-1 ${
                  viewerColumns === "3col"
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : "md:grid-cols-2"
                } gap-6`}
              >
                {project.panels.map((panel) => {
                  const isPanelBusy = regeneratingPanelId === panel.id;

                  return (
                    <article
                      key={panel.id}
                      className="group flex flex-col rounded-xl border-2 border-slate-900 bg-slate-950 overflow-hidden"
                    >
                      {/* Artwork Frame with Panel Number, Narration Box, and Speech Bubble */}
                      <div className="relative aspect-4/3 w-full overflow-hidden">
                        <PanelArtwork panel={panel} />

                        {/* Regenerating Overlay */}
                        {isPanelBusy && (
                          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                            <Loader2 className="w-7 h-7 animate-spin text-amber-400 mb-2" />
                            <span className="text-xs font-semibold tracking-wide">
                              Regenerating Panel {panel.panelNumber}...
                            </span>
                          </div>
                        )}

                        {/* Top Row: Panel Number Badge + Optional Narration Caption Box */}
                        <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2 z-10">
                          <span className="bg-amber-400 text-slate-950 border-2 border-slate-900 px-2.5 py-0.5 text-xs font-mono-tabular font-bold shrink-0 shadow-xs">
                            Panel {panel.panelNumber}
                          </span>

                          {panel.narration && (
                            <div className="bg-amber-50/95 text-slate-900 border-2 border-slate-900 px-3 py-1.5 text-xs font-medium leading-snug max-w-[75%] shadow-xs">
                              {panel.narration}
                            </div>
                          )}
                        </div>

                        {/* Bottom Speech Bubble */}
                        <div className="absolute bottom-3 inset-x-3 z-10">
                          <div className="relative bg-white/95 text-slate-900 border-2 border-slate-900 rounded-xl px-4 py-2.5 shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                                {panel.character}
                              </span>
                              <span className="text-[10px] font-mono-tabular text-slate-400">
                                {panel.artStyle}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                              “{panel.dialogue}”
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Scene Caption & Panel Controls Footer: Edit | Regenerate | Delete */}
                      <div className="bg-white border-t-2 border-slate-900 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p
                          className="text-xs text-slate-600 line-clamp-1"
                          title={panel.sceneDescription}
                        >
                          <strong className="text-slate-900">Scene:</strong>{" "}
                          {panel.planSummary}
                        </p>

                        {/* 6. Panel Controls: Edit | Regenerate | Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingPanel({ ...panel })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <span
                            className="text-slate-300 text-xs"
                            aria-hidden="true"
                          >
                            |
                          </span>

                          <button
                            type="button"
                            disabled={isPanelBusy}
                            onClick={() => handleRegenerateSinglePanel(panel)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${
                                isPanelBusy ? "animate-spin" : ""
                              }`}
                            />
                            <span>Regenerate</span>
                          </button>

                          <span
                            className="text-slate-300 text-xs"
                            aria-hidden="true"
                          >
                            |
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeletePanel(panel.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {/* + Add Panel Card */}
                <button
                  type="button"
                  onClick={handleAddPanel}
                  className="min-h-[280px] rounded-xl border-2 border-dashed border-slate-400 bg-[#F8F7F4] hover:bg-blue-50/40 hover:border-blue-700 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-300 group-hover:border-blue-700 group-hover:text-blue-700 flex items-center justify-center mb-3 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-display text-base font-bold text-slate-900 group-hover:text-blue-700">
                    + Add Panel
                  </span>
                  <span className="text-xs text-slate-500 mt-1 max-w-xs">
                    Append a new comic panel to the story sequence and customize
                    its scene, dialogue, and art style.
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================
            7. FINAL COMIC SCREEN (Presentation & Export Mode)
        ========================================================= */}
        {currentScreen === "final-comic" && (
          <section className="max-w-[1200px] mx-auto px-6 py-10 space-y-8">
            {/* Presentation Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-semibold text-emerald-700">
                    ✓ Final Comic Ready
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{project.genre}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.comicStyle} Style</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    {project.panels.length} Panels
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {project.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Spread vs Single Panel Reader Toggle */}
                <div className="flex items-center gap-1 bg-[#F8F7F4] border border-slate-200 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setFinalReaderMode("spread")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      finalReaderMode === "spread"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Full Comic Spread
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinalReaderMode("single")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      finalReaderMode === "single"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Slide Reader
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("comic-viewer")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Back to Editor</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportScript}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Script</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Comic Issue Header Banner inside the Publication Sheet */}
            <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="border-b-2 border-slate-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-mono-tabular uppercase tracking-widest text-slate-500 mb-1">
                    Issue #01 · {project.genre} · {project.comicStyle} Edition
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    {project.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2 max-w-2xl">
                    {project.summary}
                  </p>
                </div>

                <div className="text-xs text-slate-600 shrink-0">
                  <span className="font-semibold text-slate-900">
                    Featured Cast:
                  </span>{" "}
                  {project.characters.map((c) => c.name).join(" · ")}
                </div>
              </div>

              {finalReaderMode === "spread" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.panels.map((panel) => (
                    <div
                      key={panel.id}
                      className="relative aspect-4/3 rounded-lg border-2 border-slate-900 overflow-hidden bg-slate-950"
                    >
                      <PanelArtwork panel={panel} />

                      {/* Panel Number + Narration */}
                      <div className="absolute top-3 inset-x-3 flex items-start justify-between gap-2">
                        <span className="bg-amber-400 text-slate-950 border-2 border-slate-900 px-2.5 py-0.5 text-xs font-mono-tabular font-bold">
                          {panel.panelNumber}
                        </span>
                        {panel.narration && (
                          <div className="bg-amber-50/95 text-slate-900 border-2 border-slate-900 px-3 py-1.5 text-xs font-medium max-w-[78%]">
                            {panel.narration}
                          </div>
                        )}
                      </div>

                      {/* Speech Bubble */}
                      <div className="absolute bottom-3 inset-x-3">
                        <div className="bg-white/95 text-slate-900 border-2 border-slate-900 rounded-xl px-4 py-2.5">
                          <span className="block text-[11px] font-bold text-blue-700 uppercase">
                            {panel.character}
                          </span>
                          <p className="text-sm font-semibold text-slate-900">
                            “{panel.dialogue}”
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Single Panel Slide Reader Mode */
                <div className="max-w-3xl mx-auto space-y-6">
                  {project.panels[activeSlideIndex] && (
                    <div className="relative aspect-4/3 rounded-xl border-2 border-slate-900 overflow-hidden bg-slate-950">
                      <PanelArtwork panel={project.panels[activeSlideIndex]} />
                      <div className="absolute top-4 inset-x-4 flex items-start justify-between gap-3">
                        <span className="bg-amber-400 text-slate-950 border-2 border-slate-900 px-3 py-1 text-xs font-mono-tabular font-bold">
                          Panel {project.panels[activeSlideIndex].panelNumber}{" "}
                          of {project.panels.length}
                        </span>
                        {project.panels[activeSlideIndex].narration && (
                          <div className="bg-amber-50/95 text-slate-900 border-2 border-slate-900 px-4 py-2 text-xs sm:text-sm font-medium max-w-[75%]">
                            {project.panels[activeSlideIndex].narration}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 inset-x-4">
                        <div className="bg-white/95 text-slate-900 border-2 border-slate-900 rounded-xl px-5 py-3.5">
                          <span className="block text-xs font-bold text-blue-700 uppercase mb-0.5">
                            {project.panels[activeSlideIndex].character}
                          </span>
                          <p className="text-base sm:text-lg font-semibold text-slate-900">
                            “{project.panels[activeSlideIndex].dialogue}”
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={activeSlideIndex === 0}
                      onClick={() =>
                        setActiveSlideIndex((i) => Math.max(0, i - 1))
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Panel</span>
                    </button>

                    <span className="text-xs font-mono-tabular text-slate-600">
                      Panel {activeSlideIndex + 1} / {project.panels.length}
                    </span>

                    <button
                      type="button"
                      disabled={activeSlideIndex >= project.panels.length - 1}
                      onClick={() =>
                        setActiveSlideIndex((i) =>
                          Math.min(project.panels.length - 1, i + 1)
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
                    >
                      <span>Next Panel</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* =========================================================
          PANEL EDIT MODAL (Scene description, Dialogue, Narration, Character, Art style)
      ========================================================= */}
      {editingPanel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-panel-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono-tabular font-semibold text-blue-700">
                  Panel {editingPanel.panelNumber} Inspector
                </span>
                <h2
                  id="edit-panel-modal-title"
                  className="font-display text-xl font-bold text-slate-900"
                >
                  Edit Comic Panel
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditingPanel(null)}
                aria-label="Close panel editor"
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPanel} className="mt-5 space-y-4">
              {/* Scene Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="modal-scene-desc"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Scene description
                  </label>
                  <button
                    type="button"
                    disabled={isModalAiRewriting}
                    onClick={handleModalAiRewrite}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {isModalAiRewriting
                        ? "Rewriting with Gemini..."
                        : "AI Rewrite Scene & Dialogue"}
                    </span>
                  </button>
                </div>
                <textarea
                  id="modal-scene-desc"
                  rows={2}
                  value={editingPanel.sceneDescription}
                  onChange={(e) =>
                    setEditingPanel({
                      ...editingPanel,
                      sceneDescription: e.target.value,
                      planSummary: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-[#F8F7F4] px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Dialogue */}
              <div>
                <label
                  htmlFor="modal-dialogue"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Dialogue
                </label>
                <textarea
                  id="modal-dialogue"
                  rows={2}
                  value={editingPanel.dialogue}
                  onChange={(e) =>
                    setEditingPanel({
                      ...editingPanel,
                      dialogue: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-[#F8F7F4] px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Narration */}
              <div>
                <label
                  htmlFor="modal-narration"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Narration
                </label>
                <input
                  id="modal-narration"
                  type="text"
                  value={editingPanel.narration}
                  onChange={(e) =>
                    setEditingPanel({
                      ...editingPanel,
                      narration: e.target.value,
                    })
                  }
                  placeholder="Optional narrator caption box..."
                  className="w-full rounded-xl border border-slate-300 bg-[#F8F7F4] px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Character & Art Style Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="modal-character"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Character
                  </label>
                  <input
                    id="modal-character"
                    type="text"
                    list="character-suggestions"
                    value={editingPanel.character}
                    onChange={(e) =>
                      setEditingPanel({
                        ...editingPanel,
                        character: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                    required
                  />
                  <datalist id="character-suggestions">
                    {project.characters.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="modal-art-style"
                    className="block text-xs font-semibold text-slate-800 mb-1.5"
                  >
                    Art style
                  </label>
                  <select
                    id="modal-art-style"
                    value={editingPanel.artStyle}
                    onChange={(e) =>
                      setEditingPanel({
                        ...editingPanel,
                        artStyle: e.target.value as ComicStyleOption,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none cursor-pointer"
                  >
                    {COMIC_STYLE_OPTIONS.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visual Scene Preset Selector */}
              <div>
                <label
                  htmlFor="modal-visual-scene"
                  className="block text-xs font-semibold text-slate-800 mb-1.5"
                >
                  Panel Artwork Composition
                </label>
                <select
                  id="modal-visual-scene"
                  value={editingPanel.visualTheme}
                  onChange={(e) => {
                    const theme = e.target
                      .value as ComicPanel["visualTheme"];
                    setEditingPanel({
                      ...editingPanel,
                      visualTheme: theme,
                      imageUrl: PANEL_THEME_IMAGES[theme],
                    });
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 focus:border-blue-700 focus:outline-none cursor-pointer"
                >
                  <option value="lab_entry">
                    Scene 1 — Entering the Abandoned Laboratory
                  </option>
                  <option value="robot_pod">
                    Scene 2 — Discovering the Dormant Robot Pod
                  </option>
                  <option value="robot_awaken">
                    Scene 3 — Robot Core Awakening in Sparks
                  </option>
                  <option value="city_hologram">
                    Scene 4 — Holographic City Danger Briefing
                  </option>
                  <option value="enemy_breach">
                    Scene 5 — Mechanical Enemy Breaching Lab
                  </option>
                  <option value="tunnel_escape">
                    Scene 6 — High-Speed Subterranean Tunnel Escape
                  </option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPanel(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Panel Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          STORY PLAN EDIT MODAL (Edit Title, Summary, Characters, Panel Summaries)
      ========================================================= */}
      {isEditStoryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-story-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-semibold text-blue-700">
                  Story Plan Editor
                </span>
                <h2
                  id="edit-story-modal-title"
                  className="font-display text-xl font-bold text-slate-900"
                >
                  Edit Comic Story & Cast
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditStoryOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoryEdits} className="mt-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Comic Title
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Story Summary
                </label>
                <textarea
                  rows={3}
                  value={draftSummary}
                  onChange={(e) => setDraftSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  required
                />
              </div>

              {/* Characters Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Characters
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftCharacters((prev) => [
                        ...prev,
                        {
                          id: `char-new-${Date.now()}`,
                          name: "New Character",
                          role: "Supporting Role",
                          description: "Character description...",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Character</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {draftCharacters.map((char, idx) => (
                    <div
                      key={char.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 rounded-xl bg-[#F8F7F4] border border-slate-200"
                    >
                      <input
                        type="text"
                        value={char.name}
                        onChange={(e) => {
                          const next = [...draftCharacters];
                          next[idx] = { ...char, name: e.target.value };
                          setDraftCharacters(next);
                        }}
                        placeholder="Name"
                        className="sm:col-span-4 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={char.description}
                        onChange={(e) => {
                          const next = [...draftCharacters];
                          next[idx] = { ...char, description: e.target.value };
                          setDraftCharacters(next);
                        }}
                        placeholder="Description"
                        className="sm:col-span-8 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel Plan Outline Editor */}
              <div>
                <span className="block text-xs font-semibold text-slate-800 mb-2">
                  Panel Plan Outlines
                </span>
                <div className="space-y-2">
                  {project.panels.map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-xs font-mono-tabular font-semibold text-slate-500 w-16 shrink-0">
                        Panel {p.panelNumber}:
                      </span>
                      <input
                        type="text"
                        value={draftPlanSummaries[p.id] ?? p.planSummary}
                        onChange={(e) =>
                          setDraftPlanSummaries({
                            ...draftPlanSummaries,
                            [p.id]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditStoryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 cursor-pointer"
                >
                  Save Story Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-40 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 mt-16">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900">
              AI Comic Story Creator
            </span>
            <span aria-hidden="true">·</span>
            <span>Interactive College Project Prototype</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentScreen("home")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("create")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Create Comic
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("story-plan")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Story Plan
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen("comic-viewer")}
              className="hover:text-slate-900 cursor-pointer"
            >
              Comic Viewer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
