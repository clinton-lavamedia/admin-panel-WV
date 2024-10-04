import React, { useState, useEffect } from 'react';
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import RecentActorsOutlinedIcon from '@mui/icons-material/RecentActorsOutlined';
import SettingsAccessibilityOutlinedIcon from '@mui/icons-material/SettingsAccessibilityOutlined';
import InterestsOutlinedIcon from '@mui/icons-material/InterestsOutlined';
import ThreePOutlinedIcon from '@mui/icons-material/ThreePOutlined';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SmsFailedOutlinedIcon from '@mui/icons-material/SmsFailedOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import Logo from '../logo.png'
import DemoUsers from './demousers';
import SuperUsers from './superusers';
import Interests from './interests';
import Verification from './verification';
import BroadcastChat from './broadcastchat';
import Chat from './seededuserchat';
import Notification from './notification'
import Dashboard from './dashboard'
import SeededThread from './seededthread';
import Configurations from './configurations';
const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function Landing() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState('');
    const [page, setPage] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [isProd, setIsProd] = useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log('token', token)
        setUser(token)
    }, []);
    useEffect(() => {
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-stats")
          .then(res => res.json())
          .then(
            (result) => {
              console.log(result)
              setIsLoaded(true);
              let data = result.data;
             let pie=[]
              for (let key in data) {
                pie.push({
                    title:Number(data[key].count),
                    size: data[key].subtopic
                })
              }
              console.log(pie,data)
              setItems({title:'Interests',children:pie});
            },
            (error) => {
              setIsLoaded(true);
            }
          )
      }, [refresh, isProd])
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const handleListItemClick = (event, text) => {
        console.log(event, text)
        setPage(text)
    };
    function handleLogout() {
        localStorage.removeItem("token")
        window.location.href = "/";
    }
    const darkTheme = createTheme({
        palette: {
          mode: 'dark',
          primary: {
            main: '#1976d2',
          },
        },
      });

    const toggleEnv = () => {
        setIsProd(prevIsProd => {
            const newIsProd = !prevIsProd;
            sessionStorage.setItem('isProd', JSON.stringify(newIsProd));
            window.location.reload(); // Refresh the entire site
            return newIsProd;
        });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <ThemeProvider theme={darkTheme}>
            <AppBar position="fixed" open={open}>
                <Toolbar >
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1 }}>
                        HEYO admin portal 
                        <Typography variant="caption" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {user}
                    </Typography>
                    </Typography>
                    {isProd && <div style={{ width: 15, height: 15, margin: 10, borderRadius: '50%', backgroundColor: 'green', animation: 'pulse 1s infinite' }}></div>}
                    <style>
                        {`
                            @keyframes pulse {
                                0% {
                                    transform: scale(1);
                                }
                                50% {
                                    transform: scale(1.1);
                                }
                                100% {
                                    transform: scale(1.5);
                                }
                            }
                        `}
                    </style>

                    <Button style={{margin:10}} variant="contained" color='primary' onClick={toggleEnv}>
                        {isProd ? 'Switch to Dev' : 'Switch to Prod'}
                    </Button>
                    <Button variant="contained" color='error' onClick={handleLogout}>
                        Logout
                    </Button>
                   
                </Toolbar>
            </AppBar>
            </ThemeProvider>
            <ThemeProvider theme={darkTheme}>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {['Dashboard', 'Verification', 'Configurations'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                                onClick={(event) => handleListItemClick(event, text)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {index === 0 && <InsightsIcon/>}
                                    {index === 1 && <HowToRegOutlinedIcon />}
                                    {index === 2 && <SettingsIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['Chat - Seeded <> Real', 'Broadcast Chat', 'Push Notification',  'Seeded Thread'].map((text, index) => (
                        <ListItem key={text} disablePadding sx={{ display: 'block' }}>
                                                       <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                                onClick={(event) => handleListItemClick(event, text)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {index ==0 &&  <ThreePOutlinedIcon /> }
                                    {index ==1 &&  <SpeakerNotesOutlinedIcon /> }
                                    {index ==2 &&  <CampaignOutlinedIcon /> }
                                    {index ==3 &&  <ForumOutlinedIcon /> }
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            </ThemeProvider>
            
            <Box component="main" sx={{ display: 'flex', flexGrow: 1 ,p: 3,mt:5}}>
               {/*  <DrawerHeader /> */}
               {page == 'Dashboard' && <Dashboard />}

                {page == 'Verification' && <Verification />}
                {page == 'Configurations' && <Configurations />}
                {isProd && page == 'Chat - Seeded <> Real' && <Chat />}
                {page == 'Broadcast Chat' && <BroadcastChat/>}
                {isProd && page == 'Push Notification' && <Notification/>}
                {!isProd && page == 'Seeded Thread' && <SeededThread/>}
                {!isProd && (page == 'Chat - Seeded <> Real' || page == 'Push Notification') && (
                    <Typography variant="h6" color="error">
                        This feature is not available in dev mode.
                    </Typography>
                )}
                {isProd && (page == 'Thread Creation') && (
                    <Typography variant="h6" color="error">
                        This feature is not available in prod mode.
                    </Typography>
                )}
                {page == '' &&
                <div style={{justifyContent:'center',alignItems:'center', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                   {/*  <Typography gutterBottom textAlign={'center'}>
                        <img src={Logo} width='300' height='200' alt='logo'/> 
                    </Typography>
                    <Typography variant="h3" gutterBottom textAlign={'center'}>
                        Not available right now           
                    </Typography> */}
                    <Dashboard/>
                </div>}
            </Box>
        </Box>
    );
}
