import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Badge,
  Spinner,
  Alert,
} from 'reactstrap';
import { getExploredPlanetById } from '../services/api';
import { generatePlanetImageWithCache } from '../utils/image_generation';

function ExploredPlanetDetail() {
  const { id: planetId } = useParams();
  const [planet, setPlanet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlanetDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated.');
        }
        const response = await getExploredPlanetById(planetId, token);
        setPlanet(response.data);
      } catch (err) {
        setError('Failed to fetch planet details. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanetDetails();
  }, [planetId]);

  const renderColorSwatch = (color) => {
    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
      return <span className="color-swatch" style={{ backgroundColor: color }} />;
    }
    return <span className="color-swatch color-invalid">N/A</span>;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Alert color="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card className="shadow-lg">
            <CardBody>
              <CardTitle tag="h1" className="text-center text-primary mb-4">
                {planet.name}
              </CardTitle>

              <Row className="mb-4 align-items-center">
                <Col xs="12" md="6" className="text-center">
                  <img
                    src={generatePlanetImageWithCache(planet._id, planet.color_base, planet.color_extra)}
                    alt={planet.name}
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      borderRadius: "10px",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                </Col>
                <Col xs="12" md="6">
                  <div
                    className="d-flex flex-column justify-content-center align-items-center"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      height: "300px",
                      border: "3px solid black",
                      borderRadius: "10px",
                      margin: "auto",
                      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <img
                      src="/default-user.png"
                      alt="Explorer"
                      style={{
                        width: "80px",
                        borderRadius: "50%",
                        border: "2px solid #000",
                      }}
                    />
                    <p className="mt-2 mb-0 text-center">
                      <Link to={`/profile/${planet.username}`} className="text-decoration-none">
                        {planet.username}
                      </Link>
                    </p>
                    <p className="text-muted text-center">Explorer</p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <h4 className="text-dark text-center">Main Event</h4>
                  <p className="text-muted text-center">{planet.main_event}</p>
                </Col>
              </Row>

              <Row className="d-flex justify-content-center align-items-center text-center">
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Mass</Badge>
                  <p>{planet.mass ? `${planet.mass} kg` : 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Radius</Badge>
                  <p>{planet.radius ? `${planet.radius} km` : 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Gravity</Badge>
                  <p>{planet.gravity ? `${planet.gravity} m/s²` : 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Temperature</Badge>
                  <p>{planet.temperature ? `${planet.temperature} °C` : 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Civilization</Badge>
                  <p>{planet.civilization || 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Demonym</Badge>
                  <p>{planet.demonym || 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Representative</Badge>
                  <p>{planet.representative || 'Unknown'}</p>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Primary Color</Badge>
                  <div className="d-flex align-items-center justify-content-center mt-2">
                    {renderColorSwatch(planet.color_base)}
                    <span className="text-muted">{planet.color_base || 'Unknown'}</span>
                  </div>
                </Col>
                <Col xs="6" md="4" className="mb-3">
                  <Badge color="info">Secondary Color</Badge>
                  <div className="d-flex align-items-center justify-content-center mt-2">
                    {renderColorSwatch(planet.color_extra)}
                    <span className="text-muted">{planet.color_extra || 'Unknown'}</span>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ExploredPlanetDetail;
