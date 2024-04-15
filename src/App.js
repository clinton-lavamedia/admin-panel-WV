import { BrowserRouter as Router } from 'react-router-dom'; // Added import for BrowserRouter

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
  }, []);

  return (
    <Router> {/* Replaced Container with Router */}
      <Container >
        <Box sx={{ my: 4 }}>
          {!isUserAuthenticated ?
            <Login />
            :
            <Landing />
          }
        </Box>
      </Container>
    </Router>
  );
}
