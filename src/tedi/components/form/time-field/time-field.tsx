import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import cn from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import TextField, { TextFieldProps } from '../textfield/textfield';
import { TimeGrid } from './components/time-grid/time-grid';
import { TimeWheel } from './components/time-wheel/time-wheel';
import styles from './time-field.module.scss';
import { findClosestMinute, generateHours, generateMinutes, ITEM_HEIGHT, parseTime } from './time-field-helpers';

export interface TimeFieldProps {
  /**
   * Unique identifier for the input field
   */
  id: string;
  /**
   * Label displayed above the input
   */
  label: string;
  /**
   * Controlled value (HH:mm format)
   */
  value?: string;
  /**
   * Default value for uncontrolled usage
   */
  defaultValue?: string;
  /**
   * Callback fired when the time changes
   */
  onChange?: (time: string) => void;
  /**
   * Makes the field read-only and disables the picker
   * @default false
   */
  readOnly?: boolean;
  /**
   * Marks the field as required
   */
  required?: boolean;
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  /**
   * Additional props passed to the underlying TextField
   */
  inputProps?: Omit<TextFieldProps, 'id' | 'label' | 'value' | 'onChange'>;
  /**
   * Determines how the picker opens
   * @default button
   */
  openBehavior?: 'input' | 'button';
  /**
   * Minute step for the wheel picker
   * @default 1
   */
  stepMinutes?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * If provided, the picker switches to grid mode
   * and displays only these selectable times
   */
  availableTimes?: string[];
}

export const TimeField: React.FC<TimeFieldProps> = ({
  id,
  label,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  required,
  placeholder,
  inputProps,
  openBehavior = 'button',
  stepMinutes = 1,
  className,
  availableTimes,
}) => {
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue ?? availableTimes?.[0] ?? '');

  const currentValue = isControlled ? value ?? '' : internalValue;

  const [open, setOpen] = useState(false);
  const [hasSuggestedDefault, setHasSuggestedDefault] = useState(false);

  const hours = useMemo(generateHours, []);
  const minutes = useMemo(() => generateMinutes(stepMinutes), [stepMinutes]);

  useEffect(() => {
    if (open && !readOnly && currentValue === '' && !hasSuggestedDefault) {
      if (!isControlled) {
        setInternalValue('00:00');
      }
      onChange?.('00:00');
      setHasSuggestedDefault(true);
    }
  }, [open, currentValue, hasSuggestedDefault, readOnly, isControlled, onChange]);

  useEffect(() => {
    if (currentValue === '') {
      setHasSuggestedDefault(false);
    }
  }, [currentValue]);

  const { hour, minute } = parseTime(currentValue || '00:00');
  const selectedHour = hours.includes(hour) ? hour : '00';
  const selectedMinute = findClosestMinute(minute, minutes);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-end',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const { refs, context, x, y, strategy } = floating;

  const clickInteraction = useClick(context);
  const dismissInteraction = useDismiss(context);
  const roleInteraction = useRole(context, { role: 'listbox' });

  const interactions = useInteractions([
    ...(openBehavior === 'input' && !readOnly ? [clickInteraction] : []),
    dismissInteraction,
    roleInteraction,
  ]);

  const updateTime = (time: string) => {
    const cleaned = time.trim();
    if (!isControlled) {
      setInternalValue(cleaned);
    }
    onChange?.(cleaned);
  };

  useEffect(() => {
    if (!open || readOnly) return;

    const { hour, minute } = parseTime(currentValue || '00:00');
    const selHour = hours.includes(hour) ? hour : '00';
    const selMinute = findClosestMinute(minute, minutes);

    const hourIndex = hours.indexOf(selHour);
    const minuteIndex = minutes.indexOf(selMinute);

    hourRef.current?.scrollTo({
      top: Math.max(0, hourIndex) * ITEM_HEIGHT,
      behavior: 'instant',
    });

    minuteRef.current?.scrollTo({
      top: Math.max(0, minuteIndex) * ITEM_HEIGHT,
      behavior: 'instant',
    });
  }, [open, currentValue, readOnly, hours, minutes]);

  return (
    <>
      <div
        ref={refs.setReference}
        className={cn(styles['tedi-time-field__container'], className)}
        {...(readOnly ? {} : interactions.getReferenceProps())}
        aria-haspopup="listbox"
      >
        <TextField
          {...(inputProps as TextFieldProps)}
          id={id}
          label={label}
          value={currentValue}
          placeholder={placeholder}
          readOnly={readOnly}
          isClearable
          icon="schedule"
          onIconClick={() => !readOnly && setOpen((prev) => !prev)}
          onChange={(val) => updateTime(val)}
          required={required}
          aria-expanded={open}
          className={cn(styles['tedi-time-field__textfield'], {
            [styles['tedi-time-field__textfield--disabled']]: inputProps?.disabled,
          })}
        />
      </div>

      <FloatingPortal>
        {open && !readOnly && (
          <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
            <div
              ref={refs.setFloating}
              {...interactions.getFloatingProps({
                style: { position: strategy, top: y ?? 0, left: x ?? 0 },
              })}
            >
              {availableTimes ? (
                <TimeGrid
                  times={availableTimes}
                  value={currentValue}
                  onSelect={(time) => {
                    updateTime(time);
                    setOpen(false);
                  }}
                />
              ) : (
                <div className={styles['tedi-time-field__wheel']}>
                  <TimeWheel
                    hours={hours}
                    minutes={minutes}
                    selectedHour={selectedHour}
                    selectedMinute={selectedMinute}
                    onChange={(hour, minute) => updateTime(`${hour}:${minute}`)}
                  />
                </div>
              )}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
};
