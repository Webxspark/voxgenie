import { AppContext } from '@/contexts/dashboard';
import React, { useContext, useEffect, useState } from 'react';
import 'react-h5-audio-player/lib/styles.css';
import AudioPlayer from 'react-h5-audio-player';
import { Button } from '../ui/button';
import { XIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
const AudioPlayerWidget = () => {
    const { audio_player } = useContext(AppContext);
    const [isVisible, setIsVisible] = useState(audio_player.show);
    const variants = {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
        exit: { y: '100%', opacity: 0 }
    };
    const handleClose = () => {
        audio_player.api.hide();
        setIsVisible(false);
    };
    useEffect(() => {
        if (audio_player.show) {
            setIsVisible(true);
        }
    }, [audio_player.show]);
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className='fixed lg:w-1/4 md:w-1/2 m-auto inset-x-0 bottom-0'
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={(definition) => {
                        if (definition === "exit") {
                            setIsVisible(false);
                        }
                    }}
                >
                    <div className=''>
                        <div className='relative w-full'>
                            <div className='absolute -top-10 right-2'>
                                <Button onClick={handleClose} size="icon" className="rounded-full">
                                    <XIcon className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                        <AudioPlayer
                            autoPlay
                            showJumpControls={false}
                            src={audio_player.track.url}
                            onPlay={e => console.log(`Playing ${audio_player.track.title} - ${audio_player.track.voice}`)}
                            className='rounded-t-3xl'
                        // other props here
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AudioPlayerWidget;