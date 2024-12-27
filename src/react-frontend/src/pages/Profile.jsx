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
  Spinner,
  Button,
  Alert,
  Carousel,
  CarouselItem,
  CarouselControl,
} from 'reactstrap';
import { getExploredPlanetsByUser } from '../services/api';

function Profile() {
  const { username } = useParams();
  const [explorer, setExplorer] = useState({ username }); // Set username directly from params
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

  const slides = discoveries.map((planet) => (
    <CarouselItem
      key={planet.name}
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
    >
      <Card className="shadow-lg">
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
        <Col xs="12" md="3" className="text-center">
          <div className="card-explorer">
            <img
              src="/default-user.png"
              alt="Explorer"
              style={{ width: '80px', borderRadius: '50%', border: '2px solid #000'}}
            />
            <p className="mt-2 mb-0">
              <Link to={`/profile/${explorer.username}`} className="text-decoration-none">
                {explorer.username}
              </Link>
            </p>
            <p className="text-muted">Explorer</p>
          </div>
        </Col>
        <Col md="9" className='text-center'>
          <h3>Discoveries</h3>
          {discoveries.length === 0 ? (
            <p className="text-center text-muted">No discoveries yet.</p>
          ) : (
            <Carousel dark slide activeIndex={activeIndex} next={next} previous={previous}>
              {slides}
              <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
              <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
            </Carousel>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
