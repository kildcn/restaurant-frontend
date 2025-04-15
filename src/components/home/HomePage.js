import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { restaurantApi } from '../../services/api';

const HomePage = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const response = await restaurantApi.getSettings();
        if (response.success) {
          setRestaurant(response.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, []);

  const formatOperatingHours = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Updated hours based on provided info - only open Wednesday to Saturday
    return [
      'Sunday: Closed',
      'Monday: Closed',
      'Tuesday: Closed',
      'Wednesday: 6:00 PM - 11:45 PM',
      'Thursday: 6:00 PM - 11:45 PM',
      'Friday: 6:00 PM - 11:45 PM',
      'Saturday: 6:00 PM - 11:45 PM'
    ];
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5 mb-5" style={{
        backgroundImage: "url('/images/restaurant-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px'
      }}>
        <Container className="d-flex align-items-center h-100">
          <Row className="w-100">
            <Col md={6} className="text-white p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
              <h1 className="display-4 mb-4 font-serif fst-italic">L'Eustache</h1>
              <p className="lead mb-4">A casual French bistro with organic, local and seasonal cuisine accompanied by living wines! We look forward to your visit!</p>
              <Button as={Link} to="/bookings" variant="outline-light" size="lg">
                Make a Reservation
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section */}
      <section className="py-5 mb-5 bg-light">
        <Container>
          <Row>
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="mb-4">Our Story</h2>
              <p>L'Eustache is a casual French bistro committed to serving authentic cuisine made with organic, local, and seasonal ingredients. Our menu changes regularly to reflect the freshest seasonal offerings, paired perfectly with our selection of natural wines.</p>
              <p>Our dining experience allows you to secure your table for a duration of 2 hours. For parties of 7 or more, please contact us directly at restaurantleustache@gmail.com.</p>
            </Col>
            <Col md={6}>
              <h2 className="mb-4">Hours & Location</h2>
              {loading ? (
                <p>Loading information...</p>
              ) : restaurant ? (
                <>
                  <address>
                    <strong>Address:</strong><br />
                    {restaurant.address.street}<br />
                    {restaurant.address.city}, {restaurant.address.state} {restaurant.address.zipCode}
                  </address>
                  <p><strong>Phone:</strong> {restaurant.contact.phone}</p>
                  <p><strong>Email:</strong> restaurantleustache@gmail.com</p>
                  <div>
                    <strong>Hours:</strong>
                    <ul className="list-unstyled">
                      {formatOperatingHours().map((hours, index) => (
                        <li key={index}>{hours}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p>Unable to load restaurant information.</p>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Section */}
      <section className="py-5 mb-5">
        <Container>
          <h2 className="text-center mb-5">Featured Menu Items</h2>
          <Row>
            {[
              {
                title: 'Coq au Vin',
                description: 'Free-range chicken braised with organic wine, mushrooms, and heritage vegetables',
                image: 'https://via.placeholder.com/300x200'
              },
              {
                title: 'Bouillabaisse Provençale',
                description: 'Fresh-caught seafood stew with locally sourced vegetables and saffron rouille',
                image: 'https://via.placeholder.com/300x200'
              },
              {
                title: 'Tarte Tatin',
                description: 'Caramelized seasonal apples with our house-made puff pastry and crème fraîche',
                image: 'https://via.placeholder.com/300x200'
              }
            ].map((item, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <Button as={Link} to="/menu" variant="outline-dark">
              View Full Menu
            </Button>
          </div>
        </Container>
      </section>

      {/* Call to Action */}
      <section className="py-5" style={{ backgroundColor: '#AA4A44', color: 'white' }}>
        <Container className="text-center">
          <h2 className="mb-4">Ready to Experience L'Eustache?</h2>
          <p className="lead mb-4">Book your table now and enjoy our seasonal French cuisine with natural wines.</p>
          <Button as={Link} to="/bookings" variant="light" size="lg">
            Make a Reservation
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
