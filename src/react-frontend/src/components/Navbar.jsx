import React, {useState, useContext} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Collapse,
  NavbarToggler,
  Button,
} from 'reactstrap';
import logo from '../assets/logo.png';
import { AuthContext } from '../App';

const AppNavbar = (props) => {

    const username = localStorage.getItem('username');
    const [collapsed, setCollapsed] = useState(true);
    const toggleNavbar = () => setCollapsed(!collapsed);
    const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        setIsAuthenticated(false);

        navigate('/login');
    };

    return (
    <Navbar color="dark" dark expand="md" className="mb-4">
        <NavbarBrand href="/collection">
        <img src={logo} alt="Logo" style={{ height: '60px' }} />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} color="dark" dark className="me-2" />
        <Collapse isOpen={!collapsed} navbar>
            <Nav className="ml-auto" navbar>
            <NavItem>
                <NavLink to="/" className="nav-link">
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
        {isAuthenticated && (
          <>
            <NavItem>
              <Button
                color="danger"
                size="sm"
                onClick={handleLogout}
                style={{ marginLeft: '10px' }}
              >
                Logout
              </Button>
            </NavItem>
          </>
        )}
    </Navbar>
    );
};

export default AppNavbar;
