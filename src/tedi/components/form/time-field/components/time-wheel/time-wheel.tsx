import cn from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';

import styles from '../../time-field.module.scss';
import {
  clearScrollTimeout,
  getScrollTopForIndex,
  needsScrollCorrection,
  scrollToIndex,
  snapToNearestItem,
} from '../../time-field-helpers';

export interface TimeWheelProps {
  hours: string[];
  minutes: string[];
  selectedHour: string;
  selectedMinute: string;
  onChange: (hour: string, minute: string) => void;
  className?: string;
}

export const TimeWheel: React.FC<TimeWheelProps> = ({
  hours,
  minutes,
  selectedHour,
  selectedMinute,
  onChange,
  className,
}) => {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const isProgrammaticScrollHour = useRef(false);
  const isProgrammaticScrollMinute = useRef(false);

  const scrollTimeoutHour = useRef<NodeJS.Timeout>();
  const scrollTimeoutMinute = useRef<NodeJS.Timeout>();

  const lastHourIndex = useRef(hours.indexOf(selectedHour));

  const lastMinuteIndex = useRef(minutes.indexOf(selectedMinute));

  const syncScroll = useCallback(
    (ref: React.RefObject<HTMLDivElement>, index: number, isHour: boolean, length: number) => {
      if (!ref.current) return;

      const targetScroll = getScrollTopForIndex(index);

      const current = ref.current.scrollTop;

      if (!needsScrollCorrection(current, targetScroll)) return;

      if (isHour) isProgrammaticScrollHour.current = true;
      else isProgrammaticScrollMinute.current = true;

      scrollToIndex(ref.current, index);

      if (isHour) clearScrollTimeout(scrollTimeoutHour.current);
      else clearScrollTimeout(scrollTimeoutMinute.current);

      const timeout = setTimeout(() => {
        if (!ref.current) return;

        const finalIndex = snapToNearestItem(ref.current.scrollTop, length);

        const finalScroll = getScrollTopForIndex(finalIndex);

        if (needsScrollCorrection(ref.current.scrollTop, finalScroll)) {
          ref.current.scrollTo({
            top: finalScroll,
          });
        }

        if (isHour) isProgrammaticScrollHour.current = false;
        else isProgrammaticScrollMinute.current = false;
      }, 50);

      if (isHour) scrollTimeoutHour.current = timeout;
      else scrollTimeoutMinute.current = timeout;
    },
    []
  );

  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);

    const minuteIndex = minutes.indexOf(selectedMinute);

    if (hourIndex >= 0) {
      syncScroll(hourRef, hourIndex, true, hours.length);

      lastHourIndex.current = hourIndex;
    }

    if (minuteIndex >= 0) {
      syncScroll(minuteRef, minuteIndex, false, minutes.length);

      lastMinuteIndex.current = minuteIndex;
    }
  }, [selectedHour, selectedMinute, hours, minutes, syncScroll]);

  const handleHourScroll = () => {
    if (!hourRef.current || isProgrammaticScrollHour.current) return;

    const index = snapToNearestItem(hourRef.current.scrollTop, hours.length);

    if (index !== lastHourIndex.current) {
      const hour = hours[index];

      if (hour) {
        lastHourIndex.current = index;

        onChange(hour, selectedMinute);
      }
    }

    clearScrollTimeout(scrollTimeoutHour.current);

    scrollTimeoutHour.current = setTimeout(() => {
      if (!hourRef.current) return;

      const target = getScrollTopForIndex(index);

      if (needsScrollCorrection(hourRef.current.scrollTop, target)) {
        isProgrammaticScrollHour.current = true;

        scrollToIndex(hourRef.current, index);

        setTimeout(() => {
          isProgrammaticScrollHour.current = false;
        }, 20);
      }
    }, 80);
  };

  const handleMinuteScroll = () => {
    if (!minuteRef.current || isProgrammaticScrollMinute.current) return;

    const index = snapToNearestItem(minuteRef.current.scrollTop, minutes.length);

    if (index !== lastMinuteIndex.current) {
      const minute = minutes[index];

      if (minute) {
        lastMinuteIndex.current = index;

        onChange(selectedHour, minute);
      }
    }

    clearScrollTimeout(scrollTimeoutMinute.current);

    scrollTimeoutMinute.current = setTimeout(() => {
      if (!minuteRef.current) return;

      const target = getScrollTopForIndex(index);

      if (needsScrollCorrection(minuteRef.current.scrollTop, target)) {
        isProgrammaticScrollMinute.current = true;

        scrollToIndex(minuteRef.current, index);

        setTimeout(() => {
          isProgrammaticScrollMinute.current = false;
        }, 20);
      }
    }, 80);
  };

  const handleHourClick = (index: number) => {
    const hour = hours[index];

    if (!hour) return;

    clearScrollTimeout(scrollTimeoutHour.current);

    onChange(hour, selectedMinute);

    lastHourIndex.current = index;

    if (!hourRef.current) return;

    isProgrammaticScrollHour.current = true;

    scrollToIndex(hourRef.current, index, 'smooth');

    setTimeout(() => {
      if (!hourRef.current) return;

      isProgrammaticScrollHour.current = false;

      const target = getScrollTopForIndex(index);

      if (needsScrollCorrection(hourRef.current.scrollTop, target)) {
        hourRef.current.scrollTo({
          top: target,
        });
      }
    }, 200);
  };

  const handleMinuteClick = (index: number) => {
    const minute = minutes[index];

    if (!minute) return;

    clearScrollTimeout(scrollTimeoutMinute.current);

    onChange(selectedHour, minute);

    lastMinuteIndex.current = index;

    if (!minuteRef.current) return;

    isProgrammaticScrollMinute.current = true;

    scrollToIndex(minuteRef.current, index, 'smooth');

    setTimeout(() => {
      if (!minuteRef.current) return;

      isProgrammaticScrollMinute.current = false;

      const target = getScrollTopForIndex(index);

      if (needsScrollCorrection(minuteRef.current.scrollTop, target)) {
        minuteRef.current.scrollTo({
          top: target,
        });
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearScrollTimeout(scrollTimeoutHour.current);

      clearScrollTimeout(scrollTimeoutMinute.current);
    };
  }, []);

  return (
    <div className={cn(styles['tedi-time-field__wheel'], className)}>
      <div ref={hourRef} className={styles['tedi-time-field__wheel-column']} onScroll={handleHourScroll}>
        {hours.map((h, idx) => (
          <div
            key={h}
            className={cn(styles['tedi-time-field__wheel-item'], {
              [styles['tedi-time-field__wheel-item--selected']]: h === selectedHour,
            })}
            onClick={() => handleHourClick(idx)}
          >
            {h}
          </div>
        ))}
      </div>

      <div ref={minuteRef} className={styles['tedi-time-field__wheel-column']} onScroll={handleMinuteScroll}>
        {minutes.map((m, idx) => (
          <div
            key={m}
            className={cn(styles['tedi-time-field__wheel-item'], {
              [styles['tedi-time-field__wheel-item--selected']]: m === selectedMinute,
            })}
            onClick={() => handleMinuteClick(idx)}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
};
