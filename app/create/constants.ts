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
  { id: 1, name: "Hook", image_prompt: "Close up product + surprised face", video_prompt: "I did not expect this to work", speech: "I did not expect this to work" },
  { id: 2, name: "Problem", image_prompt: "Messy desk before use", video_prompt: "My old setup was wasting time every day", speech: "My old setup was wasting time every day" },
  { id: 3, name: "Discovery", image_prompt: "User discovering product online", video_prompt: "Then I found this simple fix", speech: "Then I found this simple fix" },
  { id: 4, name: "Unbox", image_prompt: "Hands opening package cleanly", video_prompt: "Everything looked premium from the box", speech: "Everything looked premium from the box" },
  { id: 5, name: "Demo", image_prompt: "Use product in bright natural room", video_prompt: "Watch how fast this takes effect", speech: "Watch how fast this takes effect" },
  { id: 6, name: "Result", image_prompt: "Before/after split scene", video_prompt: "You can see the difference right away", speech: "You can see the difference right away" },
  { id: 7, name: "Social Proof", image_prompt: "Overlay positive ratings", video_prompt: "Thousands already switched to this", speech: "Thousands already switched to this" },
  { id: 8, name: "CTA", image_prompt: "Product hero with brand color splash", video_prompt: "Tap below and try it now", speech: "Tap below and try it now" }
];

export const TIMELINE_DEFAULT_DURATION_SECONDS = 3;
export const TIMELINE_MIN_DURATION_SECONDS = 1;
export const TIMELINE_SNAP_SECONDS = 0.5;
export const TIMELINE_FLOAT_TOLERANCE = 0.001;
export const timelineClipPalette = ["#1f80db", "#2a8dec", "#4c9ae9", "#3e86cf", "#4f88b8", "#2f7aba", "#2374c4", "#4e97da"];
