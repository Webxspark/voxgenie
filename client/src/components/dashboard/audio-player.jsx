import { AppContext } from '@/contexts/dashboard';
import React, { useContext } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player'; 
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
const AudioPlayerWidget = () => {
    const { audio_player } = useContext(AppContext);
    return (
        <div className='fixed lg:w-1/4 md:w-1/2 m-auto inset-x-0  bottom-0'>
            <div className='relative w-full'>
                <div className='absolute -top-10 right-2'>
                    <Button size="icon" className="rounded-full">
                        <XIcon className='h-4 w-4' />
                    </Button>
                </div>
            </div>
            <AudioPlayer
                autoPlay
                showJumpControls={false}
                src="http://example.com/audio.mp3"
                onPlay={e => console.log("onPlay")}
                className='rounded-t-3xl'
            // other props here
            />
        </div>
    );
};

export default AudioPlayerWidget;