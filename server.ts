import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // Generate full comic story, characters, and panel plan using Gemini
  app.post("/api/comic/generate-story", async (req, res) => {
    try {
      const {
        storyIdea,
        genre,
        comicStyle,
        panelCount,
        mainCharacter,
        storyTone,
      } = req.body;

      const ai = getAiClient();
      if (!ai) {
        return res.status(200).json({ fallback: true });
      }

      const numPanels = Number(panelCount) || 6;
      const prompt = `Create a structured comic book story based on the following inputs:
Story Idea: ${storyIdea || "A college student discovers a mysterious robot in an abandoned laboratory."}
Genre: ${genre || "Science Fiction"}
Comic Art Style: ${comicStyle || "Comic Book"}
Target Number of Panels: ${numPanels}
Main Character: ${mainCharacter?.name || "Alex"} (Age: ${mainCharacter?.age || "20"}) - ${mainCharacter?.description || "Curious college student who discovers the laboratory."}
Story Tone: ${storyTone || "Exciting"}

Return a complete comic story with:
- A compelling title
- A concise 2-3 sentence story summary
- 2 to 3 key characters (including the main character) with their name, role, and short description
- Exactly ${numPanels} sequential comic panels. For each panel include:
  - panelNumber (1 to ${numPanels})
  - planSummary (short 1-sentence summary for the Story Plan screen, e.g. "Alex enters the abandoned laboratory.")
  - sceneDescription (detailed visual description of the panel action and setting)
  - character (the primary character speaking or featured in the panel)
  - dialogue (natural comic speech bubble text spoken by the character)
  - narration (brief atmospheric narrator caption box text, or empty string if not needed)
  - visualTheme (one of: "lab_entry", "robot_pod", "robot_awaken", "city_hologram", "enemy_breach", "tunnel_escape") matching the closest dramatic beat.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a professional comic book writer and storyboard director. Keep dialogue punchy and dramatic.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "role", "description"],
                },
              },
              panels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    panelNumber: { type: Type.INTEGER },
                    planSummary: { type: Type.STRING },
                    sceneDescription: { type: Type.STRING },
                    character: { type: Type.STRING },
                    dialogue: { type: Type.STRING },
                    narration: { type: Type.STRING },
                    visualTheme: { type: Type.STRING },
                  },
                  required: [
                    "panelNumber",
                    "planSummary",
                    "sceneDescription",
                    "character",
                    "dialogue",
                    "narration",
                    "visualTheme",
                  ],
                },
              },
            },
            required: ["title", "summary", "characters", "panels"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(200).json({ fallback: true });
      }
      const parsed = JSON.parse(text.trim());
      return res.json({ fallback: false, story: parsed });
    } catch (error) {
      console.error("Gemini story generation error:", error);
      return res.status(200).json({
        fallback: true,
        errorMessage:
          error instanceof Error ? error.message : "Failed to call Gemini API",
      });
    }
  });

  // Regenerate a single comic panel using Gemini
  app.post("/api/comic/regenerate-panel", async (req, res) => {
    try {
      const {
        comicTitle,
        panelNumber,
        currentPanel,
        genre,
        comicStyle,
        storyTone,
      } = req.body;

      const ai = getAiClient();
      if (!ai) {
        return res.status(200).json({ fallback: true });
      }

      const prompt = `Rewrite and enhance Panel ${panelNumber} for the comic "${comicTitle}" (${genre}, ${comicStyle} style, ${storyTone} tone).
Current panel details:
Scene: ${currentPanel?.sceneDescription || ""}
Character: ${currentPanel?.character || "Alex"}
Dialogue: ${currentPanel?.dialogue || ""}
Narration: ${currentPanel?.narration || ""}

Provide a fresh, more dramatic version of this panel with an updated planSummary, sceneDescription, character, punchy dialogue, and narration.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planSummary: { type: Type.STRING },
              sceneDescription: { type: Type.STRING },
              character: { type: Type.STRING },
              dialogue: { type: Type.STRING },
              narration: { type: Type.STRING },
            },
            required: [
              "planSummary",
              "sceneDescription",
              "character",
              "dialogue",
              "narration",
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        return res.status(200).json({ fallback: true });
      }
      return res.json({ fallback: false, panel: JSON.parse(text.trim()) });
    } catch (error) {
      console.error("Gemini panel regeneration error:", error);
      return res.status(200).json({ fallback: true });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
