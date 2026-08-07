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
import DetailsPage from "./pages/DetailsPage.jsx";
import "./App.css";

function App() {
  return (
    <div className="sidebar-layout">
      <Sidebar  
      //sidebar called here as <Sidebar/> so that it stays on the page no matter what, but the the rest of the page changes depending on if the browser URL matches the correct route path
      /> 

      <div className="route-content"> 
        <Routes>
          <Route
            path="/" //http://localhost:5173/
            element={<Navigate to="/workout" replace />} //Navigate changes the URL from http://localhost:5173/ to http://localhost:5173/workout
            //'replace' replaces / in the browser history instead of keeping it as a separate page to avoid an unecessary back and forth loop
            
          /> 

          <Route
            path="/dashboard"
            element={<DashboardPage />} // Dashboard page is loaded when the URL matces this path
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
            path="/history/:id" // :id allows a changing value in this position 
            element={<DetailsPage />}
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

/*
Order of what happens when the app is opened: 
1. main.jsx renders <App />
2. The App function runs
3. App returns its JSX
4. The sidebar is displayed using<Sidebar /> 
5. <Routes> reads the URL
6. The URL is "/history"
7. The "/history" route matches
8. <HistoryPage /> is displayed inside route-content
*/
