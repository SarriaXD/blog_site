// www.<domain> → <domain>, keeping path and query. 308 like Vercel did.
// Shared by every zone whose www host is bound to this Worker
// (www.sarria.ca, www.311trspa.com).
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = url.hostname.replace(/^www\./, "");
    return Response.redirect(url.toString(), 308);
  },
};
