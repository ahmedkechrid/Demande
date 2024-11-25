import React, { useState } from 'react';
import './Login.css';
import emailicon from '../assets/email.png';
import passwordicon from '../assets/password.png';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './LoginValidation';
import axios from 'axios';

const Login = () => {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [UserData,setUserData] = useState('');

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));  
  };


  const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://demande-3.onrender.com' 
  : 'http://localhost:8000';

axios.defaults.baseURL = baseURL;
axios.defaults.withCredentials = true;

  const handleSaveUserData = (data) => {
    setUserData(data);
    localStorage.setItem('userData', JSON.stringify(data));
    console.log('User data saved:', data);

  };
  axios.defaults.withCredentials = true;
  // const handleSaveUserData = (data) => {
  //   console.log("Saving user data to localStorage:", data);
  //   if (data.audit === "Admin") {
  //     localStorage.setItem('adminAuthToken', JSON.stringify(data)); 
  //     localStorage.removeItem('userAuthToken'); 
  //   } else {
  //     localStorage.setItem('userAuthToken', JSON.stringify(data)); 
  //     localStorage.removeItem('adminAuthToken'); 
  //   }
  // };
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (!validationErrors.email && !validationErrors.password) {
        axios.post('/login', values)
        .then(res => {
          console.log(res);  
      
          if (res.data && res.data.role) {
            handleSaveUserData(res.data); 
      
            const role = res.data.role;
            if (role === "User") {
              navigate('/Request');
            } else if (role === "Admin") {
              navigate('/AdminRequest');
            } else {
              alert('Invalid role received');
            }
          } else {
            alert('Login failed. Please try again.');
          }
        })
        .catch(err => {
          console.error(err);
          alert('An error occurred. Please try again.');
        });
      
    }
  };

  return (
    <form onSubmit={handleSubmit}>
     
      <div className='container-sign'>
        <div className='header-sign'>
          <div className='text-sign'>Sign-in</div>
          <div className='underline-sign'></div>
        </div>
        <div className='inputs-sign'>
          <div className='input-sign'>
            <img src={emailicon} alt='' />
            <input
              type='email'
              placeholder='Email'
              name='email'
              onChange={handleInput}
            />
            {errors.email && <span>{errors.email}</span>}
          </div>
          <div className='input-sign'>
            <img src={passwordicon} alt='' />
            <input
              type='password'
              placeholder='Password'
              name='password'
              onChange={handleInput}
            />
            {errors.password && <span>{errors.password}</span>}
          </div>
          <div className='forgot-password'>Lost Password?<Link to='/Passwordrecover'>Click Here</Link></div>
          <div className='submit-container'>
            <button type='submit' className='submit-sign-grey'> Login</button>
          </div>
          {loginError && <div className="error-message">{loginError}</div>}
        </div>
      </div>
    </form>
  );
}

export default Login;
