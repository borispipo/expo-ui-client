const path = require("path");
const src = path.resolve(__dirname,"src");
module.exports = function(api) {
  api.cache(true);
  const alias = require("@fto-consult/common/babel.config.alias")({
    platform :"expo",
  });
  alias.$session = path.resolve(src,"session");
  alias.$media = path.resolve(src,"media");
  alias.$screens = path.resolve(src,"screens");
  alias.$layouts = path.resolve(src,"layouts");
  alias.$components = path.resolve(src,"components");
  
  return {
    presets: ['babel-preset-expo'],
    plugins : [
      ["module-resolver", {"alias": alias}],
    ]
  };
};
