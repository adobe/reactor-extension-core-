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

import React from 'react';
import { Checkbox, Flex, TextField, View } from '@adobe/react-spectrum';
import { FieldArray, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import WrappedField from '../components/wrappedField';

import ElementFilter, {
  formConfig as elementFilterFormConfig
} from './components/elementFilter';
import AdvancedEventOptions, {
  formConfig as advancedEventOptionsFormConfig
} from './components/advancedEventOptions';
import mergeFormConfigs from '../utils/mergeFormConfigs';
import MultipleItemEditor from '../components/multipleItemEditor';
import RegexToggle from '../components/regexToggle';

import './change.styl';

const createItem = () => ({});

const renderValueItem = (field) => (
  <Flex data-row flex gap="size-100" alignItems="end">
    <View flex>
      <WrappedField
        label="Value"
        width="100%"
        name={`${field}.value`}
        component={TextField}
        supportDataElement
      />
    </View>

    <WrappedField
      name={`${field}.valueIsRegex`}
      component={RegexToggle}
      valueFieldName={`${field}.value`}
    />
  </Flex>
);

const Change = ({ showValueField, isAddDisabled }) => (
  <>
    <ElementFilter elementSpecificityLabel="When the user changes" />

    <WrappedField name="showValueField" component={Checkbox}>
      and is changed to the following value...
    </WrappedField>

    {showValueField ? (
      <FieldArray
        name="value"
        renderItem={renderValueItem}
        component={MultipleItemEditor}
        interstitialLabel="OR"
        createItem={createItem}
        className="value-changed-to-options"
        isAddDisabled={isAddDisabled}
      />
    ) : null}

    <AdvancedEventOptions />
  </>
);

const valueSelector = formValueSelector('default');
const stateToProps = (state) => {
  const showValueField = valueSelector(state, 'showValueField');
  const existsEmptyChangeValue = valueSelector(state, 'value').some(
    (nextChangeValue) => {
      return !nextChangeValue.value?.length;
    }
  );
  return {
    showValueField,
    // this prevents the user from adding a ton of empty string comparisons
    // into the library, since the old behavior wasn't to require a string of
    // text once the showValueField checkbox is turned on
    isAddDisabled: !showValueField || existsEmptyChangeValue
  };
};

export default connect(stateToProps)(Change);

export const formConfig = mergeFormConfigs(
  elementFilterFormConfig,
  advancedEventOptionsFormConfig,
  {
    settingsToFormValues(values, settings) {
      /** backwards compat changes **/
      // historically, settings.value was a simple string, and we could only compare
      // against one value change. This component was changed to support many
      // values to compare against, but we provide an "upgrade path" here.
      let settingsValues = settings.value;
      if (!Array.isArray(settingsValues)) {
        settingsValues = [];
        if (typeof settings.value === 'string') {
          settingsValues.push({
            value: settings.value,
            valueIsRegex: Boolean(settings.valueIsRegex)
          });
        } else {
          settingsValues.push(createItem());
        }
      }

      const showValueField = typeof settingsValues[0]?.value === 'string';
      delete values.valueIsRegex;
      /** end backwards compat changes **/

      return {
        ...values,
        value: settingsValues,
        showValueField
      };
    },
    formValuesToSettings(settings, values) {
      /** legacy top level keys **/
      delete settings.valueIsRegex;
      /** end legacy top level keys **/

      if (values.showValueField) {
        const settingsValues = values.value.map((nextChangeValue) => {
          // ensure there is always at least a string
          return { ...nextChangeValue, value: nextChangeValue.value || '' };
        });

        settings = {
          ...settings,
          value: settingsValues
        };
      }

      return settings;
    }
  }
);
