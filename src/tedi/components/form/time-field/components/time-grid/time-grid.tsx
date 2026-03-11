import cn from 'classnames';

import { Col, ColSize, Row } from '../../../../layout/grid';
import styles from '../../time-field.module.scss';

interface TimeGridProps {
  times: string[];
  value?: string;
  onSelect: (time: string) => void;
  colCount?: ColSize;
  className?: string;
}

export const TimeGrid: React.FC<TimeGridProps> = ({ times, value, onSelect, className, colCount = 4 }) => {
  return (
    <div className={cn(styles['tedi-time-field__grid'], className)}>
      <Row gutter={2}>
        {times.map((time) => (
          <Col width={colCount} key={time}>
            <div
              className={cn(styles['tedi-time-field__grid-item'], {
                [styles['tedi-time-field__grid-item--selected']]: time === value,
              })}
              onClick={() => onSelect(time)}
            >
              {time}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};
