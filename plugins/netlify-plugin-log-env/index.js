module.exports = {
  onPreBuild() {
    console.log("LOG HOOK DATA:", process.env.INCOMING_HOOK_BODY);
  },
}
