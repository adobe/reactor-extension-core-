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
import TrafficSource, { formConfig } from '../trafficSource';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  getTrafficSourceValueRows: () => {
    return [].slice
      .call(document.querySelectorAll('div[data-row]'))
      .map((domNode) => ({
        domNode,
        withinRow: {
          getTrafficSourceTextBox: () => {
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

describe('traffic source condition view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(TrafficSource, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe('legacy settings, typeof value === "string"', () => {
    it('can handle a legacy string landing page value from settings', () => {
      extensionBridge.init({
        settings: {
          source: 'foo'
        }
      });

      const rows = pageElements.getTrafficSourceValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(firstRow.withinRow.getTrafficSourceTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);

      expect(extensionBridge.getSettings()).toEqual({
        trafficSources: [{ value: 'foo', sourceIsRegex: false }]
      });
    });

    it('can handle legacy top level setting "sourceIsRegex": true from settings', () => {
      extensionBridge.init({
        settings: {
          source: 'foo',
          sourceIsRegex: true
        }
      });

      const rows = pageElements.getTrafficSourceValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(firstRow.withinRow.getTrafficSourceTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(true);

      expect(extensionBridge.getSettings()).toEqual({
        trafficSources: [{ value: 'foo', sourceIsRegex: true }]
      });
    });
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        trafficSources: [
          { value: 'foo', sourceIsRegex: false },
          { value: 'bar', sourceIsRegex: true }
        ]
      }
    });

    const rows = pageElements.getTrafficSourceValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    expect(firstRow.withinRow.getTrafficSourceTextBox().value).toBe('foo');
    expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);
    expect(secondRow.withinRow.getTrafficSourceTextBox().value).toBe('bar');
    expect(secondRow.withinRow.getRegexToggleSwitch().checked).toBe(true);
  });

  it('sets settings from form values', () => {
    fireEvent.click(pageElements.getAddRowButton());

    const rows = pageElements.getTrafficSourceValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    userEvent.type(firstRow.withinRow.getTrafficSourceTextBox(), 'bar');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    userEvent.type(secondRow.withinRow.getTrafficSourceTextBox(), 'baz');

    expect(extensionBridge.getSettings()).toEqual({
      trafficSources: [{ value: 'bar', sourceIsRegex: true }, { value: 'baz' }]
    });
  });

  it('sets errors if required values are not provided', () => {
    // add another row
    fireEvent.click(pageElements.getAddRowButton());
    const rows = pageElements.getTrafficSourceValueRows();
    expect(rows.length).toBe(2);

    rows.forEach((row) => {
      fireEvent.focus(row.withinRow.getTrafficSourceTextBox());
      fireEvent.blur(row.withinRow.getTrafficSourceTextBox());
    });

    const [firstRow, secondRow] = rows;
    expect(
      firstRow.withinRow.getTrafficSourceTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
    expect(
      secondRow.withinRow.getTrafficSourceTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    expect(extensionBridge.validate()).toBe(false);
  });

  it('the regex test button gives an example regex', () => {
    spyOn(extensionBridge, 'openRegexTester').and.callFake(() => ({
      then(resolve) {
        resolve('Edited Regex 1234');
      }
    }));

    const [firstRow] = pageElements.getTrafficSourceValueRows();
    userEvent.type(
      firstRow.withinRow.getTrafficSourceTextBox(),
      'initial value'
    );
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    fireEvent.click(firstRow.withinRow.getRegexTestButton());

    expect(firstRow.withinRow.getTrafficSourceTextBox().value).toBe(
      'Edited Regex 1234'
    );
  });
});
