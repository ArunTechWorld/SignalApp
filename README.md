# LMACTC - LoJack Mobile Apps on CTC

## Getting Started

* [Download the installer](https://nodejs.org/) for Node.js 6 or greater.
* Install the ionic CLI globally: `npm install -g ionic`
* Clone this repository: `git clone https://aricentcalamp@bitbucket.org/calampmobile/lmactc.git`.
* Run `npm install` from the project root.
* Run `npm start` in a terminal from the project root.
* Open the Url `http://localhost:8080/` in browser

## IDE & Setup

* [Download the latest Visual Studio Code](https://code.visualstudio.com/) IDE.
* [Install tslint](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension.
* [Install stylelint](https://marketplace.visualstudio.com/items?itemName=shinnn.stylelint) extension.
* Run `npm run lint` before build the project.

## Build


* Common code build before any platform `npm run build --enableLint false`

* iOS platform build `ionic cordova build ios`

* Android platform build `ionic cordova build android`

* Browser platform build `ionic cordova build browser`

## Documentation

* App documentation `documentation/index.html`
