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

var conditionDelegate = require('../variable');

describe('variable condition delegate', function () {
  beforeAll(function () {
    window.a = {
      b: [
        {
          c: 'foo'
        },
        {
          c: 'bar'
        }
      ]
    };
  });

  afterAll(function () {
    delete window.a;
  });

  describe('legacy behavior', function () {
    it('returns true when the variable matches the string value', function () {
      var settings = { name: 'a.b.1.c', value: 'bar' };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when the variable does not match the string value', function () {
      var settings = { name: 'a.b.1.c', value: 'cake' };
      expect(conditionDelegate(settings)).toBe(false);
    });

    it('returns true when the variable matches the regex value', function () {
      var settings = { name: 'a.b.1.c', value: 'B.r', valueIsRegex: true };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when the variable does not match the regex value', function () {
      var settings = { name: 'a.b.1.c', value: 'g.o', valueIsRegex: true };
      expect(conditionDelegate(settings)).toBe(false);
    });

    it('finds value when name is prefixed with window', function () {
      var settings = { name: 'window.a.b.1.c', value: 'bar' };
      expect(conditionDelegate(settings)).toBe(true);
    });
  });

  it('returns false if the variable "value" list is empty', function () {
    var settings = { name: 'a.b.1.c', variableValues: [] };
    expect(conditionDelegate(settings)).toBe(false);
  });

  describe('lists of varying size', function () {
    describe('as strings', function () {
      describe('returns false when', function () {
        it('the list is of size 1', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [{ value: 'bizbaz' }]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
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
          var settings = {
            name: 'a.b.1.c',
            variableValues: [{ value: 'bar' }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'bar' },
              { value: 'bazzy' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'bizzy' },
              { value: 'bar' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'bizzy' },
              { value: 'bazzy' },
              { value: 'bar' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('finds value when name is prefixed with window', function () {
          var settings = {
            name: 'window.a.b.1.c',
            variableValues: [{ value: 'bar' }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });
      });
    });

    describe('as RegularExpressions', function () {
      describe('returns false when', function () {
        it('the list is of size 1', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [{ value: 'g.o', valueIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
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
            name: 'a.b.1.c',
            variableValues: [{ value: 'B.r', valueIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'B.r', valueIsRegex: true },
              { value: 'bazzy', valueIsRegex: false },
              { value: 'buzzy', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'bizzy', valueIsRegex: false },
              { value: 'B.r', valueIsRegex: true },
              { value: 'buzzy', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            name: 'a.b.1.c',
            variableValues: [
              { value: 'bizzy', valueIsRegex: false },
              { value: 'bazzy', valueIsRegex: true },
              { value: 'B.r', valueIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('finds value when name is prefixed with window', function () {
          var settings = {
            name: 'window.a.b.1.c',
            variableValues: [{ value: 'B.r', valueIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });
      });
    });
  });
});
