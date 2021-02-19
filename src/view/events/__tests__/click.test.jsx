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

import { render, fireEvent, screen } from '@testing-library/react';
import { sharedTestingElements } from '@test-helpers/react-testing-library';
import createExtensionBridge from '@test-helpers/createExtensionBridge';
import Click, { formConfig } from '../click';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  linkDelay: {
    getCheckBox: () => {
      return screen.getByRole('checkbox', { name: /delay navigation/i });
    },
    getTextBox: () => screen.getByRole('textbox', { name: /link delay/i }),
    getDataElementModalTrigger: () => {
      return screen.getByRole('button', { name: /select a data element/i });
    }
  }
};

describe('click event view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(Click, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it('the default click options are chosen', () => {
    expect(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox().value
    ).toBe('');
    expect(
      sharedTestingElements.elementsMatching.radioGroup
        .getSpecificElements()
        .hasAttribute('checked')
    ).toBeTrue();
    expect(
      sharedTestingElements.elementsMatching.radioGroup
        .getAnyElement()
        .hasAttribute('checked')
    ).toBeFalse();

    fireEvent.click(sharedTestingElements.advancedSettings.getToggleTrigger());
    expect(
      sharedTestingElements.advancedSettings.getBubbleFireIfParentCheckbox()
        .value
    ).toBe('true');
    expect(
      sharedTestingElements.advancedSettings.getBubbleFireIfChildFiredCheckbox()
        .value
    ).toBe('true');
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        anchorDelay: 101,
        elementSelector: '.foo',
        bubbleStop: true
      }
    });

    fireEvent.click(sharedTestingElements.advancedSettings.getToggleTrigger());

    expect(pageElements.linkDelay.getTextBox().value).toBe('101');
    expect(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox().value
    ).toBe('.foo');
    expect(
      sharedTestingElements.advancedSettings.getBubbleStopCheckBox().value
    ).toBe('true');
  });

  it('sets settings from form values', () => {
    fireEvent.focus(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox()
    );
    fireEvent.change(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox(),
      {
        target: { value: '.foo' }
      }
    );
    fireEvent.blur(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox()
    );
    expect(
      sharedTestingElements.elementsMatching
        .getCssSelectorTextBox()
        .hasAttribute('aria-invalid')
    ).toBeFalse();

    fireEvent.click(pageElements.linkDelay.getCheckBox());
    fireEvent.focus(pageElements.linkDelay.getTextBox());
    fireEvent.change(pageElements.linkDelay.getTextBox(), {
      target: { value: '101' }
    });
    fireEvent.blur(pageElements.linkDelay.getTextBox());
    expect(
      pageElements.linkDelay.getTextBox().hasAttribute('aria-invalid')
    ).toBeFalse();

    fireEvent.click(sharedTestingElements.advancedSettings.getToggleTrigger());
    fireEvent.click(
      sharedTestingElements.advancedSettings.getBubbleStopCheckBox()
    );

    const {
      elementSelector,
      anchorDelay,
      bubbleStop
    } = extensionBridge.getSettings();

    expect(elementSelector).toBe('.foo');
    expect(anchorDelay).toBe(101);
    expect(bubbleStop).toBe(true);
  });

  it('sets validation errors when element selector is missing', () => {
    fireEvent.focus(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox()
    );
    fireEvent.blur(
      sharedTestingElements.elementsMatching.getCssSelectorTextBox()
    );

    expect(
      sharedTestingElements.elementsMatching
        .getCssSelectorTextBox()
        .hasAttribute('aria-invalid')
    ).toBeTrue();

    fireEvent.click(pageElements.linkDelay.getCheckBox());
    fireEvent.focus(pageElements.linkDelay.getTextBox());
    fireEvent.change(pageElements.linkDelay.getTextBox(), {
      target: { value: '' }
    });
    fireEvent.blur(pageElements.linkDelay.getTextBox());

    expect(
      pageElements.linkDelay.getTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
  });

  it('sets default linkDelay to 100', () => {
    fireEvent.click(pageElements.linkDelay.getCheckBox());

    fireEvent.focus(pageElements.linkDelay.getTextBox());
    expect(pageElements.linkDelay.getTextBox().value).toBe('100');
    fireEvent.blur(pageElements.linkDelay.getTextBox());

    expect(
      pageElements.linkDelay.getTextBox().getAttribute('aria-invalid')
    ).toBeFalsy();
  });

  it('sets validation error when the number < 1', () => {
    fireEvent.click(pageElements.linkDelay.getCheckBox());

    expect(
      pageElements.linkDelay.getTextBox().hasAttribute('aria-invalid')
    ).toBeFalse();

    fireEvent.focus(pageElements.linkDelay.getTextBox());
    fireEvent.change(pageElements.linkDelay.getTextBox(), {
      target: { value: '0' }
    });
    fireEvent.blur(pageElements.linkDelay.getTextBox());

    expect(
      pageElements.linkDelay.getTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
  });

  it('The linkDelay input supports opening the data element modal', () => {
    spyOn(extensionBridge, 'openDataElementSelector').and.callFake(() => {
      return Promise.resolve();
    });

    fireEvent.click(pageElements.linkDelay.getCheckBox());
    fireEvent.click(pageElements.linkDelay.getDataElementModalTrigger());
    expect(extensionBridge.openDataElementSelector).toHaveBeenCalledTimes(1);
  });

  it('linkDelay handles data element names just fine', () => {
    fireEvent.click(pageElements.linkDelay.getCheckBox());

    fireEvent.focus(pageElements.linkDelay.getTextBox());
    fireEvent.change(pageElements.linkDelay.getTextBox(), {
      target: { value: '%Data Element 1%' }
    });
    fireEvent.blur(pageElements.linkDelay.getTextBox());

    expect(
      pageElements.linkDelay.getTextBox().hasAttribute('aria-invalid')
    ).toBeFalse();
  });
});
