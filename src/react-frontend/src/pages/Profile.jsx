import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Spinner,
  Button,
  Alert,
  Carousel,
  CarouselItem,
  CarouselControl,
} from 'reactstrap';
import { getExploredPlanetsByUser } from '../services/api';
import { generatePlanetImageWithCache } from '../utils/image_generation';

function Profile() {
  const { username } = useParams();
  const [explorer] = useState({ username });
  const [discoveries, setDiscoveries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscoveries = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated.');
        }
        const response = await getExploredPlanetsByUser(username, token);
        setDiscoveries(response.data);
      } catch (err) {
        setError('Failed to fetch discoveries. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveries();
  }, [username]);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === discoveries.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? discoveries.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const slides = discoveries.map((planet) => {
    const image_url = generatePlanetImageWithCache(planet._id, planet.color_base, planet.color_extra);
    return (
      <CarouselItem
        key={planet.name}
        onExiting={() => setAnimating(true)}
        onExited={() => setAnimating(false)}
      >
        <Card className="shadow-lg">
          <CardBody>
            <img
              src={image_url}
              alt={planet.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
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
    );
  });

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
                Explorer Profile
              </CardTitle>

              <Row className="mb-4 align-items-center">
                <Col xs="12" md="6" className="text-center">
                  <h3>Discoveries</h3>
                  {discoveries.length === 0 ? (
                    <p className="text-center text-muted">No discoveries yet.</p>
                  ) : (
                    <Carousel
                      slide
                      activeIndex={activeIndex}
                      next={next}
                      previous={previous}
                      className="shadow-lg"
                      style={{ borderRadius: "10px" }}
                    >
                      {slides}
                      <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
                      <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
                    </Carousel>
                  )}
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
                      <Link to={`/profile/${explorer.username}`} className="text-decoration-none">
                        {explorer.username}
                      </Link>
                    </p>
                    <p className="text-muted text-center">Explorer</p>
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

export default Profile;
