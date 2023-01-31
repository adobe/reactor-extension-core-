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
import { sharedTestingElements } from '@test-helpers/react-testing-library';
import createExtensionBridge from '@test-helpers/createExtensionBridge';
import Change, { formConfig } from '../change';
import bootstrap from '../../bootstrap';

// react-testing-library element selectors
const pageElements = {
  valueField: {
    getShowFieldCheckBox: () => {
      return screen.getByRole('checkbox', {
        name: /and is changed to the following value/i
      });
    },
    getRows: () => {
      return [].slice
        .call(document.querySelectorAll('div[data-row]'))
        .map((domNode) => ({
          domNode,
          withinRow: {
            getValueTextBox: () => {
              return within(domNode).getByRole('textbox', { name: /value/i });
            },
            getDataElementModalTrigger: () => {
              return within(domNode).getByRole('button', {
                name: /select a data element/i
              });
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
    getDataElementModalTrigger: () => {
      return screen.getByRole('button', { name: /select a data element/i });
    },
    getRegexToggleSwitch: () => {
      return screen.getByRole('switch', { name: /regex/i });
    },
    getAddRowButton: () => {
      return screen.getByRole('button', { name: /add another/i });
    }
  }
};

describe('change event view', () => {
  let extensionBridge;

  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
    render(bootstrap(Change, formConfig));
    extensionBridge.init();
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe('legacy settings, typeof value === "string"', () => {
    it('sets form values from settings', () => {
      extensionBridge.init({
        settings: {
          value: 'abc',
          valueIsRegex: true,
          elementSelector: '.foo',
          bubbleStop: true
        }
      });

      const rows = pageElements.valueField.getRows();
      expect(rows.length).toBe(1);
      const [firstRow] = rows;
      expect(pageElements.valueField.getShowFieldCheckBox().checked).toBeTrue();
      expect(firstRow.withinRow.getValueTextBox().value).toBe('abc');
      expect(firstRow.withinRow.getRegexToggleSwitch().checked).toBeTrue();

      expect(
        sharedTestingElements.elementsMatching.getCssSelectorTextBox().value
      ).toBe('.foo');

      fireEvent.click(
        sharedTestingElements.advancedSettings.getToggleTrigger()
      );
      expect(
        sharedTestingElements.advancedSettings.getBubbleStopCheckBox().checked
      ).toBeTrue();
    });

    it('sets settings from form values', async () => {
      fireEvent.click(pageElements.valueField.getShowFieldCheckBox());

      const [firstRow] = pageElements.valueField.getRows();
      userEvent.type(firstRow.withinRow.getValueTextBox(), 'abc');
      fireEvent.click(firstRow.withinRow.getRegexToggleSwitch());
      userEvent.type(
        sharedTestingElements.elementsMatching.getCssSelectorTextBox(),
        '.foo'
      );

      fireEvent.click(
        sharedTestingElements.advancedSettings.getToggleTrigger()
      );
      fireEvent.click(
        sharedTestingElements.advancedSettings.getBubbleStopCheckBox()
      );

      const {
        acceptableChangeValues: valueRows,
        elementSelector,
        bubbleStop
      } = extensionBridge.getSettings();

      const [{ value, valueIsRegex }] = valueRows;
      expect(value).toBe('abc');
      expect(valueIsRegex).toBe(true);
      expect(elementSelector).toBe('.foo');
      expect(bubbleStop).toBe(true);
    });
  });

  it('sets validation errors', () => {
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
    ).toBeTruthy();

    expect(extensionBridge.validate()).toBe(false);
  });

  it('The change input supports opening the data element modal', () => {
    spyOn(extensionBridge, 'openDataElementSelector').and.callFake(() => {
      return Promise.resolve();
    });

    fireEvent.click(pageElements.valueField.getShowFieldCheckBox());
    const [firstRow] = pageElements.valueField.getRows();
    fireEvent.click(firstRow.withinRow.getDataElementModalTrigger());
    expect(extensionBridge.openDataElementSelector).toHaveBeenCalledTimes(1);
  });

  it('change handles data element names just fine', () => {
    fireEvent.click(pageElements.valueField.getShowFieldCheckBox());

    const [firstRow] = pageElements.valueField.getRows();
    fireEvent.focus(firstRow.withinRow.getValueTextBox());
    userEvent.type(firstRow.withinRow.getValueTextBox(), '%Data Element 1%');
    fireEvent.blur(firstRow.withinRow.getValueTextBox());

    expect(
      firstRow.withinRow.getValueTextBox().hasAttribute('aria-invalid')
    ).toBeFalse();

    const { acceptableChangeValues: valueRows } = extensionBridge.getSettings();
    const [{ value }] = valueRows;
    expect(value).toBe('%Data Element 1%');
  });

  it('handles multiple rows', () => {
    expect(pageElements.valueField.getShowFieldCheckBox().checked).toBeFalse();
    fireEvent.click(pageElements.valueField.getShowFieldCheckBox());

    expect(pageElements.valueField.getRows().length).toBe(1);
    expect(
      pageElements.valueField.getAddRowButton().hasAttribute('disabled')
    ).toBeTrue();

    let rows = pageElements.valueField.getRows();
    userEvent.type(rows[0].withinRow.getValueTextBox(), 'first');
    fireEvent.click(pageElements.valueField.getAddRowButton());

    rows = pageElements.valueField.getRows();
    expect(rows.length).toBe(2);
    expect(
      pageElements.valueField.getAddRowButton().hasAttribute('disabled')
    ).toBeTrue();
    userEvent.type(rows[1].withinRow.getValueTextBox(), 'second');
    fireEvent.click(rows[1].withinRow.getRegexToggleSwitch());
    expect(
      pageElements.valueField.getAddRowButton().hasAttribute('disabled')
    ).toBeFalse();

    const { acceptableChangeValues: valueRows } = extensionBridge.getSettings();
    const [firstRow, secondRow] = valueRows;

    expect(firstRow.value).toBe('first');
    expect(Boolean(firstRow.valueIsRegex)).toBeFalse();
    expect(secondRow.value).toBe('second');
    expect(Boolean(secondRow.valueIsRegex)).toBeTrue();
  });

  it(
    'results in the showFieldCheckBox being checked when there is an empty ' +
      'string value from settings',
    function () {
      extensionBridge.init({
        settings: {
          acceptableChangeValues: [{ value: '', valueIsRegex: true }],
          valueIsRegex: true,
          elementSelector: '.foo',
          bubbleStop: true
        }
      });

      expect(pageElements.valueField.getShowFieldCheckBox().checked).toBe(true);
      expect(
        pageElements.valueField.getRows()[0].withinRow.getRegexToggleSwitch()
          .checked
      ).toBeTrue();
    }
  );

  it(
    'checking the showFieldCheckBox results in getting an empty string value ' +
      'in the settings',
    function () {
      fireEvent.click(pageElements.valueField.getShowFieldCheckBox());
      const { acceptableChangeValues: valueRows } =
        extensionBridge.getSettings();
      expect(valueRows.length).toBe(1);
      expect(valueRows[0].value).toBe('');
    }
  );
});
