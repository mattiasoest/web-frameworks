import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BackendProvider } from "./context/BackendContext";
import { CrewmateDetailPage } from "./pages/CrewmateDetailPage";
import { CrewmatesPage } from "./pages/CrewmatesPage";
import { MissionDetailPage } from "./pages/MissionDetailPage";
import { MissionsPage } from "./pages/MissionsPage";
import { ShipDetailPage } from "./pages/ShipDetailPage";
import { ShipsPage } from "./pages/ShipsPage";

export default function App() {
  return (
    <BackendProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/ships" replace />} />
          <Route path="ships" element={<ShipsPage />} />
          <Route path="ships/:id" element={<ShipDetailPage />} />
          <Route path="crewmates" element={<CrewmatesPage />} />
          <Route path="crewmates/:id" element={<CrewmateDetailPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="missions/:id" element={<MissionDetailPage />} />
        </Route>
      </Routes>
    </BackendProvider>
  );
}
