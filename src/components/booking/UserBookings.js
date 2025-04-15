import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { restaurantApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await restaurantApi.getUserBookings();

      if (response.success) {
        setBookings(response.data);
      } else {
        setError('Failed to load your reservations');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('An error occurred while loading your reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      const response = await restaurantApi.cancelBooking(selectedBooking._id);

      if (response.success) {
        // Update the local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === selectedBooking._id
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );

        // Close the modal
        setShowCancelModal(false);
        setSelectedBooking(null);
      } else {
        setError('Failed to cancel reservation');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('An error occurred while cancelling your reservation');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', text: 'Pending' },
      'confirmed': { variant: 'success', text: 'Confirmed' },
      'seated': { variant: 'info', text: 'Seated' },
      'completed': { variant: 'secondary', text: 'Completed' },
      'cancelled': { variant: 'danger', text: 'Cancelled' },
      'no-show': { variant: 'dark', text: 'No Show' }
    };

    const status_info = statusMap[status] || { variant: 'secondary', text: status };

    return <Badge bg={status_info.variant}>{status_info.text}</Badge>;
  };

  const isBookingCancellable = (booking) => {
    // Check if booking is in the future and has status pending or confirmed
    return ['pending', 'confirmed'].includes(booking.status) &&
           moment(booking.timeSlot.start).isAfter(moment());
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">My Reservations</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <LoadingSpinner />
          <p className="mt-3">Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h4>You don't have any reservations yet</h4>
            <p className="text-muted mb-4">Make a reservation to enjoy our culinary experience</p>
            <Button as={Link} to="/bookings" variant="primary">
              Make a Reservation
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Party Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{moment(booking.date).format('MMM D, YYYY')}</td>
                    <td>{moment(booking.timeSlot.start).format('h:mm A')} - {moment(booking.timeSlot.end).format('h:mm A')}</td>
                    <td>{booking.partySize}</td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      {isBookingCancellable(booking) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel your reservation for:</p>
          {selectedBooking && (
            <div className="p-3 bg-light">
              <p className="mb-1">
                <strong>Date:</strong> {moment(selectedBooking.date).format('MMMM D, YYYY')}
              </p>
              <p className="mb-1">
                <strong>Time:</strong> {moment(selectedBooking.timeSlot.start).format('h:mm A')}
              </p>
              <p className="mb-0">
                <strong>Party Size:</strong> {selectedBooking.partySize}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Reservation
          </Button>
          <Button variant="danger" onClick={handleCancelBooking}>
            Cancel Reservation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserBookings;
