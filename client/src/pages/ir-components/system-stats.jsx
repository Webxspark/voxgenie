import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SystemStats = () => {
    const [cpuUsage, setCpuUsage] = useState(null);
    const [ramUsage, setRamUsage] = useState(null);
    const [gpuInfo, setGpuInfo] = useState([]);
    const isMounted = useRef(false);
    useEffect(() => {
        const socket = io('http://127.0.0.1:5000', {
            transports: ['websocket'],
            reconnectionAttempts: 3,
            timeout: 10000,  // 10 seconds
            // pingTimeout: 20000,  // 120 seconds
            // pingInterval: 10000, // 30 seconds
        });

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect', (reason) => {
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
        // <div className='text-xs absolute bottom-0'>
        //     <p className='text-blue-700'>RAM: 2.5GB / 4GB</p>
        //     <p className='text-red-600'>CPU: 25% / 100%</p>
        //     <p className='text-yellow-600'>GPU: 0% / 100%</p>
        // </div>
        <>
            <div>
                <h1>System Usage Monitor</h1>
                {cpuUsage !== null && (
                    <div>
                        <h2>CPU Usage</h2>
                        <p>{cpuUsage}%</p>
                    </div>
                )}
                {ramUsage !== null && (
                    <div>
                        <h2>RAM Usage</h2>
                        <p>
                            {ramUsage.used} GB / {ramUsage.total} GB ({ramUsage.percentage}%)
                        </p>
                    </div>
                )}
                {gpuInfo.length > 0 && (
                    <div>
                        <h2>GPU Usage</h2>
                        {gpuInfo.map((gpu, index) => (
                            <div key={index}>
                                <h3>{gpu['GPU Name']}</h3>
                                <p>Load: {gpu['GPU Load'].toFixed(2)}%</p>
                                <p>
                                    Memory: {gpu['GPU Used Memory']} MB / {gpu['GPU Total Memory']} MB
                                </p>
                                <p>Temperature: {gpu['GPU Temperature']}°C</p>
                            </div>
                        ))}
                    </div>
                )}
            </div >
        </>
    );
};

export default SystemStats;