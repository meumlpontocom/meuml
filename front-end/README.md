[![@coreui coreui](https://img.shields.io/badge/@coreui%20-coreui-lightgrey.svg?style=flat-square)](https://github.com/coreui/coreui)
[![@coreui react](https://img.shields.io/badge/@coreui%20-react-lightgrey.svg?style=flat-square)](https://github.com/coreui/react)
[![@react.js](https://img.shields.io/badge/reactjs-%5E16.13.1-blue)](https://reactjs.org)
[![@react.js](https://img.shields.io/badge/yarn-%5E1.22.19-lightblue)](https://yarnpkg.com)

[npm-coreui]: https://www.npmjs.com/package/@coreui/coreui
[npm-coreui-badge]: https://img.shields.io/npm/v/@coreui/coreui.png?style=flat-square
[npm-coreui-react]: https://www.npmjs.com/package/@coreui/react
[npm-coreui-react-badge]: https://img.shields.io/npm/v/@coreui/react.png?style=flat-square


## Installation
### Clone repo
**Only devs have access to private github repository.**

``` bash
# clone the repo
$ git clone git@gitlab.com:bitflix/front-end.git

# go into app's directory
$ cd front-end

# install app's dependencies
$ yarn
```

### Create environment file
You should use one of the following's content as .env before starting or building:
    - .env.staging (if api should point to homolog)
    - .env.production (if api should point to production)

### Basic usage

#### Local NodeJS

``` bash
$ yarn start
```

Navigate to [http://localhost:3000](http://localhost:3000). 

#### Docker
Running dev mode with "sh":
``` sh
alias run="docker run -it -p 3000:3000/tcp --volume $(pwd):/app --workdir /app node:lts-alpine"
run yarn
run yarn start
```

Both cases will run a NodeJS dev server  with hot reload at http://localhost:3000.
Wich means the app will automatically reload if you change any of the source files.

## What's included
Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this:

```
front-end
├── public/          #static files
│   └── index.html   #html template
│
├── src/             #project root
│   ├── assets/      #assets - js icons object
│   ├── containers/  #container source - template layout
|   │   ├── _nav.js  #sidebar config
|   │   └── ...      
│   ├── scss/        #user scss/css source
│   ├── views/       #views source
│   ├── App.js
│   ├── App.test.js
│   ├── polyfill.js
│   ├── Page.js
│   ├── routes.js    #routes config
│   └── store.js     #template state example 
│ 
├── README.md
├── yarn.lock
├── .gitignore
├── .env.example
└── package.json
```

# Git

## Issues
Use issues to track tasks:
    
* Titles must be brief on showing the most valuable keywords that describes the issue;
* Descriptions should summarize when the issue will be assign to yourself. Otherwise, should contain **ALL** information that might help other developer to solve it;
* Only use "Incident" as "type" if not sure about the BUG and how to fix it. Use it as a report;
* Always assign the issue to someone (even yourself);
* Always use labels:
    - <span style="color:green">PRODUCTION</span> should always be used with <span style="color:red">BUG</span>;
    - <span style="color:purple">HOMOLOG</span> should always be used with <span style="color:red">BUG</span> or <span style="color:yellow">TEST</span>;
    - <span style="color:blue">PROGRESS</span> should be always alone;
    - Issues with <span style="color:blue">PROGRESS</span> should not be closed;
    - Eventually, <span style="color:blue">PROGRESS</span> should be replaced by <span style="color:purple">HOMOLOG</span> & <span style="color:yellow">TEST</span>;
* Due dates are good but not required;
* Issues should be closed by Pull Requests.

## Branches
Patterns that must be followed when creating a new branch:

* Use hyphens instead of white spaces;
* Do not use any other special characters;
* Start the branch name with your name initial letters; 

For a developer called "Foo Bar" the "new feature" branch could be named as: **fb-new-feature**

Once the task is completed, the developer may create a Pull Request from the feature's branch to homolog's. 

**The Pull Request should be used to close one or more issues.**

## Commit types
| Commit Type | Title                    | Description                                                                                                 |
|:-----------:|--------------------------|-------------------------------------------------------------------------------------------------------------|
|   `feat`    | Features                 | A new feature                                                                                               |
|    `fix`    | Bug Fixes                | A bug Fix                                                                                                   |
|   `docs`    | Documentation            | Documentation only changes                                                                                  |
|   `style`   | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |
|   `perf`    | Performance Improvements | A code change that improves performance                                                                     |
|   `test`    | Tests                    | Adding missing tests or correcting existing tests                                                           |
|   `build`   | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |
|    `ci`     | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
|   `chore`   | Chores                   | Other changes that don't modify src or test files                                                           |
|  `revert`   | Reverts                  | Reverts a previous commit                                                                                   |

Good commit example:

    fix: updating useEffect hook's dependencies array

## CoreUI Documentation
The documentation for the CoreUI Admin Template is hosted at our website [CoreUI](https://coreui.io/docs/getting-started/introduction/)


## MeuML API's Documentation
Both Homolog and Production API's share the same documentation.

The documentation is a [Postman](https://www.postman.com)'s request collection. Also, you can count with default environment setup.

