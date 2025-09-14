import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import {io} from 'socket.io-client';
import { UserData } from "./UserContext";

const EndPoint = "https://mern-social-platform-app.onrender.com";

const SocketContext = createContext();

export const SocketContextProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const {user} = UserData();
    useEffect(()=>{
        const socket = io(EndPoint,{
            query:{
                userId: user?._id,
            },
        });

        setSocket(socket);

        socket.on("getOnlineUser",(users)=>{
            setOnlineUsers(users);

        });

        return () =>socket && socket.close();
    }, [user?._id]);
    return <SocketContext.Provider value={{socket, onlineUsers}}>{children}</SocketContext.Provider>;
};

export const SocketData = () => useContext(SocketContext);
