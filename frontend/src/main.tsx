import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { DashboardPage } from "./pages/DashboardPage";
import { RoutesPage } from "./pages/RoutesPage";
import { AssistancePage } from "./pages/AssistancePage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { ReportsPage } from "./pages/ReportsPage";
import "./styles.css";

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/dashboard");
  const [routeDetailId, setRouteDetailId] = useState<number | null>(null);

  const openRouteDetail = (id: number) => {
    setRouteDetailId(id);
    setActive("/routes");
  };

  return (
    <div className="shell">
      <aside>
        <div className="brand">无障碍出行协助平台</div>
        <nav>
          {routes.map((route) => (
            <button
              key={route.route}
              className={active === route.route ? "active" : ""}
              onClick={() => setActive(route.route)}
            >
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <main className="page">
        {active === "/dashboard" && <DashboardPage onOpenRoute={openRouteDetail} />}
        {active === "/routes" && (
          <RoutesPage
            key={routeDetailId ?? "list"}
            initialView={routeDetailId !== null ? { mode: "detail", id: routeDetailId } : null}
          />
        )}
        {active === "/assistance" && <AssistancePage />}
        {active === "/facilities" && <FacilitiesPage />}
        {active === "/reports" && <ReportsPage />}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
