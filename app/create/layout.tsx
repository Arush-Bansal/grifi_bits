"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { StepProgress } from "./_components/step-progress";
import { Lightbox } from "./_components/lightbox";
import { AiAvatarLibrary } from "./_components/ai-avatar-library";
import { CreatePageProvider, useCreatePageContext } from "./_context/CreatePageContext";

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
       <div className="flex min-h-screen items-center justify-center bg-background">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground font-medium animate-pulse uppercase tracking-widest">Initializing LabEnvironment...</p>
         </div>
       </div>
    }>
      <CreatePageProvider>
        <CreateLayoutContent>{children}</CreateLayoutContent>
      </CreatePageProvider>
    </Suspense>
  );
}

function CreateLayoutContent({ children }: { children: React.ReactNode }) {
  const state = useCreatePageContext();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="">
        <StepProgress step={state.step} stepTitle={state.stepTitle} />
        {children}
      </section>

      <Lightbox lightboxImage={state.lightboxImage} setLightboxImage={state.setLightboxImage} />

      <AiAvatarLibrary
        isOpen={state.isAiAvatarLibraryOpen}
        setIsOpen={state.setIsAiAvatarLibraryOpen}
        loading={state.loadingAvatars}
        avatars={state.aiAvatars}
        addAiAvatarReference={state.addAiAvatarReference}
      />
    </main>
  );
}
