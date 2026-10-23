export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const lastSegment = url.pathname.split("/").pop() || "";
    const isPageRequest =
      request.method === "GET" &&
      (request.mode === "navigate" ||
        url.pathname === "/" ||
        !lastSegment.includes("."));

    // Always serve the built Vite entry point for page routes. This avoids
    // accidentally returning the repository's unbuilt source index.html.
    if (isPageRequest) {
      url.pathname = "/index.html";
      return env.ASSETS.fetch(
        new Request(url.toString(), { headers: request.headers })
      );
    }

    return env.ASSETS.fetch(request);
  },
};
