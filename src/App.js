import { BrowserRouter as Router, Route, Routes ,useNavigate} from 'react-router-dom'; // Added import for BrowserRouter, Route, and Routes

import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Login from './containers/Login';
import Landing from './containers/Landing';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export default function Index() {

  const [authState, setAuthState] = React.useState({
    token: "",
  });
  const [isUserAuthenticated, setIsUserAuthenticated] = React.useState(false)
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    console.log('token', token)
    setAuthState({
      token,
    });
    setIsUserAuthenticated(!!token)
    console.log(!!token)
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Login />} />  {/* Added route for /landing redirecting to Landing.js */}
      </Routes>
      <Container >
       {/*  <Box sx={{ my: 4 }}>
          {!isUserAuthenticated ?
            <Login />
            :
            ''
          }
        </Box> */}
      </Container>
    </Router>
  );
}


