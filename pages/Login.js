import * as React from 'react';
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
import Router, { useRouter } from 'next/router';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
//const BASE_URL = 'https://192.168.1.104/'
const BASE_URL = 'https://ec2-13-126-83-192.ap-south-1.compute.amazonaws.com/'

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [open, setOpen] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
 function handleLogin(){
  let payload={email:email,password:password}
  fetch(BASE_URL + 'public/login-admin-user-verification', {
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
    if(result.data.length>0){
      router.push("/verification");
      localStorage.setItem('token',email)
    }else{
      setOpen(true);
    }
   
  }, (error) => {
    console.log(result)
    setOpen(true);
   
  })
 /*  if(email==='admin' && password==='!321'){
    router.push("/verification");
    localStorage.setItem('token',email)
  } */
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
    }}>
      <div style={{ alignContent:'center', alignItems:'center', display:'flex', flexDirection:'column'}}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          Invalid credentials
        </Alert>
      </Snackbar>
      <FormControl sx={{ m: 1 }}  variant="outlined" fullWidth={true}>
      <TextField htmlFor="email" type='email' label="email"
        onChange={(event) => {
          setEmail(event.target.value);
        }}/>
      </FormControl>
        <FormControl sx={{ m: 1 }}  variant="outlined" fullWidth={true}>
        

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
       <Button variant="contained" color="success"  onClick={handleLogin}
       >Heyo! admin</Button>

      </div>
    
    </Box>
  );
}