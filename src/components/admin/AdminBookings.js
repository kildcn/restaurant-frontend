// src/components/admin/AdminBookings.js
import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Form, Button, Badge, Modal, Pagination, Alert } from 'react-bootstrap';
import { FaSearch, FaFilter, FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { adminApi } from '../../services/api';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../common/LoadingSpinner';

// Bootstrap Modal DatePicker Component
const BootstrapModalDatePicker = ({ selectedDate, onChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate || new Date());

  // Format the date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle opening the modal
  const handleOpenModal = () => {
    setTempDate(selectedDate);
    setShowModal(true);
  };

  // Handle date selection in the DatePicker
  const handleDateChange = (date) => {
    setTempDate(date);
  };

  // Handle saving the date when clicking "Select Date"
  const handleSaveDate = () => {
    onChange(tempDate);
    setShowModal(false);
  };

  return (
    <>
      {/* Date input field */}
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          value={formatDate(selectedDate)}
          onClick={handleOpenModal}
          readOnly
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleOpenModal}
        >
          <FaCalendarAlt />
        </button>
      </div>

      {/* Bootstrap Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Date</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {/* Use React-DatePicker inside the modal */}
          <DatePicker
            selected={tempDate}
            onChange={handleDateChange}
            inline
            className="mx-auto" // Center the calendar
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px',
                alignItems: 'center'
              }}>
                <button
                  type="button"
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <FaChevronLeft />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => changeYear(parseInt(value))}
                    className="form-select form-select-sm"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    value={months[date.getMonth()]}
                    onChange={({ target: { value } }) =>
                      changeMonth(months.indexOf(value))
                    }
                    className="form-select form-select-sm"
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="btn btn-sm btn-outline-secondary"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveDate}>
            Select Date
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// Months array for the custom header
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [filters, setFilters] = useState({
    date: new Date(),
    status: '',
    search: '',
    showAllDates: false
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filters.date, filters.status, filters.showAllDates, pagination.page]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const formattedDate = filters.showAllDates ? '' : moment(filters.date).format('YYYY-MM-DD');

      const response = await adminApi.getAllBookings({
        date: formattedDate,
        status: filters.status,
        search: filters.search,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setBookings(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0
        }));
      } else {
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('An error occurred while loading bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleDateChange = (date) => {
    setFilters(prev => ({ ...prev, date, showAllDates: false }));
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  };

  const handleSearchInputChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleShowAllDatesChange = (e) => {
    setFilters(prev => ({ ...prev, showAllDates: e.target.checked }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowStatusModal(true);
  };

  const openDeleteModal = (booking) => {
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await adminApi.updateBookingStatus(selectedBooking._id, newStatus);

      if (response.success) {
        // Update local state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking._id === selectedBooking._id
              ? { ...booking, status: newStatus }
              : booking
          )
        );

        setSuccess(`Booking status updated to ${newStatus}`);
        setShowStatusModal(false);
      } else {
        setError('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('An error occurred while updating booking status');
    }
  };

  const handleDeleteBooking = async () => {
    try {
      const response = await adminApi.deleteBooking(selectedBooking._id);

      if (response.success) {
        // Remove from local state
        setBookings(prevBookings =>
          prevBookings.filter(booking => booking._id !== selectedBooking._id)
        );

        setSuccess('Booking deleted successfully');
        setShowDeleteModal(false);
        setSelectedBooking(null);
      } else {
        setError('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError('An error occurred while deleting booking');
    }
  };

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

  const handleCreateBooking = () => {
    navigate('/bookings');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Bookings</h2>
        <Button variant="primary" onClick={handleCreateBooking}>
          <FaPlus className="me-2" /> Create New Booking
        </Button>
      </div>

      {error && <AlertMessage variant="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" /> Date
                  </Form.Label>
                  <BootstrapModalDatePicker
                    selectedDate={filters.date}
                    onChange={handleDateChange}
                  />
                </Form.Group>
                <Form.Check
                  type="checkbox"
                  id="show-all-dates"
                  label="Show all bookings"
                  checked={filters.showAllDates}
                  onChange={handleShowAllDatesChange}
                  className="mt-2"
                />
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaFilter className="me-2" /> Status
                  </Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={handleStatusChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="seated">Seated</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaSearch className="me-2" /> Search
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or phone"
                    value={filters.search}
                    onChange={handleSearchInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={2} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="w-100">
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* View Floor Plan Button */}
      <div className="mb-4">
        <Button
          as={Link}
          to="/admin/floor-plan"
          variant="outline-primary"
          className="d-flex align-items-center"
        >
          <FaCalendarAlt className="me-2" /> View Floor Plan / Seating Layout
        </Button>
      </div>

      {/* Pending Bookings Alert */}
      {bookings.filter(b => b.status === 'pending').length > 0 && (
        <Alert variant="warning" className="mb-4">
          <strong>Attention:</strong> There are {bookings.filter(b => b.status === 'pending').length} pending bookings that require your review.
        </Alert>
      )}

      {/* Bookings Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="mt-3">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-0">No bookings found for the selected criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Party Size</th>
                    <th>Table(s)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id} className={booking.status === 'pending' ? 'table-warning' : ''}>
                      <td>
                        <div>{moment(booking.date).format('MMM D, YYYY')}</div>
                        <small>{moment(booking.timeSlot.start).format('h:mm A')} - {moment(booking.timeSlot.end).format('h:mm A')}</small>
                      </td>
                      <td>
                        <div>{booking.customer.name}</div>
                        <small className="text-muted">{booking.customer.email}</small>
                        <div><small>{booking.customer.phone}</small></div>
                      </td>
                      <td>{booking.partySize}</td>
                      <td>
                        {booking.tables && booking.tables.length > 0
                          ? booking.tables.map(table => table.tableNumber || 'Table').join(', ')
                          : 'Not assigned'}
                      </td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => openStatusModal(booking)}
                        >
                          <FaEdit /> Status
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => openDeleteModal(booking)}
                        >
                          <FaTrash /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                />

                {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === pagination.page}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.limit))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Booking Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p>
                <strong>Customer:</strong> {selectedBooking.customer.name}<br />
                <strong>Date:</strong> {moment(selectedBooking.date).format('MMM D, YYYY')}<br />
                <strong>Time:</strong> {moment(selectedBooking.timeSlot.start).format('h:mm A')}
              </p>

              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="seated">Seated</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              <p>Are you sure you want to delete this booking?</p>
              <p>
                <strong>Customer:</strong> {selectedBooking.customer.name}<br />
                <strong>Date:</strong> {moment(selectedBooking.date).format('MMM D, YYYY')}<br />
                <strong>Time:</strong> {moment(selectedBooking.timeSlot.start).format('h:mm A')}
              </p>
              <p className="text-danger">This action cannot be undone.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBooking}>
            Delete Booking
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminBookings;
