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
    if (!restaurant) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return restaurant.openingHours.map(hour => {
      if (hour.isClosed) return `${days[hour.day]}: Closed`;
      return `${days[hour.day]}: ${hour.open} - ${hour.close}`;
    });
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
              <p className="lead mb-4">Experience fine dining in a casual atmosphere. Our chef combines traditional techniques with modern flavors to create an unforgettable culinary journey.</p>
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
              <p>Founded in 2010, L'Eustache has been serving the community with passion and dedication. Our restaurant combines the richness of French cuisine with local ingredients to create a unique dining experience.</p>
              <p>Chef Jean-Michel Eustache, with his 25 years of culinary expertise, leads our kitchen team to deliver dishes that are both sophisticated and accessible.</p>
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
                  <p><strong>Email:</strong> {restaurant.contact.email}</p>
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
                description: 'Chicken braised with wine, lardons, mushrooms, and garlic',
                image: 'https://via.placeholder.com/300x200'
              },
              {
                title: 'Bouillabaisse',
                description: 'Provençal seafood stew served with rouille and crusty bread',
                image: 'https://via.placeholder.com/300x200'
              },
              {
                title: 'Crème Brûlée',
                description: 'Rich custard topped with a layer of caramelized sugar',
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
      <section className="py-5 bg-dark text-white">
        <Container className="text-center">
          <h2 className="mb-4">Ready to Experience L'Eustache?</h2>
          <p className="lead mb-4">Book your table now and enjoy an unforgettable dining experience.</p>
          <Button as={Link} to="/bookings" variant="primary" size="lg">
            Make a Reservation
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
