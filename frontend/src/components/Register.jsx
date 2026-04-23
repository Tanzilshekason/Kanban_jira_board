import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
}
from 'mdb-react-ui-kit';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { register, error } = useAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (id === 'password' || id === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const userData = {
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      first_name: formData.firstName,
      last_name: formData.lastName,
    };
    
    const result = await register(userData);
    
    if (!result.success) {
      setIsLoading(false);
    }
  };

  return (
    <MDBContainer fluid className="p-4 my-2">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="img-fluid" alt="Phone image" />
        </MDBCol>

        <MDBCol col='4' md='6'>
          <h2 className="mb-4 text-center">Create Account</h2>
          
          {(error || passwordError) && (
            <div className="error-message mb-4">
              {error || passwordError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-row align-items-center mb-4">
              <MDBInput 
                wrapperClass='flex-fill me-2' 
                label='First Name' 
                id='firstName' 
                type='text' 
                size="lg"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <MDBInput 
                wrapperClass='flex-fill ms-2' 
                label='Last Name' 
                id='lastName' 
                type='text' 
                size="lg"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <MDBInput 
              wrapperClass='mb-4' 
              label='Email address' 
              id='email' 
              type='email' 
              size="lg"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <MDBInput 
              wrapperClass='mb-4' 
              label='Password' 
              id='password' 
              type='password' 
              size="lg"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <MDBInput 
              wrapperClass='mb-4' 
              label='Confirm Password' 
              id='confirmPassword' 
              type='password' 
              size="lg"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <MDBBtn 
              className="mb-4 w-100" 
              size="lg"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </MDBBtn>


            <div className="text-center mt-4">
              <p>
                Already have an account?{' '}
                <button 
                  type="button" 
                  className="link-button"
                  onClick={onSwitchToLogin}
                  disabled={isLoading}
                >
                  Login here
                </button>
              </p>
            </div>
          </form>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Register;