import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaClock, FaUsers, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import moment from 'moment';
import { restaurantApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const BookingLookup = () => {
  const [bookingReference, setBookingReference] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBooking(null);

    if (!bookingReference || !customerEmail) {
      setError('Please enter both booking reference and email');
      return;
    }

    try {
      setLoading(true);

      // Make the actual API call now instead of using the mock data
      const response = await restaurantApi.lookupBooking(bookingReference, customerEmail);

      if (response.success) {
        setBooking(response.data);
      } else {
        setError(response.message || 'Booking not found. Please check your reference number and email.');
      }
    } catch (error) {
      console.error('Error looking up booking:', error);
      setError('An error occurred while looking up your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: '#ffc107', icon: <FaCalendarAlt />, text: 'Pending Review' },
      'confirmed': { color: '#28a745', icon: <FaCheckCircle />, text: 'Confirmed' },
      'seated': { color: '#17a2b8', icon: <FaUsers />, text: 'Seated' },
      'completed': { color: '#6c757d', icon: <FaCheckCircle />, text: 'Completed' },
      'cancelled': { color: '#dc3545', icon: <FaTimesCircle />, text: 'Cancelled' },
      'no-show': { color: '#343a40', icon: <FaTimesCircle />, text: 'No Show' }
    };

    const statusInfo = statusMap[status] || { color: '#6c757d', icon: null, text: status };

    return (
      <div className="d-flex align-items-center">
        <span
          className="d-inline-flex align-items-center justify-content-center rounded-circle me-2"
          style={{ backgroundColor: statusInfo.color, width: '28px', height: '28px', color: 'white' }}
        >
          {statusInfo.icon}
        </span>
        <span>{statusInfo.text}</span>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow mb-4">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4 restaurant-name">Check Reservation Status</h2>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Booking Reference</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., ABC123"
                        value={bookingReference}
                        onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email used for booking"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2} className="d-flex align-items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FaSearch className="me-2" /> Check
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {booking && (
            <Card className="border-0 shadow">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Reservation Found</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="mb-3">
                      <h5>Status</h5>
                      {getStatusBadge(booking.status)}
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <h5>Booking Reference</h5>
                      <p className="mb-0">{booking._id ? booking._id.substring(booking._id.length - 6).toUpperCase() : ''}</p>
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <h5>Date & Time</h5>
                      <p className="mb-1">
                        <FaCalendarAlt className="me-2 text-primary" />
                        {moment(booking.date).format('dddd, MMMM D, YYYY')}
                      </p>
                      <p className="mb-0">
                        <FaClock className="me-2 text-primary" />
                        {moment(booking.timeSlot.start).format('h:mm A')} - {moment(booking.timeSlot.end).format('h:mm A')}
                      </p>
                    </div>

                    <div className="mb-3">
                      <h5>Party Size</h5>
                      <p className="mb-0">
                        <FaUsers className="me-2 text-primary" />
                        {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="mb-3">
                      <h5>Guest Information</h5>
                      <p className="mb-1">{booking.customer.name}</p>
                      <p className="mb-1">{booking.customer.email}</p>
                      <p className="mb-0">{booking.customer.phone}</p>
                    </div>

                    {booking.specialRequests && (
                      <div>
                        <h5>Special Requests</h5>
                        <p className="mb-0">{booking.specialRequests}</p>
                      </div>
                    )}
                  </Col>
                </Row>

                {booking.status === 'pending' && (
                  <Alert variant="info" className="mt-4">
                    <FaCalendarAlt className="me-2" />
                    Your reservation is still pending confirmation. The restaurant will review it shortly and send you a confirmation email.
                  </Alert>
                )}

                {booking.status === 'confirmed' && (
                  <Alert variant="success" className="mt-4">
                    <FaCheckCircle className="me-2" />
                    Your reservation has been confirmed! We look forward to seeing you.
                  </Alert>
                )}

                {booking.status === 'cancelled' && (
                  <Alert variant="danger" className="mt-4">
                    <FaTimesCircle className="me-2" />
                    This reservation has been cancelled. If you need assistance, please contact the restaurant.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookingLookup;
