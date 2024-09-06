import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { AppContext } from '@/contexts/dashboard';
import { GlobalContext } from '@/contexts/global';
import { vgFetch } from '@/lib/fetch';
import { cn } from '@/lib/utils';
import { DownloadIcon, ExclamationTriangleIcon, PlayIcon } from '@radix-ui/react-icons';
import { Loader } from 'lucide-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import History from './ir-components/history';
import WxpToolTip from '@/components/dashboard/tooltip';

const DashboardLanding = () => {
    const { utils } = useContext(GlobalContext);
    const { audio_player, tasks, nonces } = useContext(AppContext);
    const [text, setText] = useState('');
    const [btnLoading, setBtnLoading] = useState(false);
    const [outputAudio, setOutputAudio] = useState('');
    const [voice, setVoice] = useState('');
    const [trainedVoices, setTrainedVoices] = useState([]);
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            // fetch trained voices
            vgFetch("/xtts/voices").then(resp => {
                if (resp.status == 200) {
                    console.log(resp.voices, typeof resp.voices);
                    if (typeof resp.voices === 'object' && resp.voices.length > 0) {
                        setTrainedVoices(resp.voices);
                    } else {
                        setTrainedVoices([]);
                    }
                } else {
                    console.error(resp);
                    setTrainedVoices(false);
                    utils.toast.error(resp.message || 'Something went wrong while fetching trained voices. Please try again later. [D-500]');
                }
            }).catch(err => {
                console.error(err);
                setTrainedVoices(false);
                utils.toast.error('Something went wrong while fetching trained voices. Please try again later. [D-500]');
            })
        }
    }, [])

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (text.length < 1) {
            utils.toast.error('Please enter some text to generate speech');
            return;
        }
        // validate voice
        if (voice.length < 1) {
            utils.toast.error('Please select a voice to generate speech');
            return;
        }
        setBtnLoading(true);
        setOutputAudio('');
        var reqData = {
            prompt: text,
        }
        var decodedJSON = JSON.parse(voice);
        if (decodedJSON.speaker) {
            reqData.speaker = decodedJSON.speaker;
        }
        if (decodedJSON.voice) {
            reqData.voice = decodedJSON.voice;
        }
        // tasks.api.processes.add(reqData);
        vgFetch("/app/voice", {
            method: "POST",
            body: new URLSearchParams(reqData)
        }).then(resp => {
            setBtnLoading(false);
            if (resp.status == 200) {
                utils.toast.success(resp.message);
                setOutputAudio(resp.data?.output || '');
                // setHistoryNonce(Date.now());
                nonces.api.setHistory(Date.now());
            } else {
                console.error(resp);
                utils.toast.error(resp.message || 'Something went wrong while synthesizing text to speech. Please try again later. [D-500]');
            }
        }).catch(err => {
            setBtnLoading(false);
            console.error(err);
            utils.toast.error('Something went wrong. Please try again later. [D-500]');
        })
    }
    const handlePlayAction = e => {
        audio_player.api.setTrack({
            title: 'Generated Speech',
            voice: 'Generated Voice'
        });
        audio_player.api.setUrl(`/genie/outputs/${outputAudio}`);
        audio_player.api.show();
        audio_player.api.play();
    }
    return (
        <div className='grid grid-cols-12 gap-4 items-start'>
            <Card className="md:col-span-7 col-span-12">
                <CardHeader>
                    <CardTitle>
                        Speech Synthesis (Text-to-Speech)
                    </CardTitle>
                    <CardDescription>
                        Clone your voice or use a default voice to generate speech from text.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className='space-y-4' onSubmit={handleFormSubmit}>
                        <div className='gap-x-6 flex justify-between'>
                            <Label>
                                Text
                            </Label>
                            <div className='w-full'>
                                <Textarea
                                    placeholder="Type or paste text here"
                                    rows="8"
                                    maxLength="1000"
                                    value={text}
                                    onChange={(e) => {
                                        if (e.target.value.length > 1000) return;
                                        setText(e.target.value.slice(0, 1000));
                                    }}
                                />
                                <div className='flex justify-end mt-2'>
                                    <p className={cn('text-muted-foreground text-sm', text.length >= 1000 && "text-red-500 font-bold")}>
                                        {text.length}/1000 characters
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='gap-x-6 flex justify-between'>
                            <Label>
                                Voice
                            </Label>
                            <div className='w-full'>
                                <Select onValueChange={e => setVoice(e)}>
                                    <SelectTrigger
                                        className={cn(typeof trainedVoices === 'object' && trainedVoices.length == 0 && 'animate-pulse')}
                                    >
                                        <SelectValue placeholder="Select a voice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Default Voice
                                            </SelectLabel>
                                            <SelectItem value='{"speaker":"Ana Florence"}'>Ana Florence</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Trained Voices
                                            </SelectLabel>
                                            {trainedVoices.map((voice, idx) => {
                                                var trainedVoicesList = JSON.parse(voice[2]);
                                                return <SelectItem value={`{"voice": "${voice[0]}"}`} disabled={trainedVoicesList.length == 0}>
                                                    <div className="flex items-center">
                                                        {voice[3]}
                                                        {trainedVoicesList.length == 0 && <WxpToolTip
                                                            asChild
                                                            title={"No voices trained for this speaker"}
                                                            sparkVariant
                                                        >
                                                            <ExclamationTriangleIcon className='text-red-700 h-4 w-4 ml-1' />
                                                        </WxpToolTip>}
                                                    </div>
                                                </SelectItem>
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <div className='flex justify-end mt-2'>
                                    <p className='text-muted-foreground text-sm'>
                                        Can't find the voice you're looking for? <Link to={ROUTES.dashboard.train} className='text-blue-500 hover:underline underline-offset-2'>Train a new voice</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center'>
                            <Button disabled={btnLoading} className="w-full disabled:cursor-not-allowed" >
                                {
                                    btnLoading ? <>
                                        Generating Speech
                                        <Loader className='h-4 w-4 ml-1 animate-spin' />
                                    </> :
                                        "Generate Speech"
                                }
                            </Button>
                            {
                                outputAudio.length > 0 && <div className='flex gap-x-1 ml-3'>
                                    <a
                                        className={cn(buttonVariants({ size: "icon" }), "rounded-full cursor-pointer")}
                                        href={`/genie/outputs/${outputAudio}`}
                                        download={`generated-speech-${Date.now()}.mp3`}
                                    >
                                        <DownloadIcon />
                                    </a>
                                    <Button onClick={handlePlayAction} type="button" size="icon" className="rounded-full">
                                        <PlayIcon />
                                    </Button>
                                </div>
                            }
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className='md:col-span-5 col-span-12'>
                <History dashboard />
            </div>
        </div>
    );
};

export default DashboardLanding;