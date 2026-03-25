// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserData } from '../../Authentication/jwt_decode';

const SOCKET_URL = 'http://172.18.0.44:6379'; // Main socket server
const SOCKET_IO_URL = 'http://172.18.0.34:8005'; // Socket.IO server
// const attendence_Socket_URL = 'http://172.18.0.44:6379';

const useSocket = () => {
    const socketRef = useRef(null);
    const socketIoRef = useRef(null);

    useEffect(() => {
        // Initialize main socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'],
            auth: {
                token: localStorage.getItem('jwt')
            }
        });

        socketRef.current.on('connect', () => {
            // Join organization room on connection
            const userData = getUserData();
            if (userData?.org_oneid) {
                socketRef.current.emit('join_org', userData.org_oneid);
            }
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('🔌 Main socket connection error:', error);
        });

        // Initialize Socket.IO connection on http://172.18.0.34:8005
        socketIoRef.current = io(SOCKET_IO_URL, {
            transports: ['websocket', 'polling'],
            auth: {
                token: localStorage.getItem('jwt')
            }
        });

        socketIoRef.current.on('connect', () => {
            // Join organization room on connection
            const userData = getUserData();
            if (userData?.org_oneid) {
                socketIoRef.current.emit('join_org', userData.org_oneid);
            }
        });

        socketIoRef.current.on('connect_error', (error) => {
            console.error('🔌 Socket.IO connection error (8005):', error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (socketIoRef.current) {
                socketIoRef.current.disconnect();
            }
        };
    }, []);

    return { socketRef, socketIoRef };
};

export default useSocket;
