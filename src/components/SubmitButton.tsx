import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "./Button";

type SubmitButtonProps = {
  disabled?: boolean;
  children: ReactNode;
};

// useFormStatus só funciona dentro de um <form> — reflete o `pending` do
// formAction mais próximo sem precisar receber isso via prop (ver PRD 04,
// react.md "React 19 Actions & Forms"). Compartilhado entre Signup e Login.
export function SubmitButton({ disabled = false, children }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={disabled} loading={pending}>
      {children}
    </Button>
  );
}
