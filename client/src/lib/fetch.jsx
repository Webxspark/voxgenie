const API = "http://localhost:5000"
async function vgFetch(route, options) {
  return fetch(`${API}${route}`, options)
    .then((res) => {
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    });
}

export { vgFetch };