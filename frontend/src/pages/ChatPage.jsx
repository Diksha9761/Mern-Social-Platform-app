import React, { useEffect, useState } from 'react';
import { ChatData } from '../context/ChatContext';
import axios from 'axios';
import { FaSearch } from "react-icons/fa";
import Chat from "../components/chat/Chat";
import MessageContainer from '../components/chat/MessageContainer';
import { SocketData } from '../context/SocketContext';

const ChatPage = ({ user }) => {
    const { createChat, selectedChat, setSelectedChat, chats, setChats } = ChatData();

    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState(false);
    const [loadingChats, setLoadingChats] = useState(false);

    const { onlineUsers } = SocketData();

    // Fetch users based on search query
    async function fetchAllUsers() {
        try {
            const { data } = await axios.get(`/api/user/all?search=${query}`);
            setUsers(data);
        } catch (error) {
            console.log(error);
        }
    }

    // Fetch all chats
    const getAllChats = async () => {
        setLoadingChats(true);
        try {
            const { data } = await axios.get("/api/messages/chats");
            setChats(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingChats(false);
        }
    };

    // Create a new chat
    async function createNewChat(id) {
        await createChat(id);
        setSearch(false);
        getAllChats();
    }

    useEffect(() => {
        fetchAllUsers();
    }, [query]);

    useEffect(() => {
        getAllChats();
    }, []);

    return (
        <div className="w-[100%] md:w-[750px] md:p-4">
            <div className="flex gap-4 mx-auto">
                {/* Left Panel */}
                <div className="w-[30%]">
                    <div className="top">
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-full"
                            onClick={() => setSearch(!search)}
                        >
                            {search ? "X" : <FaSearch />}
                        </button>

                        {search ? (
                            <>
                                <input
                                    type="text"
                                    className="custom-input"
                                    style={{ width: "100px", border: "gray solid 1px" }}
                                    placeholder="Enter Name"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />

                                <div className="users mt-2">
                                    {users && users.length > 0 ? (
                                        users.map((u) => (
                                            <div
                                                key={u._id}
                                                onClick={() => createNewChat(u._id)}
                                                className="bg-gray-500 text-white p-2 mt-2 cursor-pointer flex justify-center items-center gap-2"
                                            >
                                                <img
                                                    src={u.profilePic?.url || "/default.png"}
                                                    className="w-8 h-8 rounded-full"
                                                    alt={u.name}
                                                />
                                                {u.name}
                                            </div>
                                        ))
                                    ) : (
                                        <p>No Users</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col justify-center items-center mt-2">
                                {loadingChats ? (
                                    <p>Loading chats...</p>
                                ) : (
                                    chats.map((chat) => {
                                        // Find the other user (not the logged-in user)
                                        const otherUser = chat.users?.find(u => u._id !== user._id);

                                        if (!otherUser) return null;

                                        return (
                                            <Chat
                                                key={chat._id}
                                                chat={chat}
                                                setSelectedChat={setSelectedChat}
                                                isOnline={onlineUsers.includes(otherUser._id)}
                                                user={otherUser}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-[70%]">
                    {selectedChat ? (
                        <MessageContainer selectedChat={selectedChat} setChats={setChats} />
                    ) : (
                        <div className="mx-20 mt-40 text-2xl">
                            Hello 👋 {user.name}, select a chat to start conversation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;