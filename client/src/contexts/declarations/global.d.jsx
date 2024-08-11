const declarations = {
    user: {
        username: null,
        email: null,
        token: null,
        tag: null,
    },
    setUser: (user = null) => { },
    token: null,
    setToken: () => { },
    utils: {
        toast: () => { },
    },
    logout: {
        init: (status) => { },
        status: false,
    }
}

export { declarations }