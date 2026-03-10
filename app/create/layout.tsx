"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { StepProgress } from "./_components/step-progress";
import { Lightbox } from "./_components/lightbox";
import { AiAvatarLibrary } from "./_components/ai-avatar-library";
import { useUIState } from "./_hooks/useUIState";
import { useReferenceState } from "./_hooks/useReferenceState";
import { ProjectAutoSaver } from "./_components/project-auto-saver";

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
      <CreateLayoutContent>{children}</CreateLayoutContent>
    </Suspense>
  );
}

function CreateLayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    step, 
    stepTitle, 
    lightboxImage, 
    setLightboxImage, 
    isAiAvatarLibraryOpen, 
    setIsAiAvatarLibraryOpen 
  } = useUIState();
  
  const {
    loading_avatars,
    ai_avatars,
    addAiAvatarReference
  } = useReferenceState();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <section className="">
        <StepProgress step={step} stepTitle={stepTitle} />
        {children}
        <ProjectAutoSaver />
      </section>

      <Lightbox lightboxImage={lightboxImage} setLightboxImage={setLightboxImage} />

      <AiAvatarLibrary
        isOpen={isAiAvatarLibraryOpen}
        setIsOpen={setIsAiAvatarLibraryOpen}
        loading={loading_avatars}
        avatars={ai_avatars}
        addAiAvatarReference={addAiAvatarReference}
      />
    </main>
  );
}
