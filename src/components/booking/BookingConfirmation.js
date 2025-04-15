import React from 'react';
import { Container, Card, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  // If no booking data, redirect to booking page
  if (!booking) {
    navigate('/bookings');
    return null;
  }

  const formatDate = (date) => moment(date).format('dddd, MMMM D, YYYY');
  const formatTime = (time) => moment(time).format('h:mm A');

  // Generate a booking reference - we'll use the last 6 characters of the booking ID
  const bookingReference = booking._id ? booking._id.substring(booking._id.length - 6).toUpperCase() : 'PENDING';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-0 shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h1 className="font-serif fst-italic mb-2">L'Eustache</h1>
                <h2 className="h4 text-muted">Reservation Confirmation</h2>
                <div className="my-4 text-success">
                  <span className="display-4">✓</span>
                  <p className="lead mt-2">Your reservation has been received!</p>
                </div>
              </div>

              {/* Status Message */}
              <Alert variant={booking.status === 'confirmed' ? 'success' : 'warning'} className="mb-4">
                {booking.status === 'confirmed' ? (
                  <div className="d-flex align-items-center">
                    <FaCheckCircle className="me-2" />
                    <span>Your reservation has been confirmed.</span>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">Your reservation is currently <Badge bg="warning" text="dark">pending</Badge> approval.</p>
                    <p className="mb-0 small">You'll receive a confirmation email when your reservation is approved by the restaurant. You can also check your reservation status using your booking reference number.</p>
                  </div>
                )}
              </Alert>

              <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded">
                <h5 className="mb-0">Booking Reference:</h5>
                <h4 className="mb-0 text-primary">{bookingReference}</h4>
              </div>

              <Row className="mt-4">
                <Col md={6}>
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <h5 className="mb-0">Date</h5>
                    </div>
                    <p className="ms-4">{formatDate(booking.date)}</p>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaClock className="text-primary me-2" />
                      <h5 className="mb-0">Time</h5>
                    </div>
                    <p className="ms-4">
                      {formatTime(booking.timeSlot.start)} - {formatTime(booking.timeSlot.end)}
                    </p>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaUsers className="text-primary me-2" />
                      <h5 className="mb-0">Party Size</h5>
                    </div>
                    <p className="ms-4">{booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}</p>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-primary me-2" />
                      <h5 className="mb-0">Table(s)</h5>
                    </div>
                    <p className="ms-4">
                      {booking.tables && booking.tables.length > 0
                        ? booking.tables.map(table => table.tableNumber || 'Table').join(', ')
                        : 'Will be assigned upon arrival'}
                    </p>
                  </div>
                </Col>
              </Row>

              <Card className="bg-light border-0 p-3 mt-4">
                <Card.Body>
                  <h5>Reservation Details</h5>
                  <p className="mb-1"><strong>Name:</strong> {booking.customer.name}</p>
                  <p className="mb-1"><strong>Email:</strong> {booking.customer.email}</p>
                  <p className="mb-1"><strong>Phone:</strong> {booking.customer.phone}</p>
                  {booking.specialRequests && (
                    <p className="mb-1"><strong>Special Requests:</strong> {booking.specialRequests}</p>
                  )}
                </Card.Body>
              </Card>

              <div className="text-center mt-5">
                <p className="mb-2 d-flex align-items-center justify-content-center text-muted">
                  <FaEnvelope className="me-2" />
                  A confirmation email has been sent to {booking.customer.email}
                </p>
                <p className="mb-3">
                  Please save your booking reference: <strong>{bookingReference}</strong>
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <Button variant="outline-secondary" onClick={() => navigate('/')}>
                    Return to Home
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/my-bookings')}>
                    View My Reservations
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingConfirmation;
