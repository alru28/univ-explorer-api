import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
} from 'reactstrap';
import logo from '../assets/logo.png';

const AppNavbar = () => {
  return (
    <Navbar color="light" light expand="md" className="mb-4">
      <NavbarBrand href="/collection">
        <img src={logo} alt="Logo" style={{ height: '40px' }} />
      </NavbarBrand>
      <Nav className="ml-auto" navbar>
        <NavItem>
          <NavLink to="/collection" className="nav-link">
            Collection
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/explore" className="nav-link">
            Explore
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/profile" className="nav-link">
            Profile
          </NavLink>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default AppNavbar;
