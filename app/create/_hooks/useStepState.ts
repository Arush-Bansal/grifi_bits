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
    if (pathname.includes("/concepts")) return 1 as Step;
    if (pathname.includes("/references")) return 2 as Step;
    if (pathname.includes("/scenes")) return 3 as Step;
    if (pathname.includes("/preview")) return 4 as Step;
    return 0 as Step;
  }, [pathname]);

  const setStep = useCallback((targetStep: Step | ((prev: Step) => Step)) => {
    const nextStep = typeof targetStep === "function" ? targetStep(step) : targetStep;
    const stepToRoute: Record<number, string> = {
      0: "/create/setup",
      1: "/create/concepts",
      2: "/create/references",
      3: "/create/scenes",
      4: "/create/preview",
    };
    const projectId = searchParams.get("id");
    const url = `${stepToRoute[nextStep]}${projectId ? `?id=${projectId}` : ""}`;
    router.push(url);
  }, [router, searchParams, step]);

  const stepTitle = ["Product Setup", "Plan Selection", "Reference Style", "Scenes", "Final Preview"][step];

  return { step, setStep, stepTitle };
}
