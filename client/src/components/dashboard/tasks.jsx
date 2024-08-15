import React, { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/dashboard';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';

const AppTasks = () => {
    const { tasks, nonces } = useContext(AppContext);
    const { utils } = useContext(GlobalContext);
    useEffect(() => {
        if (tasks.processes.length > 0) {
            tasks.processes.forEach(process => {
                if(typeof process === 'object') {
                    utils.toast.promise(handleSpeechSynthesis(process), {
                        loading: "Synthesizing text to speech...",
                        success: (resp) => {
                            return resp.message;
                        },
                        error: (err) => {
                            console.error(err);
                            return err.message || 'Something went wrong while synthesizing text to speech. Please try again later. [D-500]';
                        }
                    })
                    tasks.api.processes.clear()
                } else {
                    console.error(process, typeof process);
                    utils.toast.error('Invalid process detected. Please try again later. [D-500]');
                }
            })
        }
    }, [tasks.processes])
    async function handleSpeechSynthesis(process){
        return new Promise((resolve, reject) => {
            vgFetch("/app/voice", {
                method: "POST",
                body: new URLSearchParams(process)
            }).then(resp => {
                if (resp.status == 200) {
                    resolve(resp);
                    nonces.api.setHistory(Date.now());
                } else {
                    reject(resp);
                }
            }).catch(err => {
                console.error(err);
                reject(err);
            })
        })
    }
    return (
        <></>
    );
};

export default AppTasks;