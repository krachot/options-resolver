# OptionsResolver

This is a port of awesome Symfony component OptionsResolver.

## Installation

```
npm install options-resolver --save
```

## Usage

```js
import createResolver from 'options-resolver';

const resolver = createResolver();
resolver
  .setDefault({
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



