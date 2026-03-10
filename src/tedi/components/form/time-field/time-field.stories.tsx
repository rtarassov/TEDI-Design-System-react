import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Text } from '../../base/typography/text/text';
import { Col, Row } from '../../layout/grid';
import { TimeField, TimeFieldProps } from './time-field';

/**
 * <a href="https://www.figma.com/design/jWiRIXhHRxwVdMSimKX2FF/TEDI-READY-2.38.59?node-id=4662-91741&m=dev" target="_BLANK">Figma ↗</a><br />
 * <a href="https://www.tedi.ee/1ee8444b7/p/73629d-time-field" target="_BLANK">Zeroheight ↗</a>
 */

export default {
  title: 'Tedi-Ready/Components/Form/TimeField',
  component: TimeField,
} as Meta<TimeFieldProps>;

type Story = StoryObj<TimeFieldProps>;

const Template: StoryFn<TimeFieldProps> = (args) => <TimeField {...args} />;
const stateArray = ['Default', 'Hover', 'Focus', 'Active', 'Disabled'];

interface TemplateStateProps extends TimeFieldProps {
  array: typeof stateArray;
}

const TemplateColumnWithStates: StoryFn<TemplateStateProps> = (args) => {
  const { array, ...timeFieldProps } = args;

  return (
    <div className="state-example">
      {array.map((state, index) => (
        <Row key={index} className="padding-14-16">
          <Col width={2} className="display-flex align-items-center">
            <Text modifiers="bold">{state}</Text>
          </Col>
          <Col className="display-flex align-items-center" width={10}>
            <TimeField
              {...timeFieldProps}
              id={state}
              inputProps={{
                ...(state === 'Disabled' && { disabled: true }),
              }}
            />
          </Col>
        </Row>
      ))}
      <Row className="padding-14-16">
        <Col width={2} className="display-flex align-items-center">
          <Text modifiers="bold">Success</Text>
        </Col>
        <Col className="display-flex align-items-center" width={10}>
          <TimeField
            {...timeFieldProps}
            id="success-time-field"
            inputProps={{
              helper: { text: 'Feedback text', type: 'valid' },
            }}
          />
        </Col>
      </Row>
      <Row className="padding-14-16">
        <Col width={2} className="display-flex align-items-center">
          <Text modifiers="bold">Error</Text>
        </Col>
        <Col className="display-flex align-items-center" width={10}>
          <TimeField
            {...timeFieldProps}
            id="error-time-field"
            inputProps={{
              helper: { text: 'Feedback text', type: 'error' },
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export const Single: Story = {
  render: Template,
  args: {
    label: 'Time',
    required: true,
    stepMinutes: 1,
  },
};

export const States: StoryObj<TemplateStateProps> = {
  render: TemplateColumnWithStates,
  args: {
    array: stateArray,
    label: 'Time',
  },
  parameters: {
    pseudo: {
      hover: '#Hover',
      focus: '#Focus',
      active: '#Active',
    },
  },
};

export const DefaultValue: Story = {
  render: Template,
  args: {
    label: 'Default selected time',
    defaultValue: '14:30',
  },
};

export const CustomStep: Story = {
  render: Template,
  args: {
    label: 'Time with 15-min steps',
    stepMinutes: 15,
    placeholder: 'hh:mm',
  },
};

export const ManualTyping: StoryFn<TimeFieldProps> = (args) => {
  const [time, setTime] = useState<string | undefined>('08:00');

  return (
    <TimeField
      {...args}
      value={time}
      onChange={(val) => setTime(val)}
      label="Enter time manually"
      placeholder="HH:mm"
    />
  );
};

export const AvailableTimesInGrid: Story = {
  render: () => {
    const [time, setTime] = useState<string | undefined>();
    const availableTimes = [
      '08:00',
      '08:30',
      '09:00',
      '09:15',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
    ];

    return (
      <TimeField
        id="available-times"
        label="Select time from grid"
        value={time}
        onChange={setTime}
        placeholder="Choose time"
        availableTimes={availableTimes}
      />
    );
  },
};
