"use client";

import dynamic from "next/dynamic";

const AdvocateWorkspaceView = dynamic(
  () =>
    import("@/components/pages/AdvocateWorkspaceView").then(
      (mod) => mod.AdvocateWorkspaceView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-medium text-zinc-500">
            Loading Advocate Chamber Workspace...
          </span>
        </div>
      </div>
    ),
  }
);

export default function AdvocateWorkspacePage() {
  return <AdvocateWorkspaceView />;
}
