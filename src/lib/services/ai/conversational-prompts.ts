/**
 * Prompt templates for generating conversational podcast scripts
 * Optimized for multi-voice TTS generation
 */

export interface ConversationalPromptOptions {
  podcastName?: string;
  hostAName?: string;
  hostBName?: string;
  style?: "professional" | "casual" | "technical" | "news";
  targetDuration?: "short" | "medium" | "long"; // 2-3min, 5-7min, 10-15min
  audience?: "general" | "technical" | "business";
}

export const CONVERSATIONAL_PROMPTS = {
  news: {
    system: `You are an expert podcast scriptwriter for a popular daily news show. Your specialty is transforming written news summaries into engaging, natural conversations between two hosts.

**Your Task:**
Transform the provided news summary into a conversational script between two distinct hosts with different personalities and roles.

**Host Personalities:**
- **HOST_A (Alex):** The analytical lead host. Sharp, fact-focused, introduces topics and provides core information. Professional tone, asks strategic questions.
- **HOST_B (Ben):** The conversational co-host. Relatable, connects dots, explores implications and real-world impact. Warmer tone, asks clarifying questions.

**Conversation Flow:**
1. Alex introduces the main story with key facts
2. Ben asks clarifying questions or adds perspective  
3. Natural back-and-forth discussing implications
4. Alex provides additional context or data
5. Ben connects to broader trends or audience impact
6. Conclude with forward-looking perspective

**Format Requirements:**
- Use EXACTLY this format: "HOST_A: [dialogue]" and "HOST_B: [dialogue]"
- Each line should be 1-2 sentences maximum (optimal for TTS)
- Include natural conversation markers ("That's interesting," "Right," "Exactly")
- Aim for 8-12 exchanges total
- Keep technical jargon to minimum, explain when necessary`,

    user: (summary: string, options: ConversationalPromptOptions = {}) => {
      const podcastName = options.podcastName || "Morning Brief";
      const duration = options.targetDuration || "medium";
      const style = options.style || "professional";

      let targetLength = "";
      if (duration === "short")
        targetLength = "6-8 exchanges, 1-2 minutes total";
      if (duration === "medium")
        targetLength = "8-12 exchanges, 2-4 minutes total";
      if (duration === "long")
        targetLength = "12-16 exchanges, 4-6 minutes total";

      return `Transform this news summary into a conversational script for "${podcastName}".

**Style Guide:** ${style}
**Target Length:** ${targetLength}
**Tone:** Informative but accessible, like two smart colleagues discussing news

**Summary to Transform:**
${summary}

**Remember:**
- Use only "HOST_A:" and "HOST_B:" labels
- Keep each line concise (1-2 sentences)
- Make it sound natural and conversational
- Include brief introductory context if needed`;
    },
  },

  tech: {
    system: `You are a scriptwriter for a technical podcast that makes complex topics accessible. You excel at creating conversations that explain technical concepts through natural dialogue.

**Host Personalities:**
- **HOST_A (Tech Lead):** Technical expert who can explain complex concepts clearly. Precise, knowledgeable, but avoids unnecessary jargon.
- **HOST_B (Interpreter):** Curious non-expert who asks the questions the audience would ask. Helps break down complex ideas into simple terms.

**Conversation Approach:**
1. HOST_A introduces the technical topic/development
2. HOST_B asks for clarification or real-world examples
3. HOST_A explains with analogies and simple terms
4. HOST_B explores practical implications
5. Natural discussion of why this matters
6. Future outlook or next steps`,

    user: (summary: string, options: ConversationalPromptOptions = {}) => {
      return `Create a technical discussion script that makes this content accessible to a general audience.

**Key Objectives:**
- Explain technical concepts through conversation
- Use analogies and simple examples
- Focus on practical implications
- Maintain engaging dialogue flow

**Technical Summary:**
${summary}

Format as conversation between HOST_A (technical expert) and HOST_B (curious interpreter).`;
    },
  },

  business: {
    system: `You are a business podcast scriptwriter specializing in market analysis and business strategy discussions. You create conversations that explore business implications and strategic thinking.

**Host Personalities:**
- **HOST_A (Strategy Analyst):** Business-focused, sees market implications, discusses competitive landscape and financial impact.
- **HOST_B (Market Interpreter):** Focuses on consumer impact, regulatory implications, and broader economic effects.

**Discussion Framework:**
1. Present the business development/news
2. Analyze immediate market implications
3. Discuss competitive landscape effects
4. Explore consumer/industry impact
5. Consider regulatory or policy implications
6. Strategic outlook and predictions`,

    user: (summary: string, options: ConversationalPromptOptions = {}) => {
      return `Transform this business summary into a strategic discussion between two business analysts.

**Focus Areas:**
- Market implications and competitive effects
- Consumer and industry impact
- Strategic and financial considerations
- Future business landscape

**Business Summary:**
${summary}

Create engaging dialogue that explores business strategy and market dynamics.`;
    },
  },
};

/**
 * Generate conversational script prompt based on content type and options
 */
export function generateConversationalPrompt(
  summary: string,
  contentType: "news" | "tech" | "business" = "news",
  options: ConversationalPromptOptions = {}
): { system: string; user: string } {
  const promptTemplate = CONVERSATIONAL_PROMPTS[contentType];

  return {
    system: promptTemplate.system,
    user: promptTemplate.user(summary, options),
  };
}

/**
 * Parse generated script into structured format for TTS
 */
export function parseConversationalScript(scriptText: string): Array<{
  speaker: "HOST_A" | "HOST_B";
  text: string;
  emphasis?: "normal" | "strong" | "reduced";
}> {
  const lines = scriptText
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        (line.startsWith("HOST_A:") || line.startsWith("HOST_B:"))
    );

  return lines.map((line) => {
    const speaker = line.startsWith("HOST_A:") ? "HOST_A" : "HOST_B";
    const text = line.replace(/^HOST_[AB]:\s*/, "").trim();

    // Add emphasis detection
    let emphasis: "normal" | "strong" | "reduced" = "normal";
    if (
      text.includes("!") ||
      text.includes("important") ||
      text.includes("critical")
    ) {
      emphasis = "strong";
    } else if (
      text.includes("(") ||
      text.includes("by the way") ||
      text.includes("incidentally")
    ) {
      emphasis = "reduced";
    }

    return {
      speaker: speaker as "HOST_A" | "HOST_B",
      text: text.replace(/[*_]/g, ""), // Remove markdown formatting
      emphasis,
    };
  });
}

/**
 * Quality check for generated conversational scripts
 */
export function validateConversationalScript(
  script: Array<{ speaker: string; text: string }>
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues = [];
  const suggestions = [];

  // Check minimum length
  if (script.length < 4) {
    issues.push("Script too short (minimum 4 exchanges)");
  }

  // Check maximum length (for TTS optimization)
  if (script.length > 20) {
    suggestions.push(
      "Consider shortening script (over 20 exchanges may be too long)"
    );
  }

  // Check speaker balance
  const hostACount = script.filter((line) => line.speaker === "HOST_A").length;
  const hostBCount = script.filter((line) => line.speaker === "HOST_B").length;
  const balance = Math.abs(hostACount - hostBCount);

  if (balance > 3) {
    suggestions.push(
      `Speaker imbalance detected (HOST_A: ${hostACount}, HOST_B: ${hostBCount})`
    );
  }

  // Check line length (optimal for TTS)
  const longLines = script.filter((line) => line.text.length > 200);
  if (longLines.length > 0) {
    suggestions.push(
      `${longLines.length} lines over 200 characters (may be too long for natural TTS)`
    );
  }

  // Check for alternating speakers (more natural conversation)
  let consecutiveSameSpeaker = 0;
  let maxConsecutive = 0;
  let lastSpeaker = "";

  for (const line of script) {
    if (line.speaker === lastSpeaker) {
      consecutiveSameSpeaker++;
      maxConsecutive = Math.max(maxConsecutive, consecutiveSameSpeaker);
    } else {
      consecutiveSameSpeaker = 1;
    }
    lastSpeaker = line.speaker;
  }

  if (maxConsecutive > 3) {
    suggestions.push(
      "Consider alternating speakers more frequently for better conversation flow"
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}
