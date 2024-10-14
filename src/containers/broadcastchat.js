import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChatUsersWithMessages, CometChatUsers } from '@cometchat/chat-uikit-react';
import {
    UsersConfiguration,
    UsersStyle,
    MessagesConfiguration,
    MessageListConfiguration,
    MessageListStyle,
    WithMessagesStyle
} from "@cometchat/uikit-shared";
import * as React from 'react';
import consts from "./consts";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import { CometChat } from "@cometchat/chat-sdk-javascript";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { DataGrid } from '@mui/x-data-grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;
let UID = "heyo_user";

function BroadcastChat() {
    const [user, setUser] = React.useState(undefined);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [UIDs, setUIDs] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [message, setMessage] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [selectedCollege, setSelectedCollege] = React.useState('');
    const [colleges, setColleges] = React.useState([]);

    const [selected, setSelected] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [isProd, setIsProd] = React.useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setErrorMessage('')
        setOpen(false);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = filteredItems.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        console.log(event, id)
        setSelected(event)
    };

    const handleCollegeChange = (event) => {
        setSelectedCollege(event.target.value);
        if (event.target.value === '') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.college_id === event.target.value));
        }
    };

    const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(isProd ? consts.APP_ID : consts.DEV_APP_ID)
        .setRegion(isProd ? consts.REGION : consts.DEV_REGION)
        .setAuthKey(isProd ? consts.AUTH_KEY : consts.DEV_AUTH_KEY)
        .subscribePresenceForFriends()
        .build();
    React.useEffect(() => {
        CometChatUIKit.init(UIKitSettings)
            .then(() => {
                console.log("Initialization completed successfully");
                CometChatUIKit.login(UID, isProd ? consts.AUTH_KEY : consts.DEV_AUTH_KEY)
                    .then((user) => {
                        console.log("Login Successful", { user });
                        setUser(user);
                    })
                    .catch((error) => { }, console.log);
                setUser(user);
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    React.useEffect(() => {
        setIsLoaded(false);

        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-real-users")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setIsLoaded(true);
                    let data = result.data.user;
                    // Filter users without interests
                    data = data.filter(user => !user.interests || user.interests.length === 0);
                    // Map only required fields
                    data = data.map(user => ({
                        id: user.id,
                        username: user.username,
                        college_id: user.college_id
                    }));
                    console.log(data)
                    setItems(data);
                    setFilteredItems(data);
                    // Extract unique college IDs
                    const uniqueColleges = [...new Set(data.map(item => item.college_id))];
                    setColleges(uniqueColleges);
                },
                (error) => {
                    setIsLoaded(true);
                    console.error("Error fetching users:", error);
                }
            )
    }, [])

    const columns = [
        { field: 'id', headerName: 'User DB ID', width: 90, type: 'number' },
        { field: 'username', headerName: 'Username', width: 200 },
        { field: 'college_id', headerName: 'College', width: 280 },
    ];

    function sendBulkMessage() {
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                onBehalfOf: UID.toString(),
                'content-type': 'application/json',
                apikey: isProd ? 'b1eefbb21e93639f2576dc2d9c68e3e751bf6358' : 'b6b82b4b0434b97f248cd93ef817b94b76758ea7'
            },
            body: JSON.stringify({ category: 'message', type: 'text', data: { text: message }, multipleReceivers: { uids: selected } })
        };
        console.log(options)
        fetch((isProd ? 'https://2535993d01b5203a.api-in.cometchat.io/v3/messages' : 'https://2404783e5909fb6f.api-us.cometchat.io/v3/messages'), options)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if (response.error) {
                    let msg = errorMessage + '\nmsg: ' + response.error.message
                    setErrorMessage(msg)
                }
                response = response.data.uids
                for (let data in response) {
                    console.log(data)
                    console.log(response[data].error ? response[data].error.message : 'false')
                    if (response[data].error) {
                        let msg = errorMessage + '\nid: ' + data + ' msg: ' + response[data].error.message
                        setErrorMessage(msg)
                    }
                }
                setOpen(true);
            }
            )
            .catch(err => console.error(err));
    }

    return user && items ? (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ width: '100%' }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="college-select-label">Filter by College</InputLabel>
                        <Select
                            labelId="college-select-label"
                            id="college-select"
                            value={selectedCollege}
                            label="Filter by College"
                            onChange={handleCollegeChange}
                        >
                            <MenuItem value="">
                                <em>All Colleges</em>
                            </MenuItem>
                            {colleges.map((college) => (
                                <MenuItem key={college} value={college}>{college}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                        <DataGrid
                            rows={filteredItems}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 10 },
                                },
                            }}
                            pageSizeOptions={[10, 20, 30, 40, 100, 200, 300, 400, 500]}
                            checkboxSelection={!open}
                            onRowSelectionModelChange={(rowSelectionModel, details) => handleClick(rowSelectionModel, details)}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Logged in as: {user.name} - User ID: {user.uid}
                        </Typography>
                        <TextField
                            fullWidth
                            id="outlined-multiline-static"
                            label="Message"
                            placeholder="Enter message"
                            multiline
                            rows={4}
                            onChange={(event) => setMessage(event.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button variant="contained" color="primary" disabled={!message || !selected.length} 
                        onClick={sendBulkMessage}>
                            Send
                        </Button>
                    </Paper>
                    <Paper elevation={3} sx={{ p: 2, height: '30vh', overflowY: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Selected Users
                        </Typography>
                        <List>
                            {selected.map((id) => {
                                const user = items.find(item => item.id === id);
                                return (
                                    <ListItem key={id}>
                                        <ListItemText primary={user.username} secondary={user.college_id} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Paper>
                    
                </Grid>
               
               
            </Grid>

            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                fullWidth
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Report"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {errorMessage ? errorMessage : 'Successfully sent all messages'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}

export default BroadcastChat;