import { AppContext } from '@/contexts/dashboard';
import React, { useContext } from 'react';

const DashboardLanding = () => {
    const { audio_player } = useContext(AppContext);
    return (
        <div>
            Hello world :)
        </div>
    );
};

export default DashboardLanding;