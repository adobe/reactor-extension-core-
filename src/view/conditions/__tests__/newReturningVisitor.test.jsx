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

import { fireEvent, render, screen } from '@testing-library/react';
import createExtensionBridge from '@test-helpers/createExtensionBridge';
import NewReturningVisitor, { formConfig } from '../newReturningVisitor';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  getNewVisitorRadio: () => screen.getByRole('radio', { name: /new visitor/i }),
  getReturningVisitorRadio: () =>
    screen.getByRole('radio', { name: /returning visitor/i })
};

describe('new/returning visitor condition view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(NewReturningVisitor, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it('sets new visitor radio as checked by default', () => {
    expect(pageElements.getNewVisitorRadio().checked).toBeTrue();
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        isNewVisitor: false
      }
    });

    expect(pageElements.getReturningVisitorRadio().checked).toBeTrue();
  });

  it('sets settings from form values', () => {
    fireEvent.click(pageElements.getReturningVisitorRadio());

    expect(extensionBridge.getSettings()).toEqual({
      isNewVisitor: false
    });
  });
});
