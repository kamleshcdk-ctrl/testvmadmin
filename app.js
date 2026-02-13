export default {
  async fetch(request) {
    return new Response('Hello World from testvmadmin', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};