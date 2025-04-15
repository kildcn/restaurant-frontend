import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { restaurantApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const BookingForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  const [bookingData, setBookingData] = useState({
    customerName: currentUser ? currentUser.name : '',
    customerEmail: currentUser ? currentUser.email : '',
    customerPhone: currentUser ? currentUser.phone : '',
    date: new Date(),
    time: '19:00',
    partySize: 2,
    duration: 120,
    tableIds: [],
    specialRequests: ''
  });

  const [availability, setAvailability] = useState({
    checked: false,
    available: false,
    tables: [],
    reason: ''
  });

  useEffect(() => {
    const fetchRestaurantSettings = async () => {
      try {
        const response = await restaurantApi.getSettings();
        if (response.success) {
          setRestaurant(response.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
        setError('Unable to load restaurant information. Please try again later.');
      }
    };

    fetchRestaurantSettings();

    // If user is logged in, pre-fill the form
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: value
    });

    // If changing critical fields, reset availability check
    if (['date', 'time', 'partySize', 'duration'].includes(name)) {
      setAvailability({
        checked: false,
        available: false,
        tables: [],
        reason: ''
      });
    }
  };

  const handleDateChange = (date) => {
    setBookingData({
      ...bookingData,
      date
    });

    // Reset availability check
    setAvailability({
      checked: false,
      available: false,
      tables: [],
      reason: ''
    });
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    setError(null);
    setAvailabilityLoading(true);

    try {
      const { date, time, partySize, duration } = bookingData;
      const formattedDate = moment(date).format('YYYY-MM-DD');

      const response = await restaurantApi.getAvailability(
        formattedDate,
        time,
        parseInt(partySize),
        parseInt(duration)
      );

      if (response.success) {
        setAvailability({
          checked: true,
          available: response.available,
          tables: response.tables || [],
          reason: response.reason || ''
        });
      } else {
        setError(response.message || 'Failed to check availability');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('An error occurred while checking availability. Please try again.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formattedDate = moment(bookingData.date).format('YYYY-MM-DD');

      const response = await restaurantApi.createBooking({
        ...bookingData,
        date: formattedDate,
        partySize: parseInt(bookingData.partySize),
        duration: parseInt(bookingData.duration)
      });

      if (response.success) {
        // Navigate to confirmation page with booking details
        navigate('/bookings/confirmation', {
          state: { booking: response.data }
        });
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('An error occurred while creating your booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeOptions = () => {
    if (!restaurant) return [];

    const options = [];
    const dayOfWeek = moment(bookingData.date).day();
    const daySettings = restaurant.openingHours.find(h => h.day === dayOfWeek);

    if (!daySettings || daySettings.isClosed) return [];

    let start = moment(daySettings.open, 'HH:mm');
    const end = moment(daySettings.close, 'HH:mm');

    // If closing time is after midnight, adjust end time
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }

    // Generate time slots in 30-minute increments
    const increment = restaurant.bookingRules.timeSlotDuration || 30;

    while (start.isBefore(end.subtract(bookingData.duration, 'minutes'))) {
      options.push(start.format('HH:mm'));
      start.add(increment, 'minutes');
    }

    return options;
  };

  return (
    <Container>
      <h1 className="text-center mb-4">Make a Reservation</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>Reservation Details</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCheckAvailability}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <DatePicker
                    selected={bookingData.date}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    className="form-control"
                    dateFormat="MMMM d, yyyy"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Select
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    required
                  >
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Party Size</Form.Label>
                  <Form.Select
                    name="partySize"
                    value={bookingData.partySize}
                    onChange={handleInputChange}
                    required
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'person' : 'people'}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Select
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="90">90 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="150">2.5 hours</option>
                    <option value="180">3 hours</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="outline-primary"
                  type="submit"
                  className="w-100"
                  disabled={availabilityLoading}
                >
                  {availabilityLoading ? <LoadingSpinner size="sm" /> : 'Check Availability'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>Guest Information</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitBooking}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={bookingData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="customerEmail"
                    value={bookingData.customerEmail}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={bookingData.customerPhone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Special Requests (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {availability.checked && (
                  <Alert variant={availability.available ? 'success' : 'warning'}>
                    {availability.available
                      ? `Great! We have a table available for your party of ${bookingData.partySize} on ${moment(bookingData.date).format('MMMM D, YYYY')} at ${bookingData.time}.`
                      : `Sorry, we don't have availability for your requested time. ${availability.reason}`
                    }
                  </Alert>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading || !availability.available}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Complete Reservation'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingForm;
