export default {
  async fetch(request) {
    return new Response('  testvmadmin', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};