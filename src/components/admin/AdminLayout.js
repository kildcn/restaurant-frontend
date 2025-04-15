import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaChartLine, FaUsers, FaUtensils, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Helper to check if a nav link is active
  const isActive = (path) => {
    return location.pathname === path ||
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  // Admin navigation items
  const navItems = [
    { path: '/admin', icon: <FaChartLine />, text: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
    { path: '/admin/bookings', icon: <FaCalendarAlt />, text: 'Bookings', roles: ['admin', 'manager', 'staff'] },
    { path: '/admin/tables', icon: <FaUtensils />, text: 'Tables', roles: ['admin', 'manager', 'staff'] },
    { path: '/admin/restaurant', icon: <FaCog />, text: 'Settings', roles: ['admin', 'manager'] },
    { path: '/admin/users', icon: <FaUsers />, text: 'Users', roles: ['admin'] }
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item =>
    item.roles.includes(currentUser?.role)
  );

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Admin Dashboard</h1>

      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="mb-4">
          <Nav className="flex-column">
            {filteredNavItems.map((item, index) => (
              <Nav.Link
                as={Link}
                to={item.path}
                key={index}
                className={`mb-2 ${isActive(item.path) ? 'active fw-bold bg-light' : ''}`}
              >
                <span className="me-2">{item.icon}</span>
                {item.text}
              </Nav.Link>
            ))}
          </Nav>
        </Col>

        {/* Main Content */}
        <Col md={9} lg={10}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
