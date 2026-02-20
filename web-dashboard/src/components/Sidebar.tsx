import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiDollarSign, FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">
          <FiHome size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" className="nav-link">
          <FiUsers size={20} />
          <span>Leads</span>
        </NavLink>
        <NavLink to="/franchises" className="nav-link">
          <FiBriefcase size={20} />
          <span>Franchises</span>
        </NavLink>
        <NavLink to="/commissions" className="nav-link">
          <FiDollarSign size={20} />
          <span>Commissions</span>
        </NavLink>
        <NavLink to="/reports" className="nav-link">
          <FiTrendingUp size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
