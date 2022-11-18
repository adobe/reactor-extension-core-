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

var visitorTracking = require('../helpers/visitorTracking');
var textMatch = require('../helpers/textMatch');

/**
 * Landing page condition. Determines if the actual landing page matches an acceptable landing page.
 * @param {Object} settings Condition settings.
 * @param {Object[]} settings.landingPages Acceptable landing page values to match.
 * @param {string} settings.landingPages[].value An acceptable landing page value.
 * @param {string} [settings.landingPages[].pageIsRegex=false] Is the landing page
 * value a Regular Expression?
 * DEPRECATED @param {string=} settings.page An acceptable landing page.
 * DEPRECATED @param {boolean=} [settings.pageIsRegex=false] Whether
 * <code>settings.page</code> is intended to
 * be a regular expression.
 * @returns {boolean}
 */
module.exports = function (settings) {
  // empty strings aren't allowed because a landing page value is required in the UI.
  var storedLandingPage = visitorTracking.getLandingPage();
  if (!storedLandingPage) {
    return false;
  }

  var landingPageValues;
  if (!Array.isArray(settings.landingPages)) {
    // legacy support
    landingPageValues = [
      {
        value: settings.page,
        pageIsRegex: Boolean(settings.pageIsRegex)
      }
    ];
  } else {
    landingPageValues = settings.landingPages;
  }

  return landingPageValues.some(function (acceptablePageValue) {
    var acceptableValue = acceptablePageValue.pageIsRegex
      ? new RegExp(acceptablePageValue.value, 'i')
      : acceptablePageValue.value;

    return textMatch(storedLandingPage, acceptableValue);
  });
};
