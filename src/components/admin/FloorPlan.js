import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { FaUsers, FaCalendarAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import moment from 'moment';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import AlertMessage from '../common/AlertMessage';

// Table shape components
const RoundTable = ({ table, onClick, isOccupied, bookingInfo, size = 100 }) => (
  <div
    className={`position-relative rounded-circle d-flex align-items-center justify-content-center ${isOccupied ? 'bg-danger' : 'bg-success'} text-white`}
    style={{ width: `${size}px`, height: `${size}px`, cursor: 'pointer' }}
    onClick={() => onClick(table, bookingInfo)}
  >
    <div className="text-center">
      <div className="fw-bold">{table.tableNumber}</div>
      <small>{table.capacity}</small>
    </div>
    {isOccupied && (
      <Badge
        bg="warning"
        text="dark"
        className="position-absolute"
        style={{ top: '5px', right: '5px' }}
      >
        <FaUsers />
      </Badge>
    )}
  </div>
);

const RectangleTable = ({ table, onClick, isOccupied, bookingInfo, width = 120, height = 80 }) => (
  <div
    className={`position-relative rounded d-flex align-items-center justify-content-center ${isOccupied ? 'bg-danger' : 'bg-success'} text-white`}
    style={{ width: `${width}px`, height: `${height}px`, cursor: 'pointer' }}
    onClick={() => onClick(table, bookingInfo)}
  >
    <div className="text-center">
      <div className="fw-bold">{table.tableNumber}</div>
      <small>{table.capacity}</small>
    </div>
    {isOccupied && (
      <Badge
        bg="warning"
        text="dark"
        className="position-absolute"
        style={{ top: '5px', right: '5px' }}
      >
        <FaUsers />
      </Badge>
    )}
  </div>
);

const FloorPlan = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [filterDate, setFilterDate] = useState(new Date());
  const [filterTime, setFilterTime] = useState(moment().startOf('hour').format('HH:mm'));

  // Room sections
  const [sections, setSections] = useState({
    indoor: { name: 'Indoor Seating', tables: [] },
    outdoor: { name: 'Outdoor Patio', tables: [] },
    bar: { name: 'Bar Area', tables: [] },
    private: { name: 'Private Room', tables: [] },
    window: { name: 'Window Seating', tables: [] },
    other: { name: 'Other Areas', tables: [] }
  });

  useEffect(() => {
    fetchData();
  }, [filterDate, filterTime]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get all tables
      const tablesResponse = await adminApi.getTables();

      if (tablesResponse.success) {
        setTables(tablesResponse.data);

        // Group tables by section
        const newSections = { ...sections };

        tablesResponse.data.forEach(table => {
          const sectionKey = table.section || 'other';
          if (newSections[sectionKey]) {
            newSections[sectionKey].tables.push(table);
          } else {
            newSections.other.tables.push(table);
          }
        });

        setSections(newSections);
      }

      // Get bookings for the selected date
      const formattedDate = moment(filterDate).format('YYYY-MM-DD');
      const bookingsResponse = await adminApi.getTableAvailability(formattedDate);

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load floor plan data');
    } finally {
      setLoading(false);
    }
  };

  const isTableOccupied = (tableId) => {
    const currentTime = moment(`${moment(filterDate).format('YYYY-MM-DD')} ${filterTime}`);

    for (const availability of bookings) {
      if (availability.tableId === tableId) {
        for (const booking of availability.bookings) {
          const startTime = moment(booking.start);
          const endTime = moment(booking.end);

          if (currentTime.isBetween(startTime, endTime, null, '[)')) {
            return booking;
          }
        }
      }
    }

    return null;
  };

  const handleTableClick = (table, bookingInfo) => {
    setSelectedTable(table);
    setSelectedBooking(bookingInfo);
    setShowBookingModal(true);
  };

  const generateTimeOptions = () => {
    const options = [];
    let start = moment().startOf('day').add(6, 'hours'); // 6 AM
    const end = moment().startOf('day').add(23, 'hours'); // 11 PM

    while (start.isSameOrBefore(end)) {
      options.push(start.format('HH:mm'));
      start.add(30, 'minutes');
    }

    return options;
  };

  const handleTimeChange = (e) => {
    setFilterTime(e.target.value);
  };

  const handleDateChange = (date) => {
    setFilterDate(date);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <LoadingSpinner size="lg" />
        <p className="mt-3">Loading floor plan...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Floor Plan & Table Layout</h2>

      {error && <AlertMessage variant="danger" message={error} onClose={() => setError(null)} />}

      {/* Date and Time Filter */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <FaCalendarAlt className="me-2" /> Date
                </Form.Label>
                <DatePicker
                  selected={filterDate}
                  onChange={handleDateChange}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <FaClock className="me-2" /> Time
                </Form.Label>
                <Form.Select
                  value={filterTime}
                  onChange={handleTimeChange}
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>
                      {moment(time, 'HH:mm').format('h:mm A')}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Legend */}
      <div className="d-flex mb-4">
        <div className="me-4 d-flex align-items-center">
          <div className="bg-success rounded-circle me-2" style={{ width: '20px', height: '20px' }}></div>
          <span>Available</span>
        </div>
        <div className="me-4 d-flex align-items-center">
          <div className="bg-danger rounded-circle me-2" style={{ width: '20px', height: '20px' }}></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Floor Plan Sections */}
      <div className="mb-5">
        {Object.entries(sections).map(([sectionKey, section]) => (
          section.tables.length > 0 && (
            <Card key={sectionKey} className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{section.name}</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-4 p-3">
                  {section.tables.map(table => {
                    const bookingInfo = isTableOccupied(table._id);
                    const isOccupied = bookingInfo !== null;

                    return (
                      <div key={table._id} className="text-center mb-2">
                        {(table.shape === 'round' || table.section === 'bar') ? (
                          <RoundTable
                            table={table}
                            onClick={handleTableClick}
                            isOccupied={isOccupied}
                            bookingInfo={bookingInfo}
                            size={table.capacity > 4 ? 120 : 80}
                          />
                        ) : (
                          <RectangleTable
                            table={table}
                            onClick={handleTableClick}
                            isOccupied={isOccupied}
                            bookingInfo={bookingInfo}
                            width={table.capacity > 6 ? 150 : 120}
                            height={table.capacity > 6 ? 100 : 80}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>
          )
        ))}
      </div>

      {/* Table Details Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Table {selectedTable?.tableNumber} Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTable && (
            <div>
              <p><strong>Table Number:</strong> {selectedTable.tableNumber}</p>
              <p><strong>Capacity:</strong> {selectedTable.capacity} {selectedTable.capacity === 1 ? 'person' : 'people'}</p>
              <p><strong>Section:</strong> {sections[selectedTable.section]?.name || selectedTable.section}</p>
              <p><strong>Status:</strong> {selectedBooking ? (
                <Badge bg="danger">Occupied</Badge>
              ) : (
                <Badge bg="success">Available</Badge>
              )}</p>

              {selectedBooking && (
                <div className="mt-4">
                  <h6 className="border-bottom pb-2 mb-3">Current Booking</h6>
                  <p><strong>Customer:</strong> {selectedBooking.customerName}</p>
                  <p><strong>Party Size:</strong> {selectedBooking.partySize}</p>
                  <p><strong>Time:</strong> {moment(selectedBooking.start).format('h:mm A')} - {moment(selectedBooking.end).format('h:mm A')}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FloorPlan;
