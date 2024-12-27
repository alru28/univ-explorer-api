import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Spinner,
  Alert,
} from 'reactstrap';
import { getExploredPlanetById } from '../services/api';

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

              <Row className="mb-4">
                <Col xs="12" md="3" className="text-center">
                  <div className="card-explorer">
                    <img
                      src="/default-user.png"
                      alt="Explorer"
                      style={{ width: '80px', borderRadius: '50%' }}
                    />
                    <p className="mt-2 mb-0">
                      <Link to={`/profile/${planet.username}`} className="text-decoration-none">
                        {planet.username}
                      </Link>
                    </p>
                    <p className="text-muted">Explorer</p>
                  </div>
                </Col>
                <Col xs="12" md="9">
                  <h4 className="text-light">Main Event</h4>
                  <p className="text-muted">{planet.main_event}</p>
                </Col>
              </Row>

              <Row>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Mass</Badge>
                  <p>{planet.mass ? `${planet.mass} kg` : 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Radius</Badge>
                  <p>{planet.radius ? `${planet.radius} km` : 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Gravity</Badge>
                  <p>{planet.gravity ? `${planet.gravity} m/s²` : 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Temperature</Badge>
                  <p>{planet.temperature ? `${planet.temperature} °C` : 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Civilization</Badge>
                  <p>{planet.civilization || 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Demonym</Badge>
                  <p>{planet.demonym || 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Representative</Badge>
                  <p>{planet.representative || 'Unknown'}</p>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Primary Color</Badge>
                  <div className="d-flex align-items-center">
                    {renderColorSwatch(planet.color_base)}
                    <span>{planet.color_base || 'Unknown'}</span>
                  </div>
                </Col>
                <Col xs="4" className="mb-3">
                  <Badge color="info">Secondary Color</Badge>
                  <div className="d-flex align-items-center">
                    {renderColorSwatch(planet.color_extra)}
                    <span>{planet.color_extra || 'Unknown'}</span>
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
