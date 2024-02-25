#!/usr/bin/env node

/**
  toujours ajouter l'instruction ci-dessus à la première ligne de chaque script npx
  @see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ 
  @see : https://www.npmjs.com/package/commander, for command parsing
*/
'use strict';

const { program } = require('commander');
const path = require("path");
const fs = require("fs");
const packageObj = require("../package.json");
const dir = path.resolve(__dirname,"..");
const appJSON = require(path.resolve(dir,"app.json"));
const version = packageObj.version;
const packageName = packageObj.name;
const {exec,thowError,copy,writeFile,createDirSync} = require("@fto-consult/node-utils");

const script = process.argv[2];
const appName = process.argv[3];

if(!script || script !=="init"){
    throw "Vous devez spécifier la tâche que vous souhaitez faire via l'un des scripts : "+["init"].join(",");
}
if(!appName || !appName.trim()){
    throw "Vous devez spécifier le nom de l'application à initialiser"
}

const projectRoot = path.resolve(process.cwd(),appName);
console.log("création du répertoire de l'application "+appName);
createDirSync(projectRoot);
["assets","src","App.js","babel.config.js","metro.config.js"].map((p)=>{
    copy(path.resolve(dir,p),path.resolve(projectRoot,p));
    const destGitIgnore = path.resolve(projectRoot,".gitignore");
    try {
        if(!fs.existsSync(destGitIgnore)){
            fs.copyFileSync(path.resolve(dir,".gitignore"),destGitIgnore);
        }
    } catch{}
    const destPackageJson = path.resolve(projectRoot,"package.json");
    const destAppJSON = path.resolve(projectRoot,"app.json");
    if(!fs.existsSync(destPackageJson)){
        packageObj.name = appName;
        packageObj.version = "1.0.0";
        try {
            writeFile(destPackageJson,JSON.stringify(packageObj,null,2));
        } catch{ }
    }
    if(!fs.existsSync(destAppJSON)){
        appJSON.expo.name = appName;
        appJSON.expo.slug = appJSON.expo.scheme = appName.trim().toLowerCase();
        appJSON.expo.version = "1.0.0";
        try {
            writeFile(destAppJSON,JSON.stringify(appJSON,null,2));
        } catch{ }
    }
    if(fs.existsSync(destPackageJson)){
        console.log("installation des packages....");
        exec(`npm install`,{projectRoot}).finally(()=>{
            console.log("application "+appName+" créée.");
        });
    }
    
});
