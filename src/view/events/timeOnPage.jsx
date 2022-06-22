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
import { TextField, Flex } from '@adobe/react-spectrum';
import WrappedField from '../components/wrappedField';
import NoWrapText from '../components/noWrapText';
import { isNumberLikeInRange, isDataElementToken } from '../utils/validators';

const TimeOnPage = () => (
  <Flex alignItems="end" gap="size-100" minWidth="size-6000">
    <NoWrapText>Trigger after</NoWrapText>
    <WrappedField
      label="Time On Page"
      name="timeOnPage"
      isRequired
      component={TextField}
      supportDataElement
    />
    <NoWrapText>seconds spent on the page</NoWrapText>
  </Flex>
);

export default TimeOnPage;

const minNumberOptions = { min: 1 };

export const formConfig = {
  settingsToFormValues(values, settings) {
    return {
      ...values,
      ...settings
    };
  },
  formValuesToSettings: (settings, values) => ({
    ...settings,
    timeOnPage: isNumberLikeInRange(values.timeOnPage, minNumberOptions)
      ? Number(values.timeOnPage)
      : String(values.timeOnPage || '')
  }),
  validate: (errors, values) => {
    errors = {
      ...errors
    };

    if (
      !isNumberLikeInRange(values.timeOnPage, minNumberOptions) &&
      !isDataElementToken(values.timeOnPage)
    ) {
      errors.timeOnPage =
        'Please specify a number greater than or equal to 1, or specify a data element.';
    }

    return errors;
  }
};
