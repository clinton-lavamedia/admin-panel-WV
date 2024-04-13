
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
const BASE_URL = process.env.NEXT_PUBLIC_BASEURL
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
        /*  const selectedIndex = selected.indexOf(id);
         let newSelected = [];
 
         if (selectedIndex === -1) {
             newSelected = newSelected.concat(selected, id);
         } else if (selectedIndex === 0) {
             newSelected = newSelected.concat(selected.slice(1));
         } else if (selectedIndex === selected.length - 1) {
             newSelected = newSelected.concat(selected.slice(0, -1));
         } else if (selectedIndex > 0) {
             newSelected = newSelected.concat(
                 selected.slice(0, selectedIndex),
                 selected.slice(selectedIndex + 1),
             );
         }
         setSelected(newSelected); */
    };

    const UIKitSettings = new UIKitSettingsBuilder()
        .setAppId(consts.APP_ID)
        .setRegion(consts.REGION)
        .setAuthKey(consts.AUTH_KEY)
        .subscribePresenceForFriends()
        .build();
    React.useEffect(() => {

        CometChat.getUser(UID).then(
            user => {
                console.log("User details fetched for user:", user);
                setUser(user);
            }, error => {
                console.log("User details fetching failed with error:", error);
            }
        );


        CometChatUIKit.init(UIKitSettings)
            .then(() => {
                console.log("Initialization completed successfully");
                CometChatUIKit.getLoggedinUser().then((user) => {
                    if (!user) {
                        CometChatUIKit.login(UID, consts.AUTH_KEY)
                            .then((user) => {
                                console.log("Login Successful", { user });
                                setUser(user);
                            })
                            .catch((error) => { }, console.log);
                    } else {
                        console.log("Already logged-in", { user });
                        setUser(user);
                    }
                });
            })
            .catch((e) => {
                console.log(e);
            });
    }, []);

    React.useEffect(() => {
        setIsLoaded(false);

        fetch(BASE_URL + "/admin-get-real-users")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setIsLoaded(true);
                    let data = result.data.user;

                    setItems(data);
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setIsLoaded(true);
                   // setError(error);
                }
            )
    }, [])



    const columns = [
        { field: 'id', headerName: 'User DB ID', width: 90, type: 'number', },
        { field: 'first_name', headerName: 'First name', width: 130 },
        { field: 'last_name', headerName: 'Last name', width: 130 },
        {
            field: 'gender',
            headerName: 'Gender',

            width: 110,
        },
        {
            field: 'college_id',
            headerName: 'College',
            // description: 'This column has a value getter and is not sortable.',
            sortable: false,
            width: 160,
            //valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
        },
    ];




    function sendBulkMessage() {
        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                onBehalfOf: UID.toString(),
                'content-type': 'application/json',
                apikey: 'b6b82b4b0434b97f248cd93ef817b94b76758ea7'
            },
            body: JSON.stringify({ category: 'message', type: 'text', data: { text: message }, multipleReceivers: { uids: selected } })
        };
        console.log(options)
        fetch('https://2404783e5909fb6f.api-us.cometchat.io/v3/messages', options)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                if(response.error){
                    let msg=errorMessage+'\nmsg: '+response.error.message
                    setErrorMessage(msg)
                }
                 response=response.data.uids
                for(let data in response ){
                    console.log(data)
                    console.log(response[data].error? response[data].error.message :'false')
                    if(response[data].error)
                   { let msg=errorMessage+'\nid: '+data+' msg: '+response[data].error.message
                    setErrorMessage(msg)}
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
                    style={{width:'50%'}}
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
            <div style={{ marginTop: 10,marginBottom:10 }}>
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
                pageSizeOptions={[20, 40, 60,80,100]}
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