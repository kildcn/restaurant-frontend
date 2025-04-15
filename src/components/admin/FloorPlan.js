import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Row, Col, Button, Badge, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaUsers, FaCalendarAlt, FaClock, FaInfoCircle, FaObjectGroup } from 'react-icons/fa';
import moment from 'moment';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import AlertMessage from '../common/AlertMessage';

// Months array for the custom header
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Table shape components
const RoundTable = ({ table, onClick, isOccupied, bookingInfo, groupInfo, size = 100 }) => (
  <div
    className={`position-relative rounded-circle d-flex align-items-center justify-content-center text-white`}
    style={{
      width: `${size}px`,
      height: `${size}px`,
      cursor: 'pointer',
      backgroundColor: isOccupied ? (bookingInfo?.bookingColor || '#DC3545') : '#28A745',
      border: groupInfo ? `4px solid ${groupInfo.color}` : 'none',
      boxShadow: groupInfo ? '0 0 10px rgba(0,0,0,0.3)' : 'none'
    }}
    onClick={() => onClick(table, bookingInfo, groupInfo)}
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
    {groupInfo && groupInfo.tableCount > 1 && (
      <Badge
        bg="info"
        className="position-absolute"
        style={{ bottom: '5px', right: '5px' }}
      >
        <FaObjectGroup /> {groupInfo.tableCount}
      </Badge>
    )}
  </div>
);

const RectangleTable = ({ table, onClick, isOccupied, bookingInfo, groupInfo, width = 120, height = 80 }) => (
  <div
    className={`position-relative rounded d-flex align-items-center justify-content-center text-white`}
    style={{
      width: `${width}px`,
      height: `${height}px`,
      cursor: 'pointer',
      backgroundColor: isOccupied ? (bookingInfo?.bookingColor || '#DC3545') : '#28A745',
      border: groupInfo ? `4px solid ${groupInfo.color}` : 'none',
      boxShadow: groupInfo ? '0 0 10px rgba(0,0,0,0.3)' : 'none'
    }}
    onClick={() => onClick(table, bookingInfo, groupInfo)}
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
    {groupInfo && groupInfo.tableCount > 1 && (
      <Badge
        bg="info"
        className="position-absolute"
        style={{ bottom: '5px', right: '5px' }}
      >
        <FaObjectGroup /> {groupInfo.tableCount}
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
  const [bookingGroups, setBookingGroups] = useState({});
  const [bookingColors, setBookingColors] = useState({});
  const datePickerRef = useRef(null);

  const [filterDate, setFilterDate] = useState(new Date());
  // Start with a default of 11:00 AM as a common restaurant opening time
  const [filterTime, setFilterTime] = useState("11:00");

  // Room sections
  const [sections, setSections] = useState({
    indoor: { name: 'Indoor Seating', tables: [] },
    outdoor: { name: 'Outdoor Patio', tables: [] },
    bar: { name: 'Bar Area', tables: [] },
    private: { name: 'Private Room', tables: [] },
    window: { name: 'Window Seating', tables: [] },
    other: { name: 'Other Areas', tables: [] }
  });

  // Update time options based on restaurant data
  useEffect(() => {
    const fetchRestaurantSettings = async () => {
      try {
        const response = await adminApi.getSettings();
        if (response.success) {
          // Get the day of week (0 = Sunday, 6 = Saturday)
          const dayOfWeek = filterDate.getDay();

          // Find opening hours for the selected day
          const dayHours = response.data.openingHours.find(h => h.day === dayOfWeek);

          if (dayHours && !dayHours.isClosed) {
            // Set default time to opening hour
            setFilterTime(dayHours.open);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
      }
    };

    fetchRestaurantSettings();
  }, [filterDate]);

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

        // Reset sections before grouping tables to avoid duplicates
        const newSections = {
          indoor: { name: 'Indoor Seating', tables: [] },
          outdoor: { name: 'Outdoor Patio', tables: [] },
          bar: { name: 'Bar Area', tables: [] },
          private: { name: 'Private Room', tables: [] },
          window: { name: 'Window Seating', tables: [] },
          other: { name: 'Other Areas', tables: [] }
        };

        // Group tables by section
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

        // Process bookings to identify groups and assign colors
        const groups = {};
        const colors = {};
        const colorOptions = [
          '#8E44AD', '#2980B9', '#1ABC9C', '#F39C12', '#D35400',
          '#27AE60', '#E74C3C', '#16A085', '#2C3E50', '#3498DB'
        ];

        let colorIndex = 0;

        // Group tables by booking ID
        bookingsResponse.data.forEach(tableData => {
          tableData.bookings.forEach(booking => {
            const bookingId = booking.bookingId;
            if (!groups[bookingId]) {
              groups[bookingId] = [];
              colors[bookingId] = colorOptions[colorIndex % colorOptions.length];
              colorIndex++;
            }
            groups[bookingId].push({
              tableId: tableData.tableId,
              tableNumber: tableData.tableNumber,
              ...booking
            });
          });
        });

        setBookingGroups(groups);
        setBookingColors(colors);
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
            return {
              ...booking,
              bookingColor: bookingColors[booking.bookingId] || '#D35400'
            };
          }
        }
      }
    }

    return null;
  };

  // Get booking group information for a table
  const getBookingGroupInfo = (tableId) => {
    // Find which booking group this table belongs to at the current time
    const currentTime = moment(`${moment(filterDate).format('YYYY-MM-DD')} ${filterTime}`);

    for (const [bookingId, tables] of Object.entries(bookingGroups)) {
      const tableInGroup = tables.find(item =>
        item.tableId === tableId &&
        currentTime.isBetween(moment(item.start), moment(item.end), null, '[)')
      );

      if (tableInGroup) {
        return {
          bookingId,
          color: bookingColors[bookingId],
          tableCount: tables.length,
          tables: tables
        };
      }
    }

    return null;
  };

  const handleTableClick = (table, bookingInfo, groupInfo) => {
    setSelectedTable(table);
    setSelectedBooking({
      ...bookingInfo,
      groupInfo: groupInfo
    });
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
                <div className="date-picker-container">
                  <DatePicker
                    ref={datePickerRef}
                    selected={filterDate}
                    onChange={handleDateChange}
                    className="form-control"
                    dateFormat="MMMM d, yyyy"
                    wrapperClassName="date-picker-wrapper"
                    calendarClassName="date-picker-calendar"
                    popperClassName="date-picker-popper"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    renderCustomHeader={({
                      date,
                      changeYear,
                      changeMonth,
                      decreaseMonth,
                      increaseMonth,
                      prevMonthButtonDisabled,
                      nextMonthButtonDisabled,
                    }) => (
                      <div
                        style={{
                          margin: 10,
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={decreaseMonth}
                          disabled={prevMonthButtonDisabled}
                          className="btn btn-sm btn-outline-secondary me-2"
                        >
                          {"<"}
                        </button>
                        <select
                          value={date.getFullYear()}
                          onChange={({ target: { value } }) => changeYear(value)}
                          className="form-select form-select-sm mx-1"
                          style={{ width: "80px" }}
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
                          className="form-select form-select-sm mx-1"
                          style={{ width: "100px" }}
                        >
                          {months.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={increaseMonth}
                          disabled={nextMonthButtonDisabled}
                          className="btn btn-sm btn-outline-secondary ms-2"
                        >
                          {">"}
                        </button>
                      </div>
                    )}
                  />
                </div>
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
      <div className="d-flex flex-wrap mb-4">
        <div className="me-4 mb-2 d-flex align-items-center">
          <div className="bg-success rounded-circle me-2" style={{ width: '20px', height: '20px' }}></div>
          <span>Available</span>
        </div>
        <div className="me-4 mb-2 d-flex align-items-center">
          <div className="bg-danger rounded-circle me-2" style={{ width: '20px', height: '20px' }}></div>
          <span>Occupied</span>
        </div>
        <div className="me-4 mb-2 d-flex align-items-center">
          <div className="rounded-circle me-2" style={{ width: '20px', height: '20px', border: '4px solid #8E44AD' }}></div>
          <span>Grouped Tables (same booking)</span>
        </div>
        <div className="me-4 mb-2 d-flex align-items-center">
          <Badge bg="info" className="me-2">
            <FaObjectGroup /> 2
          </Badge>
          <span>Number of Tables in Group</span>
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
                    const groupInfo = getBookingGroupInfo(table._id);

                    return (
                      <div key={table._id} className="text-center mb-2">
                        {(table.shape === 'round' || table.section === 'bar') ? (
                          <RoundTable
                            table={table}
                            onClick={handleTableClick}
                            isOccupied={isOccupied}
                            bookingInfo={bookingInfo}
                            groupInfo={groupInfo}
                            size={table.capacity > 4 ? 120 : 80}
                          />
                        ) : (
                          <RectangleTable
                            table={table}
                            onClick={handleTableClick}
                            isOccupied={isOccupied}
                            bookingInfo={bookingInfo}
                            groupInfo={groupInfo}
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
        <Modal.Header closeButton style={selectedBooking?.bookingColor ? {borderBottom: `4px solid ${selectedBooking.bookingColor}`} : {}}>
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

                  {selectedBooking.groupInfo && selectedBooking.groupInfo.tableCount > 1 && (
                    <div className="mt-4">
                      <h6 className="border-bottom pb-2 mb-3">
                        <FaObjectGroup className="me-2" style={{color: selectedBooking.groupInfo.color}} />
                        Grouped Tables
                      </h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {selectedBooking.groupInfo.tables.map(table => (
                          <Badge
                            key={table.tableId}
                            bg="light"
                            text="dark"
                            className="p-2 border"
                            style={{borderColor: selectedBooking.groupInfo.color}}
                          >
                            Table {table.tableNumber || table.tableId}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-muted small">
                        <em>These tables are part of the same booking and should be arranged together.</em>
                      </p>
                    </div>
                  )}
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
