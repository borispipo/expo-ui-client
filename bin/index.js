#!/usr/bin/env node

/**
  toujours ajouter l'instruction ci-dessus à la première ligne de chaque script npx
  @see : https://blog.shahednasser.com/how-to-create-a-npx-tool/ 
  @see : https://www.npmjs.com/package/commander, for command parsing
*/
'use strict';

const { program } = require('commander');

const packageObj = require("../package.json");
const dir = path.resolve(__dirname,"..");
const appJSON = require(path.resolve(dir,"app.json"));
const version = packageObj.version;
const packageName = packageObj.name;
const path = require("path");
const fs = require("fs");
const {exec,thowError,copy,writeFile,createDirSync,FILE:{sanitizeFileName},JSONFileManager} = require("@fto-consult/node-utils");
program
  .name(packageName)
  .description(`Utilitaire cli lié au framework ${packageName}`)
  .version(version);
  
program.command('init')
  .description(`crèe et initialise une application ${packageName}`)
  .argument('<appName>', 'le nom de l\'application à initialiser')
  .option('-r, --project-root [dir]', 'le project root de l\'application')
  .action((appName, options) => {
    const projectRoot = path.resolve(process.cwd(),appName);
    console.log("création du répertoire de l'application "+appName);
    createDirSync(projectRoot);
    ["assets","src","App","babel.config.js","metro.config.js"].map((p)=>{
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
                fs.writeFileSync(destPackageJson,JSON.stringify(packageObj,null,2));
            } catch{ }
        }
        if(!fs.existsSync(destAppJSON)){
            appJSON.name = appName;
            appJSON.slug = appName.trim().toLowerCase();
            try {
                fs.writeFileSync(destAppJSON,JSON.stringify(appJSON,null,2));
            } catch{ }
        }
        if(fs.existsSync(destPackageJson)){
            console.log("installation des packages....");
            exec(`npm install`,{projectRoot}).finally(()=>{
                console.log("application "+appName+" créée.");
            });
        }
        
    });
  });
