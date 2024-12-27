import React, {useState} from 'react';
import { NavLink } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Collapse,
  NavbarToggler
} from 'reactstrap';
import logo from '../assets/logo.png';

const AppNavbar = (props) => {

    const username = localStorage.getItem('username');
    const [collapsed, setCollapsed] = useState(true);
    const toggleNavbar = () => setCollapsed(!collapsed);

    return (
    <Navbar color="dark" dark expand="md" className="mb-4">
        <NavbarBrand href="/collection">
        <img src={logo} alt="Logo" style={{ height: '60px' }} />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} color="dark" dark className="me-2" />
        <Collapse isOpen={!collapsed} navbar>
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
                <NavLink to={`/profile/${username}`} className="nav-link">
                Profile
                </NavLink>
            </NavItem>
            </Nav>
        </Collapse>
    </Navbar>
    );
};

export default AppNavbar;
