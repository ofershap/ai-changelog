export interface AiConfig {
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
}

export async function generateChangelog(
  config: AiConfig,
  prSummaries: string,
  categories: string[],
): Promise<string> {
  const systemPrompt = `You are a changelog generator. Given a list of merged pull requests, generate a well-structured changelog grouped by these categories: ${categories.join(", ")}.

Rules:
- Each entry should be a concise, user-facing description (not the PR title verbatim)
- Use markdown format with ## for each category
- Only include categories that have entries
- Skip internal/maintenance PRs that don't affect users
- Be concise but informative`;

  const userPrompt = `Generate a changelog from these merged pull requests:\n\n${prSummaries}`;

  if (config.provider === "openai") {
    return callOpenAI(config, systemPrompt, userPrompt);
  }
  return callAnthropic(config, systemPrompt, userPrompt);
}

async function callOpenAI(
  config: AiConfig,
  system: string,
  user: string,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    }),
  });
  if (!response.ok)
    throw new Error(
      `OpenAI API error: ${response.status} ${await response.text()}`,
    );
  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return data.choices[0]?.message.content ?? "";
}

async function callAnthropic(
  config: AiConfig,
  system: string,
  user: string,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!response.ok)
    throw new Error(
      `Anthropic API error: ${response.status} ${await response.text()}`,
    );
  const data = (await response.json()) as { content: { text: string }[] };
  return data.content[0]?.text ?? "";
}
