import { watch } from 'chokidar';
import * as glob from 'glob';
import { BuildPluginSassConfig } from './typings/Config';
import defaultConfig from './defaultConfig';
import * as merge from 'deepmerge';
import * as fs from 'fs-extra';
import * as sass from 'node-sass';
import * as path from 'path';

const createGlobPattern = (array: string[]) => array.length === 1 ? array[0] : `{${array.join(',')}}`;

const compileSass = (filepath: string, targetPath: string) => {
  const result = sass.renderSync({
    file: filepath
  });
  fs.outputFileSync(targetPath, result.css)
}


export default (pluginOptions: Partial<BuildPluginSassConfig> = {}) => {
  const pluginConfig = merge(defaultConfig, pluginOptions);
  return async (buildConfig, isServing) => {
    if(isServing) {
      watch(pluginConfig.srcPatterns, {
        ignored: [
          "**/_*"
        ]
      }).on('all', (err, filepath) => {
        console.log(filepath);
        
        compileSass(filepath, `${buildConfig.paths.distFolder}/${pluginConfig.targetPath}/${path.basename(filepath, '.scss')}.css`)
      });
    } else {
      glob(createGlobPattern(pluginConfig.srcPatterns), {
        ignore: [
          "**/_*"
        ]
      }, (err, filepaths) => {
        
        filepaths.forEach(filepath => {
          console.log(filepaths);
          compileSass(filepath, `${buildConfig.paths.distFolder}/${pluginConfig.targetPath}/${path.basename(filepath, '.scss')}.css`)
        });
      });
    }
    
  }
};