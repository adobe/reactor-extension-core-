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
var getObjectProperty = require('../helpers/getObjectProperty');
var textMatch = require('../helpers/textMatch');

/**
 * Variable condition. Determines if a particular JS variable's actual value matches
 * an acceptable value.
 * @param {Object} settings Condition settings.
 * @param {number} settings.name The name of the JS variable (e.g., event.target.id).
 * @param {Object[]} settings.variableValues Acceptable JS variable values to match.
 * @param {string} settings.variableValues[].value An acceptable JS variable value.
 * @param {string} [settings.variableValues[].valueIsRegex=false] Is the JS variable
 * value a Regular Expression?
 * DEPRECATED @param {string=} settings.value An acceptable JS variable value.
 * DEPRECATED @param {boolean=} [settings.valueIsRegex=false] Whether <code>settings.value</code>
 * @returns {boolean}
 */
module.exports = function (settings) {
  var variableValues;
  if (!Array.isArray(settings.variableValues)) {
    // legacy support
    variableValues = [
      { value: settings.value, valueIsRegex: Boolean(settings.valueIsRegex) }
    ];
  } else {
    variableValues = settings.variableValues;
  }

  var testValue = getObjectProperty(window, settings.name);
  return variableValues.some(function (acceptableVariableValue) {
    var acceptableValue = acceptableVariableValue.valueIsRegex
      ? new RegExp(acceptableVariableValue.value, 'i')
      : acceptableVariableValue.value;

    return textMatch(testValue, acceptableValue);
  });
};
