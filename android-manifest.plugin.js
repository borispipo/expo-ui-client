const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androiManifestPlugin(config) {
  return withAndroidManifest(config, async (config) => {
    const application = config.modResults.manifest.application[0];
    application.$ = typeof application.$ =="object" && application.$ || {};
    application.$["android:usesCleartextTraffic"] = true;
    return config;
  });
};