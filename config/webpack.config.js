const chalk = require("chalk");
const fs = require('fs');
const path = require('path');
const useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');
const tslintHtmlReport = require('tslint-html-report');
const env = process.env.IONIC_ENV;
const customEnv = process.env.ENV_NAME || process.env.IONIC_ENV;

if (env === 'prod' || env === 'dev') {

  if(customEnv !== 'qa') {
    useDefaultConfig[env].resolve.alias = {
      "@env": path.resolve(environmentPath(env))
    };
  } else {
    useDefaultConfig[env].resolve.alias = {
      "@env": path.resolve(environmentPath(customEnv))
    };    
  }

} else {

  // Default to dev config
  useDefaultConfig[env] = useDefaultConfig.dev;
  useDefaultConfig[env].resolve.alias = {
    "@env": path.resolve(environmentPath(env))
  };

}

function environmentPath(envName = 'dev') {

  let filePath = './src/environments/environment' + (envName === 'prod' ? '' : '.' + envName) + '.ts';
  tslintHtmlReport({
    tslint: 'tslint.json', // path to tslint.json
    srcFiles: 'src/**/*.ts', // files to lint
    outDir: 'reports/tslint-html-report', // output folder to write the report to.
    html: 'tslint-report.html', // name of the html report generated
    breakOnError: false, // Should it throw an error in tslint errors are found.
    typeCheck: true, // enable type checking. requires tsconfig.json
    tsconfig: 'tsconfig.json' // path to tsconfig.json
  });
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('\n' + filePath + ' does not exist!'));
  } else {
    return filePath;
  }
}

module.exports = function () {
  return useDefaultConfig;
};

/*
https://github.com/ionic-team/ionic-app-scripts/issues/1271
https://github.com/ionic-team/ionic-app-scripts/blob/master/config/webpack.config.js
module.exports = {
  dev: useDefaultConfig,
  prod: useDefaultConfig
}
*/

/*
"tabs-page": [ "pages/tabs/tabs" ]
"tabs-page": path.resolve('./src/pages/tabs/tabs.ts')
*/