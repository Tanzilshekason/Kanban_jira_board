import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox
}
from 'mdb-react-ui-kit';

const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    const result = await login(email, password);
    
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

        <MDBCol col='4' md='6' className="d-flex flex-column align-items-center">
          <h2 className="mb-4 text-center">Login to VibeFlow</h2>
          
          {error && (
            <div className="error-message mb-4 w-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
            <MDBInput 
              wrapperClass='mb-4 w-50' 
              label='Email address' 
              id='email' 
              type='email' 
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <MDBInput 
              wrapperClass='mb-4 w-50' 
              label='Password' 
              id='password' 
              type='password' 
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <div className="d-flex justify-content-between mb-4 w-50">
              <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
              <a href="#!">Forgot password?</a>
            </div>

            <MDBBtn 
              className="mb-4 w-50" 
              size="lg"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Logging in...' : 'Sign in'}
            </MDBBtn>
          </form>

          <div className="text-center mt-4 w-50">
            <p>
              Don't have an account?{' '}
              <button 
                type="button" 
                className="link-button"
                onClick={onSwitchToRegister}
                disabled={isLoading}
              >
                Register here
              </button>
            </p>
          </div>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Login;