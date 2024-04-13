import dynamic from "next/dynamic";
import { useEffect } from "react";

const CometChatNoSSR = dynamic(() => import("./seededuserchat"), {
  ssr: false,
});

function Chat() {
 /*  useEffect(() => {
    window.CometChat = require("@cometchat/chat-sdk-javascript").CometChat;
    
  }); */

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.CometChat = require("@cometchat/chat-sdk-javascript").CometChat;

    }
  },[] );

  return (
    <div>
      <CometChatNoSSR />
    </div>
  );
}

export default Chat;