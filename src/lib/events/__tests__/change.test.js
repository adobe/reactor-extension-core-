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

describe('change event delegate', function () {
  var testStandardEvent = require('./helpers/testStandardEvent');
  var delegate = require('../change');

  var assertTriggerCall = function (options) {
    expect(options.call.args[0]).toEqual({
      element: options.element,
      target: options.target,
      nativeEvent: jasmine.any(Object)
    });
  };

  describe('without value defined', function () {
    testStandardEvent(function () {
      return delegate;
    }, 'change');
  });

  describe('with value defined', function () {
    var outerElement;
    var innerElement;

    beforeAll(function () {
      outerElement = document.createElement('div');
      outerElement.id = 'outer';

      innerElement = document.createElement('input');
      innerElement.setAttribute('type', 'text');
      innerElement.id = 'inner';
      outerElement.appendChild(innerElement);

      document.body.insertBefore(outerElement, document.body.firstChild);
    });

    afterAll(function () {
      document.body.removeChild(outerElement);
    });

    describe('legacy behavior', function () {
      it('triggers rule when a string value matches', function () {
        var trigger = jasmine.createSpy();

        delegate(
          {
            elementSelector: '#outer',
            value: 'foo',
            bubbleFireIfParent: true,
            bubbleFireIfChildFired: true
          },
          trigger
        );

        innerElement.value = 'foo';
        Simulate.change(innerElement);

        expect(trigger.calls.count()).toBe(1);

        assertTriggerCall({
          call: trigger.calls.mostRecent(),
          target: innerElement,
          element: outerElement
        });
      });

      it('does not trigger rule when a string value does not match', function () {
        var trigger = jasmine.createSpy();

        delegate(
          {
            elementSelector: '#outer',
            value: 'foo',
            bubbleFireIfParent: true,
            bubbleFireIfChildFired: true
          },
          trigger
        );

        innerElement.value = 'bar';
        Simulate.change(innerElement);

        expect(trigger.calls.count()).toBe(0);
      });

      it('triggers rule when a regex value matches', function () {
        var trigger = jasmine.createSpy();

        delegate(
          {
            elementSelector: '#outer',
            value: '^F',
            valueIsRegex: true,
            bubbleFireIfParent: true,
            bubbleFireIfChildFired: true
          },
          trigger
        );

        innerElement.value = 'foo';
        Simulate.change(innerElement);

        expect(trigger.calls.count()).toBe(1);

        assertTriggerCall({
          call: trigger.calls.mostRecent(),
          target: innerElement,
          element: outerElement
        });
      });

      it('does not trigger rule when a string value does not match', function () {
        var trigger = jasmine.createSpy();

        delegate(
          {
            elementSelector: '#outer',
            value: '^f',
            valueIsRegex: true,
            bubbleFireIfParent: true,
            bubbleFireIfChildFired: true
          },
          trigger
        );

        innerElement.value = 'bar';
        Simulate.change(innerElement);

        expect(trigger.calls.count()).toBe(0);
      });

      it('triggers rule when empty string matches', function () {
        var trigger = jasmine.createSpy();

        delegate(
          {
            elementSelector: '#outer',
            value: '',
            bubbleFireIfParent: true,
            bubbleFireIfChildFired: true
          },
          trigger
        );

        innerElement.value = '';
        Simulate.change(innerElement);

        expect(trigger.calls.count()).toBe(1);

        assertTriggerCall({
          call: trigger.calls.mostRecent(),
          target: innerElement,
          element: outerElement
        });
      });
    });

    it('triggers the rule when value is an empty list (no specific qualifier)', function () {
      var trigger = jasmine.createSpy();

      delegate(
        {
          elementSelector: '#outer',
          value: [],
          bubbleFireIfParent: true,
          bubbleFireIfChildFired: true
        },
        trigger
      );

      innerElement.value = 'bar';
      Simulate.change(innerElement);

      expect(trigger.calls.count()).toBe(1);
    });

    it('does not trigger rule when there is no match', function () {
      var trigger = jasmine.createSpy();

      delegate(
        {
          elementSelector: '#outer',
          value: [{ value: 'aaa' }, { value: 'bbb' }, { value: 'ccc' }],
          bubbleFireIfParent: true,
          bubbleFireIfChildFired: true
        },
        trigger
      );

      innerElement.value = 'bar';
      Simulate.change(innerElement);

      expect(trigger.calls.count()).toBe(0);
    });

    describe('it triggers the rule when', function () {
      describe('the value is a string', function () {
        it('at the beginning', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [{ value: 'foo' }, { value: 'bbb' }, { value: 'ccc' }],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });

        it('in the middle', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [{ value: 'aaa' }, { value: 'foo' }, { value: 'ccc' }],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });

        it('at the end', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [{ value: 'aaa' }, { value: 'bbb' }, { value: 'foo' }],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });

        it('the string is empty', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [{ value: '' }],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = '';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });
      });

      describe('the value is a regex', function () {
        it('at the beginning', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [
                { value: '^F', valueIsRegex: true },
                { value: 'bbb', valueIsRegex: false },
                { value: 'ccc', valueIsRegex: false }
              ],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });

        it('in the middle', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [
                { value: 'aaa', valueIsRegex: false },
                { value: '^F', valueIsRegex: true },
                { value: 'ccc', valueIsRegex: false }
              ],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });

        it('at the end', function () {
          var trigger = jasmine.createSpy();

          delegate(
            {
              elementSelector: '#outer',
              value: [
                { value: 'aaa', valueIsRegex: false },
                { value: 'bbb', valueIsRegex: false },
                { value: '^F', valueIsRegex: true }
              ],
              bubbleFireIfParent: true,
              bubbleFireIfChildFired: true
            },
            trigger
          );

          innerElement.value = 'foo';
          Simulate.change(innerElement);

          expect(trigger.calls.count()).toBe(1);

          assertTriggerCall({
            call: trigger.calls.mostRecent(),
            target: innerElement,
            element: outerElement
          });
        });
      });
    });
  });
});
