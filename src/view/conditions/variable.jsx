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
import { Flex, TextField, View } from '@adobe/react-spectrum';
import { FieldArray } from 'redux-form';
import InfoTip from '../components/infoTip';
import RegexToggle from '../components/regexToggle';
import WrappedField from '../components/wrappedField';
import NoWrapText from '../components/noWrapText';
import FullWidthField from '../components/fullWidthField';
import MultipleItemEditor from '../components/multipleItemEditor';

const createItem = () => ({});

const renderItem = (field) => (
  <Flex data-row flex gap="size-100" alignItems="end">
    <NoWrapText>has value</NoWrapText>
    <View flex>
      <WrappedField
        minWidth="size-4600"
        width="100%"
        label="Value"
        name={`${field}.value`}
        component={TextField}
        isRequired
      />
    </View>
    <View>
      <InfoTip className="u-gapRight" placement="bottom">
        Specify a text (string) value here. The rule will only fire if the
        specified variable contains this string. Note: If your variable contains
        a number, this will not work as expected.
      </InfoTip>
    </View>
    <WrappedField
      name={`${field}.valueIsRegex`}
      component={RegexToggle}
      valueFieldName={`${field}.value`}
    />
  </Flex>
);

const Variable = () => (
  <Flex gap="size-100" direction="column" minWidth="size-6000">
    <FullWidthField
      beginText="Return true if the JavaScript variable named"
      label="Variable name"
      name="name"
      minWidth="size-2400"
      placeholder="dataLayer.products.1.price"
      isRequired
      blankSpace={{
        width: 'size-2000',
        marginEnd: 'size-200',
        marginStart: 'size-115'
      }}
    />

    <FieldArray
      name="variableValues"
      renderItem={renderItem}
      component={MultipleItemEditor}
      interstitialLabel="OR"
      createItem={createItem}
    />
  </Flex>
);

export default Variable;

export const formConfig = {
  settingsToFormValues(values, settings) {
    values = {
      ...values,
      ...settings
    };

    /** backwards compat changes **/
    // historically, settings.value was a simple string, and we could only compare
    // against one variable value. This component was changed to support many variable
    // values to compare against, but we provide an "upgrade path" here.
    if (!Array.isArray(values.variableValues)) {
      values.variableValues = [];
      if (typeof settings.value === 'string') {
        values.variableValues.push({
          value: settings.value,
          valueIsRegex: Boolean(settings.valueIsRegex)
        });
      } else {
        values.variableValues.push(createItem());
      }
    }
    delete values.value;
    delete values.valueIsRegex;
    /** end backwards compat changes **/

    return values;
  },
  formValuesToSettings(settings, values) {
    /** legacy top level keys **/
    delete settings.value;
    delete settings.valueIsRegex;
    /** end legacy top level keys **/

    return {
      ...settings,
      ...values
    };
  },
  validate(errors, values) {
    errors = {
      ...errors
    };

    if (!values.name) {
      errors.name = 'Please specify a variable name.';
    }

    // values.value is now an array
    errors.variableValues = (values.variableValues || []).map(
      (variableValue) => {
        const result = {};
        if (!variableValue.value) {
          result.value = 'Please specify a cookie value.';
        }
        return result;
      }
    );

    return errors;
  }
};
