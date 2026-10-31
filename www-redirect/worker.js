// www.sarria.ca → sarria.ca, keeping path and query. 308 like Vercel did.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = "sarria.ca";
    return Response.redirect(url.toString(), 308);
  },
};
