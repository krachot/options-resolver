import {expect} from 'chai';
import _ from 'lodash';

import createResolver from '../src';

describe('Create Resolver', () => {
  var resolver;

  beforeEach(function() {
    resolver = createResolver();
  });

  describe('resolve', () => {

    it('fails is option does not exist', (done) => {
      resolver.setDefault('z', '1');
      resolver.setDefault('a', '2');

      expect(resolver.resolve({
        'foo': 'bar'
      }))
      .be.rejectedWith('The option(s) "foo" do not exist. Defined options are: "a", "z"')
      .notify(done);

    });

    it('fails if multiple options do not exist', (done) => {
      resolver.setDefault('z', '1');
      resolver.setDefault('a', '2');

      expect(resolver.resolve({
        'ping': 'pong',
        'foo': 'bar',
        'baz': 'bam'
      }))
      .be.rejectedWith('The option(s) "baz", "foo", "ping" do not exist. Defined options are: "a", "z"')
      .notify(done);

    });

  });

  describe('setDefault(s)', () => {
    it('set default returns this', () => {
      expect(resolver).to.equal(resolver.setDefault('foo', 'bar'));
    });

    it('resolve default options', (done) => {
      resolver.setDefaults({
        'one': '1',
        'two': '2'
      });

      expect(resolver.resolve()).to.eventually.deep.equal({
        'one': '1',
        'two': '2'
      }).notify(done);
    });
  });

  describe('hasDefault', () => {
    it('has default', () => {
      expect(resolver.hasDefault('foo')).to.be.false;
      resolver.setDefault('foo', 'bar');
      expect(resolver.hasDefault('foo')).to.be.true;
    });

    it('has default with null value', () => {
      expect(resolver.hasDefault('foo')).to.be.false;
      resolver.setDefault('foo', null);
      expect(resolver.hasDefault('foo')).to.be.true;
    });
  });

  describe('setRequired', () => {
    it('return resolver', () => {
      expect(resolver).to.equal(resolver.setRequired('foo'));
    });

    it('fail to resolve if they have missing required option', (done) => {
      resolver.setRequired('foo');
      expect(resolver.resolve()).be.rejected.notify(done);
    });

    it('resolve if required option set', (done) => {
      resolver.setRequired('foo');
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).be.fulfilled.notify(done);
    });

    it('resolve if required option passed', (done) => {
      resolver.setRequired('foo');

      expect(resolver.resolve({'foo': 'bar'})).be.fulfilled.notify(done);
    });
  });

  describe('isRequired', () => {
    it('is required', () => {
      expect(resolver.isRequired('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isRequired('foo')).to.be.true;
    });

    it('required if set before', () => {
      expect(resolver.isRequired('foo')).to.be.false;
      resolver.setDefault('foo', 'bar');
      resolver.setRequired('foo');
      expect(resolver.isRequired('foo')).to.be.true;
    });

    it('still required after set', () => {
      expect(resolver.isRequired('foo')).to.be.false;
      resolver.setRequired('foo');
      resolver.setDefault('foo', 'bar');
      expect(resolver.isRequired('foo')).to.be.true;
    });

    it('is not required after remove', () => {
      expect(resolver.isRequired('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isRequired('foo')).to.be.true;
      resolver.remove('foo');
      expect(resolver.isRequired('foo')).to.be.false;
    });

    it('is not required after clear', () => {
      expect(resolver.isRequired('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isRequired('foo')).to.be.true;
      resolver.clear();
      expect(resolver.isRequired('foo')).to.be.false;
    });
  });

  describe('getRequired', () => {
    it('get required options', () => {
      resolver.setRequired(['foo', 'bar']);
      resolver.setDefault('bam', 'baz');
      resolver.setDefault('foo', 'boo');

      expect(resolver.getRequiredOptions()).to.deep.equal(['foo', 'bar']);
    });
  });

  describe('isMissing', () => {
    it('is missing if not set', () => {
      expect(resolver.isMissing('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isMissing('foo')).to.be.true;
    });

    it('is not missing if set', () => {
      resolver.setDefault('foo', 'bar');
      expect(resolver.isMissing('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isMissing('foo')).to.be.false;
    });

    it('is not missing after remove', () => {
      resolver.setRequired('foo');
      resolver.remove('foo');
      expect(resolver.isMissing('foo')).to.be.false;
    });

    it('is not missing after clear', () => {
      resolver.setRequired('foo');
      resolver.clear();
      expect(resolver.isMissing('foo')).to.be.false;
    });
  });

  describe('getMissingOptions', () => {
    it('get missing options', () => {
      resolver.setRequired(['foo', 'bar']);
      resolver.setDefault('bam', 'baz');
      resolver.setDefault('foo', 'boo');
      expect(resolver.getMissingOptions()).to.deep.equal(['bar']);
    });
  });

  describe('setDefined', () => {
    it('defined options not included in resolved options', (done) => {
      resolver.setDefined('foo');
      expect(resolver.resolve()).to.eventually.deep.equal({}).notify(done);
    });

    it('defined options included if default set before', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setDefined('foo');
      expect(resolver.resolve()).to.eventually.deep.equal({'foo': 'bar'}).notify(done);
    });

    it('defined options included if default set after', (done) => {
      resolver.setDefined('foo');
      resolver.setDefault('foo', 'bar');
      expect(resolver.resolve()).to.eventually.deep.equal({'foo': 'bar'}).notify(done);
    });

    it('defined options included if passed to resolve', (done) => {
      resolver.setDefined('foo');
      expect(resolver.resolve({'foo': 'bar'})).to.eventually.deep.equal({'foo': 'bar'}).notify(done);
    });
  });

  describe('isDefined', () => {
    it('is defined', () => {
      expect(resolver.isDefined('foo')).to.be.false;
      resolver.setDefined('foo');
      expect(resolver.isDefined('foo')).to.be.true;
    });

    it('required options are defined', () => {
      expect(resolver.isDefined('foo')).to.be.false;
      resolver.setRequired('foo');
      expect(resolver.isDefined('foo')).to.be.true;
    });

    it('set options are defined', () => {
      expect(resolver.isDefined('foo')).to.be.false;
      resolver.setDefault('foo', 'bar');
      expect(resolver.isDefined('foo')).to.be.true;
    });

    it('get defined options', () => {
      resolver.setDefined(['foo', 'bar']);
      resolver.setDefault('baz', 'bam');
      resolver.setRequired('boo');

      expect(resolver.getDefinedOptions()).to.deep.equal(['foo', 'bar', 'baz', 'boo']);
    });

    it('removed options are not defined', () => {
      expect(resolver.isDefined('foo')).to.be.false;
      resolver.setDefined('foo');
      expect(resolver.isDefined('foo')).to.be.true;
      resolver.remove('foo');
      expect(resolver.isDefined('foo')).to.be.false;
    });

    it('cleared options are not defined', () => {
      expect(resolver.isDefined('foo')).to.be.false;
      resolver.setDefined('foo');
      expect(resolver.isDefined('foo')).to.be.true;
      resolver.clear();
      expect(resolver.isDefined('foo')).to.be.false;
    });
  });

  describe('setAllowedTypes', () => {
    it('set allowed types fails if unknow option', () => {
      expect(resolver.setAllowedTypes.bind(resolver, 'foo', 'string')).to.throw(Error);
    });

    it('resolve fails if invalid type', (done) => {
      var cases = [
        [true, 'string'],
        [false, 'string'],
        [[], 'string'],
        ['foo', 'array'],
        ['foo', 'object'],
        [[], 'object'],
        [42, 'string'],
      ];

      var tasks = _.map(cases, (testCase) => {
        return () => {
          resolver.setDefined('option');
          resolver.setAllowedTypes('option', testCase[1]);
          return expect(resolver.resolve({'option': testCase[0]})).to.be.rejectedWith(Error);
        }
      });

      expect(Promise.all(tasks)).notify(done);
    });

    it('resolve fails if invalid type multiple', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedTypes('foo', ['string', 'bool']);

      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid type multiple', (done) => {
      resolver.setDefault('foo', true);
      resolver.setAllowedTypes('foo', ['string', 'boolean']);

      expect(resolver.resolve()).to.eventually.deep.equal({'foo': true}).notify(done);
    });

    it('resolve succeeds if instance of class', (done) => {
      resolver.setDefault('foo', new Date('31-12-2015'));
      resolver.setAllowedTypes('foo', 'Date');

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });
  });

  describe('addAllowedTypes', () => {
    it('fails is unknow option', () => {
      expect(resolver.addAllowedTypes.bind(resolver, 'foo', 'string')).to.throw(Error);
    });

    it('resolve fails if invalid added type', (done) => {
      resolver.setDefault('foo', 42);
      resolver.addAllowedTypes('foo', 'string');
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid added type', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.addAllowedTypes('foo', 'string');
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve fails if invalid added type multiple', (done) => {
      resolver.setDefault('foo', 42);
      resolver.addAllowedTypes('foo', ['string', 'boolean']);
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid added type multiple', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.addAllowedTypes('foo', ['string', 'boolean']);
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('add allowed types dones not overwrite', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedTypes('foo', 'string');
      resolver.addAllowedTypes('foo', 'boolean');
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('add allowed types dones not overwrite (bis)', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedTypes('foo', 'string');
      resolver.addAllowedTypes('foo', 'boolean');
      resolver.setDefault('foo', false);
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });
  });

  describe('setAllowedValues', () => {
    it('set allowed values fails if unknow option', () => {
      expect(resolver.setAllowedValues.bind(resolver, 'foo', 'bar')).to.throw(Error);
    });

    it('resolve fails if invalid value', (done) => {
      resolver.setDefined('foo');
      resolver.setAllowedValues('foo', 'bar');
      expect(resolver.resolve({'foo': 42})).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve fails if invalid value is null', (done) => {
      resolver.setDefault('foo', null);
      resolver.setAllowedValues('foo', 'bar');
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve fails if invalid value strict', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', '42');
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid value', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedValues('foo', 'bar');
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve succeeds if valid value is null', (done) => {
      resolver.setDefault('foo', null);
      resolver.setAllowedValues('foo', null);
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve fails if invalid value multiple', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', ['bar', false, null]);
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid value multiple', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', ['bar', false, null, 42]);
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve fails if function returns false', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', (value) => {
        return false;
      });

      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if function returns true', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', (value) => {
        return true;
      });

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });


    it('resolve fails if all function returns false', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', [
        (value) => { return false; },
        (value) => { return false; },
        (value) => { return false; }
      ]);

      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if any function returns true', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', [
        (value) => { return false; },
        (value) => { return true; },
        (value) => { return false; }
      ]);

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });
  });

  describe('addAllowedValues', () => {
    it('add allowed values fails if unknow option', () => {
      expect(resolver.addAllowedValues.bind(resolver, 'foo', 'bar')).to.throw(Error);
    });

    it('resolve fails if invalid added value', (done) => {
      resolver.setDefault('foo', 42);
      resolver.addAllowedValues('foo', 'bar');
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid added value', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.addAllowedValues('foo', 'bar');
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve succeeds if valid added value is null', (done) => {
      resolver.setDefault('foo', null);
      resolver.addAllowedValues('foo', null);
      expect(resolver.resolve({'foo': null})).to.be.fulfilled.notify(done);
    });

    it('resolve fails if invalid added value multiple', (done) => {
      resolver.setDefault('foo', 42);
      resolver.addAllowedValues('foo', ['bar', 'baz']);
      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if valid added value multiple', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.addAllowedValues('foo', ['bar', 'baz']);
      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('add allowed values does not overwrite', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedValues('foo', 'bar');
      resolver.addAllowedValues('foo', 'baz');
      expect(resolver.resolve({'foo': 'bar'})).to.eventually.deep.equal({'foo': 'bar'}).notify(done);
    });

    it('add allowed values does not overwrite (bis)', (done) => {
      resolver.setDefault('foo', 'baz');
      resolver.setAllowedValues('foo', 'bar');
      resolver.addAllowedValues('foo', 'baz');
      expect(resolver.resolve({'foo': 'baz'})).to.eventually.deep.equal({'foo': 'baz'}).notify(done);
    });

    it('resolve fails if all added function returns false', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', (value) => {
        return false;
      });
      resolver.addAllowedValues('foo', (value) => {
        return false;
      });

      expect(resolver.resolve()).to.be.rejectedWith(Error).notify(done);
    });

    it('resolve succeeds if any added function returns true', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', (value) => {
        return false;
      });
      resolver.addAllowedValues('foo', (value) => {
        return true;
      });

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('resolve succeeds if any added function returns true (bis)', (done) => {
      resolver.setDefault('foo', 42);
      resolver.setAllowedValues('foo', (value) => {
        return true;
      });
      resolver.addAllowedValues('foo', (value) => {
        return false;
      });

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });
  });

  describe('setNormalizer', () => {
    it('set normalizer returns resolver', () => {
      resolver.setDefault('foo', 'bar');
      expect(resolver.setNormalizer('foo', () => {})).to.be.equal(resolver);
    });

    it('set normalizer closure', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setNormalizer('foo', () => {
        return 'normalized';
      });
      expect(resolver.resolve()).to.eventually.deep.equal({'foo': 'normalized'}).notify(done);
    });

    it('set normalizer fails if unknow option', () => {
      expect(resolver.setNormalizer.bind(resolver, 'foo', () => {})).to.throw(Error);
    });

    it('normalizer receives set option', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setNormalizer('foo', (value) => {
        return `normalized[${value}]`;
      });

      expect(resolver.resolve()).to.eventually.deep.equal({'foo': 'normalized[bar]'}).notify(done);
    });

    it('normalizer receives passed option', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setNormalizer('foo', (value) => {
        return `normalized[${value}]`;
      });

      expect(resolver.resolve({'foo': 'baz'})).to.eventually.deep.equal({'foo': 'normalized[baz]'}).notify(done);
    });

    it('validate type before normalization', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedTypes('foo', 'number');
      resolver.setNormalizer('foo', () => {
        throw new Error('Should not be called');
      });

      expect(resolver.resolve()).to.be.rejectedWith('Invalid type for option "foo".').notify(done);
    });

    it('normalizer can access other options', (done) => {
      resolver.setDefault('default', 'bar');
      resolver.setDefault('norm', 'baz');

      resolver.setNormalizer('norm', (value) => {
        expect(resolver.get('default')).to.be.equal('bar');
        return 'normalized';
      });

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'default': 'bar',
        'norm': 'normalized'
      }).notify(done);
    });

    it('fails if cyclic dependency between normalizers', (done) => {
      resolver.setDefault('norm1', 'bar');
      resolver.setDefault('norm2', 'baz');
      resolver.setNormalizer('norm1', (value) => {
          resolver.get('norm2');
      });
      resolver.setNormalizer('norm2', (value) => {
          resolver.get('norm1');
      });

      expect(resolver.resolve()).to.be.rejectedWith('The options "norm1", "norm2" have a cyclic dependency')
        .notify(done);
    });

    it('catched exception from normalizer does not crash options resolver', (done) => {
      var isThrow = true;
      resolver.setDefaults({
        catcher: null,
        thrower: null
      });

      resolver.setNormalizer('catcher', (value) => {
        try {
          resolver.get('thrower');
        } catch (e) {
          return false;
        }
      });

      resolver.setNormalizer('thrower', (value) => {
        if (isThrow) {
          isThrow = false;
          throw new Error('throwing');
        }

        return true;
      });

      expect(resolver.resolve()).to.be.fulfilled.notify(done);
    });

    it('invoke each normalizer only once', (done) => {
      let calls = 0;

      resolver.setDefault('norm1', 'bar');
      resolver.setDefault('norm2', 'baz');

      resolver.setNormalizer('norm1', (value) => {
        expect(1).to.be.equal(++calls);
        resolver.get('norm2');
      });

      resolver.setNormalizer('norm2', (value) => {
        expect(2).to.be.equal(++calls);
      });

      expect(expect(resolver.resolve()).to.be.fulfilled.then(() => {
        expect(2).to.be.equal(calls);
      })).notify(done);
    });

    it('normalizer not called for unset options', (done) => {
      resolver.setDefined('norm');
      resolver.setNormalizer('norm', () => {
        throw new Error('Should not be called');
      });

      expect(resolver.resolve()).to.be.eventually.deep.equal({}).notify(done);
    });
  });

  describe('setDefaults', () => {
    it('set defaults return resolver', () => {
      expect(resolver.setDefaults(['foo', 'bar'])).to.be.equal(resolver);
    });

    it('set defaults', (done) => {
      resolver.setDefault('one', '1');
      resolver.setDefault('two', 'bar');
      resolver.setDefaults({
        'two': '2',
        'three': '3'
      });

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'one': '1',
        'two': '2',
        'three': '3'
      }).notify(done);
    })
  });

  describe('remove', () => {
    it('remove return resolver', () => {
      resolver.setDefault('foo', 'bar');
      expect(resolver.remove('foo')).to.be.equal(resolver);
    });

    it('remove single option', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setDefault('baz', 'boo');
      resolver.remove('foo');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'baz': 'boo'
      }).notify(done);
    });

    it('remove multi options', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setDefault('baz', 'boo');
      resolver.setDefault('doo', 'dam');
      resolver.remove(['foo', 'doo']);

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'baz': 'boo'
      }).notify(done);
    });

    it('remove normalizer', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setNormalizer('foo', (value) => {
        return 'normalized';
      });
      resolver.remove('foo');
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('remove allowed types', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedTypes('foo', 'int');
      resolver.remove('foo');
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('remove allowed values', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedValues('foo', ['baz', 'boo']);
      resolver.remove('foo');
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('ignore unknow option', () => {
      expect(resolver.remove('foo')).to.be.equal(resolver);
    });
  });

  describe('clear', () => {
    it('return resolver', () => {
      expect(resolver.clear()).to.be.equal(resolver);
    });

    it('removes all options', (done) => {
      resolver.setDefaults({
        'one': 1,
        'two': 2
      });
      resolver.clear();

      expect(resolver.resolve()).to.be.eventually.deep.equal({}).notify(done);
    });

    it('clear normalizer', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setNormalizer('foo', (value) => {
        return 'normalized';
      });
      resolver.clear();
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('clear allowed types', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedTypes('foo', 'int');
      resolver.clear();
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('clear allowed values', (done) => {
      resolver.setDefault('foo', 'bar');
      resolver.setAllowedValues('foo', ['baz', 'boo']);
      resolver.clear();
      resolver.setDefault('foo', 'bar');

      expect(resolver.resolve()).to.be.eventually.deep.equal({
        'foo': 'bar'
      }).notify(done);
    });

    it('clear option and normalizer', (done) => {
      resolver.setDefault('foo1', 'bar');
      resolver.setNormalizer('foo1', (value) => {
        return '';
      });
      resolver.setDefault('foo2', 'bar');
      resolver.setNormalizer('foo2', (value) => {
        return '';
      });
      resolver.clear();
      expect(resolver.resolve()).to.be.eventually.deep.equal({}).notify(done);
    });
  });
});
