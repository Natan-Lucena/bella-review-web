import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TagInput } from "./TagInput";

describe("TagInput", () => {
  it("adds free text as a tag on Enter", async () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Digite e pressione Enter");
    await userEvent.type(input, "minha-categoria{Enter}");
    expect(onChange).toHaveBeenCalledWith(["minha-categoria"]);
  });

  it("adds a suggestion when its chip is clicked", async () => {
    const onChange = vi.fn();
    render(<TagInput value={[]} onChange={onChange} suggestions={["security"]} />);
    await userEvent.click(screen.getByRole("button", { name: "+ security" }));
    expect(onChange).toHaveBeenCalledWith(["security"]);
  });

  it("removes a tag via its labeled remove button", async () => {
    const onChange = vi.fn();
    render(<TagInput value={["security"]} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remover categoria security" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("does not show a suggestion already added", () => {
    render(<TagInput value={["security"]} onChange={vi.fn()} suggestions={["security"]} />);
    expect(screen.queryByRole("button", { name: "+ security" })).not.toBeInTheDocument();
  });
});
