import React from 'react';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FaCalendarAlt, FaClock, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

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
                  <p className="lead mt-2">Your reservation has been confirmed!</p>
                </div>
              </div>

              <Row className="mt-5">
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
                      <h5 className="mb-0">Reservation ID</h5>
                    </div>
                    <p className="ms-4">{booking._id}</p>
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
                <p className="mb-4">A confirmation email has been sent to {booking.customer.email}</p>
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
