const path = require("path");
const src = path.resolve(__dirname,"src");
module.exports = function(api) {
  api.cache(true);
  const alias = require("@fto-consult/common/babel.config.alias")({
    platform :"expo",
  });
  alias.$session = path.resolve(src,"session");
  alias.$media = path.resolve(src,"media");
  return {
    presets: ['babel-preset-expo'],
    plugins : [
      ["module-resolver", {"alias": alias}],
    ]
  };
};
