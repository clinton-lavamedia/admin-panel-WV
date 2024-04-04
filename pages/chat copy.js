
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChatUsersWithMessages } from '@cometchat/chat-uikit-react';
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
function Chat() {
    const [user, setUser] = React.useState(undefined);
    React.useEffect(() => {
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
                CometChatUIKit.login("superhero1", consts.AUTH_KEY)
                  .then((user) => {
                    console.log("Login Successful", { user });
                    setUser(user);
                  })
                  .catch((error) => {}, console.log);
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
   

    

      return user ? (
        <div style={{ width: "95vw", height: "95vh" }}>
          <div style={{ height: "90%", width: "100%" }}>
            <CometChatUsersWithMessages />
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      );
}

export default Chat;