import { Scene } from "./types";


export const INDIAN_LANGUAGES = [
  { label: "Hindi", value: "hindi" },
  { label: "English", value: "english" },
  { label: "Marathi", value: "marathi" },
  { label: "Bengali", value: "bengali" },
  { label: "Tamil", value: "tamil" },
  { label: "Telugu", value: "telugu" },
  { label: "Gujarati", value: "gujarati" }
];


export const defaultScenes: Scene[] = [
  { id: 1, name: "Hook", imagePrompt: "Close up product + surprised face", videoScript: "I did not expect this to work", audioPrompt: "I did not expect this to work" },
  { id: 2, name: "Problem", imagePrompt: "Messy desk before use", videoScript: "My old setup was wasting time every day", audioPrompt: "My old setup was wasting time every day" },
  { id: 3, name: "Discovery", imagePrompt: "User discovering product online", videoScript: "Then I found this simple fix", audioPrompt: "Then I found this simple fix" },
  { id: 4, name: "Unbox", imagePrompt: "Hands opening package cleanly", videoScript: "Everything looked premium from the box", audioPrompt: "Everything looked premium from the box" },
  { id: 5, name: "Demo", imagePrompt: "Use product in bright natural room", videoScript: "Watch how fast this takes effect", audioPrompt: "Watch how fast this takes effect" },
  { id: 6, name: "Result", imagePrompt: "Before/after split scene", videoScript: "You can see the difference right away", audioPrompt: "You can see the difference right away" },
  { id: 7, name: "Social Proof", imagePrompt: "Overlay positive ratings", videoScript: "Thousands already switched to this", audioPrompt: "Thousands already switched to this" },
  { id: 8, name: "CTA", imagePrompt: "Product hero with brand color splash", videoScript: "Tap below and try it now", audioPrompt: "Tap below and try it now" }
];

export const TIMELINE_DEFAULT_DURATION_SECONDS = 3;
export const TIMELINE_MIN_DURATION_SECONDS = 1;
export const TIMELINE_SNAP_SECONDS = 0.5;
export const TIMELINE_FLOAT_TOLERANCE = 0.001;
export const timelineClipPalette = ["#1f80db", "#2a8dec", "#4c9ae9", "#3e86cf", "#4f88b8", "#2f7aba", "#2374c4", "#4e97da"];
