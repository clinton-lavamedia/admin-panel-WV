import * as React from 'react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Image } from 'react';
import Typography from '@mui/material/Typography';

import Logo from '../logo.png'

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const BASE_URL = process.env.REACT_APP_BASEURL

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [alertSeverity, setAlertSeverity] = React.useState('error');
  const [isUserAuthenticated, setIsUserAuthenticated] = React.useState(false)
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    console.log('token', token)
   
    setIsUserAuthenticated(!!token)
    console.log(!!token)
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  function handleLogin() {
    let payload = { email: email, password: password }
    fetch(BASE_URL + '/login-admin-user-verification', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => response.json())
      .then((result) => {
        console.log(result)
        console.log(result.data)
        if (result.data.length > 0) {
          const user = result.data[0];
          if (user.active) {
            console.log('logged in')
            navigate("/landing");
            if (user.email.includes(':')) {
              const [userType, userEmail] = user.email.split(':');
              localStorage.setItem('token', userEmail);
              localStorage.setItem('usertype', userType);
            } else {
              localStorage.setItem('token', user.email);
              localStorage.setItem('usertype', 'admin');
            }
            localStorage.setItem('admin_id', user.id);
          } else {
            setAlertMessage('Your account is not active. Please contact the administrator.');
            setAlertSeverity('warning');
            setOpen(true);
          }
        } else {
          setAlertMessage('Invalid credentials');
          setAlertSeverity('error');
          setOpen(true);
        }
      }, (error) => {
        console.log(error)
        setAlertMessage('An error occurred. Please try again.');
        setAlertSeverity('error');
        setOpen(true);
      })
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  return (
  
    <Box sx={{
      width: 500,
      maxWidth: '100%',
      alignContent: 'center',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '100px',
      marginLeft:'30%'
    }}>
      <div style={{ alignContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom textAlign={'center'}>
          <img src={Logo} width='200px' height='200px' alt='logo' />
        </Typography>
        <Typography variant="h3" gutterBottom textAlign={'center'}>
          Sign in as a HEYO! admin
        </Typography>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={alertSeverity} sx={{ width: '100%' }}>
            {alertMessage}
          </Alert>
        </Snackbar>
        <FormControl sx={{ m: 1 }} variant="outlined" fullWidth={true}>
          <TextField htmlFor="email" type='email' label="email"
            onChange={(event) => {
              setEmail(event.target.value);
            }} />
        </FormControl>
        <FormControl sx={{ m: 1 }} variant="outlined" fullWidth={true}>
          <InputLabel htmlFor="password">password</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="password"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </FormControl>
        <Button variant="contained" color="info" onClick={handleLogin}>Heyo! admin</Button>
      </div>
    </Box>
          
  );

}