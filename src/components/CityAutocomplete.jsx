import { useState, useEffect, useMemo, useRef } from 'react';
import SOUTH_AFRICAN_CITIES from '../data/southAfricanCities';

function CityAutocomplete({ className, placeholder, value, onChange, label, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (q.length === 0) return [];

    const starts = [];
    const contains = [];

    SOUTH_AFRICAN_CITIES.forEach((city) => {
      const c = city.toLowerCase();
      if (c.startsWith(q)) starts.push(city);
      else if (c.includes(q)) contains.push(city);
    });

    return [...starts, ...contains].slice(0, 6);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectCity(city) {
    onChange(city);
    setIsOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e) {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      selectCity(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className={(className || '') + ' autocomplete-wrap'} ref={wrapRef}>
      {label && <label>{label}</label>}
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        required={required}
      />
      {isOpen && suggestions.length > 0 && (
        <div className="autocomplete-list">
          {suggestions.map((city, i) => (
            <div
              key={city}
              className={'autocomplete-item' + (i === highlighted ? ' highlighted' : '')}
              onMouseDown={() => selectCity(city)}
            >
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;
