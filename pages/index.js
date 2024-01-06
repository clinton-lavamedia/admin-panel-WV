import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ProTip from '../src/ProTip';
import Link from '../src/Link';
import Copyright from '../src/Copyright';
import { AuthContext } from '../src/context/auth-context';
import Router, { useRouter } from 'next/router';
import Login from './Login'
import Verification from './verification';
export default function Index() {
  /* const router = useRouter();
  const authContext = React.useContext(AuthContext);
  React.useEffect(() => {
    // checks if the user is authenticated
    authContext.isUserAuthenticated()
    ? router.push("/about")
    : router.push("/login");
  }, []); */

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
    setIsUserAuthenticated(!!authState.token)
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        {!isUserAuthenticated ?
          <Login />
          :
          <Verification />
        }
        {/*  <Typography variant="h4" component="h1" gutterBottom>
          Material UI - Next.js example
        </Typography>
        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
        <ProTip /> */}
        {/* <Copyright /> */}
      </Box>
    </Container>
  );
}
