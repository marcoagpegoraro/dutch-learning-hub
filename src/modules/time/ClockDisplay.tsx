import type { ClockType } from '../../types/settings';

interface ClockDisplayProps {
  hour: number;
  minute: number;
  clockType: Exclude<ClockType, 'random'>;
}

export function ClockDisplay({ hour, minute, clockType }: ClockDisplayProps) {
  const display = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const minuteDegrees = minute * 6;
  const hourDegrees = (hour % 12) * 30 + minute * 0.5;

  return (
    <div className="clock-stage mb-4" aria-label={`Clock showing ${display}`}>
      {clockType === 'digital' ? (
        <div className="digital-clock" aria-live="polite">
          {display}
        </div>
      ) : (
        <div className="analog-clock" role="img" aria-label={`Analog clock showing ${display}`}>
          <div className="clock-face" aria-hidden="true">
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((number) => (
              <span className={`clock-number n${number}`} key={number}>
                {number}
              </span>
            ))}
            <div
              className="clock-hand hour-hand"
              style={{ transform: `rotate(${hourDegrees}deg)` }}
            />
            <div
              className="clock-hand minute-hand"
              style={{ transform: `rotate(${minuteDegrees}deg)` }}
            />
            <div className="clock-pin" />
          </div>
        </div>
      )}
    </div>
  );
}
