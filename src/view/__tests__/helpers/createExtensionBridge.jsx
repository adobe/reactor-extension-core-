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

import { fireEvent, render, screen, act } from '@testing-library/react';

export default () => {
  let registeredOptions;

  return {
    register(options) {
      registeredOptions = options;
    },
    init(...args) {
      act(() => {
        registeredOptions.init.apply(this, args);
      });
    },
    validate(...args) {
      let validationResult;

      act(() => {
        validationResult = registeredOptions.validate.apply(this, args);
      });
      return validationResult;
    },
    getSettings(...args) {
      return registeredOptions.getSettings.apply(this, args);
    },
    openCodeEditor() {},
    openRegexTester() {},
    openDataElementSelector() {}
  };
};
