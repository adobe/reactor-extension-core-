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

var mockVisitorTracking = {
  getTrafficSource: function () {
    return 'http://trafficsource.com';
  }
};

var conditionDelegateInjector = require('inject-loader!../trafficSource');
var conditionDelegate = conditionDelegateInjector({
  '../helpers/visitorTracking': mockVisitorTracking
});

describe('traffic source condition delegate', function () {
  describe('legacy behavior', function () {
    it('returns true when the traffic source matches a string', function () {
      var settings = {
        source: 'http://trafficsource.com',
        sourceIsRegex: false
      };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when the traffic source does not match a string', function () {
      var settings = {
        source: 'http://foo.com',
        sourceIsRegex: false
      };
      expect(conditionDelegate(settings)).toBe(false);
    });

    it('returns true when the traffic source matches a regex', function () {
      var settings = {
        source: 'Traffic.ource',
        sourceIsRegex: true
      };
      expect(conditionDelegate(settings)).toBe(true);
    });

    it('returns false when the traffic source does not match a regex', function () {
      var settings = {
        source: 'my\\.yahoo\\.com',
        sourceIsRegex: true
      };
      expect(conditionDelegate(settings)).toBe(false);
    });
  });

  it('it returns false if the landing page value list is empty', function () {
    var settings = {
      trafficSources: []
    };
    expect(conditionDelegate(settings)).toBe(false);
  });

  describe('lists of varying size', function () {
    describe('as strings', function () {
      describe('returns false when', function () {
        it('the list is of size 1', function () {
          var settings = { trafficSources: [{ value: 'http://foo.com' }] };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            trafficSources: [
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
            trafficSources: [{ value: 'http://trafficsource.com' }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'http://trafficsource.com' },
              { value: 'bazzy' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'bizzy' },
              { value: 'http://trafficsource.com' },
              { value: 'buzzy' }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'bizzy' },
              { value: 'bazzy' },
              { value: 'http://trafficsource.com' }
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
            trafficSources: [{ value: 'g.o', sourceIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });

        it('the list has many items', function () {
          var settings = {
            trafficSources: [
              { value: 'a.b', sourceIsRegex: true },
              { value: 'c.d', sourceIsRegex: true },
              { value: 'e.f', sourceIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(false);
        });
      });

      describe('returns true when', function () {
        it('the list is of size 1', function () {
          var settings = {
            trafficSources: [{ value: 'Traffic.ource', sourceIsRegex: true }]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the front of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'Traffic.ource', sourceIsRegex: true },
              { value: 'bazzy', sourceIsRegex: false },
              { value: 'buzzy', sourceIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is in the middle of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'bizzy', sourceIsRegex: false },
              { value: 'Traffic.ource', sourceIsRegex: true },
              { value: 'buzzy', sourceIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });

        it('the match is at the end of a many item list', function () {
          var settings = {
            trafficSources: [
              { value: 'bizzy', sourceIsRegex: false },
              { value: 'bazzy', sourceIsRegex: true },
              { value: 'Traffic.ource', sourceIsRegex: true }
            ]
          };
          expect(conditionDelegate(settings)).toBe(true);
        });
      });
    });
  });
});
