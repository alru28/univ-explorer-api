import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import {
  Container,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await loginUser({ username, password });
      const token = response.data.token;

      // Store token (Local Storage for now ?????)
      localStorage.setItem('token', token);

      // Redirect to profile
      navigate('/profile');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
        </CardBody>
      </Card>
    </Container>
  );
}

export default Login;
