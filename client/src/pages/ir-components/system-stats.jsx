import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SystemStats = () => {
    const [cpuUsage, setCpuUsage] = useState(null);
    const [ramUsage, setRamUsage] = useState(null);
    const [gpuInfo, setGpuInfo] = useState([]);
    const [socketConnection, setSocketConnection] = useState(null);
    const connectionCountRef = useRef(0);
    useEffect(() => {
        if (connectionCountRef.current > 0) {
            return;
        }
        const socket = io('http://127.0.0.1:5000', {
            transports: ['websocket'],
            reconnectionAttempts: 3,
            timeout: 10000,  // 10 seconds
            // pingTimeout: 20000,  // 120 seconds
            // pingInterval: 10000, // 30 seconds
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            setSocketConnection(true);
        });

        socket.on('disconnect', (reason) => {
            setSocketConnection(false);
            console.log(`Disconnected: ${reason}`);
            if (reason === 'io server disconnect') {
                // If the server disconnects the client, we manually reconnect
                socket.connect();
            }
        });

        socket.on('system_usage', (data) => {
            setCpuUsage(data.cpu_usage);
            setRamUsage({
                total: data.ram_total.toFixed(2),
                used: data.ram_used.toFixed(2),
                percentage: data.ram_percentage,
            });
            setGpuInfo(data.gpu_info);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });

        // Clean up on component unmount
        return () => {
            socket.disconnect();
            console.log('Socket disconnected');
        };
    }, []);

    return (
        <>
            <div className='text-xs absolute bottom-0'>
                {
                    socketConnection === false ? (
                        <div className='text-red-500 p-4 border-2 border-red-600'>Connection to server lost!</div>
                    ) : socketConnection === null ? <>
                        <div className='text-blue-500 p-4 border-2 border-blue-600'>Connecting to server...</div>
                    </> : (<div>
                        {ramUsage !== null && (<p className='text-blue-700'>RAM: {ramUsage.used} GB / {ramUsage.total} GB ({ramUsage.percentage}%)</p>)}
                        {cpuUsage !== null && (<p className='text-red-600'>CPU: {cpuUsage}%</p>)}
                        {
                            gpuInfo.length > 0 && (
                                <p className='text-yellow-600'>
                                    {gpuInfo.map((gpu, index) => {
                                        return <p key={index}>GPU: {gpu['GPU Name']}:: {gpu['GPU Used Memory']} MB / {gpu['GPU Total Memory']} MB ({gpu['GPU Temperature']}°C)</p>
                                    })}
                                </p>
                            )
                        }
                    </div>)
                }
            </div >
        </>
    );
};

export default SystemStats;