async function listGeminiModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Available Models:");
      if (data.models) {
        data.models.forEach((m: any) => {
          console.log(
            `- ${m.name} (${m.supportedGenerationMethods.join(", ")})`
          );
        });
      } else {
        console.log("No models returned in the list.");
      }
    } else {
      console.log(
        `❌ FAILED to list models: ${response.status} ${data.error?.message || "Unknown error"}`
      );
    }
  } catch (err: any) {
    console.log(`💥 ERROR: ${err.message}`);
  }
}

listGeminiModels();
