import { AppContext } from '@/contexts/dashboard';
import React, { useContext } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import { motion } from 'framer-motion';
const AudioPlayerWidget = () => {
    const { audio_player } = useContext(AppContext);
    const variants = {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 }
    };
    return (
        <>
            {
                audio_player.show && <motion.div
                    className='fixed lg:w-1/4 md:w-1/2 m-auto inset-x-0 bottom-0'
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{ duration: 0.2 }}
                >
                    <div className=''>
                        <div className='relative w-full'>
                            <div className='absolute -top-10 right-2'>
                                <Button onClick={e => audio_player.api.hide()} size="icon" className="rounded-full">
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
                        />
                    </div>
                </motion.div>
            }
        </>
    );
};

export default AudioPlayerWidget;