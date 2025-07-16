"use client";

import { toast as sonnerToast } from "sonner";
import * as React from "react";

const TOAST_LIMIT = 1;

type Toast = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
} & Omit<Parameters<typeof sonnerToast>[1], "description" | "action">;

function toast({ title, description, action, ...props }: Toast) {
  const id = sonnerToast(title || "", {
    description,
    action,
    ...props,
  });

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (updateProps: Toast) => {
      sonnerToast.dismiss(id);
      return sonnerToast(updateProps.title || "", {
        id,
        description: updateProps.description,
        action: updateProps.action,
        ...updateProps,
      });
    },
  };
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string) =>
      id ? sonnerToast.dismiss(id) : sonnerToast.dismiss(),
  };
}

export { useToast, toast };
