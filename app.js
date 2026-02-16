export default {
  async fetch() {
    return new Response('-', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};