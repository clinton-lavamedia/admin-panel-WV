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
import { CometChat } from "@cometchat/chat-sdk-javascript";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import consts from "./consts";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
const BASE_URL = process.env.REACT_APP_BASEURL

function Chat() {
    const [user, setUser] = React.useState(undefined);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [UIDs, setUIDs] = React.useState([]);
    const [isRequestOpen, setIsRequestOpen] = React.useState(false);
    const [requestedProfiles, setRequests] = React.useState([]);

    const UIKitSettings = new UIKitSettingsBuilder()
        .setAppId(consts.APP_ID)
        .setRegion(consts.REGION)
        .setAuthKey(consts.AUTH_KEY)
        .subscribePresenceForFriends()
        .build();

    React.useEffect(() => {
        fetch(BASE_URL + "/admin-get-seeded-users-matches")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setIsLoaded(true);
                    let data = result.data;

                    const mergedData = {};
                    data.forEach(obj => {
                        const { seeded_user_id, real_user_id, ...rest } = obj;

                        if (mergedData[seeded_user_id]) {
                            mergedData[seeded_user_id].real_user_id.push(real_user_id);
                        } else {
                            mergedData[seeded_user_id] = { seeded_user_id, real_user_id: [real_user_id], ...rest };
                        }
                    });

                    const merged_data = {
                        data: Object.values(mergedData)
                    };

                    console.log(JSON.stringify(merged_data.data));
                    console.log(merged_data.data)

                    setItems(merged_data.data);
                    setUIDs(data[0].real_user_id)
                    let UID = 'heyo_user' 
                    console.log(UID)

                    const UIKitSettings = new UIKitSettingsBuilder()
                        .setAppId(consts.APP_ID)
                        .setRegion(consts.REGION)
                        .setAuthKey(consts.AUTH_KEY)
                        .subscribePresenceForFriends()
                        .build();

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
                                    setIsLoaded(true);
                                }
                            });
                        })
                        .catch((e) => {
                            console.log(e);
                            setUser(undefined)
                        });
                },
                (error) => {
                    console.log("Error fetching data:", error);
                }
            )
    }, [refresh])

    const getSubtitleView = (user) => {
        console.log('user in list -> ', user)
        return (
            <div>
                <span style={{ color: "#347fb9", font: "400 11px Inter, sans-serif" }}>
                    {user.uid} | {user.status} {user.lastActiveAt} |  {user.tags} |
                </span>
            </div>
        );
    };

    const uStyle = new UsersStyle({});

    let limit = 100;

    function getChats(seeded_user_id, uids) {
        setUIDs(uids)
        CometChat.logout().then(
            () => {
                setUser(undefined);
                CometChatUIKit.init(UIKitSettings)
                    .then(() => {
                        console.log("Initialization completed successfully");
                        CometChatUIKit.getLoggedinUser().then((user) => {
                            if (!user) {
                                CometChatUIKit.login('seeded_'+seeded_user_id.toString(), consts.AUTH_KEY)
                                    .then((user) => {
                                        console.log("Login Successful", { user });
                                        setUser(user);
                                        let usersRequest = new CometChat.UsersRequestBuilder()
                                            .setLimit(limit)
                                            .withTags(true);

                                        let uConfig = new UsersConfiguration({
                                            hideSectionSeparator: true,
                                            showSectionHeader: false,
                                            usersStyle: uStyle,
                                            subtitleView: getSubtitleView,
                                            usersRequestBuilder: usersRequest
                                        });
                                    })
                                    .catch((error) => {
                                        console.log('error', error);
                                        alert('User not created in cometchat')
                                        setUser(undefined)
                                        setRefresh(!refresh)
                                    });
                            } else {
                                console.log("Already logged-in", { user });
                                setUser(user);
                            }
                        });
                    })
                    .catch((e) => {
                        console.log('error', e);
                        alert('User not created in cometchat')
                        setUser(undefined)
                        setRefresh(!refresh)
                    });
            }, error => {
                console.log("Logout failed with exception:", { error });
            }
        );
    }

    const splitScreen = {
        display: 'flex',
        flexDirection: 'row',
    };

    const topPane = {
        width: '20%',
        height: "95vh"
    }
    const bottomPane = {
        width: '80%',
        height: "95vh"
    }
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const handleOpenRequests = () => {
        console.log('checking requests')
        fetch(BASE_URL + "/admin-seeded-friend-request")
                .then(res => res.json())
                .then(data => {
                    console.log(data.data)
                    setRequests(data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                    setIsRequestOpen(true);
                })
                .catch(error => {
                    console.error('Error fetching friend requests:', error);
                });
    };

    const handleAcceptProfile = (seededUserId, realUserId) => {
        fetch(BASE_URL + "/admin-seeded-accept-request", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: seededUserId,
                target: realUserId,
                seeded: true
            })
        })
        .then(res => res.json())
        .then(data => {
            setIsRequestOpen(false)
            alert('Request accepted')
            console.log('Request accepted successfully:', data);
        })
        .catch(error => {
            setIsRequestOpen(false)
            alert('Error accepting request')
            console.error('Error accepting request:', error);
        });
    };

    const handleRejectProfile = (seededUserId, realUserId) => {
        fetch(BASE_URL + "/admin-reject-request", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: seededUserId,
                target: realUserId,
                seeded: true
            })
        })
        .then(res => res.json())
        .then(data => {
            setIsRequestOpen(false)
            console.log('Request rejected successfully:', data);
            alert('Request rejected success')
        })
        .catch(error => {
            setIsRequestOpen(false)
            alert('Error rejecting request')
            console.error('Error rejecting request:', error);
        });
    };

    const formatDate = (dateString) => {
        const options = { timeZone: 'Asia/Kolkata', hour12: true, year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString('en-IN', options);
    };

    return user ? (
        <div style={{ width: "95vw", height: "95vh" }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div>Logged in as: {user.name + ' - User ID: ' + user.uid}</div>
                    <Button variant="contained" color="primary" onClick={handleOpenRequests}>View Requests</Button>
                </div>
            </div>
            {isRequestOpen && (
                <Modal open={isRequestOpen} onClose={() => setIsRequestOpen(false)}>
                    <Box sx={{ ...style, maxHeight: '70vh', overflowY: 'auto' }}>
                        <Table>
                            <TableBody>
                                {requestedProfiles.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Avatar alt={item.seeded_first_name} src={item.seeded_user_image_urls[0]} />
                                            {item.seeded_first_name + ' ' + item.seeded_last_name}
                                        </TableCell>
                                        <TableCell>
                                            <Avatar alt={item.real_first_name} src={item.real_user_image_urls[0]} />
                                            {item.real_first_name + ' ' + item.real_last_name}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(item.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="primary" size="small" style={{ marginRight: '10px' }} onClick={() => handleAcceptProfile(item.seeded_user_id, item.real_user_id)}>Accept</Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="outlined" color="secondary" size="small" onClick={() => handleRejectProfile(item.seeded_user_id, item.real_user_id)}>Reject</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Modal>
            )}
            <div style={splitScreen}>
                <div style={topPane}>
                    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {items.map((value) => {
                            return (
                                <ListItem
                                    key={value.id}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            getChats(value.seeded_user_id, value.real_user_id)
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                alt={value.seeded_first_name}
                                                src={value.seeded_user_image_urls[0]}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText id={value.id} primary={value.seeded_first_name + ' ' + value.seeded_last_name} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List></div>
                <div style={bottomPane}>
                    <div style={{ height: "90%", width: "100%" }}>
                        <CometChatUsersWithMessages
                            usersConfiguration={new UsersConfiguration({
                                hideSectionSeparator: true,
                                showSectionHeader: false,
                                usersStyle: uStyle,
                                subtitleView: getSubtitleView,
                                usersRequestBuilder: new CometChat.UsersRequestBuilder()
                                    .setLimit(limit)
                                    .setUIDs(UIDs)
                                    .withTags(true)
                            })}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
        : (
            <div>Loading...</div>
        )
}

export default Chat;
