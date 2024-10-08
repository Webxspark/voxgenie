import { createContext, useState } from "react";
import DashboardContextDecl from "./declarations/dashboard.d";
const AppContext = createContext(DashboardContextDecl);

const AppContextProvider = ({ children }) => {
    const [audioPlayerState, setAudioPlayerState] = useState('paused');
    const [audioPlayerTitle, setAudioPlayerTitle] = useState('');
    const [audioPlayerVoice, setAudioPlayerVoice] = useState('');
    const [audioPlayerUrl, setAudioPlayerUrl] = useState('');
    const [audioPlayerShow, setAudioPlayerShow] = useState(false);
    /**-------------------------------------------**/
    const [tasksProcesses, setTasksProcesses] = useState([]);
    const [tasksOnGoing, setTasksOnGoing] = useState([]);
    /**-------------------------------------------**/
    const [historyNonce, setHistoryNonce] = useState('');

    const api = {
        audio_player: {
            state: audioPlayerState,
            track: {
                title: audioPlayerTitle,
                voice: audioPlayerVoice,
                url: audioPlayerUrl,
            },
            show: audioPlayerShow,
            api: {
                setState: setAudioPlayerState,
                setTrack: (details) => {
                    setAudioPlayerTitle(details.title);
                    setAudioPlayerVoice(details.voice);
                },
                setUrl: setAudioPlayerUrl,
                play: () => {
                    setAudioPlayerState('playing');
                },
                pause: () => {
                    setAudioPlayerState('paused');
                },
                stop: () => {
                    setAudioPlayerState('paused');
                },
                show: () => {
                    setAudioPlayerShow(true);
                },
                hide: () => {
                    setAudioPlayerShow(false);
                }
            }
        },
        tasks: {
            processes: tasksProcesses,
            onGoing: tasksOnGoing,
            api: {
                processes: {
                    add: (process) => {
                        setTasksProcesses([...tasksProcesses, process]);
                    },
                    clear: () => {
                        setTasksProcesses([]);
                    }
                },
                onGoing: {
                    add: (process) => {
                        setTasksOnGoing([...tasksOnGoing, process]);
                    },
                    clear: () => {
                        setTasksOnGoing([]);
                    }
                }
            }
        },
        nonces: {
            history: historyNonce,
            api: {
                setHistory: setHistoryNonce
            }
        }
    }
    return (
        <AppContext.Provider value={api}>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppContextProvider };