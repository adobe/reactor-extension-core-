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

var textMatch = require('../helpers/textMatch');
var visitorTracking = require('../helpers/visitorTracking');

/**
 * Traffic source condition. Determines if the actual traffic source matches an acceptable traffic
 * source.
 * @param {Object} settings Condition settings.
 * @param {Object[]} settings.trafficSources Acceptable traffic values to match.
 * @param {string} settings.trafficSources[].value An acceptable traffic source value.
 * @param {string} [settings.trafficSources[].sourceIsRegex=false] Is the traffic source
 * value a Regular Expression?
 * DEPRECATED @param {string} settings.source An acceptable traffic source.
 * DEPRECATED @param {boolean} [settings.sourceIsRegex=false] Whether
 * <code>settings.source</code> is intended
 * to be a regular expression.
 * @returns {boolean}
 */
module.exports = function (settings) {
  // empty strings aren't allowed because a traffic source value is required in the UI.
  var storedTrafficSource = visitorTracking.getTrafficSource();
  if (!storedTrafficSource) {
    return false;
  }

  var trafficSourceValues;
  if (!Array.isArray(settings.trafficSources)) {
    // legacy support
    trafficSourceValues = [
      { value: settings.source, sourceIsRegex: Boolean(settings.sourceIsRegex) }
    ];
  } else {
    trafficSourceValues = settings.trafficSources;
  }

  return trafficSourceValues.some(function (acceptableTrafficSource) {
    var acceptableValue = acceptableTrafficSource.sourceIsRegex
      ? new RegExp(acceptableTrafficSource.value, 'i')
      : acceptableTrafficSource.value;

    return textMatch(storedTrafficSource, acceptableValue);
  });
};
