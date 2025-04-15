import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Pagination } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { adminApi } from '../../services/api';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  });

  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [filters.role, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await adminApi.getUsers({
        search: filters.search,
        role: filters.role,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setUsers(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0
        }));
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('An error occurred while loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const openAddUserModal = () => {
    setUserForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer'
    });
    setEditingUser(null);
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '', // Don't populate password for security
      role: user.role
    });
    setEditingUser(user);
    setShowUserModal(true);
  };

  const openDeleteUserModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      let response;

      // Create form data, omitting empty password if editing
      const userData = { ...userForm };
      if (editingUser && !userData.password) {
        delete userData.password;
      }

      if (editingUser) {
        // Update existing user
        response = await adminApi.updateUser(editingUser._id, userData);
        if (response.success) {
          setUsers(users.map(user =>
            user._id === editingUser._id ? response.data : user
          ));
          setSuccess('User updated successfully');
        }
      } else {
        // Create new user
        response = await adminApi.createUser(userData);
        if (response.success) {
          setUsers([...users, response.data]);
          setSuccess('User created successfully');
        }
      }

      setShowUserModal(false);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('An error occurred while saving the user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await adminApi.deleteUser(userToDelete._id);

      if (response.success) {
        setUsers(users.filter(user => user._id !== userToDelete._id));
        setSuccess('User deleted successfully');
        setShowDeleteModal(false);
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('An error occurred while deleting the user');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Users</h2>
        <Button variant="primary" onClick={openAddUserModal}>
          <FaPlus className="me-2" /> Add New User
        </Button>
      </div>

      {error && <AlertMessage variant="danger" message={error} onClose={() => setError(null)} />}
      {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <FaSearch className="me-2" /> Search
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name, email, or phone"
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </Form.Select>
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

      {/* Users Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <LoadingSpinner />
              <p className="mt-3">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-0">No users found for the selected criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <Badge bg={getRoleBadgeColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-1 mb-1"
                          onClick={() => openEditUserModal(user)}
                        >
                          <FaEdit /> Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => openDeleteUserModal(user)}
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

      {/* Add/Edit User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitUser}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userForm.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={userForm.phone}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userForm.password}
                onChange={handleFormChange}
                required={!editingUser}
                minLength={6}
              />
              {!editingUser && (
                <Form.Text className="text-muted">
                  Password must be at least 6 characters
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={userForm.role}
                onChange={handleFormChange}
                required
              >
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => setShowUserModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <div>
              <p>Are you sure you want to delete the following user?</p>
              <p>
                <strong>Name:</strong> {userToDelete.name}<br />
                <strong>Email:</strong> {userToDelete.email}<br />
                <strong>Role:</strong> {userToDelete.role}
              </p>
              <p className="text-danger">
                This action cannot be undone. If this user has existing bookings,
                you won't be able to delete them.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Helper function to get role badge color
const getRoleBadgeColor = (role) => {
  const colorMap = {
    admin: 'danger',
    manager: 'warning',
    staff: 'info',
    customer: 'success'
  };

  return colorMap[role] || 'secondary';
};

export default AdminUsers;
