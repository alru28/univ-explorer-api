import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Spinner,
  Alert,
} from 'reactstrap';
import { getAllCollectionPlanets } from '../services/api';

function Collection() {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPlanets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated.');
        }
        const response = await getAllCollectionPlanets(token);
        setPlanets(response.data);
      } catch (err) {
        setError('Failed to fetch planet data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    getPlanets();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner color="primary" />
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
        {planets.map((planet) => (
          <Col sm="6" md="4" lg="3" className="mb-4" key={planet.name}>
            <Card>
              <CardBody>
                <CardTitle tag="h5">{planet.name}</CardTitle>
                <CardText>
                  {planet.distanceFromEarth
                    ? `Distance from Earth: ${planet.distanceFromEarth.toExponential(2)} km`
                    : "Not Available"}
                </CardText>
                <Button color="primary" href={`/collection/planet/${planet.name}`}>
                  View Details
                </Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Collection;
