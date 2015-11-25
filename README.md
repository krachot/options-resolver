# OptionsResolver

This is a port of awesome Symfony component OptionsResolver.

[![Build Status](https://travis-ci.org/krachot/options-resolver.svg?branch=master)](https://travis-ci.org/krachot/options-resolver)

## Installation

```
npm install options-resolver --save
```

## Usage

```js
import createResolver from 'options-resolver';

const resolver = createResolver();
resolver
  .setDefaults({
    'foo': 'bar',
    'baz': 'bam'
  })
  .setRequired('foo')
  .setAllowedTypes('foo', 'string')
  .setAllowedValues('foo', ['bar', 'one'])
;

resolver.resolve({
  'foo': 'one'
}).then((options) => {
  // options is equal to :
  // {
  //    'foo': 'one',
  //    'baz': 'bam'
  // }
});

```

## Run tests

```
npm run test
```

## TODO

* Improve documentation

## Release History

* 0.1.0 Initial release




