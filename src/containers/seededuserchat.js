import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChatUsersWithMessages, CometChatUsers,CometChatOption } from '@cometchat/chat-uikit-react';
import {
    UsersConfiguration,
    UsersStyle,
    ContactsConfiguration,
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
const BASE_URL = process.env.REACT_APP_BASEURL;
const DEV_BASE_URL = process.env.REACT_APP_DEV_BASEURL;

function Chat() {
    const [user, setUser] = React.useState(undefined);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [UIDs, setUIDs] = React.useState([]);
    const [isRequestOpen, setIsRequestOpen] = React.useState(false);
    const [requestedProfiles, setRequests] = React.useState([]);
    const [selectedUserDetails, setSelectedUserDetails] = React.useState(null);
    const [isUserDetailsOpen, setIsUserDetailsOpen] = React.useState(false);
    const [selectedRealUserDetails, setSelectedRealUserDetails] = React.useState(null);
    const [isRealUserDetailsOpen, setIsRealUserDetailsOpen] = React.useState(false);
    const [selectedRealUserId, setSelectedRealUserId] = React.useState(null);
    const [isProd, setIsProd] = React.useState(() => {
        const savedEnv = sessionStorage.getItem('isProd');
        return savedEnv !== null ? JSON.parse(savedEnv) : true;
    });
    const UIKitSettings = new UIKitSettingsBuilder()
        .setAppId(isProd ? consts.APP_ID : consts.DEV_APP_ID)
        .setRegion(isProd ? consts.REGION : consts.DEV_REGION)
        .setAuthKey(isProd ? consts.AUTH_KEY : consts.DEV_AUTH_KEY)
        .subscribePresenceForFriends()
        .build();

    React.useEffect(() => {
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-get-seeded-users-matches")
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

                   // console.log(JSON.stringify(merged_data.data));
                    console.log(merged_data.data)

                    setItems(merged_data.data);
                    setUIDs(data[0].real_user_id)
                    let UID = 'heyo_user' 
                    console.log(UID)

                    const UIKitSettings = new UIKitSettingsBuilder()
                        .setAppId(isProd ? consts.APP_ID : consts.DEV_APP_ID)
                        .setRegion(isProd ? consts.REGION : consts.DEV_REGION)
                        .setAuthKey(isProd ? consts.AUTH_KEY : consts.DEV_AUTH_KEY)
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
        function formatTime(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
          }
       // console.log('user in list -> ', user)
        return (
            <div>
                <span style={{ color: "#347fb9", font: "400 11px Inter, sans-serif" }}>
                    {user.uid} | {user.status} {user.lastActiveAt ? formatTime(user.lastActiveAt): 'N/A'} 
                </span>
            </div>
        );
    };
    const getHeaderView = (user) => {
        function formatTime(timestamp) {
            const date = new Date(timestamp * 1000);
            return date.toLocaleString();
          }
        console.log('user in list -> ', user)
       /*  return (
            <div>
                <span style={{ color: "#347fb9", font: "400 11px Inter, sans-serif" }}>
                    {user.uid} | {user.status} {user.lastActiveAt ? formatTime(user.lastActiveAt): 'N/A'} 
                </span>
            </div>
        ); */
    };
    
    const uStyle = new UsersStyle({});

    let limit = 100;

    function getChats(seeded_user_id, uids) {
        console.log(uids)
        setUIDs(uids)
         // Fetch user details
         fetch((isProd ? BASE_URL : DEV_BASE_URL) + `/admin-get-seeded-users?userId=${seeded_user_id}`)
         .then(res => res.json())
         .then(data => {
             if (data.status === "OK" && data.data && data.data.user && data.data.user.length > 0) {
                 setSelectedUserDetails(data.data.user[0]);
             }
         })
         .catch(error => {
             console.error('Error fetching user details:', error);
         });
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
                                       /*  let usersRequest = new CometChat.UsersRequestBuilder()
                                            .setLimit(limit)
                                            .withTags(true); */

                                       /*  let uConfig = new UsersConfiguration({
                                            hideSectionSeparator: true,
                                            showSectionHeader: false,
                                            usersStyle: uStyle,
                                            subtitleView: getSubtitleView,
                                            usersRequestBuilder: usersRequest
                                        }); */

                                       

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
  
    function getRealUserDetails(real_user_id) {
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + `/admin-get-real-users?userId=${real_user_id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "OK" && data.data && data.data.user && data.data.user.length > 0) {
                    setSelectedRealUserDetails(data.data.user[0]);
                    setIsRealUserDetailsOpen(true);
                }
            })
            .catch(error => {
                console.error('Error fetching real user details:', error);
            });
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
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-seeded-friend-request")
                .then(res => res.json())
                .then(data => {
                    console.log(data.data)
                    const groupedData = data.data.reduce((acc, item) => {
                        if (!acc[item.real_user_id]) {
                            acc[item.real_user_id] = {
                                real_user_id: item.real_user_id,
                                real_first_name: item.real_first_name,
                                real_last_name: item.real_last_name,
                                real_user_image_urls: item.real_user_image_urls,
                                real_college_name: item.real_college_id,
                                requests: []
                            };
                        }
                        acc[item.real_user_id].requests.push(item);
                        return acc;
                    }, {});
                    setRequests(Object.values(groupedData).sort((a, b) => new Date(b.requests[0].created_at) - new Date(a.requests[0].created_at)));
                    setIsRequestOpen(true);
                })
                .catch(error => {
                    console.error('Error fetching friend requests:', error);
                });
    };

    const handleAcceptProfile = (seededUserId, realUserId) => {
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-seeded-accept-request", {
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
        fetch((isProd ? BASE_URL : DEV_BASE_URL) + "/admin-reject-request", {
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
                    <div>
                        Logged in as: {user.name + ' - User ID: ' + user.uid}
                        {selectedUserDetails && (
                            <div>
                                <Button variant="contained" color="primary" onClick={() => setIsUserDetailsOpen(true)}> {selectedUserDetails.first_name} {selectedUserDetails.last_name} 's details</Button>
                                <Modal open={isUserDetailsOpen} onClose={() => setIsUserDetailsOpen(false)}>
                                    <Box sx={{ ...style, maxHeight: '70vh', overflowY: 'auto' }}>
                                        <Typography variant="body1">Selected seeded user details:</Typography>
                                        <Typography variant="body2">Name: {selectedUserDetails.first_name} {selectedUserDetails.last_name}</Typography>
                                        <Typography variant="body2">Age: {selectedUserDetails.age}</Typography>
                                        <Typography variant="body2">Gender: {selectedUserDetails.gender}</Typography>
                                        <Typography variant="body2">Degree: {selectedUserDetails.degree}</Typography>
                                        <Typography variant="body2">Year: {selectedUserDetails.year}</Typography>
                                        <Typography variant="body2">College: {selectedUserDetails.college_id}</Typography>
                                        <Typography variant="body2">Course: {selectedUserDetails.course_id}</Typography>
                                        <Typography variant="body2">Interests: {selectedUserDetails.interests.map(interest => interest.subtopic).join(', ')}</Typography>
                                        <div>
                                            {selectedUserDetails.images.map(image => (
                                                <img key={image.id} src={image.image_url} alt="User" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                                            ))}
                                        </div>
                                    </Box>
                                </Modal>
                            </div>
                        )}
                        {selectedRealUserDetails && (
                            <div>
                                <Modal open={isRealUserDetailsOpen} onClose={() => setIsRealUserDetailsOpen(false)}>
                                    <Box sx={{ ...style, maxHeight: '70vh', overflowY: 'auto' }}>
                                        <Typography variant="body2">Name: {selectedRealUserDetails.first_name} {selectedRealUserDetails.last_name}</Typography>
                                        <Typography variant="body2">Age: {selectedRealUserDetails.age}</Typography>
                                        <Typography variant="body2">Gender: {selectedRealUserDetails.gender}</Typography>
                                        <Typography variant="body2">Degree: {selectedRealUserDetails.degree}</Typography>
                                        <Typography variant="body2">Year: {selectedRealUserDetails.year}</Typography>
                                        <Typography variant="body2">College: {selectedRealUserDetails.college_id}</Typography>
                                        <Typography variant="body2">Course: {selectedRealUserDetails.course_id}</Typography>
                                        <Typography variant="body2">Interests: {selectedRealUserDetails.interests.map(interest => interest.subtopic).join(', ')}</Typography>
                                        <div>
                                            {selectedRealUserDetails.images.map(image => (
                                                <img key={image.id} src={image.image_url} alt="User" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
                                            ))}
                                        </div>
                                    </Box>
                                </Modal>
                            </div>
                        )}
                    </div>
                    <Button variant="contained" color="primary" onClick={handleOpenRequests}>View Requests</Button>
                   {/*  {selectedRealUserId && (
                        <Button variant="contained" color="secondary" onClick={() => getRealUserDetails(selectedRealUserId)}>View Real User Details</Button>
                    )} */}
                </div>
            </div>
            {isRequestOpen && (
                <Modal open={isRequestOpen} onClose={() => setIsRequestOpen(false)}>
                    <Box sx={{ ...style, maxHeight: '70vh', overflowY: 'auto', width: '60%' }}>
                        <Table>
                            <TableBody>
                                {requestedProfiles.map((group) => (
                                    <React.Fragment key={group.real_user_id}>
                                        <TableRow>
                                            <TableCell colSpan={5}>
                                                <Typography variant="h6">
                                                    <Avatar alt={group.real_first_name} src={group.real_user_image_urls[0]} />
                                                    {group.real_first_name + ' ' + group.real_last_name}
                                                </Typography>
                                                <Typography variant="subtitle1">
                                                    {group.real_college_name}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                        {group.requests.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <Avatar alt={item.seeded_first_name} src={item.seeded_user_image_urls[0]} />
                                                    {item.seeded_first_name + ' ' + item.seeded_last_name}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {Object.keys(item.chat_request).map(key => (
                                                            key !== 'time' && (
                                                                <div key={key}>
                                                                    <strong>{key}:</strong> {key === 'mediaUrl' ? <img src={item.chat_request[key]} alt="media" style={{ width: '50px', height: '50px' }} /> : item.chat_request[key]}
                                                                </div>
                                                            )
                                                        ))}
                                                    </Typography>
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
                                    </React.Fragment>
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
                                           // setSelectedRealUserId(value.real_user_id[0])
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
                                options: (user) => {
                                    const customOptions = [
                                      new CometChatOption({
                                        id: "1",
                                        title: "Details",
                                        iconURL: "https://lavamedia-seeded-users-prod.s3.ap-south-1.amazonaws.com/1521/4852.jpeg",
                                        backgroundColor: "grey",
                                        onClick: () => {
                                            getRealUserDetails(user.uid)
                                          console.log("Custom option clicked for user:", user);
                                        },
                                        iconTint: "#890aff",
                                        titleColor: "blue",
                                      }),
                                    ];
                                    return customOptions;
                                  },
                                usersRequestBuilder: new CometChat.UsersRequestBuilder()
                                    .setLimit(limit)
                                    .setUIDs(UIDs)
                                    .withTags(true),
                                   

                            })
                        }
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

