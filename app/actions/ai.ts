"use server";

import { generateText } from "ai";
import { openrouter } from "@/lib/ai";

export async function enhanceDescription(description: string) {
  if (!description || description.length < 10) {
    return { error: "Description is too short to enhance." };
  }

  try {
    const { text } = await generateText({
      model: openrouter("allenai/molmo-2-8b:free"),
      system: `You are a text formatter for "Flora Accessories". 
      Your task is to take the user's raw product description and add Markdown formatting (bolding, lists, proper spacing) WITHOUT changing the actual words or rewriting the content.
      
      Rules:
      1. DO NOT rewrite the sentences. Keep the original text as provided.
      2. Identify key technical details (materials, counts, contents) and make them **bold**.
      3. If the user provided a list of features or items separated by dots, commas, or newlines, format them as a clean bulleted list using standard Markdown syntax ("- ").
      4. Add appropriate line breaks and spacing to make it readable.
      5. Add 1-2 subtle emojis only if for emphasis on existing points.
      6. Return ONLY the formatted Markdown text.`,
      prompt: `Enhance this description: ${description}`,
    });

    return { text };
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return { error: "Failed to enhance description. Please check your API key." };
  }
}
