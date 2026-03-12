"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Step } from "../types";

export function useStepState() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const step = useMemo(() => {
    if (pathname.includes("/setup")) return 0 as Step;
    if (pathname.includes("/scenes")) return 1 as Step;
    if (pathname.includes("/preview")) return 2 as Step;
    return 0 as Step;
  }, [pathname]);

  const setStep = useCallback((targetStep: Step | ((prev: Step) => Step)) => {
    const nextStep = typeof targetStep === "function" ? targetStep(step) : targetStep;
    const stepToRoute: Record<number, string> = {
      0: "/create/setup",
      1: "/create/scenes",
      2: "/create/preview",
    };
    const projectId = searchParams.get("id");
    const url = `${stepToRoute[nextStep]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  }, [router, searchParams, step]);

  const stepTitle = ["Product Setup", "Scenes", "Final Preview"][step];

  return { step, setStep, stepTitle };
}
