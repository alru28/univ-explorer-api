import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import { AuthContext } from '../App';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ username, password });
      const token = response.data.token;

      // Store token and username in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);

      // Update authentication state
      setIsAuthenticated(true);

      // Redirect to collection
      navigate('/collection');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row className="align-items-center w-75">
        <Col md="6" className="d-flex justify-content-center align-items-center">
          <Card style={{ width: '400px' }}>
            <CardBody>
              <CardTitle tag="h2" className="text-center mb-4">
                Login
              </CardTitle>

              {error && <Alert color="danger">{error}</Alert>}

              <Form onSubmit={handleLogin}>
                <FormGroup>
                  <Label for="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>

                <Button color="primary" type="submit" block>
                  Login
                </Button>
              </Form>
              <p className="text-center mt-3">
                Don't have an account? <a href="/register" title="Register for a new account">Register here</a>
              </p>
            </CardBody>
          </Card>
        </Col>
        <Col md="6" className="d-flex justify-content-center align-items-center">
          <img
            src="/logo.png"
            alt="App Logo"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px', marginBottom: '80px' }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
