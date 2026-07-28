import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "./FormField";

describe("FormField", () => {
  it("associates the label with the input via htmlFor/id", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders the error as an alert when present", () => {
    render(
      <FormField label="Email" htmlFor="email" error="Email inválido">
        <input id="email" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Email inválido");
  });

  it("renders no alert when there is no error", () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
