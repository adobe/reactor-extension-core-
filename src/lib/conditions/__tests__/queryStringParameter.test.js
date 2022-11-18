/***************************************************************************************
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

var conditionDelegateInjector = require('inject-loader!../queryStringParameter');

describe('query string parameter condition delegate', function () {
  var conditionDelegate;

  beforeAll(function () {
    conditionDelegate = conditionDelegateInjector({
      '@adobe/reactor-window': {
        location: {
          search: '?testParam=foo'
        }
      }
    });
  });

  describe('legacy behavior', function () {
    it('returns true when value matches using regular string', function () {
      var settings = { name: 'testParam', value: 'foo' };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when value does not match using regular string', function () {
      var settings = { name: 'testParam', value: 'goo' };
      expect(conditionDelegate(settings)).toBe(false);
    });

    it('returns true when value matches using regex', function () {
      var settings = {
        name: 'testParam',
        value: '^F[ojd]o$',
        valueIsRegex: true
      };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when value does not match using regex', function () {
      var settings = {
        name: 'testParam',
        value: '^g[ojd]o$',
        valueIsRegex: true
      };
      expect(conditionDelegate(settings)).toBe(false);
    });
  });

  it('returns false if the query param "value" list is empty', function () {
    var settings = { name: 'testParam', queryParams: [] };
    expect(conditionDelegate(settings)).toBe(false);
  });

  describe('lists of varying size', function () {
    describe('as strings', function () {
      describe('returns false when', function () {
        it('the list is of size 1', function () {
          var settings = {
            name: 'testParam',
            queryParams: [{ value: 'bizbaz' }]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'bizzy' },
              { value: 'bazzy' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });
      });

      describe('returns true when', function () {
        it('the list is of size 1', function () {
          var settings = { name: 'testParam', queryParams: [{ value: 'foo' }] };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'foo' },
              { value: 'bazzy' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'bizzy' },
              { value: 'foo' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'bizzy' },
              { value: 'bazzy' },
              { value: 'foo' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });
      });
    });

    describe('as RegularExpressions', function () {
      describe('returns false when', function () {
        it('the list is of size 1', function () {
          var settings = {
            name: 'testParam',
            queryParams: [{ value: '^g[ojd]o$', valueIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'a.b', valueIsRegex: true },
              { value: 'c.d', valueIsRegex: true },
              { value: 'e.f', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });
      });

      describe('returns true when', function () {
        it('the list is of size 1', function () {
          var settings = {
            name: 'testParam',
            queryParams: [{ value: '^F[ojd]o$', valueIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: '^F[ojd]o$', valueIsRegex: true },
              { value: 'bazzy', valueIsRegex: false },
              { value: 'buzzy', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'bizzy', valueIsRegex: false },
              { value: '^F[ojd]o$', valueIsRegex: true },
              { value: 'buzzy', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            name: 'testParam',
            queryParams: [
              { value: 'bizzy', valueIsRegex: false },
              { value: 'bazzy', valueIsRegex: true },
              { value: '^F[ojd]o$', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });
      });
    });
  });
});
