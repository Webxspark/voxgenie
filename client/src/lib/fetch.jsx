const API = "/genie"
async function vgFetch(route, options) {
    return fetch(`${API}${route}`, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      }).catch(err => {
        throw new Error(err);
      });
  
}

export { vgFetch };