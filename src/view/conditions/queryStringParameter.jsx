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
import { FieldArray } from 'redux-form';
import { Flex, TextField, View } from '@adobe/react-spectrum';
import FullWidthField from '../components/fullWidthField';
import NoWrapText from '../components/noWrapText';
import WrappedField from '../components/wrappedField';
import RegexToggle from '../components/regexToggle';
import MultipleItemEditor from '../components/multipleItemEditor';

const createItem = () => ({});

const renderItem = (field) => (
  <Flex data-row flex gap="size-100" alignItems="end">
    <NoWrapText>has value</NoWrapText>
    <View flex>
      <WrappedField
        label="Value"
        width="100%"
        name={`${field}.value`}
        component={TextField}
        isRequired
      />
    </View>

    <WrappedField
      name={`${field}.valueIsRegex`}
      component={RegexToggle}
      valueFieldName={`${field}.value`}
    />
  </Flex>
);

export default () => (
  <Flex gap="size-100" direction="column" minWidth="size-6000">
    <FullWidthField
      beginText="Return true if the parameter named"
      label="Parameter"
      name="name"
      blankSpace={{ width: 'size-1700', marginStart: 'size-100' }}
      isRequired
    />

    <FieldArray
      name="queryParams"
      renderItem={renderItem}
      component={MultipleItemEditor}
      interstitialLabel="OR"
      createItem={createItem}
    />
  </Flex>
);

export const formConfig = {
  settingsToFormValues(values, settings) {
    values = {
      ...values,
      ...settings
    };

    /** backwards compat changes **/
    // historically, settings.value was a simple string, and we could only compare
    // against one cookie value. This component was changed to support many cookie
    // values to compare against, but we provide an "upgrade path" here.
    if (!Array.isArray(values.queryParams)) {
      values.queryParams = [];
      if (typeof settings.value === 'string') {
        values.queryParams.push({
          value: settings.value,
          valueIsRegex: Boolean(settings.valueIsRegex)
        });
      } else {
        values.queryParams.push(createItem());
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
      errors.name = 'Please enter a URL parameter name.';
    }

    // values.value is now an array
    errors.queryParams = (values.queryParams || []).map((urlParamValue) => {
      const result = {};
      if (!urlParamValue.value) {
        result.value = 'Please specify a cookie value.';
      }
      return result;
    });

    return errors;
  }
};
