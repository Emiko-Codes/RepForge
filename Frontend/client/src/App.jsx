import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import WorkoutLoggerPage from "./pages/WorkoutLoggerPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import "./App.css";

function App() {
  return (
    <div className="sidebar-layout">
      <Sidebar />

      <div className="route-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/workout" replace />}
          />

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/workout"
            element={<WorkoutLoggerPage />}
          />

          <Route
            path="/history"
            element={<HistoryPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
