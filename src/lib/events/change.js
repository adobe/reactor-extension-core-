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
var bubbly = require('./helpers/createBubbly')();
var textMatch = require('../helpers/textMatch');

document.addEventListener('change', bubbly.evaluateEvent, true);

/**
 * The change event. This event occurs when a change to an element's value is committed by the user.
 * @param {Object} settings The event settings object.
 * @param {string} [settings.elementSelector] The CSS selector the element must match in order for
 * the rule to fire.
 * @param {Object[]} [settings.elementProperties] Property values the element must have in order
 * for the rule to fire.
 * @param {string} settings.elementProperties[].name The property name.
 * @param {string} settings.elementProperties[].value The property value.
 * @param {boolean} [settings.elementProperties[].valueIsRegex=false] Whether <code>value</code>
 * on the object instance is intended to be a regular expression.
 * @param {Object[]} settings.value Acceptable change values
 * @param {string} settings.value[].value A change value that would trigger the event
 * @param {string} [settings.value[].valueIsRegex=false] Is the value to change to
 * a regular expression?
 * @param {boolean} [settings.bubbleFireIfParent=true] Whether the rule should fire if
 * the event originated from a descendant element.
 * @param {boolean} [settings.bubbleFireIfChildFired=true] Whether the rule should fire
 * if the same event has already triggered a rule targeting a descendant element.
 * @param {boolean} [settings.bubbleStop=false] Whether the event should not trigger
 * rules on ancestor elements.
 * @param {ruleTrigger} trigger The trigger callback.
 * DEPRECATED @param {string} [settings.value] What the new value must be for the rule
 * to fire.
 * DEPRECATED @param {boolean} [settings.valueIsRegex=false] Whether <code>settings.value</code> is
 * intended to be a regular expression.
 */
module.exports = function (settings, trigger) {
  var acceptableChangeValues = Array.isArray(settings.value)
    ? settings.value
    : [];

  // legacy support
  if (typeof settings.value === 'string') {
    acceptableChangeValues.push({
      value: settings.value,
      valueIsRegex: Boolean(settings.valueIsRegex)
    });
  }

  bubbly.addListener(settings, function (syntheticEvent) {
    if (!acceptableChangeValues.length) {
      trigger(syntheticEvent);
    }

    acceptableChangeValues.forEach(function (nextChangeValue) {
      var acceptableValue = nextChangeValue.valueIsRegex
        ? new RegExp(nextChangeValue.value, 'i')
        : nextChangeValue.value;

      if (textMatch(syntheticEvent.target.value, acceptableValue)) {
        trigger(syntheticEvent);
      }

      return true;
    });

    return false;
  });
};
