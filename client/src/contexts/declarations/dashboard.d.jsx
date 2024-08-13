const DashboardContextDecl = {
    "audio_player": {
        state: "paused",
        track: {
            title: "",
            voice: "",
            url: "",
        },
        show: false,
        api: {
            setState: (state) => { },
            setTrack: (details) => { },
            setUrl: (url) => { },
            play: () => { },
            pause: () => { },
            stop: () => { },
            show: () => { },
            hide: () => { },
        }
    }
}

export default DashboardContextDecl;