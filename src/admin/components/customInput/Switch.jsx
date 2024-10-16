import '../../styles/switch.css'
import { ToggleVisibility } from '../../utils';
import { useState } from 'react';

const Switch = ({ name, value, onChange, disabled }) => {
    const [checkedValue, setCheckedValue] = useState(value === 'on');
    const usagePerDay = document.getElementById("usage_per_day");
    const usagePerDayLabel = document.getElementById("label_usage_per_day");

    if (!checkedValue) {
        ToggleVisibility(usagePerDay, false)
        ToggleVisibility(usagePerDayLabel, false)
    } else {
        ToggleVisibility(usagePerDay)
        ToggleVisibility(usagePerDayLabel)
    }

    const checkboxChange = (e) => {
        const event = {
            target: {
                name: name,
                value: e.target.value
            }
        };
        setCheckedValue(e.target.checked)
        onChange(event);
    }

    return (
        <>
            <label className="switch">
                <input type="checkbox"
                    name={name}
                    id={name}
                    onChange={checkboxChange}
                    checked={checkedValue}
                    disabled={disabled ?? false}
                />
                <span className="slider round"></span>
            </label>
        </>
    )

}

export default Switch;