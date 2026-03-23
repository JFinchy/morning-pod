async function testGeminiDirect() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found");
    return;
  }

  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  const versions = ["v1", "v1beta"];

  for (const version of versions) {
    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "hi" }] }],
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log(`✅ SUCCESS: ${version} / ${model}`);
          return; // Stop at first success
        } else {
          console.log(
            `❌ FAILED: ${version} / ${model} - ${response.status} ${data.error?.message || "Unknown error"}`
          );
        }
      } catch (err: any) {
        console.log(`💥 ERROR: ${version} / ${model} - ${err.message}`);
      }
    }
  }
}

testGeminiDirect();
