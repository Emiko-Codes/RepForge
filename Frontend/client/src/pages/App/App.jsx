import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Sidebar from "../../components/Sidebar.jsx";
import WorkoutLoggerPage from "./WorkoutLoggerPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import DashboardPage from "./DashboardPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import DetailsPage from "./DetailsPage.jsx";
import LoginPage from "../Auth/LoginPage.jsx";
import SignupPage from "../Auth/SignupPage.jsx";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/"
      element={<Navigate to="/login" replace/>} //Navigate changes the URL from http://localhost:5173/ to http://localhost:5173/login
       //'replace' replaces / in the browser history instead of keeping it as a separate page to avoid an unecessary back and forth loop
     />
      <Route 
      path="/login"
      element={<LoginPage/>}
      />
      
      <Route 
      path="/signup"
      element={<SignupPage/>}
      />
    
      <Route path ="/*"
      element = {
        <div className="sidebar-layout">
          <Sidebar  
          //sidebar called here as <Sidebar/> so that it stays on the page no matter what, but the the rest of the page changes depending on if the browser URL matches the correct route path
          /> 

          <div className="route-content"> 
            <Routes>
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
      }
      />
    </Routes>
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
6. The URL is "/login"
7. The "/login" route matches
8. <LoginPage/> is displayed inside route-content
*/
