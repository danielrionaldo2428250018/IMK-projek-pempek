import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";

export function AppShell() {
  return (
    <div className="app-shell">
      <DesktopSidebar />
      <div className="app-shell__main">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
