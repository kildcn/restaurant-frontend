import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from location state or default to homepage
  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { email, password } = formData;
      const result = await login(email, password);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="font-serif fst-italic mb-2">L'Eustache</h2>
                <h3 className="h4">Sign In</h3>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                </Button>
              </Form>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Don't have an account? <Link to="/register">Register</Link>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Demo Credentials Card */}
          <Card className="border-0 shadow mt-4">
            <Card.Body className="p-3">
              <h5 className="text-center mb-3">Demo Credentials</h5>
              <p className="small mb-2"><strong>Admin:</strong> admin@restaurant.com / password123</p>
              <p className="small mb-0"><strong>Customer:</strong> customer@example.com / password123</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
