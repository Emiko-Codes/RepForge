import {
  House,
  CirclePlus,
  History as HistoryIcon,
  UserRound,
  Dumbbell,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Dumbbell size={32} />
        <span>RepForge</span>
      </div>

      <nav className="icons" aria-label="Workout navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <House size={24} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/workout"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <CirclePlus size={24} />
          <span>Log Workout</span>
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <HistoryIcon size={24} />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <UserRound size={24} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;