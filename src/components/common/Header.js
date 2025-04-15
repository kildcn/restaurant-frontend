import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fs-3 font-serif fst-italic">
          L'Eustache
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>

            {/* Reservation Dropdown */}
            <NavDropdown title="Reservations" id="reservation-dropdown">
              <NavDropdown.Item as={Link} to="/bookings">Make a Reservation</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/bookings/lookup">Check Reservation Status</NavDropdown.Item>
              {currentUser && (
                <NavDropdown.Item as={Link} to="/my-bookings">My Reservations</NavDropdown.Item>
              )}
            </NavDropdown>

            {currentUser ? (
              <>
                {['admin', 'manager', 'staff'].includes(currentUser.role) && (
                  <NavDropdown title="Admin" id="admin-dropdown">
                    <NavDropdown.Item as={Link} to="/admin">Dashboard</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/bookings">Manage Bookings</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/floor-plan">Floor Plan</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/admin/tables">Manage Tables</NavDropdown.Item>
                    {['admin', 'manager'].includes(currentUser.role) && (
                      <NavDropdown.Item as={Link} to="/admin/restaurant">Settings</NavDropdown.Item>
                    )}
                    {currentUser.role === 'admin' && (
                      <NavDropdown.Item as={Link} to="/admin/users">Users</NavDropdown.Item>
                    )}
                  </NavDropdown>
                )}

                <NavDropdown title={currentUser.name} id="user-dropdown" align="end">
                  <NavDropdown.Item as={Link} to="/my-bookings">My Reservations</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
