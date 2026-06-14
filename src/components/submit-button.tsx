"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function SubmitButton({
  label,
  pendingLabel = "Menyimpan...",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? pendingLabel : label}
    </Button>
  );
}
