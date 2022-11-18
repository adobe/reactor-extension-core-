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
import createExtensionBridge from '@test-helpers/createExtensionBridge';
import userEvent from '@testing-library/user-event';
import Cookie, { formConfig } from '../cookie';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  getCookieNameTextBox: () => {
    return screen.getByRole('textbox', { name: /cookie name/i });
  },
  getCookieValueRows: () => {
    return [].slice
      .call(document.querySelectorAll('div[data-row]'))
      .map((domNode) => ({
        domNode,
        withinRow: {
          getCookieValueTextBox: () => {
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

describe('cookie condition view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(Cookie, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe('legacy settings, typeof value === "string"', () => {
    it('can handle a legacy string cookie value from settings', () => {
      extensionBridge.init({
        settings: {
          name: 'foo',
          value: 'bar'
        }
      });

      const rows = pageElements.getCookieValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(pageElements.getCookieNameTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getCookieValueTextBox().value).toBe('bar');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);

      expect(extensionBridge.getSettings()).toEqual({
        name: 'foo',
        cookieValues: [{ value: 'bar', valueIsRegex: false }]
      });
    });

    it('can handle legacy top level setting "valueIsRegex": true from settings', () => {
      extensionBridge.init({
        settings: {
          name: 'foo',
          value: 'bar',
          valueIsRegex: true
        }
      });

      const rows = pageElements.getCookieValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(pageElements.getCookieNameTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getCookieValueTextBox().value).toBe('bar');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(true);

      expect(extensionBridge.getSettings()).toEqual({
        name: 'foo',
        cookieValues: [{ value: 'bar', valueIsRegex: true }]
      });
    });
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        name: 'foo',
        cookieValues: [
          { value: 'bar', valueIsRegex: false },
          { value: 'baz', valueIsRegex: true }
        ]
      }
    });

    const rows = pageElements.getCookieValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    expect(pageElements.getCookieNameTextBox().value).toBe('foo');
    expect(firstRow.withinRow.getCookieValueTextBox().value).toBe('bar');
    expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);
    expect(secondRow.withinRow.getCookieValueTextBox().value).toBe('baz');
    expect(secondRow.withinRow.getRegexToggleSwitch().checked).toBe(true);
  });

  it('sets settings from form values', () => {
    userEvent.type(pageElements.getCookieNameTextBox(), 'foo');
    fireEvent.click(pageElements.getAddRowButton());

    const rows = pageElements.getCookieValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    userEvent.type(firstRow.withinRow.getCookieValueTextBox(), 'bar');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    userEvent.type(secondRow.withinRow.getCookieValueTextBox(), 'baz');

    expect(extensionBridge.getSettings()).toEqual({
      name: 'foo',
      cookieValues: [{ value: 'bar', valueIsRegex: true }, { value: 'baz' }]
    });
  });

  it('sets errors if required values are not provided', () => {
    // add another row
    fireEvent.click(pageElements.getAddRowButton());
    expect(pageElements.getCookieValueRows().length).toBe(2);

    fireEvent.focus(pageElements.getCookieNameTextBox());
    fireEvent.blur(pageElements.getCookieNameTextBox());
    expect(
      pageElements.getCookieNameTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    const rows = pageElements.getCookieValueRows();
    rows.forEach((row) => {
      fireEvent.focus(row.withinRow.getCookieValueTextBox());
      fireEvent.blur(row.withinRow.getCookieValueTextBox());
    });

    const [firstRow, secondRow] = rows;
    expect(
      firstRow.withinRow.getCookieValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
    expect(
      secondRow.withinRow.getCookieValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    expect(extensionBridge.validate()).toBe(false);
  });

  it('the regex test button gives an example regex', () => {
    spyOn(extensionBridge, 'openRegexTester').and.callFake(() => ({
      then(resolve) {
        resolve('Edited Regex 1234');
      }
    }));

    const [firstRow] = pageElements.getCookieValueRows();
    userEvent.type(firstRow.withinRow.getCookieValueTextBox(), 'initial value');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    fireEvent.click(firstRow.withinRow.getRegexTestButton());

    expect(firstRow.withinRow.getCookieValueTextBox().value).toBe(
      'Edited Regex 1234'
    );
  });
});
