// Card generation prompt builder — runs SERVER-SIDE only
// Prompts synced with cardify-imp FRAME_STYLES (source of truth)

export interface CardParams {
  // Credit system fields
  platform: string
  external_user_id: string
  
  // Card generation fields
  mainCharacter: string
  background?: string
  frameStyle?: "none" | "pokemon" | "magic" | "cyberpunk"
  titleText?: string
  additionalText?: string
}

const FRAME_STYLES = {
  none: {
    basePrompt:
      "Create a full-art card with no frame or border elements, allowing the artwork to fill the entire card.",
    titleTextPrompt:
      "Overlay the title text directly on the artwork in a bold, readable font with a subtle shadow or glow effect to ensure visibility against the background.",
    additionalTextPrompt:
      "Place additional text in a complementary position with similar styling to maintain readability.",
    bothTextsPrompt:
      "Position the title prominently and the additional text as supporting information, both with effects to ensure visibility against the artwork.",
  },
  pokemon: {
    basePrompt:
      "Use a full-art Pokémon-style card layout with no distinct border around the artwork. The top left contains a small stage label inside a blue capsule.",
    titleTextPrompt:
      "Place the card name in bold white serif font on a dark red rectangular header at the top left. The top right displays HP in bold white text next to a circular energy symbol.",
    additionalTextPrompt:
      "Include attack descriptions in clean white sans-serif font directly over the artwork with semi-transparent boxes. The lower portion includes semi-transparent boxes for weakness, resistance, and retreat symbols.",
    bothTextsPrompt:
      "Place the card name in bold white serif font on a dark red rectangular header at the top left. The top right displays HP in bold white text next to a circular energy symbol. Use the additional text as attack names and descriptions, placed directly over the artwork in bold black text with energy icons to the left. Attack descriptions in clean white sans-serif font. The lower portion includes semi-transparent boxes for weakness, resistance, and retreat symbols. Flavor text appears in a thin, italicized box in the bottom right corner.",
  },
  magic: {
    basePrompt:
      "Use a full-art trading card frame inspired by Magic: The Gathering, with no visible borders.",
    titleTextPrompt:
      "Place the card name at the top left in a bold serif font, enclosed in a curved, 50% transparent banner. Align mana cost symbols to the top right.",
    additionalTextPrompt:
      "Include a wide, rounded 50% transparent textbox in the lower third that varies in size with the amount of text (should be positioned as far down as it can), containing the text in a legible serif font. Show a power/toughness box in the bottom right corner, clearly visible against the art.",
    bothTextsPrompt:
      "Place the card name at the top left in a bold serif font, enclosed in a curved, 50% transparent banner. Align mana cost symbols to the top right. Include the additional text as a type line (bold) and rules text in a wide, rounded 50% transparent textbox in the lower third that varies in size with the amount of text (should be positioned as far down as it can). Show a power/toughness box in the bottom right corner, clearly visible against the art.",
  },
  cyberpunk: {
    basePrompt:
      "Use a full-art digital trading card frame with a high-tech, cyber interface design. Outline with thin, angular circuit-like borders and corner connectors. Include stylized HUD-style graphical elements in frame corners.",
    titleTextPrompt:
      "Display the character name in bold, all-caps text with digital styling, integrated into the cyber interface.",
    additionalTextPrompt:
      "Include subtitle text in a matching digital font style, positioned to complement the interface design.",
    bothTextsPrompt:
      "Display the title in bold, all-caps text centered near the bottom of the card within the digital interface. Place the additional text as a smaller subtitle below it in matching font style. Integrate both text elements seamlessly with the HUD-style graphical elements and circuit patterns.",
  },
}

export function buildCardPrompt(params: CardParams): string {
  const { mainCharacter, background, frameStyle, titleText, additionalText } = params

  let prompt =
    "Create a fully designed, high-resolution trading card image in portrait orientation with an aspect ratio of 2.5:3.5 (standard playing card dimensions).\n\n"

  // Frame instructions
  if (frameStyle && frameStyle !== "none" && FRAME_STYLES[frameStyle]) {
    const frame = FRAME_STYLES[frameStyle]
    prompt += `Frame: ${frame.basePrompt}\n\n`

    const hasTitle = titleText?.trim()
    const hasAdditional = additionalText?.trim()

    if (hasTitle && hasAdditional) {
      prompt += `Text layout: ${frame.bothTextsPrompt}\n\n`
    } else if (hasTitle) {
      prompt += `Text layout: ${frame.titleTextPrompt}\n\n`
    } else if (hasAdditional) {
      prompt += `Text layout: ${frame.additionalTextPrompt}\n\n`
    }

    // 3D breakout effect
    prompt +=
      "Special effect: The character should visually break through the frame, with parts of their body (such as weapon, arm, or cloak) extending past the border to give a 3D effect.\n\n"
  } else if (frameStyle === "none" && FRAME_STYLES.none) {
    // Explicitly selected "none" frame
    const frame = FRAME_STYLES.none
    prompt += `Frame: ${frame.basePrompt}\n\n`

    const hasTitle = titleText?.trim()
    const hasAdditional = additionalText?.trim()

    if (hasTitle && hasAdditional) {
      prompt += `Text layout: ${frame.bothTextsPrompt}\n\n`
    } else if (hasTitle) {
      prompt += `Text layout: ${frame.titleTextPrompt}\n\n`
    } else if (hasAdditional) {
      prompt += `Text layout: ${frame.additionalTextPrompt}\n\n`
    }
  } else if (titleText || additionalText) {
    prompt +=
      "Text overlay: Place text directly on the artwork with effects (shadow, glow, or outline) to ensure readability. Title positioned prominently, additional text as supporting information.\n\n"
  }

  // Card specs
  prompt += "Card specifications:\n"
  if (mainCharacter) prompt += `• Main character: ${mainCharacter}\n`
  if (background) prompt += `• Background: ${background}\n`
  if (frameStyle) {
    const styleNames: Record<string, string> = { none: "No Frame", pokemon: "TCG Style", magic: "Magic Fantasy", cyberpunk: "Cyberpunk Style" }
    prompt += `• Card frame style: ${styleNames[frameStyle] || frameStyle}\n`
  }
  if (titleText) prompt += `• Title text: "${titleText}"\n`
  if (additionalText) prompt += `• Additional text: "${additionalText}"\n`

  prompt +=
    "\nThe final composition should resemble a premium trading card: perfectly centered, clear layout, crisp detail, and layered effects with a dynamic visual style.\n"
  prompt +=
    "IMPORTANT: Generate the image in a 2.5:3.5 aspect ratio (portrait orientation, like a standard playing card). The image dimensions should be suitable for printing on a physical card."

  return prompt
}

// Validation
export function validateCardParams(params: CardParams): { valid: boolean; error?: string } {
  if (!params.platform || params.platform.trim().length === 0) {
    return { valid: false, error: "platform is required" }
  }
  if (!params.external_user_id || params.external_user_id.trim().length === 0) {
    return { valid: false, error: "external_user_id is required" }
  }
  if (!params.mainCharacter || params.mainCharacter.trim().length === 0) {
    return { valid: false, error: "mainCharacter is required" }
  }
  if (params.mainCharacter.length > 300) {
    return { valid: false, error: "mainCharacter must be under 300 characters" }
  }
  if (params.background && params.background.length > 300) {
    return { valid: false, error: "background must be under 300 characters" }
  }
  if (params.titleText && params.titleText.length > 100) {
    return { valid: false, error: "titleText must be under 100 characters" }
  }
  if (params.additionalText && params.additionalText.length > 200) {
    return { valid: false, error: "additionalText must be under 200 characters" }
  }
  if (params.frameStyle && !["none", "pokemon", "magic", "cyberpunk"].includes(params.frameStyle)) {
    return { valid: false, error: "Invalid frameStyle" }
  }
  return { valid: true }
}
