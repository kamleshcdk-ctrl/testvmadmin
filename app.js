export default {
  async fetch() {
    return new Response('testvmadmin', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};