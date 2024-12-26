import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Spinner,
  Alert,
  Carousel,
  CarouselItem,
  CarouselControl,
} from 'reactstrap';
import { getCollectionPlanetDetails, getCollectionPlanetMoons } from '../services/api';

function CollectionPlanetDetail() {
  const { name } = useParams();
  const [planet, setPlanet] = useState(null);
  const [moons, setMoons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('User is not authenticated.');
        }

        const planetResponse = await getCollectionPlanetDetails(name, token);
        setPlanet(planetResponse.data);

        const moonsResponse = await getCollectionPlanetMoons(name, token);
        setMoons(moonsResponse.data);
      } catch (err) {
        setError('Failed to fetch planet or moon details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === moons.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? moons.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const slides = moons.map((moon) => (
    <CarouselItem
      key={moon.name}
      onExiting={() => setAnimating(true)}
      onExited={() => setAnimating(false)}
    >
      <Card>
        <CardBody>
          <CardTitle tag="h5">{moon.name}</CardTitle>
          <CardText>Discoverer: {moon.discoverer}</CardText>
        </CardBody>
      </Card>
    </CarouselItem>
  ));

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
      <Card>
        <CardBody>
          <CardTitle tag="h2">{planet.name}</CardTitle>
          <CardText>Type: {planet.type}</CardText>
          <CardText>Distance from Earth: {planet.distanceFromEarth ? `${planet.distanceFromEarth.toExponential(2)} km` : "Unknown"}</CardText>
          <CardText>Mass: {planet.mass.toExponential(2)} kg</CardText>
          <CardText>Radius: {planet.radius.toExponential(2)} km</CardText>
          <CardText>Diameter: {planet.diameter.toExponential(2)} km</CardText>
          <CardText>Gravity: {planet.gravity} m/s²</CardText>
          <CardText>Temperature: {planet.temperature} K</CardText>
          <CardText>Civilization: {planet.civilization}</CardText>
          <CardText>Demonym: {planet.demonym}</CardText>
          <CardText>Discoverer: {planet.discoverer}</CardText>
        </CardBody>
      </Card>

      {moons.length > 0 && (
        <div className="mt-4">
          <h3>Moons</h3>
          <Carousel activeIndex={activeIndex} next={next} previous={previous}>
            {slides}
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
          </Carousel>
        </div>
      )}
    </Container>
  );
}

export default CollectionPlanetDetail;
