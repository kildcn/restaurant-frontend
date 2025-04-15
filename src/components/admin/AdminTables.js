import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaBan } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showTableModal, setShowTableModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);

  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    capacity: 2,
    section: 'indoor',
    isActive: true,
    isReservable: true
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTables();

      if (response.success) {
        setTables(response.data);
      } else {
        setError('Failed to load tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('An error occurred while loading tables');
    } finally {
      setLoading(false);
    }
  };

  const openAddTableModal = () => {
    setTableForm({
      tableNumber: '',
      capacity: 2,
      section: 'indoor',
      isActive: true,
      isReservable: true
    });
    setEditingTable(null);
    setShowTableModal(true);
  };

  const openEditTableModal = (table) => {
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      section: table.section,
      isActive: table.isActive,
      isReservable: table.isReservable
    });
    setEditingTable(table);
    setShowTableModal(true);
  };

  const openDeleteTableModal = (table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTableForm({
      ...tableForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitTable = async (e) => {
    e.preventDefault();

    try {
      let response;

      // Format the data
      const tableData = {
        ...tableForm,
        capacity: parseInt(tableForm.capacity)
      };

      if (editingTable) {
        // Update existing table
        response = await adminApi.updateTable(editingTable._id, tableData);
        if (response.success) {
          setTables(tables.map(table =>
            table._id === editingTable._id ? response.data : table
          ));
          setSuccess('Table updated successfully');
        }
      } else {
        // Create new table
        response = await adminApi.createTable(tableData);
        if (response.success) {
          setTables([...tables, response.data]);
          setSuccess('Table created successfully');
        }
      }

      setShowTableModal(false);
    } catch (error) {
      console.error('Error saving table:', error);
      setError('An error occurred while saving the table');
    }
  };

  const handleDeleteTable = async () => {
    try {
      const response = await adminApi.deleteTable(tableToDelete._id);

      if (response.success) {
        setTables(tables.filter(table => table._id !== tableToDelete._id));
        setSuccess('Table deleted successfully');
        setShowDeleteModal(false);
      } else {
        setError(response.message || 'Failed to delete table');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      setError('An error occurred while deleting the table');
    }
  };

  const toggleTableActive = async (table) => {
    try {
      const response = await adminApi.updateTable(table._id, {
        isActive: !table.isActive
      });

      if (response.success) {
        setTables(tables.map(t =>
          t._id === table._id ? response.data : t
        ));
        setSuccess(`Table ${table.tableNumber} ${table.isActive ? 'deactivated' : 'activated'}`);
      }
    } catch (error) {
      console.error('Error toggling table active state:', error);
      setError('An error occurred while updating the table');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Tables</h2>
        <Button variant="primary" onClick={openAddTableModal}>
          <FaPlus className="me-2" /> Add New Table
        </Button>
      </div>

      {error && <AlertMessage variant="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess(null)} />}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="mt-3">Loading tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-4">
              <p>No tables found. Add your first table to get started.</p>
              <Button variant="primary" onClick={openAddTableModal}>
                <FaPlus className="me-2" /> Add New Table
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Table Number</th>
                    <th>Capacity</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Reservable</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map(table => (
                    <tr key={table._id}>
                      <td>{table.tableNumber}</td>
                      <td>{table.capacity} {table.capacity === 1 ? 'person' : 'people'}</td>
                      <td>
                        <Badge bg="secondary" className="text-capitalize">
                          {table.section}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={table.isActive ? 'success' : 'danger'}>
                          {table.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={table.isReservable ? 'primary' : 'warning'}>
                          {table.isReservable ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => openEditTableModal(table)}
                        >
                          <FaEdit /> Edit
                        </Button>
                        <Button
                          variant={table.isActive ? 'outline-danger' : 'outline-success'}
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => toggleTableActive(table)}
                        >
                          {table.isActive ? <><FaBan /> Deactivate</> : <><FaCheck /> Activate</>}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => openDeleteTableModal(table)}
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
        </Card.Body>
      </Card>

      {/* Add/Edit Table Modal */}
      <Modal show={showTableModal} onHide={() => setShowTableModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingTable ? 'Edit Table' : 'Add New Table'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitTable}>
            <Form.Group className="mb-3">
              <Form.Label>Table Number/Name</Form.Label>
              <Form.Control
                type="text"
                name="tableNumber"
                value={tableForm.tableNumber}
                onChange={handleFormChange}
                placeholder="e.g., T1, Window-2, etc."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={tableForm.capacity}
                onChange={handleFormChange}
                min="1"
                max="20"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Select
                name="section"
                value={tableForm.section}
                onChange={handleFormChange}
                required
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="bar">Bar</option>
                <option value="private">Private Room</option>
                <option value="window">Window</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="isActive"
                    checked={tableForm.isActive}
                    onChange={handleFormChange}
                  />
                  <Form.Text className="text-muted">
                    Inactive tables won't be available for reservations
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Reservable Online"
                    name="isReservable"
                    checked={tableForm.isReservable}
                    onChange={handleFormChange}
                  />
                  <Form.Text className="text-muted">
                    If unchecked, only staff can book this table
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowTableModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingTable ? 'Update Table' : 'Create Table'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Table</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tableToDelete && (
            <div>
              <p>Are you sure you want to delete table {tableToDelete.tableNumber}?</p>
              <p className="text-danger">
                This action cannot be undone. If this table has existing bookings,
                you won't be able to delete it. Consider deactivating it instead.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteTable}>
            Delete Table
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminTables;
