export default eventHandler(async () => {
  return await runTask("send:job-status");
});
