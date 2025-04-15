import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaUtensils, FaChartLine } from 'react-icons/fa';
import moment from 'moment';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    bookingsToday: [],
    totalTables: 0,
    totalUsers: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get today's bookings
        const today = moment().format('YYYY-MM-DD');
        const bookingsResponse = await adminApi.getAllBookings({ date: today });

        // Get tables count
        const tablesResponse = await adminApi.getTables();

        // Get users count
        const usersResponse = await adminApi.getUsers();

        setStats({
          bookingsToday: bookingsResponse.success ? bookingsResponse.data : [],
          totalTables: tablesResponse.success ? tablesResponse.data.length : 0,
          totalUsers: usersResponse.success ? usersResponse.data.length : 0,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', text: 'Pending' },
      'confirmed': { variant: 'primary', text: 'Confirmed' },
      'seated': { variant: 'info', text: 'Seated' },
      'completed': { variant: 'success', text: 'Completed' },
      'cancelled': { variant: 'danger', text: 'Cancelled' },
      'no-show': { variant: 'dark', text: 'No Show' }
    };

    const status_info = statusMap[status] || { variant: 'secondary', text: status };
    return <Badge bg={status_info.variant}>{status_info.text}</Badge>;
  };

  if (stats.loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner size="lg" />
        <p className="mt-3">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {stats.error && (
        <div className="alert alert-danger">{stats.error}</div>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 me-3">
                <FaCalendarAlt className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Today's Bookings</h6>
                <h3 className="mb-0">{stats.bookingsToday.length}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Link to="/admin/bookings" className="text-decoration-none">View All Bookings</Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 me-3">
                <FaUtensils className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Tables</h6>
                <h3 className="mb-0">{stats.totalTables}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Link to="/admin/tables" className="text-decoration-none">Manage Tables</Link>
            </Card.Footer>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-info bg-opacity-10 me-3">
                <FaUsers className="text-info" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1">Total Users</h6>
                <h3 className="mb-0">{stats.totalUsers}</h3>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0">
              <Link to="/admin/users" className="text-decoration-none">Manage Users</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Today's Bookings */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Today's Bookings</h5>
        </Card.Header>
        <Card.Body>
          {stats.bookingsToday.length === 0 ? (
            <p className="text-center mb-0">No bookings for today</p>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Party Size</th>
                    <th>Table(s)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.bookingsToday
                    .sort((a, b) => new Date(a.timeSlot.start) - new Date(b.timeSlot.start))
                    .map(booking => (
                      <tr key={booking._id}>
                        <td>{moment(booking.timeSlot.start).format('h:mm A')}</td>
                        <td>{booking.customer.name}</td>
                        <td>{booking.partySize}</td>
                        <td>
                          {booking.tables && booking.tables.length > 0
                            ? booking.tables.map(table => table.tableNumber || 'Table').join(', ')
                            : 'Not assigned'}
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="bg-white">
          <Link to="/admin/bookings" className="text-decoration-none">
            View All Bookings
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default AdminDashboard;
