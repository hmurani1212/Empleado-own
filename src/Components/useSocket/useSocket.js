// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserData } from '../../Authentication/jwt_decode';
import { inbox_Url, attendance_url } from '../../Model/BaseUri';

/**
 * REST bases like https://host/empleado_app/inbox must not be passed alone to io():
 * the client only uses origin for the connection and defaults path to /socket.io,
 * which hits wss://host/socket.io (wrong). Use origin + path /prefix/socket.io.
 */
function socketOriginAndPath(restApiBaseUrl) {
    const u = new URL(restApiBaseUrl);
    const prefix = u.pathname.replace(/\/$/, '');
    return {
        url: `${u.protocol}//${u.host}`,
        path: `${prefix}/socket.io`,
    };
}

const useSocket = () => {
    const socketRef = useRef(null);
    const socketIoRef = useRef(null);

    useEffect(() => {
        const inboxSocket = socketOriginAndPath(inbox_Url);
        const attendanceSocket = socketOriginAndPath(attendance_url);

        // Initialize main socket connection (inbox service)
        socketRef.current = io(inboxSocket.url, {
            path: inboxSocket.path,
            transports: ['polling', 'websocket'],
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

        // Attendance Socket.IO (same host, different path prefix)
        socketIoRef.current = io(attendanceSocket.url, {
            path: attendanceSocket.path,
            transports: ['polling', 'websocket'],
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
