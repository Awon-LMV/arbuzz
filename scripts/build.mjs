import {rm,mkdir,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','script.js','scene.js','experiments.css','experiments.js','assets']) await cp(file,`dist/${file}`,{recursive:true});
console.log('Built ARBUZZ → dist/');
