# Visitu Admin - V Admin

This version of the Visitu Admin utility uses Nuxt and Vue 3 with Vite.

## Setup

Node 20.2.0 or newer must be installed. Verify the node version with the following command:

```bash
node --version
```

Make sure to install the following dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:8079` with:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```
<p>These commands can be prefixed with an environment variable for AWS Amplify specific versions
of the production build output. The build done inside AWS amplify is somewhat different than the
local production preview builds.</p>


## Environment variable configuration
<p>
Various environment variables need to be configured for the project to run correctly. One easy way
to setup the environment variables is to create a .env file in the root directory of the project. It is important that the .env file is in your .gitignore so that you do
not mistakenly add the .env file to the git repository.</p>

Here is an example .env file:
```
# Use localhost:3000 when we have a locally running instance of the Visitu graphql api on port 3000
NUXT_PUBLIC_DIRECT_GRAPHQL_URL=http://localhost:3000

# # To connect to the development/staging graphql server use:
# NUXT_PUBLIC_DIRECT_GRAPHQL_URL=https://dev-api.visitu.com

# # To connect to the production graphql server use:
# NUXT_PUBLIC_DIRECT_GRAPHQL_URL=https://api.visitu.com

NUXT_PUBLIC_MAPBOX_TOKEN=< use token here >
NUXT_PUBLIC_FORMKIT_PRO_KEY=< use token here >
NUXT_PUBLIC_AGGRID_PRO_KEY=< use token here >

NUXT_TAILSCALE_SIGNING_KEY=
```
<p>
If you have access to the AWS Amplify account then the secret tokens used in the deployments are
available there. Alternately, you can request the license tokens from another Visitu developer.</p>

## Running locally from a docker container

<p>
There is also a 'Dockerfile' in the root of this project. It should be possible to run this
application in a docker container launched from the https://github.com/visitu/docker-compose project,
just like the other containers and prior versions of the Visitu Admin. </p>


## Linting

<p>
Linting is used in the continuous integration build pipeline. It is important that you check to see if the code passes the mostly standard Nuxt eslint rules as well as the strict typechecking rules before you create a pull request.</p>

<p>
If linting fails, the build will not be deployed when a pull request is created. Ideally, linting and typechecking will be setup in your IDE to match the linting and typechecking that is done in the package.json with the following commands:</p>

```bash
# npm
npm run lint
```

```bash
# npm
npm run typecheck
```
<p>
Neither eslint warnings nor prettier code format issues will cause the build to fail.
Only eslint errors and type checking errors will stop the build from being deployed.</p>

<p>
VS Code, or whatever IDE is used, should be setup to show eslint warnings
and to auto-format the code using a standard eslint-prettier configuration.
It can be annoying when each developer has different whitespace auto-formatting.
If developers do not all have auto-formatting enabled that follows the same rules, then
a single line change in a file might show a bunch of other whitespace and indent auto-format
changes in the git diff tool. So it is best to avoid that problem by having a matching code
auto-format setup for everyone.</p>

## Strict Type Checking
<p>
This project is configured to require strict typescript types. If there is a type error and
you do not want to deal with adding correct types, you can turn off type checking for a
single line. You can use the following type of comment with an explanation of what the
type will eventually be:</p>

```javascript
// @ts-expect-error (explain why we expect a type error)
```

Sometimes in a Vue template a type error can be skipped with:
```
<!-- @vue-expect-error (explain why we expect an error) -->
```

Strict type checking is set in the nuxt.config.ts file.

Some lint errors can be auto-fixed with the following command:
```bash
npm run lintfix
```

# Project IDE setup
<p>
This section covers VS Code as one potential setup for a code editor.
Everything in this section could be accomplished using JetBrains Webstorm, vim, or any number of
other development environment setups.</p>

## Code formatting setup in VS Code

<p>
Code formatting is recommended although not enforced in the build. The correct extensions for
Nuxt Vue 3 linting and code formatting are less obvious due to the transition to new recommended
tools. Vetur was recommended in Vue 2 and Volar was recommended in Vue 3. However, the Volar
VS Code plugin is also deprecated in favor of a "Vue Official : Language Support for Vue" extension.
This can be confusing because the official language support for Vue seems to include the
correct modern version of Volar as if Volar has been merged into the "Vue Official" VS Code extension.
</p>

<p>
To setup formatting on save for typescript files it is recommended to use the built in VS Code
typescript formatting. This will enable automatically removing extra spaces around brackets
and similar code auto-formatting in '.ts' files like a definition file for a Vue 3 composable. </p>

<p>
Use < command > < shift > P in VS Code to bring up the command search, and type Format Document to
manually trigger the document formatting. If the formatter is not setup you will be prompted
to choose a formatter. Choose the following one if it is available :</p>

```
TypeScript and JavaScript Language Features VS Code.typescript-language-features
```
Maybe "Vue - Official Vue.volar" is a better choice.

<p>
One key setting is to use the "Vue - Official" language pack, which may be a version of Volar as
the code formatter. If you open settings and search for "format" you will see an option
called "Editor: Default Formatter" which should be set to "Vue - Official". There is also
an option for "Editor: Format On Save" which is nice to have enabled.</p>

<p>
Ultimately there are configurations using the standard VS Code user or workspace settings
checkboxes and also there is json configuration file in ~/.vscode/settings.json and in
the project directory .vscode/settings.json file. Here are some settings that go in a
VS Code settings.json file:</p>


```
  "editor.defaultFormatter": "Vue.volar",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.format.enable": true,
  "prettier.eslintIntegration": true,
  "prettier.tslintIntegration": true,
  "[typescript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  "[javascript]": {
    "editor.defaultFormatter": "vscode.typescript-language-features"
  },
  "scss.lint.unknownAtRules": "ignore",
```

The following is an example of the VS Code plugins that you might want to have installed:
```
Apollo GraphQL
Auto Import
Code Spell Checker
DotEnv
EditorConfig for VS Code
Error Lens
EsLint
GitLess
ImportCost
Npm Intellisense
Path Intellisense
Prettier+
SCSS Formatter
Tailwind CSS IntelliSense
VsCode Prettier ESLint
Vue - Official
Vue 3 Pack
```
<p>
Note that neither 'Volar' nor 'Vetur' VS Code plugins are in that plugin list directly.
One of these plugins would have needed to be installed when using earlier Vue versions. </p>

# Continuous integration and automated deployment

This project is setup to deploy Nuxt with server side rendering using AWS Amplify.

## Triggering builds and development/staging deployment

<p>
There is a development/staging AWS Amplify and a production AWS Amplify app that are both deployed
from interaction with the https://github.com/visitu/vadmin repository.</p>

<p>
The production app with a url of vadmin.visitu.xyz lives in the visitu-prod account. The
development/staging app with a url of vadmin-stage.visitu.xyz lives in the AWS visitu-dev account.
The development/staging app points to the development/staging graphql api and the production
app points to the production graphql api, as you might expect.</p>

<p>
Within the development/staging environment feature branch builds are triggered automatically
when a pull request is created on github. Feature branch builds have a url that is randomly
generated by AWS Amplify, and this url is posted in the pull request by the AWS Amplify bot. </p>

<p>
To find the url for the feature branch deployment of this admin utility, look for a comment
on the pull request like this one:</p>

```
This pull request is automatically being deployed by Amplify Hosting (learn more).

Access this pull request here: https://pr-3.d1p8krmxeixid9.amplifyapp.com
```
<p>
The lint and tests are run in the AWS amplify build, rather than directly in github actions.
Therefore, you may need to look at the build logs in the AWS web console for Amplify to
see any lint or test run errors that might have broken a build, rather than in Github Actions.
Within the pull request there is a link to the app in AWS Amplify, although a developer will
need access to the AWS console to see why any particular build has failed. </p>

<p>
Once the pull request is merged into the main branch, a deployment to vadmin-stage.visitu.xyz
will be triggered. None of the staging environments are available on the public internet, rather
they are protected by a weak 'basic auth' password. The username is 'Visitu' and the password
that can be set in the AWS console Amplify app configuration pages. The password to see the deployed development/staging and feature branch versions is currently set to the following:</p>

```
RgCB&gi2
```

## Production deployment

<p>
Much like the https://github.com/visitu/api graphql api project, you trigger a production
deployment by incrementing the version number of the project using npm and creating
a git tag for the current commit, and then pushing that tag to the github repository.
These are the commands to trigger a production release:</p>

```bash
npm version patch
git push
git push --tags
```


### Cloudflare secrets:
The cloudflare secrets for the tailscale auth token has a problem where the "\" in the token is treated as an escape instead of a backslash, changeing the token as it is used in the code so that it is not the expected token value. So any "\" must be replaced with "\\". It also appears that the use of the token only works correctly if it is first saved as a cloudflare environment variable and then later converted to a secret after it is verified to have worked. This part might be supersition though, and varies depening on if the secret variable is setup through the cloudflare console or through a wranger deployment.

### Environment variables:
A new environment variable has to be setup in a number of places when the project is deployed to cloudflare. First, it needs to either be a secret or an environment in the github repository configuration.

Second, it has to exist with a blank value in the wrangler.jsonc file in the project.

Third, the github action needs to read the value from github and replace it within the wrangler.json file in the .github/workflows/*.yml file for the github action. The jq command is used to replace the variable. Alternately, a secret needs to have an entry in the 'env:' section at the top of the github action and an entry in the cloudflare/wrangler-action@v3 deployment action.

Finally, the nuxt.config.ts file 'runtimeConfig' section needs to map that env variable to a public or server only availability. There is an alternative to this step if the variable is named a certain way starting with 'NUXT_', although adding the environment variable to the runtimeConfig section is recommended. This allows the variable to be available on the config object using "const config = useRuntimeConfig()" within a Vue component or server side endpoint.
