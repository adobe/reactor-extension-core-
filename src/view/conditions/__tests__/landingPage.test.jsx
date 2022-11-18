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

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import createExtensionBridge from '@test-helpers/createExtensionBridge';
import LandingPage, { formConfig } from '../landingPage';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  getLandingPageValueRows: () => {
    return [].slice
      .call(document.querySelectorAll('div[data-row]'))
      .map((domNode) => ({
        domNode,
        withinRow: {
          getPageValueTextBox: () => {
            return within(domNode).getByRole('textbox', { name: /value/i });
          },
          getRegexToggleSwitch: () => {
            return within(domNode).getByRole('switch', { name: /regex/i });
          },
          getRegexTestButton: () => {
            return within(domNode).getByText(/test/i);
          }
        }
      }));
  },
  getAddRowButton: () => {
    return screen.getByText(/add another/i);
  }
};

describe('landing page condition view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(LandingPage, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe('legacy settings, typeof value === "string"', () => {
    it('can handle a legacy string landing page value from settings', () => {
      extensionBridge.init({
        settings: {
          page: 'foo'
        }
      });

      const rows = pageElements.getLandingPageValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(firstRow.withinRow.getPageValueTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);

      expect(extensionBridge.getSettings()).toEqual({
        landingPages: [{ value: 'foo', pageIsRegex: false }]
      });
    });

    it('can handle legacy top level setting "pageIsRegex": true from settings', () => {
      extensionBridge.init({
        settings: {
          page: 'bar',
          pageIsRegex: true
        }
      });

      const rows = pageElements.getLandingPageValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(firstRow.withinRow.getPageValueTextBox().value).toBe('bar');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(true);

      expect(extensionBridge.getSettings()).toEqual({
        landingPages: [{ value: 'bar', pageIsRegex: true }]
      });
    });
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        landingPages: [
          { value: 'foo', pageIsRegex: false },
          { value: 'bar', pageIsRegex: true }
        ]
      }
    });

    const rows = pageElements.getLandingPageValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    expect(firstRow.withinRow.getPageValueTextBox().value).toBe('foo');
    expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);
    expect(secondRow.withinRow.getPageValueTextBox().value).toBe('bar');
    expect(secondRow.withinRow.getRegexToggleSwitch().checked).toBe(true);
  });

  it('sets settings from form values', () => {
    fireEvent.click(pageElements.getAddRowButton());

    const rows = pageElements.getLandingPageValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    userEvent.type(firstRow.withinRow.getPageValueTextBox(), 'bar');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    userEvent.type(secondRow.withinRow.getPageValueTextBox(), 'baz');

    expect(extensionBridge.getSettings()).toEqual({
      landingPages: [{ value: 'bar', pageIsRegex: true }, { value: 'baz' }]
    });
  });

  it('sets errors if required values are not provided', () => {
    // add another row
    fireEvent.click(pageElements.getAddRowButton());
    const rows = pageElements.getLandingPageValueRows();
    expect(rows.length).toBe(2);

    rows.forEach((row) => {
      fireEvent.focus(row.withinRow.getPageValueTextBox());
      fireEvent.blur(row.withinRow.getPageValueTextBox());
    });

    const [firstRow, secondRow] = rows;
    expect(
      firstRow.withinRow.getPageValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
    expect(
      secondRow.withinRow.getPageValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    expect(extensionBridge.validate()).toBe(false);
  });

  it('the regex test button gives an example regex', () => {
    spyOn(extensionBridge, 'openRegexTester').and.callFake(() => ({
      then(resolve) {
        resolve('Edited Regex 1234');
      }
    }));

    const [firstRow] = pageElements.getLandingPageValueRows();
    userEvent.type(firstRow.withinRow.getPageValueTextBox(), 'initial value');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    fireEvent.click(firstRow.withinRow.getRegexTestButton());

    expect(firstRow.withinRow.getPageValueTextBox().value).toBe(
      'Edited Regex 1234'
    );
  });
});
