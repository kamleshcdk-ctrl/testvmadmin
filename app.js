export default {
  async fetch(request) {
    return new Response('Hello GIT testvmadmin', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};