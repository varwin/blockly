# Varwin Blockly

This is a fork of Google Blockly with modifications for [Varwin](https://varwin.com/).
The main feature of Varwin Blockly: "Modules" (`/core/module.*`)

## Algorithm for updating the repository

1. Pulling changes from `google/blockly` (Github will offer to do this itself if it finds new commits in master `google/blockly`)
2. If there are conflicts, a PR will be created for the merge
3. Go to the merge branch and resolve all conflicts
4. Run ```npm run build```
5. Run the local playground, which is located in `tests/playground.html`
6. If errors are found, then go to step 3 and solve the problems that have arisen. Pay attention to the section with common problems below.
7. Run ```npm run package```
8. Go to the `dist` directory
9. In file `/dist/package.json` check package name and update version
10. `npm config set registry https://registry.npmjs.org/`
11. Run `npm publish`

## Updating locales after build for Linux
1. Run ```npm run build```
2. Run ```npm run package```
3. Go to the `dist` directory
4. In file `/dist/package.json` check package name and update version
5. In msg files `/dist/msg/*.js` change `define(['Blockly'], factory);` to `define(['blockly'], factory);`
6. `npm config set registry https://registry.npmjs.org/`
7. Run `npm publish`

## How convenient it is to test Varwin Blockly right away in RMS

You can call `gulp package` with the argument `--output "path"` where `path` is the path to the `blockly` folder in `node_modules` RMS.
Note that the path must be relative to the root of the Varwin Blockly repository.

Those.

1. Making edits in Varwin Blockly
2. Run ```npm run package:copy --  --dest /c/Users/USER/dev/rms/node_modules/blockly```
3. Run the RMS build (or hot reload will pull up node_modules by itself)

## Frequent problems

### Playground cannot find files

Go to the file `/blockly_uncompresed.js` and fix the paths to the files.

### Build crashes with the error "No supported platform for closure-compiler found"

You can try installing the unsupported package `google-closure-compiler-js`.
Then go into `node_modules/google-closure-compiler/lib/utils.js` and always return in the `getFirstSupportedPlatform` method
`"google-closure-compiler-js"`.

This will build the package using node.js, but it's slower, but it works. For now.

=======

# Blockly [![Build Status]( https://travis-ci.org/google/blockly.svg?branch=master)](https://travis-ci.org/google/blockly)

Google's Blockly is a library that adds a visual code editor to web and mobile apps. The Blockly editor uses interlocking, graphical blocks to represent code concepts like variables, logical expressions, loops, and more. It allows users to apply programming principles without having to worry about syntax or the intimidation of a blinking cursor on the command line. All code is free and open source.

![](https://developers.google.com/blockly/images/sample.png)

## Getting Started with Blockly

Blockly has many resources for learning how to use the library. Start at our [Google Developers Site](https://developers.google.com/blockly) to read the documentation on how to get started, configure Blockly, and integrate it into your application. The developers site also contains links to:

- [Getting Started article](https://developers.google.com/blockly/guides/get-started/web)
- [Getting Started codelab](https://blocklycodelabs.dev/codelabs/getting-started/index.html#0)
- [More codelabs](https://blocklycodelabs.dev/)
- [Demos and plugins](https://google.github.io/blockly-samples/)

Help us focus our development efforts by telling us [what you are doing with
Blockly](https://developers.google.com/blockly/registration). The questionnaire only takes
a few minutes and will help us better support the Blockly community.

### Installing Blockly

Blockly is [available on npm](https://www.npmjs.com/package/blockly).

```bash
npm install blockly
```

For more information on installing and using Blockly, see the [Getting Started article](https://developers.google.com/blockly/guides/get-started/web).

### Getting Help

- [Report a bug](https://developers.google.com/blockly/guides/modify/contribute/write_a_good_issue) or file a feature request on GitHub
- Ask a question, or search others' questions, on our [developer forum](https://groups.google.com/forum/#!forum/blockly). You can also drop by to say hello and show us your prototypes; collectively we have a lot of experience and can offer hints which will save you time. We actively monitor the forums and typically respond to questions within 2 working days.

### blockly-samples

We have a number of resources such as example code, demos, and plugins in another repository called [blockly-samples](https://github.com/google/blockly-samples/). A plugin is a self-contained piece of code that adds functionality to Blockly. Plugins can add fields, define themes, create renderers, and much more. For more information, see the [Plugins documentation](https://developers.google.com/blockly/guides/plugins/overview).

## Contributing to Blockly

Want to make Blockly better? We welcome contributions to Blockly in the form of pull requests, bug reports, documentation, answers on the forum, and more! Check out our [Contributing Guidelines](https://developers.google.com/blockly/guides/modify/contributing) for more information. You might also want to look for issues tagged "[Help Wanted](https://github.com/google/blockly/labels/help%20wanted)" which are issues we think would be great for external contributors to help with.

## Releases

We release by pushing the latest code to the master branch, followed by updating the npm package, our [docs](https://developers.google.com/blockly), and [demo pages](https://google.github.io/blockly-samples/). If there are breaking bugs, such as a crash when performing a standard action or a rendering issue that makes Blockly unusable, we will cherry-pick fixes to master between releases to fix them. The [releases page](https://github.com/google/blockly/releases) has a list of all releases.

We use [semantic versioning](https://semver.org/). Releases that have breaking changes or are otherwise not backwards compatible will have a new major version. Patch versions are reserved for bug-fix patches between scheduled releases.

We now have a [beta release on npm](https://www.npmjs.com/package/blockly?activeTab=versions). If you'd like to test the upcoming release, or try out a not-yet-released new API, you can use the beta channel with:

```bash
npm install blockly@beta
```

As it is a beta channel, it may be less stable, and the APIs there are subject to change.

### Branches

There are two main branches for Blockly.

**[master](https://github.com/google/blockly)** - This is the (mostly) stable current release of Blockly.

**[develop](https://github.com/google/blockly/tree/develop)** - This is where most of our work happens. Pull requests should always be made against develop. This branch will generally be usable, but may be less stable than the master branch. Once something is in develop we expect it to merge to master in the next release.

**other branches:** - Larger changes may have their own branches until they are good enough for people to try out. These will be developed separately until we think they are almost ready for release. These branches typically get merged into develop immediately after a release to allow extra time for testing.

### New APIs

Once a new API is merged into master it is considered beta until the following release. We generally try to avoid changing an API after it has been merged to master, but sometimes we need to make changes after seeing how an API is used. If an API has been around for at least two releases we'll do our best to avoid breaking it.

Unreleased APIs may change radically. Anything that is in `develop` but not `master` is subject to change without warning.

## Issues and Milestones

We typically triage all bugs within 1 week, which includes adding any appropriate labels and assigning it to a milestone. Please keep in mind, we are a small team so even feature requests that everyone agrees on may not be prioritized.

## Good to Know

- Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
- We test browsers using [BrowserStack](https://browserstack.com)
