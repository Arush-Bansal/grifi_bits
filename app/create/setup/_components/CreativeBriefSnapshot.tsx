"use client";

interface CreativeBriefSnapshotProps {
  productName: string;
  previewCount: number;
}

export function CreativeBriefSnapshot({ productName, previewCount }: CreativeBriefSnapshotProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-[#dff2ff] to-[#eff7ff] p-5">
      <h2 className="text-base font-semibold">Creative Brief Snapshot</h2>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">* Required fields</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Your brief will feed the script, scene prompts, and voice style in the next steps.
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <p>
          <span className="font-semibold">Brand:</span> {productName || "Not set"}
        </p>
        <p>
          <span className="font-semibold">Assets:</span> {previewCount} uploaded
        </p>
        <p>
          <span className="font-semibold">Tone:</span> UGC conversion focused
        </p>
      </div>
    </div>
  );
}
