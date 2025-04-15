import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5 className="mb-3 font-serif fst-italic">L'Eustache</h5>
            <p>Exquisite dining experience in a cozy atmosphere</p>
            <p>123 Main Street<br />Anytown, State 12345</p>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="mb-3">Hours</h5>
            <p>Monday - Thursday: 11:00 - 22:00</p>
            <p>Friday - Saturday: 11:00 - 23:00</p>
            <p>Sunday: 12:00 - 22:00</p>
          </Col>

          <Col md={4} className="mb-3">
            <h5 className="mb-3">Contact</h5>
            <p>Phone: (123) 456-7890</p>
            <p>Email: info@leustache.com</p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </Col>
        </Row>

        <hr className="mt-4 mb-4" />

        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} L'Eustache Restaurant. All rights reserved.
            </p>
            <p className="small">
              <Link to="/privacy" className="text-light text-decoration-none me-3">Privacy Policy</Link>
              <Link to="/terms" className="text-light text-decoration-none me-3">Terms of Service</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
