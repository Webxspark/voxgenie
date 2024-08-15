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
            setTrack: (details = {title: "", voice: ""}) => { },
            setUrl: (url) => { },
            play: () => { },
            pause: () => { },
            stop: () => { },
            show: () => { },
            hide: () => { },
        }
    },
    tasks: {
        processes: [],
        onGoing: [],
        api: {
            processes: {
                add: (process) => { },
                clear: () => { },
            },
            onGoing: {
                add: (process) => { },
                clear: () => { },
            }
        }
    },
    nonces: {
        history: "",
        api: {
            setHistory: (nonce) => {}
        }
    }
}

export default DashboardContextDecl;