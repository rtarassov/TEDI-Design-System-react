import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimeField } from './time-field';

import '@testing-library/jest-dom';

jest.mock('./time-field-helpers', () => ({
  ITEM_HEIGHT: 40,
  generateHours: () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')),
  generateMinutes: (step = 1) =>
    Array.from({ length: Math.floor(60 / step) }, (_, i) => (i * step).toString().padStart(2, '0')),
  parseTime: (time: string) => {
    const [h = '00', m = '00'] = (time || '00:00').split(':');
    return { hour: h.padStart(2, '0'), minute: m.padStart(2, '0') };
  },
  findClosestMinute: (target: string, minutes: string[]) => {
    const t = Number(target);
    return minutes.reduce((best, curr) => {
      const diff = Math.abs(Number(curr) - t);
      const bestDiff = Math.abs(Number(best) - t);
      return diff < bestDiff || (diff === bestDiff && Number(curr) > Number(best)) ? curr : best;
    }, minutes[0]);
  },
  getScrollIndex: (scrollTop: number) => Math.round(scrollTop / 40),
}));

jest.mock('@floating-ui/react', () => {
  const actual = jest.requireActual('@floating-ui/react');
  return {
    ...actual,
    useFloating: () => ({
      refs: { setReference: jest.fn(), setFloating: jest.fn() },
      x: 0,
      y: 0,
      strategy: 'absolute',
      context: {},
    }),
    useInteractions: () => ({
      getReferenceProps: (props = {}) => props,
      getFloatingProps: (props = {}) => props,
    }),
    useClick: () => ({}),
    useDismiss: () => ({}),
    useRole: () => ({}),
    FloatingPortal: ({ children }: { children: React.ReactNode }) =>
      children ? <div data-testid="floating-portal">{children}</div> : null,
    FloatingFocusManager: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

jest.mock(
  './time-field.module.scss',
  () =>
    new Proxy(
      {},
      {
        get: (target, prop) => prop,
      }
    )
);

beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

describe('TimeField', () => {
  const defaultProps = {
    id: 'time-test',
    label: 'Appointment time',
  };

  it('renders without crashing and shows label', () => {
    render(<TimeField {...defaultProps} />);
    expect(screen.getByLabelText('Appointment time')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(<TimeField {...defaultProps} placeholder="Select time" />);
    expect(screen.getByPlaceholderText('Select time')).toBeInTheDocument();
  });

  it('displays provided value (controlled)', () => {
    render(<TimeField {...defaultProps} value="14:30" />);
    const input = screen.getByLabelText('Appointment time');
    expect(input).toHaveValue('14:30');
  });

  it('uses defaultValue when uncontrolled and no value', () => {
    render(<TimeField {...defaultProps} defaultValue="09:15" />);
    expect(screen.getByLabelText('Appointment time')).toHaveValue('09:15');
  });

  it('is read-only when readOnly=true', () => {
    render(<TimeField {...defaultProps} readOnly />);
    const input = screen.getByLabelText('Appointment time');
    expect(input).toHaveAttribute('readonly');
  });

  it('marks field as required', () => {
    render(<TimeField {...defaultProps} required />);
    expect(screen.getByRole('textbox', { name: /appointment time/i })).toBeRequired();
  });

  // it('opens wheel picker when clicking icon button (default openBehavior=button)', async () => {
  //   const user = userEvent.setup();
  //   render(<TimeField {...defaultProps} />);

  //   const iconButton = screen.getByRole('button', { name: /schedule/i });
  //   await user.click(iconButton);

  //   await waitFor(() => {
  //     expect(screen.getByTestId('floating-portal')).toBeInTheDocument();
  //     expect(screen.getAllByText('00')).toHaveLength(2);
  //   });
  // });

  // it('suggests 00:00 and highlights it when opening empty picker', async () => {
  //   const user = userEvent.setup();
  //   const onChange = jest.fn();

  //   render(<TimeField {...defaultProps} onChange={onChange} />);

  //   await user.click(screen.getByRole('button', { name: /schedule/i }));

  //   await waitFor(() => {
  //     const input = screen.getByLabelText('Appointment time');
  //     expect(input).toHaveValue('00:00');
  //     expect(onChange).toHaveBeenCalledWith('00:00');

  //     const highlighted = screen.getAllByText('00', { selector: '[class*="--selected"]' });
  //     expect(highlighted).toHaveLength(2);
  //   });
  // });

  // it('does NOT suggest 00:00 again after value was cleared', async () => {
  //   const user = userEvent.setup();
  //   const onChange = jest.fn();

  //   const { rerender } = render(<TimeField {...defaultProps} onChange={onChange} />);

  //   await user.click(screen.getByRole('button', { name: /schedule/i }));
  //   await waitFor(() => expect(screen.getByLabelText('Appointment time')).toHaveValue('00:00'));

  //   rerender(<TimeField {...defaultProps} onChange={onChange} value="" />);
  //   await user.click(screen.getByRole('button', { name: /schedule/i }));

  //   await waitFor(() => {
  //     expect(onChange).toHaveBeenCalledTimes(1);
  //   });
  // });

  // it('selects time when clicking an hour and a minute', async () => {
  //   const user = userEvent.setup();
  //   const onChange = jest.fn();

  //   render(<TimeField {...defaultProps} onChange={onChange} />);

  //   await user.click(screen.getByRole('button', { name: /schedule/i }));
  //   await waitFor(() => expect(screen.getByText('13')).toBeInTheDocument());

  //   await user.click(screen.getByText('13')); // hour
  //   await user.click(screen.getByText('45')); // minute

  //   expect(onChange).toHaveBeenCalledWith('13:45');
  // });

  it('updates value when typing valid time', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TimeField {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText('Appointment time');
    await user.type(input, '17:20');

    expect(onChange).toHaveBeenCalledWith('17:20');
  });

  // it('applies custom className to container', () => {
  //   render(<TimeField {...defaultProps} className="custom-time-class" />);
  //   expect(screen.getByLabelText('Appointment time').closest('div')).toHaveClass('custom-time-class');
  // });

  // it('respects stepMinutes prop in minute column', async () => {
  //   const user = userEvent.setup();

  //   render(<TimeField {...defaultProps} stepMinutes={15} />);
  //   await user.click(screen.getByRole('button', { name: /schedule/i }));

  //   await waitFor(() => {
  //     expect(screen.getAllByText('05')).toHaveLength(0);
  //     expect(screen.getByText('15')).toBeInTheDocument();
  //   });
  // });
});
