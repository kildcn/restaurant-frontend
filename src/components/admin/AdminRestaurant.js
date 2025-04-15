import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Accordion, Table } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { adminApi } from '../../services/api';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminRestaurant = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form data for different settings
  const [generalForm, setGeneralForm] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    maxCapacity: 100
  });

  const [openingHoursForm, setOpeningHoursForm] = useState([]);

  const [bookingRulesForm, setBookingRulesForm] = useState({
    timeSlotDuration: 30,
    minAdvanceBooking: 60,
    maxAdvanceBooking: 30,
    maxDuration: 120,
    bufferBetweenBookings: 15,
    maxPartySize: 10,
    maxCapacityThreshold: 90,
    allowedPartySizes: {
      min: 1,
      max: 10
    }
  });

  const [newClosedDate, setNewClosedDate] = useState({
    date: new Date(),
    reason: ''
  });

  const [newSpecialEvent, setNewSpecialEvent] = useState({
    name: '',
    date: new Date(),
    customOpeningHours: {
      open: '17:00',
      close: '23:00'
    },
    customCapacity: '',
    notes: ''
  });

  useEffect(() => {
    fetchRestaurantSettings();
  }, []);

  const fetchRestaurantSettings = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSettings();

      if (response.success) {
        const data = response.data;
        setRestaurant(data);

        // Set form values from restaurant data
        setGeneralForm({
          name: data.name || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || ''
          },
          contact: {
            phone: data.contact?.phone || '',
            email: data.contact?.email || '',
            website: data.contact?.website || ''
          },
          maxCapacity: data.maxCapacity || 100
        });

        setOpeningHoursForm(data.openingHours || getDefaultOpeningHours());

        setBookingRulesForm({
          timeSlotDuration: data.bookingRules?.timeSlotDuration || 30,
          minAdvanceBooking: data.bookingRules?.minAdvanceBooking || 60,
          maxAdvanceBooking: data.bookingRules?.maxAdvanceBooking || 30,
          maxDuration: data.bookingRules?.maxDuration || 120,
          bufferBetweenBookings: data.bookingRules?.bufferBetweenBookings || 15,
          maxPartySize: data.bookingRules?.maxPartySize || 10,
          maxCapacityThreshold: data.bookingRules?.maxCapacityThreshold || 90,
          allowedPartySizes: {
            min: data.bookingRules?.allowedPartySizes?.min || 1,
            max: data.bookingRules?.allowedPartySizes?.max || 10
          }
        });
      } else {
        setError('Failed to load restaurant settings');
      }
    } catch (error) {
      console.error('Error fetching restaurant settings:', error);
      setError('An error occurred while loading restaurant settings');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOpeningHours = () => {
    return [
      { day: 0, open: '12:00', close: '22:00', isClosed: false }, // Sunday
      { day: 1, open: '11:00', close: '22:00', isClosed: false }, // Monday
      { day: 2, open: '11:00', close: '22:00', isClosed: false }, // Tuesday
      { day: 3, open: '11:00', close: '22:00', isClosed: false }, // Wednesday
      { day: 4, open: '11:00', close: '23:00', isClosed: false }, // Thursday
      { day: 5, open: '11:00', close: '23:00', isClosed: false }, // Friday
      { day: 6, open: '12:00', close: '23:00', isClosed: false }  // Saturday
    ];
  };

  const handleGeneralFormChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGeneralForm({
        ...generalForm,
        [parent]: {
          ...generalForm[parent],
          [child]: value
        }
      });
    } else {
      setGeneralForm({
        ...generalForm,
        [name]: name === 'maxCapacity' ? parseInt(value) : value
      });
    }
  };

  const handleOpeningHoursChange = (index, field, value) => {
    const updatedHours = [...openingHoursForm];

    if (field === 'isClosed') {
      updatedHours[index].isClosed = value;
    } else {
      updatedHours[index][field] = value;
    }

    setOpeningHoursForm(updatedHours);
  };

  const handleBookingRulesChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingRulesForm({
        ...bookingRulesForm,
        [parent]: {
          ...bookingRulesForm[parent],
          [child]: parseInt(value)
        }
      });
    } else {
      setBookingRulesForm({
        ...bookingRulesForm,
        [name]: parseInt(value)
      });
    }
  };

  const handleClosedDateChange = (field, value) => {
    setNewClosedDate({
      ...newClosedDate,
      [field]: value
    });
  };

  const handleSpecialEventChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewSpecialEvent({
        ...newSpecialEvent,
        [parent]: {
          ...newSpecialEvent[parent],
          [child]: value
        }
      });
    } else {
      setNewSpecialEvent({
        ...newSpecialEvent,
        [field]: field === 'customCapacity' ? (value ? parseInt(value) : '') : value
      });
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.updateRestaurantSettings(generalForm);

      if (response.success) {
        setRestaurant(response.data);
        setSuccess('General settings updated successfully');
      } else {
        setError('Failed to update general settings');
      }
    } catch (error) {
      console.error('Error updating general settings:', error);
      setError('An error occurred while updating general settings');
    }
  };

  const handleOpeningHoursSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.updateOpeningHours(openingHoursForm);

      if (response.success) {
        setRestaurant({
          ...restaurant,
          openingHours: response.data
        });
        setSuccess('Opening hours updated successfully');
      } else {
        setError('Failed to update opening hours');
      }
    } catch (error) {
      console.error('Error updating opening hours:', error);
      setError('An error occurred while updating opening hours');
    }
  };

  const handleBookingRulesSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await adminApi.updateBookingRules(bookingRulesForm);

      if (response.success) {
        setRestaurant({
          ...restaurant,
          bookingRules: response.data
        });
        setSuccess('Booking rules updated successfully');
      } else {
        setError('Failed to update booking rules');
      }
    } catch (error) {
      console.error('Error updating booking rules:', error);
      setError('An error occurred while updating booking rules');
    }
  };

  const handleAddClosedDate = async (e) => {
    e.preventDefault();
    try {
      // Format the date
      const formattedClosedDate = {
        date: moment(newClosedDate.date).format('YYYY-MM-DD'),
        reason: newClosedDate.reason
      };

      const response = await adminApi.addClosedDate(formattedClosedDate);

      if (response.success) {
        setRestaurant({
          ...restaurant,
          closedDates: response.data
        });
        setNewClosedDate({
          date: new Date(),
          reason: ''
        });
        setSuccess('Closed date added successfully');
      } else {
        setError('Failed to add closed date');
      }
    } catch (error) {
      console.error('Error adding closed date:', error);
      setError('An error occurred while adding closed date');
    }
  };

  const handleAddSpecialEvent = async (e) => {
    e.preventDefault();
    try {
      // Format the special event data
      const formattedEvent = {
        name: newSpecialEvent.name,
        date: moment(newSpecialEvent.date).format('YYYY-MM-DD'),
        customOpeningHours: newSpecialEvent.customOpeningHours,
        customCapacity: newSpecialEvent.customCapacity || undefined,
        notes: newSpecialEvent.notes
      };

      const response = await adminApi.addSpecialEvent(formattedEvent);

      if (response.success) {
        setRestaurant({
          ...restaurant,
          specialEvents: response.data
        });
        setNewSpecialEvent({
          name: '',
          date: new Date(),
          customOpeningHours: {
            open: '17:00',
            close: '23:00'
          },
          customCapacity: '',
          notes: ''
        });
        setSuccess('Special event added successfully');
      } else {
        setError('Failed to add special event');
      }
    } catch (error) {
      console.error('Error adding special event:', error);
      setError('An error occurred while adding special event');
    }
  };

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner size="lg" centered />
        <p className="mt-3">Loading restaurant settings...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Restaurant Settings</h2>

      {error && <AlertMessage variant="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess(null)} />}

      <Accordion defaultActiveKey="0" className="mb-4">
        {/* General Information */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>General Information</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleGeneralSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Restaurant Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={generalForm.name}
                      onChange={handleGeneralFormChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Capacity</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxCapacity"
                      value={generalForm.maxCapacity}
                      onChange={handleGeneralFormChange}
                      min="1"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Address</h5>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.street"
                      value={generalForm.address.street}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.city"
                      value={generalForm.address.city}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.state"
                      value={generalForm.address.state}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Zip/Postal Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.zipCode"
                      value={generalForm.address.zipCode}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.country"
                      value={generalForm.address.country}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className="mt-4">Contact Information</h5>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact.phone"
                      value={generalForm.contact.phone}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="contact.email"
                      value={generalForm.contact.email}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control
                      type="text"
                      name="contact.website"
                      value={generalForm.contact.website}
                      onChange={handleGeneralFormChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button type="submit" variant="primary">
                  Save General Information
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Opening Hours */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Opening Hours</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleOpeningHoursSubmit}>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Open</th>
                    <th>Close</th>
                    <th>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {openingHoursForm.map((hours, index) => (
                    <tr key={index}>
                      <td>{getDayName(hours.day)}</td>
                      <td>
                        <Form.Control
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOpeningHoursChange(index, 'open', e.target.value)}
                          disabled={hours.isClosed}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOpeningHoursChange(index, 'close', e.target.value)}
                          disabled={hours.isClosed}
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={hours.isClosed}
                          onChange={(e) => handleOpeningHoursChange(index, 'isClosed', e.target.checked)}
                          label="Closed"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end mt-3">
                <Button type="submit" variant="primary">
                  Save Opening Hours
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Booking Rules */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Booking Rules</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleBookingRulesSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time Slot Duration (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="timeSlotDuration"
                      value={bookingRulesForm.timeSlotDuration}
                      onChange={handleBookingRulesChange}
                      min="15"
                      max="60"
                    />
                    <Form.Text className="text-muted">
                      The duration of each booking time slot (e.g., 30 min slots: 5:00, 5:30, 6:00...)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Buffer Between Bookings (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="bufferBetweenBookings"
                      value={bookingRulesForm.bufferBetweenBookings}
                      onChange={handleBookingRulesChange}
                      min="0"
                      max="60"
                    />
                    <Form.Text className="text-muted">
                      Buffer time between bookings for the same table
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Minimum Advance Booking (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="minAdvanceBooking"
                      value={bookingRulesForm.minAdvanceBooking}
                      onChange={handleBookingRulesChange}
                      min="0"
                    />
                    <Form.Text className="text-muted">
                      How far in advance a booking must be made (e.g., 60 mins before)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Advance Booking (days)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxAdvanceBooking"
                      value={bookingRulesForm.maxAdvanceBooking}
                      onChange={handleBookingRulesChange}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      How far in the future bookings can be made (e.g., 30 days ahead)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Booking Duration (minutes)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxDuration"
                      value={bookingRulesForm.maxDuration}
                      onChange={handleBookingRulesChange}
                      min="30"
                    />
                    <Form.Text className="text-muted">
                      Maximum duration a customer can book a table for
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Maximum Party Size</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxPartySize"
                      value={bookingRulesForm.maxPartySize}
                      onChange={handleBookingRulesChange}
                      min="1"
                    />
                    <Form.Text className="text-muted">
                      Largest party size allowed for online bookings
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Max Capacity Threshold (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="maxCapacityThreshold"
                      value={bookingRulesForm.maxCapacityThreshold}
                      onChange={handleBookingRulesChange}
                      min="1"
                      max="100"
                    />
                    <Form.Text className="text-muted">
                      Maximum percentage of restaurant capacity that can be booked
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Min Party Size</Form.Label>
                        <Form.Control
                          type="number"
                          name="allowedPartySizes.min"
                          value={bookingRulesForm.allowedPartySizes.min}
                          onChange={handleBookingRulesChange}
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Party Size</Form.Label>
                        <Form.Control
                          type="number"
                          name="allowedPartySizes.max"
                          value={bookingRulesForm.allowedPartySizes.max}
                          onChange={handleBookingRulesChange}
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button type="submit" variant="primary">
                  Save Booking Rules
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>

        {/* Closed Dates */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>Closed Dates</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>
                <h5>Add Closed Date</h5>
                <Form onSubmit={handleAddClosedDate}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <DatePicker
                      selected={newClosedDate.date}
                      onChange={(date) => handleClosedDateChange('date', date)}
                      minDate={new Date()}
                      className="form-control"
                      dateFormat="MMMM d, yyyy"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Reason</Form.Label>
                    <Form.Control
                      type="text"
                      value={newClosedDate.reason}
                      onChange={(e) => handleClosedDateChange('reason', e.target.value)}
                      placeholder="e.g., Holiday, Renovation, etc."
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary">
                    Add Closed Date
                  </Button>
                </Form>
              </Col>

              <Col md={6}>
                <h5>Existing Closed Dates</h5>
                {restaurant?.closedDates?.length > 0 ? (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurant.closedDates.map((date, index) => (
                        <tr key={index}>
                          <td>{moment(date.date).format('MMMM D, YYYY')}</td>
                          <td>{date.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No closed dates set</p>
                )}
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* Special Events */}
        <Accordion.Item eventKey="4">
          <Accordion.Header>Special Events</Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={6}>
                <h5>Add Special Event</h5>
                <Form onSubmit={handleAddSpecialEvent}>
                  <Form.Group className="mb-3">
                    <Form.Label>Event Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newSpecialEvent.name}
                      onChange={(e) => handleSpecialEventChange('name', e.target.value)}
                      placeholder="e.g., Valentine's Day, New Year's Eve"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <DatePicker
                      selected={newSpecialEvent.date}
                      onChange={(date) => handleSpecialEventChange('date', date)}
                      minDate={new Date()}
                      className="form-control"
                      dateFormat="MMMM d, yyyy"
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Opening Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={newSpecialEvent.customOpeningHours.open}
                          onChange={(e) => handleSpecialEventChange('customOpeningHours.open', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Closing Time</Form.Label>
                        <Form.Control
                          type="time"
                          value={newSpecialEvent.customOpeningHours.close}
                          onChange={(e) => handleSpecialEventChange('customOpeningHours.close', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Custom Capacity (optional)</Form.Label>
                    <Form.Control
                      type="number"
                      value={newSpecialEvent.customCapacity}
                      onChange={(e) => handleSpecialEventChange('customCapacity', e.target.value)}
                      placeholder="Leave blank to use regular capacity"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={newSpecialEvent.notes}
                      onChange={(e) => handleSpecialEventChange('notes', e.target.value)}
                      placeholder="Any special notes about this event"
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary">
                    Add Special Event
                  </Button>
                </Form>
              </Col>

              <Col md={6}>
                <h5>Upcoming Special Events</h5>
                {restaurant?.specialEvents?.length > 0 ? (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                    {restaurant.specialEvents
  .filter(event => moment(event.date).isSameOrAfter(moment(), 'day'))
  .sort((a, b) => moment(a.date) - moment(b.date))
  .map((event, index) => (
    <tr key={index}>
      <td>{moment(event.date).format('MMM D, YYYY')}</td>
      <td>{event.name}</td>
      <td>
        {event.customOpeningHours?.open} - {event.customOpeningHours?.close}
      </td>
    </tr>
  ))}
</tbody>
</Table>
) : (
<p>No upcoming special events</p>
)}
</Col>
</Row>
</Accordion.Body>
</Accordion.Item>
</Accordion>
</div>
);
};

export default AdminRestaurant;
