import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmailPage } from "@/routes/email";
import { callAI, useAISettings } from "@/lib/ai";

vi.mock("@/lib/ai", () => ({ callAI: vi.fn(), useAISettings: vi.fn() }));

describe("Email generation", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(useAISettings).mockReturnValue({ configured: true, ready: true, settings: { provider: "openai", apiKey: "", model: "gpt-4o-mini" } });
    vi.mocked(callAI).mockReset();
  });
  afterEach(cleanup);

  it("does not generate when no AI provider is connected", async () => {
    vi.mocked(useAISettings).mockReturnValue({ configured: false, ready: true, settings: { provider: "openai", apiKey: "", model: "gpt-4o-mini" } });
    render(<EmailPage />);
    fireEvent.click(screen.getByRole("button", { name: "Generate Email" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No AI provider connected");
    expect(callAI).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Generated email")).toHaveValue("");
  });

  it("uses the existing AI integration and keeps output editable, regeneratable and clearable", async () => {
    vi.mocked(callAI).mockResolvedValueOnce("Subject: Budget approval\n\nPlease approve the Q3 budget.").mockResolvedValueOnce("Subject: Revised budget request");
    render(<EmailPage />);
    fireEvent.change(screen.getByLabelText("What is the email about?"), { target: { value: "Request Q3 budget approval from Sarah" } });
    fireEvent.click(screen.getByRole("radio", { name: "Friendly" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate Email" }));
    await waitFor(() => expect(screen.getByLabelText("Generated email")).toHaveValue("Subject: Budget approval\n\nPlease approve the Q3 budget."));
    expect(callAI).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ role: "user", content: expect.stringContaining("Friendly:") })]));
    expect(callAI).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ role: "user", content: expect.stringContaining("Request Q3 budget approval from Sarah") })]));
    fireEvent.change(screen.getByLabelText("Generated email"), { target: { value: "Edited email" } });
    expect(screen.getByLabelText("Generated email")).toHaveValue("Edited email");
    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    await waitFor(() => expect(screen.getByLabelText("Generated email")).toHaveValue("Subject: Revised budget request"));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Generated email")).toHaveValue("");
  });

  it("shows provider errors without fabricated output", async () => {
    vi.mocked(callAI).mockRejectedValue(new Error("Your API key was rejected."));
    render(<EmailPage />);
    fireEvent.change(screen.getByLabelText("What is the email about?"), { target: { value: "Request a meeting" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate Email" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Your API key was rejected.");
    expect(screen.getByLabelText("Generated email")).toHaveValue("");
  });
});