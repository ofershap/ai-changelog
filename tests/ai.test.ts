import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateChangelog, type AiConfig } from "../src/ai.js";

describe("generateChangelog", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
          text: () => Promise.resolve(""),
        }),
      ),
    );
  });

  it("calls OpenAI API with correct payload for openai provider", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "## Features\n- New feature X" } }],
        }),
      text: () => Promise.resolve(""),
    });
    vi.stubGlobal("fetch", mockFetch);

    const config: AiConfig = {
      provider: "openai",
      model: "gpt-4o-mini",
      apiKey: "sk-test",
    };
    const result = await generateChangelog(
      config,
      "- PR #1: Add feature (by @user)",
      ["Features", "Bug Fixes"],
    );

    expect(result).toBe("## Features\n- New feature X");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
          "Content-Type": "application/json",
        }),
        body: expect.stringContaining("gpt-4o-mini"),
      }),
    );
  });

  it("calls Anthropic API with correct payload for anthropic provider", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: "## Bug Fixes\n- Fixed issue Y" }],
        }),
      text: () => Promise.resolve(""),
    });
    vi.stubGlobal("fetch", mockFetch);

    const config: AiConfig = {
      provider: "anthropic",
      model: "claude-3-haiku-20240307",
      apiKey: "sk-ant-test",
    };
    const result = await generateChangelog(
      config,
      "- PR #2: Fix bug (by @user)",
      ["Features", "Bug Fixes"],
    );

    expect(result).toBe("## Bug Fixes\n- Fixed issue Y");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.anthropic.com/v1/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-api-key": "sk-ant-test",
          "anthropic-version": "2023-06-01",
        }),
        body: expect.stringContaining("claude-3-haiku-20240307"),
      }),
    );
  });

  it("throws on OpenAI API error response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve("Unauthorized"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const config: AiConfig = {
      provider: "openai",
      model: "gpt-4o-mini",
      apiKey: "invalid",
    };

    await expect(
      generateChangelog(config, "- PR #1: Test", ["Features"]),
    ).rejects.toThrow("OpenAI API error: 401 Unauthorized");
  });

  it("throws on Anthropic API error response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("Rate limit exceeded"),
    });
    vi.stubGlobal("fetch", mockFetch);

    const config: AiConfig = {
      provider: "anthropic",
      model: "claude-3-haiku",
      apiKey: "invalid",
    };

    await expect(
      generateChangelog(config, "- PR #1: Test", ["Features"]),
    ).rejects.toThrow("Anthropic API error: 429 Rate limit exceeded");
  });

  it("includes categories and prSummaries in the prompt", async () => {
    let capturedBody = "";
    const mockFetch = vi.fn().mockImplementation(async (_, init) => {
      capturedBody = init?.body as string;
      return {
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: "Generated changelog" } }],
          }),
        text: () => Promise.resolve(""),
      };
    });
    vi.stubGlobal("fetch", mockFetch);

    await generateChangelog(
      { provider: "openai", model: "gpt-4o", apiKey: "key" },
      "PR #42: Custom feature",
      ["Features", "Breaking"],
    );

    const body = JSON.parse(capturedBody);
    expect(body.messages[1].content).toContain("PR #42: Custom feature");
    expect(body.messages[0].content).toContain("Features");
    expect(body.messages[0].content).toContain("Breaking");
  });
});
