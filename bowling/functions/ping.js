// Public reachability check, no data. Used to tell a network problem apart
// from a bad link: if this loads but the private link does not, the link is
// the issue.
export function onRequest() {
  return new Response("ok " + new Date().toISOString(), {
    headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
  });
}
