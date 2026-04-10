import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen gradient-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="grid-pattern min-h-full">
          <div className="p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
