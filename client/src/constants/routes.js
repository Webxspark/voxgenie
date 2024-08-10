const DASH_BASE = "/dashboard"
const ROUTES = {
    home: "/",
    setup: "/install",
    auth: "/auth",
    dashboard: {
        _base: DASH_BASE,
        dashboard: DASH_BASE + "/app",
        train: DASH_BASE + "/train-voice",
        fileManager: DASH_BASE + "/voices/files",
        history: DASH_BASE + "/history",
    }
};

export { ROUTES };
