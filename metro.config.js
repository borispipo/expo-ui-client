
const { getDefaultConfig } = require('expo/metro-config');
module.exports = function(options){
    const config = getDefaultConfig(__dirname);
    return config;
}