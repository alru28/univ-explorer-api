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
  Input,
  Badge,
  Alert,
  Carousel,
  CarouselItem,
  CarouselControl,
} from 'reactstrap';
import {
  getLatestExploredPlanets,
  generateNewExploredPlanet,
  getExploredPlanetById,
  updateExploredPlanet,
} from '../services/api';

function Explore() {
  const [latestPlanets, setLatestPlanets] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planetData, setPlanetData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchLatestPlanets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated.');
        }
        const response = await getLatestExploredPlanets(token);
        setLatestPlanets(response.data);
      } catch (err) {
        setError('Failed to fetch the latest explored planets.');
      }
    };

    fetchLatestPlanets();
  }, []);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === latestPlanets.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? latestPlanets.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const startExploration = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPlanetData(null);

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      setLoading(false);
      setError('User is not authenticated.');
      return;
    }

    try {
      const response = await generateNewExploredPlanet(username, token);
      setPlanetData(response.data);
      setSuccess('Exploration successful! Edit and publish your planet.');
    } catch (err) {
      setError('Failed to explore a new planet. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const publishPlanet = async () => {
    const token = localStorage.getItem('token');
    if (!planetData || !token) {
      setError('Failed to publish planet. No planet data available or user is not authenticated.');
      return;
    }
  
    try {
      const updatedPlanet = {
        civilization: planetData.civilization,
        color_base: planetData.color_base,
        color_extra: planetData.color_extra,
        demonym: planetData.demonym,
        gravity: planetData.gravity,
        main_event: planetData.main_event,
        mass: planetData.mass,
        name: planetData.name,
        radius: planetData.radius,
        representative: planetData.representative,
        temperature: planetData.temperature, 
      };
  
      await updateExploredPlanet(planetData._id, updatedPlanet, token);
      setSuccess('Planet published successfully!');
    } catch (err) {
      setError('Failed to publish planet. Ensure all fields are valid.');
    }
  };

  const slides = latestPlanets.map((planet) => (
    <CarouselItem
      key={planet.name}
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
    >
      <Card>
        <CardBody>
          {/* <img src={planet.image_url} alt={planet.name} style={{ width: '100%' }} /> NO HAY IMAGENES DE MOMENTO*/}
          <CardTitle tag="h5" className="text-center mt-2">{planet.name}</CardTitle>
          <Button
            color="primary"
            href={`/explore/planet/${planet._id}`}
            className="mt-2 w-auto"
          >
            View Details
          </Button>
        </CardBody>
      </Card>
    </CarouselItem>
  ));

  return (
    <Container fluid className="mt-4">
      <Row>
        {/* Left Column: Latest Explored Planets */}
        <Col md="4" className="text-center">
          <h3>Latest Explored Planets</h3>
          <Carousel dark slide activeIndex={activeIndex} next={next} previous={previous}>
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
          </Carousel>
        </Col>

        {/* Right Column: Exploration Functionality */}
        <Col md="8" className="text-center">
          <h3>Explore New Planets</h3>
          <div className="text-center">
            {!loading && !planetData && (
              <Button className="w-auto" color="primary" onClick={startExploration}>
                Explore
              </Button>
            )}

            {loading && (
              <div className="mt-4">
                <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
              </div>
            )}

            {planetData && (
              <Card className="mt-4">
                <CardBody>
                  <CardTitle tag="h5">
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="primary" className="w-100 text-center">Planet Name</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="text"
                          value={planetData.name}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, name: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardTitle>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Mass</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="number"
                          value={planetData.mass}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, mass: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Radius</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="number"
                          value={planetData.radius}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, radius: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Temperature</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="number"
                          value={planetData.temperature}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, temperature: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Civilization</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="text"
                          value={planetData.civilization}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, civilization: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Main Event</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="text"
                          value={planetData.main_event}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, main_event: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <CardText>
                    <Row className="align-items-center">
                      <Col xs="2">
                        <Badge color="info" className="w-100 text-center">Representative</Badge>
                      </Col>
                      <Col xs="8">
                        <Input
                          type="text"
                          value={planetData.representative}
                          onChange={(e) =>
                            setPlanetData({ ...planetData, representative: e.target.value })
                          }
                        />
                      </Col>
                    </Row>
                  </CardText>

                  <Button color="success" onClick={publishPlanet} className="mt-3 w-auto">
                    Publish Planet
                  </Button>
                </CardBody>
              </Card>
            )}

            {error && <Alert color="danger" className="mt-3">{error}</Alert>}
            {success && <Alert color="success" className="mt-3">{success}</Alert>}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Explore;
