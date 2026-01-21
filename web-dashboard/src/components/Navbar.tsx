import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi';
import './Navbar.css';

interface NavbarProps {
  onLogout: () => void;
  onMenuClick: () => void;
}

interface Admin {
  name?: string;
  email?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, onMenuClick }) => {
  const navigate = useNavigate();
  const admin: Admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = (): void => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <FiMenu size={24} />
        </button>
        <h1 className="navbar-title">Fortune Cloud Admin</h1>
      </div>
      <div className="navbar-right">
        <div className="user-info">
          <FiUser size={18} />
          <span>{admin.name || 'Admin'}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
