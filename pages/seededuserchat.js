
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
import Avatar from '@mui/material/Avatar';
const BASE_URL = process.env.NEXT_PUBLIC_BASEURL

function Chat() {
    const [user, setUser] = React.useState(undefined);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [UIDs, setUIDs] = React.useState([]);

    const UIKitSettings = new UIKitSettingsBuilder()
        .setAppId(consts.APP_ID)
        .setRegion(consts.REGION)
        .setAuthKey(consts.AUTH_KEY)
        .subscribePresenceForFriends()
        .build();
    /*  React.useEffect(() => {
         let UID = "001";
         CometChat.getUser(UID).then(
             user => {
                 console.log("User details fetched for user:", user);
             }, error => {
                 console.log("User details fetching failed with error:", error);
             }
         );
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
                     }
                 });
             })
             .catch((e) => {
                 console.log(e);
             });
     }, []); */
    React.useEffect(() => {
        fetch(BASE_URL + "/admin-get-seeded-users-matches")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    setIsLoaded(true);
                    let data = result.data;

                    //data[key].open = false
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

                    //  console.log(data)
                    // data.delete( data[key].image_urls)

                    setItems(merged_data.data);
                    setUIDs(data[0].real_user_id)
                    let UID = data[0].seeded_user_id.toString();
                    console.log(UID)
                    CometChat.getUser(UID).then(
                        user => {
                            console.log("User details fetched for user:", user);
                        }, error => {
                            console.log("User details fetching failed with error:", error);
                        }
                    );
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
                                }
                            });
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                },
                // Note: it's important to handle errors here
                // instead of a catch() block so that we don't swallow
                // exceptions from actual bugs in components.
                (error) => {
                    setIsLoaded(true);
                    //setError(error);
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
                {/*  <br/>
           <span style={{ color: "#347fb9", font: "400 11px Inter, sans-serif" }}>
         {'blocked-me: ' + user.hasBlockedMe} | {'blocked-by-me: ' + user.blockedByMe}
         </span> */}
            </div>
        );
    };
    const uStyle = new UsersStyle({
        /*  background: "linear-gradient(#b6eae1, #D2FBAD)",
         searchBorder: "1px solid #38aecc",
         searchTextColor: "#38aecc",
         searchPlaceholderTextColor: "#38aecc",
         searchIconTint: "#38aecc",
         loadingIconTint: "#38aecc",
         onlineStatusColor: "yellow",
         emptyStateTextColor: "#96DEDA",
         titleTextColor: "#38aecc",
         separatorColor: "#38aecc" */
        // height:500
    });
    let limit = 100;
    /*  let tags = [];
     let uConfig = new UsersConfiguration({
         hideSectionSeparator: true,
         showSectionHeader: false,
         usersStyle: uStyle,
         subtitleView: getSubtitleView,
        // usersRequestBuilder: usersRequest
     }); */

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
                                CometChatUIKit.login(seeded_user_id, consts.AUTH_KEY)
                                    .then((user) => {
                                        console.log("Login Successful", { user });
                                        setUser(user);
                                        let usersRequest = new CometChat.UsersRequestBuilder()
                                            .setLimit(limit)
                                            .setUIDs(uids)
                                            // .setTags(tags)
                                            //.setStatus(CometChat.USER_STATUS.ONLINE)
                                            // .friendsOnly(true)
                                            .withTags(true);

                                        uConfig = new UsersConfiguration({
                                            hideSectionSeparator: true,
                                            showSectionHeader: false,
                                            usersStyle: uStyle,
                                            subtitleView: getSubtitleView,
                                            usersRequestBuilder: usersRequest
                                        });
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
            }, error => {
                console.log("Logout failed with exception:", { error });
            }
        );
    }

    //const urb = new CometChat.UsersRequestBuilder().setLimit(30).sortBy("status");


    /* const uwmStyle = new WithMessagesStyle({
        width: "600px",
        height: "600px",
        border: "1px solid #38aecc",
        background: "linear-gradient(#e9fbcf, #1d7d8e)",
        messageTextColor: "#38aecc"
    }); */
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

    return user ? (

        <div style={{ width: "95vw", height: "95vh" }}>
            <div>
                Logged in as: {user.name + ' - User ID: ' + user.uid}
            </div>
            <div style={splitScreen}>
                <div style={topPane}>
                    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {items.map((value) => {
                            return (
                                <ListItem
                                    key={value.id}
                                    /* secondaryAction={
                                      <Checkbox
                                        edge="end"
                                        onChange={handleToggle(value)}
                                        checked={checked.indexOf(value) !== -1}
                                        inputProps={{ 'aria-labelledby': labelId }}
                                      />
                                    } */
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => {
                                            getChats(value.seeded_user_id, value.real_user_id)
                                           // alert(value.seeded_user_id);
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
                        {/* <CometChatUsers
                 hideSectionSeparator= {true}
                 showSectionHeader= {false}
                 usersStyle= {uStyle}
                 subtitleView= {getSubtitleView}
                 usersRequestBuilder= {usersRequest}
                    //usersConfiguration={uConfig}
                /> */}
                        <CometChatUsersWithMessages
                            usersConfiguration={new UsersConfiguration({
                                hideSectionSeparator: true,
                                showSectionHeader: false,
                                usersStyle: uStyle,
                                subtitleView: getSubtitleView,
                                 usersRequestBuilder: new CometChat.UsersRequestBuilder()
                                 .setLimit(limit)
                                 .setUIDs(UIDs)
                                 // .setTags(tags)
                                 //.setStatus(CometChat.USER_STATUS.ONLINE)
                                 // .friendsOnly(true)
                                 .withTags(true)
                            })}
                        // messagesConfiguration={mConfig}
                        // usersWithMessagesStyle={uwmStyle}
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