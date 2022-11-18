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
import Variable, { formConfig } from '../variable';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  getNameTextBox: () => {
    return screen.getByRole('textbox', { name: /name/i });
  },
  getVariableValueRows: () => {
    return [].slice
      .call(document.querySelectorAll('div[data-row]'))
      .map((domNode) => ({
        domNode,
        withinRow: {
          getVariableValueTextBox: () => {
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

describe('variable condition view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(Variable, formConfig, extensionBridge));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe('legacy settings, typeof value === "string"', () => {
    it('can handle a legacy string variable value from settings', () => {
      extensionBridge.init({
        settings: {
          name: 'foo',
          value: 'bar'
        }
      });

      const rows = pageElements.getVariableValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(pageElements.getNameTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getVariableValueTextBox().value).toBe('bar');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);

      expect(extensionBridge.getSettings()).toEqual({
        name: 'foo',
        variableValues: [{ value: 'bar', valueIsRegex: false }]
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

      const rows = pageElements.getVariableValueRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;

      expect(pageElements.getNameTextBox().value).toBe('foo');
      expect(firstRow.withinRow.getVariableValueTextBox().value).toBe('bar');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(true);

      expect(extensionBridge.getSettings()).toEqual({
        name: 'foo',
        variableValues: [{ value: 'bar', valueIsRegex: true }]
      });
    });
  });

  it('sets form values from settings', () => {
    extensionBridge.init({
      settings: {
        name: 'foo',
        variableValues: [
          { value: 'bar', valueIsRegex: false },
          { value: 'baz', valueIsRegex: true }
        ]
      }
    });

    const rows = pageElements.getVariableValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    expect(pageElements.getNameTextBox().value).toBe('foo');
    expect(firstRow.withinRow.getVariableValueTextBox().value).toBe('bar');
    expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBe(false);
    expect(secondRow.withinRow.getVariableValueTextBox().value).toBe('baz');
    expect(secondRow.withinRow.getRegexToggleSwitch().checked).toBe(true);
  });

  it('sets settings from form values', () => {
    userEvent.type(pageElements.getNameTextBox(), 'foo');
    fireEvent.click(pageElements.getAddRowButton());

    const rows = pageElements.getVariableValueRows();
    expect(rows.length).toBe(2);
    const [firstRow, secondRow] = rows;

    userEvent.type(firstRow.withinRow.getVariableValueTextBox(), 'bar');
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    userEvent.type(secondRow.withinRow.getVariableValueTextBox(), 'baz');

    expect(extensionBridge.getSettings()).toEqual({
      name: 'foo',
      variableValues: [{ value: 'bar', valueIsRegex: true }, { value: 'baz' }]
    });
  });

  it('sets errors if required values are not provided', () => {
    // add another row
    fireEvent.click(pageElements.getAddRowButton());
    expect(pageElements.getVariableValueRows().length).toBe(2);

    fireEvent.focus(pageElements.getNameTextBox());
    fireEvent.blur(pageElements.getNameTextBox());
    expect(
      pageElements.getNameTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    const rows = pageElements.getVariableValueRows();
    rows.forEach((row) => {
      fireEvent.focus(row.withinRow.getVariableValueTextBox());
      fireEvent.blur(row.withinRow.getVariableValueTextBox());
    });

    const [firstRow, secondRow] = rows;
    expect(
      firstRow.withinRow.getVariableValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();
    expect(
      secondRow.withinRow.getVariableValueTextBox().hasAttribute('aria-invalid')
    ).toBeTrue();

    expect(extensionBridge.validate()).toBe(false);
  });

  it('the regex test button gives an example regex', () => {
    spyOn(extensionBridge, 'openRegexTester').and.callFake(() => ({
      then(resolve) {
        resolve('Edited Regex 1234');
      }
    }));

    const [firstRow] = pageElements.getVariableValueRows();
    userEvent.type(
      firstRow.withinRow.getVariableValueTextBox(),
      'initial value'
    );
    fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
    fireEvent.click(firstRow.withinRow.getRegexTestButton());

    expect(firstRow.withinRow.getVariableValueTextBox().value).toBe(
      'Edited Regex 1234'
    );
  });
});
