import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';

interface GenesisStepperProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  presets?: number[];
  label?: string;
  helperText?: string;
}

export const GenesisStepper: React.FC<GenesisStepperProps> = ({
  value,
  min,
  max,
  step = 10,
  onChange,
  disabled = false,
  presets = [100, 200, 250, 300, 500],
  label = 'Student Enrollment Count',
  helperText,
}) => {
  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (isNaN(num)) return;
    if (num >= min && num <= max) {
      onChange(num);
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            {label}
          </label>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Allowed: {min} - {max} students
          </span>
        </div>
      )}

      {/* Main Counter Display with Controls */}
      <div className="flex items-center gap-3 bg-neutral-50 p-2 rounded-2xl border border-neutral-200">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="w-11 h-11 rounded-xl bg-white border border-neutral-300 text-neutral-800 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm font-bold"
          title="Decrease student count"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full text-center text-3xl font-extrabold text-neutral-900 bg-transparent border-0 focus:ring-0 p-0 tracking-tight"
          />
          <span className="text-[11px] font-bold text-neutral-600 tracking-wider uppercase block -mt-1">
            Confirmed Students
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="w-11 h-11 rounded-xl bg-amber-500 border border-amber-400 text-neutral-950 hover:bg-amber-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm font-bold"
          title="Increase student count"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Slider Control */}
      <div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
        />
      </div>

      {/* Quick Select Preset Pills */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 mr-1">Quick Select:</span>
          {presets.map((preset) => {
            if (preset < min || preset > max) return null;
            const isSelected = value === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                disabled={disabled}
                className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="text-xs text-neutral-500 italic mt-1">{helperText}</p>
      )}
    </div>
  );
};
