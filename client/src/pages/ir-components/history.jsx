import WxpToolTip from '@/components/dashboard/tooltip';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AppContext } from '@/contexts/dashboard';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { cn } from '@/lib/utils';
import { DownloadIcon, PlayIcon, TrashIcon } from '@radix-ui/react-icons';
import React, { useContext, useEffect, useRef, useState } from 'react';

const History = ({ dashboard = false }) => {
    const isMounted = useRef(false);
    const [view, setView] = useState("loading");
    const [historyData, setHistoryData] = useState([]);
    const { utils } = useContext(GlobalContext)
    const { audio_player, nonces } = useContext(AppContext);
    const [overViewPopupVisible, setOverViewPopupVisible] = useState(false);
    const processingRef = useRef(false);
    const [overViewData, setOverViewData] = useState(false);
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
            fetchHisoryData()
        }
    }, [])
    var reqBody = {}
    if (dashboard) {
        reqBody.limit = 6
    }
    useEffect(() => {
        if (nonces.history != "") {
            fetchHisoryData()
            nonces.api.setHistory("")
        }
    }, [nonces.history])
    const handleHistoryDeletion = (audio) => {
        if (processingRef.current) return;
        if (window.confirm("Are you sure you want to delete this history?")) {
            setOverViewPopupVisible(false)
            processingRef.current = true
            utils.toast.promise(__intCall(), {
                loading: "Deleting history...",
                success: (resp) => {
                    nonces.api.setHistory(Date.now());
                    return resp.message;
                },
                error: (err) => {
                    console.error(err);
                    return err.message || 'Something went wrong while deleting history. Please try again later. [D-500]';
                }
            })
            function __intCall() {
                return new Promise((resolve, reject) => {
                    vgFetch("/app/history/remove", {
                        method: "DELETE",
                        body: new URLSearchParams({ audio: audio })
                    }).then(resp => {
                        processingRef.current = false
                        if (resp.status == 200) {
                            resolve(resp)
                        } else {
                            reject(resp)
                        }
                    }).catch(err => {
                        processingRef.current = false
                        console.error(err)
                        reject({ message: 'Something went wrong while deleting history. Please try again later. [D-500]' })
                    })
                })
            }
        }
    }
    const fetchHisoryData = () => {
        setView("loading")
        vgFetch("/app/history", {
            method: 'POST',
            body: new URLSearchParams(reqBody)
        }).then(res => {
            if (res.status == 200) {
                setView("content")
                setHistoryData(res.history || [])
            } else {
                setView(res.message || "Something went wrong while fetching history. [D-400]")
            }
        })
            .catch(err => {
                console.error(err)
                setView("Something went wrong while fetching history. [D-500]")
            })
    }
    const handlePlayClick = (outputAudio = "", details = { title: "", voice: "" }) => {
        if (outputAudio == "") return;
        audio_player.api.setTrack(details);
        audio_player.api.setUrl(`/genie/outputs/${outputAudio}`);
        audio_player.api.show();
        audio_player.api.play();
    }
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-y-3">
                        {
                            view == "loading" && <>
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                                <Skeleton className="h-16" />
                            </>
                            || view == "content" && <>
                                {
                                    historyData.length > 0 && historyData.map((item, index) => {
                                        let audioOutput = item[3] || '',
                                            voice = JSON.parse(item[2]) || '';
                                        const truncatedPrompt = voice.prompt.length > 80 ? voice.prompt.substring(0, 80) + '...' : voice.prompt;
                                        return (
                                            <div className='flex gap-x-1 transition-all duration-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-xl p-2'>
                                                <span>{index + 1}.</span>
                                                <div className="flex justify-between gap-x-3 w-full">
                                                    <div
                                                        onClick={e => {
                                                            setOverViewData({ prompt: voice.prompt, voice: voice.speaker || voice.voice, audio: audioOutput })
                                                            setOverViewPopupVisible(true)
                                                        }}
                                                    >
                                                        <h1 className='text-base'>{truncatedPrompt}</h1>
                                                        <p>
                                                            <span className="text-sm text-gray-500">
                                                                Voice: {voice.speaker || voice.voice || "Unknown"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className='flex items-center gap-x-2'>
                                                        <WxpToolTip title={"Play audio"} asChild sparkVariant={true} >
                                                            <Button onClick={e => handlePlayClick(audioOutput, { title: truncatedPrompt, voice: voice.speaker })} size="icon" className="rounded-full">
                                                                <PlayIcon />
                                                            </Button>
                                                        </WxpToolTip>
                                                        <WxpToolTip title={"Download audio"} asChild sparkVariant={true} >
                                                            <a href={`/genie/outputs/${audioOutput}`} download={`generated-speech-${Date.now()}.mp3`} className={cn(buttonVariants({ size: "icon" }), "rounded-full cursor-pointer")} >
                                                                <DownloadIcon />
                                                            </a>
                                                        </WxpToolTip>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                    || <div className='flex items-center justify-center h-24'>
                                        <p className='text-gray-500'>
                                            No history found. Generate some audio to view history.
                                        </p>
                                    </div>
                                }
                            </>
                            || <>
                                <div className='overflow-hidden relative rounded-2xl p-10 text-base text-white bg-gradient-to-br from-purple-700 to-violet-900'>
                                    {view}
                                </div>
                            </>
                        }
                    </div>
                </CardContent>
            </Card>
            <Dialog
                open={overViewPopupVisible}
                onOpenChange={e => {
                    if (!processingRef.current) {
                        setOverViewPopupVisible(e)
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>History Overview</DialogTitle>
                        <DialogDescription>
                            Play/Dowload/Delete history
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-3">
                        <div>
                            <h1 className='text-base'>
                                {overViewData.prompt || "-"}
                            </h1>
                            <p>
                                <span className="text-sm text-gray-500">
                                    Voice: {overViewData.voice || "-"}
                                </span>
                            </p>
                        </div>
                        <div className='flex items-center gap-x-2'>
                            <WxpToolTip title={"Play audio"} sparkVariant side='bottom'>
                                <Button onClick={e => handlePlayClick(overViewData.audio || "")} size="icon" className="rounded-full">
                                    <PlayIcon />
                                </Button>
                            </WxpToolTip>
                            <WxpToolTip title={"Download audio"} asChild sparkVariant={true} side='bottom' >
                                <a href={`/genie/outputs/${overViewData.audio}`} download={`generated-speech-${Date.now()}.mp3`} className={cn(buttonVariants({ size: "icon" }), "rounded-full cursor-pointer")} >
                                    <DownloadIcon />
                                </a>
                            </WxpToolTip>
                            <WxpToolTip title={"Delete from history"} sparkVariant side='bottom'>
                                <Button onClick={e => handleHistoryDeletion(overViewData.audio)} size="icon" className="rounded-full">
                                    <TrashIcon />
                                </Button>
                            </WxpToolTip>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default History;