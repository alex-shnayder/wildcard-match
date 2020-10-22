<br>

<h1 align="center">wildcard-match</h1>

<p align="center">
  <strong>A tiny but extremely fast JavaScript library for matching basic glob patterns</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/wildcard-match"><img src="https://img.shields.io/npm/v/wildcard-match" alt="npm package"></a>
  &nbsp;
  <a href="https://github.com/axtgr/wildcard-match/actions"><img src="https://img.shields.io/github/workflow/status/axtgr/wildcard-match/CI?label=CI&logo=github" alt="CI"></a>
  &nbsp;
  <a href="https://www.buymeacoffee.com/axtgr"><img src="https://img.shields.io/badge/%F0%9F%8D%BA-Buy%20me%20a%20beer-red?style=flat" alt="Buy me a beer"></a>
</p>

<br>

Wildcard-match takes one or more basic glob patterns, compiles them into a RegExp and returns a function for matching strings with it.

Glob patterns are strings that contain `?`, `*` and `**` wildcards. When such a pattern is compared with another string, these wildcards can replace one or more symbols. For example, `src/*` would match both `src/foo` and `src/bar`.

This library's goal is to be as small and as fast as possible while supporting only the most basic wildcards. If you need character ranges, extended globs, braces and other advanced features, check out [outmatch](https://github.com/axtgr/outmatch).

## Quickstart

```
npm install wildcard-match
```

```js
import wcmatch from 'wildcard-match'

const isMatch = wcmatch('src/**/*.?s')

isMatch('src/components/header/index.js') //=> true
isMatch('src/README.md') //=> false

isMatch.pattern //=> 'src/**/*.?s'
isMatch.options //=> { separator: true }
isMatch.regexp //=> /^src[/\\]+?(?:[^/\\]*?[/\\]+?)*?[^/\\]*?\.[^/\\]s[/\\]*?$/
```

More details are available in the [Installation](#installation), [Usage](#usage) and [API](#api) sections.

## Features

<table>
  <tr>
    <td align="center">🍃</td>
    <td><strong>Lightweight</strong><br>No dependencies. Just <strong>750</strong> bytes when minified and gzipped</td>
  </tr>
  <tr>
    <td align="center">🏎</td>
    <td><strong>Fast</strong><br>Compiles and matches patterns faster than any other known library</td>
  </tr>
  <tr>
    <td align="center">🌞</td>
    <td><strong>Simple</strong><br>The API is a single function. The number of available options is <strong>1</strong></td>
  </tr>
  <tr>
    <td align="center">⚒</td>
    <td><strong>Reliable</strong><br>Written in TypeScript. Covered by hundreds of unit tests</td>
  </tr>
  <tr>
    <td align="center">🔌</td>
    <td><strong>Compatible</strong><br>Works in any ES5 environment including older versions of Node.js, Deno, React Native and browsers</td>
  </tr>
</table>

For comparison with the alternatives, see the [corresponding section](#comparison).

## Installation

The package is distributed via the npm package registry. It can be installed using one of the compatible package managers or included directly from a CDN.

#### [npm](https://www.npmjs.com)

```
npm install wildcard-match
```

#### [Yarn](https://yarnpkg.com)

```
yarn add wildcard-match
```

#### [pnpm](https://pnpm.js.org)

```
pnpm install wildcard-match
```

#### CDN

When included from a CDN, wildcard-match is available as the global function `wcmatch`.

- [unpkg](https://unpkg.com/wildcard-match)
- [jsDelivr](https://www.jsdelivr.com/package/npm/wildcard-match)

## Usage

Wildcard-match comes built in ESM, CommonJS and UMD formats and includes TypeScript typings. The examples use ESM imports, which can be replaced with the following line for CommonJS: `const wcmatch = require('wildcard-match')`.

The default export is a function of two arguments, first of which can be either a single glob string or an array of such patterns. The second argument is optional and can be either an [options](#options) object or a separator (which will be the value of the `separator` option). Wildcard-match compiles them into a regular expression and returns a function (usually called `isMatch` in the examples) that tests strings against the pattern. The pattern, options and the compiled RegExp object are available as properties on the returned function:

```js
import wcmatch from 'wildcard-match'

const isMatch = wcmatch('src/?ar', '@')

isMatch('src/bar') //=> true
isMatch('src/car') //=> true
isMatch('src/cvar') //=> false

isMatch.pattern //=> 'src/?ar'
isMatch.options //=> { separator: '@' }
isMatch.regexp //=> /^src\/+?[^/]ar\/*?$/
```

The returned function can be invoked immediately if there is no need to match a pattern more than once:

```js
wcmatch('src/**/*.js')('src/components/body/index.js') //=> true
```

Compiling a pattern is much slower than comparing a string to it, so it is recommended to always reuse the returned function when possible.

### Syntax

Wildcard-match supports the following glob syntax in patterns:

- `?` matches exactly one arbitrary character excluding separators
- `*` matches zero or more arbitrary characters excluding separators
- `**` matches any number of segments when used as a whole segment in a separated pattern (e.g. <code>/\*\*/</code> if <code>/</code> is the separator)
- `\` escapes the following character making it be treated literally

More features are available in the [outmatch](https://github.com/axtgr/outmatch) library.

### File Paths and Separators

Globs are most often used to search file paths, which are, essentially, strings split into segments by slashes. While other libraries are usually restricted to this use-case, wildcard-match is able to work with _arbitrary_ strings by accepting a custom separator as the second parameter:

```js
const matchDomain = wcmatch('*.example.com', { separator: '.' })
matchDomain('subdomain.example.com') //=> true

const matchLike = wcmatch('wh?t like**like mean', { separator: 'like' })
matchLike('what like do like you like mean') //=> true
```

The only limitation is that backslashes `\` cannot be used as separators in patterns because
wildcard-match uses them for character escaping. However, when `separator` is `undefined`
or `true`, `/` in patterns will match both `/` and `\`, so a single pattern with forward
slashes can match both Unix and Windows paths:

```js
const isMatchA = outmatch('foo\\bar') // throws an error

const isMatchB = outmatch('foo/bar') // same as passing `true` as the separator

isMatchB('foo/bar') //=> true
isMatchB('foo\\bar') //=> true

const isMatchC = outmatch('foo/bar', '/')

isMatchC('foo/bar') //=> true
isMatchC('foo\\bar') //=> false
```

Matching features work with a _segment_ rather than a whole pattern:

```js
const isMatch = wcmatch('foo/b*')

isMatch('foo/bar') //=> true
isMatch('foo/b/ar') //=> false
```

Segmentation can be turned off completely by passing `false` as the separator, which makes wildcard-match treat whole patterns as a single segment. Slashes become regular symbols and `*` matches _anything_:

```js
const isMatch = wcmatch('foo?ba*', false)
isMatch('foo/bar/qux') //=> true
```

A single separator in a pattern will match any number of separators in a sample string:

```js
wcmatch('foo/bar/baz')('foo/bar///baz') //=> true
```

When a pattern has an explicit separator at its end, samples also require one or more trailing separators:

```js
const isMatch = wcmatch('foo/bar/')

isMatch('foo/bar') //=> false
isMatch('foo/bar/') //=> true
isMatch('foo/bar///') //=> true
```

However, if there is no trailing separator in a pattern, strings will match even if they have separators at the end:

```js
const isMatch = wcmatch('foo/bar')

isMatch('foo/bar') //=> true
isMatch('foo/bar/') //=> true
isMatch('foo/bar///') //=> true
```

### Multiple Patterns

Wildcard-match can take an array of glob patterns as the first argument instead of a single pattern. In that case a string will be considered a match if it matches _any_ of the given patterns:

```js
const isMatch = wcmatch(['src/*', 'tests/*'])

isMatch('src/utils.js') //=> true
isMatch('tests/utils.js') //=> true
```

### Matching Arrays of Strings

The returned function can work with arrays of strings when used as the predicate of the native array methods:

```js
const isMatch = wcmatch('src/*.js')
const paths = ['readme.md', 'src/index.js', 'src/components/body.js']

paths.map(isMatch) //=> [ false, true, false ]
paths.filter(isMatch) //=> [ 'src/index.js' ]
paths.some(isMatch) //=> true
paths.every(isMatch) //=> false
paths.find(isMatch) //=> 'src/index.js'
paths.findIndex(isMatch) //=> 1
```

## API

### wcmatch(patterns, options?): isMatch<br>wcmatch(patterns, separator?): isMatch

Takes a single pattern string or an array of patterns and compiles them into a regular expression. Returns an isMatch function that takes a sample string as its only argument and returns true if the string matches the pattern(s).

### isMatch(sample): boolean

Tests if a sample string matches the patterns that were used to compile the regular expression and create this function.

### isMatch.regexp

The compiled regular expression.

### isMatch.pattern

The original pattern or array of patterns that was used to compile the regular expression and create the isMatch function.

### isMatch.options

The options object that was used to compile the regular expression and create the isMatch function.

### Options

| Option      | Type              | Default Value | Description                                                                                                                                                                                          |
| ----------- | ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `separator` | boolean \| string | true          | Defines the separator used to split patterns and samples into segments<ul><li>`true` — `/` in patterns match both `/` and `\` in samples<li>`false` — don't split<li>_any string_ — custom separator |

## Comparison

```
Pattern: src/test/**/*.?s
Sample: src/test/foo/bar.js

Compilation
  wildcard-match     1,046,326 ops/sec
  picomatch            261,589 ops/sec

Matching
  wildcard-match     34,646,993 ops/sec
  picomatch          10,750,888 ops/sec
```

A better comparison is in the works.
