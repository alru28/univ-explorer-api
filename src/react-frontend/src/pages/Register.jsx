import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
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

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await registerUser({ username, email, password });
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={{ width: '400px' }}>
        <CardBody>
          <CardTitle tag="h2" className="text-center mb-4">
            Register
          </CardTitle>

          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <Form onSubmit={handleRegister}>
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
              <Label for="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <FormGroup>
              <Label for="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </FormGroup>

            <Button color="primary" type="submit" block>
              Register
            </Button>
          </Form>
          <p className="text-center mt-3">
            Are you registered already? <a href="/" title="Login into account">Login here</a>
          </p>
        </CardBody>
      </Card>
    </Container>
  );
}

export default Register;
