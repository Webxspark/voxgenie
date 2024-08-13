import { Button } from '@/components/ui/button';
import { AppContext } from '@/contexts/dashboard';
import React, { useContext } from 'react';

const DashboardLanding = () => {
    const { audio_player } = useContext(AppContext);
    return (
        <div>
            <Button onClick={e => {audio_player.api.show()}}>
                Click me
            </Button>
        </div>
    );
};

export default DashboardLanding;