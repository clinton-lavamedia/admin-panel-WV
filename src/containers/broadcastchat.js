
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
    const [UIDs, setUIDs] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [message, setMessage] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

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
            const newSelected = items.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        console.log(event, id)
        setSelected(event)

    };

    const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(isProd ? consts.APP_ID : consts.DEV_APP_ID)
        .setRegion(isProd ? consts.REGION : consts.DEV_REGION)
        .setAuthKey(isProd ? consts.AUTH_KEY : consts.DEV_AUTH_KEY)
        .subscribePresenceForFriends()
        .build();
    React.useEffect(() => {

       /*  CometChat.logout().then(
            () => {
                setUser(undefined); */
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
         /*    }, error => {
                console.log("Logout failed with exception:", { error });
            }) */
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

        <div style={{ width: "95vw", height: "95vh" }}>
            <div>
                Logged in as: {user.name + ' - User ID: ' + user.uid}
            </div>
            <div style={{ marginTop: 20 }}>
                <TextField
                    style={{ width: '50%' }}
                    id="outlined-multiline-static"
                    label="Message"
                    placeholder="Enter message"

                    multiline
                    rows={4}
                    onChange={(event) => {
                        setMessage(event.target.value);
                    }}
                />


            </div>
            <div style={{ marginTop: 10, marginBottom: 10 }}>
                <Button variant="outlined" color="primary" onClick={sendBulkMessage}
                >Send</Button>
            </div>

            <DataGrid
                rows={items}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 20 },
                    },
                }}
                pageSizeOptions={[20, 40, 60, 80, 100]}
                checkboxSelection={!open}
                onRowSelectionModelChange={(rowSelectionModel, details) => handleClick(rowSelectionModel, details)}
            />
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
                        {errorMessage ? errorMessage : 'Successfully sent all message'}
                    </DialogContentText>
                </DialogContent>

            </Dialog>
        </div>
    )
        : (
            <div>Loading...</div>
        )

}

export default BroadcastChat;