'use client';
import * as React from 'react';
/**
* Renders a tooltip for data quality charts when active, displaying label and percentage information.
* @example
* renderTooltip({ active: true, payload: [{ value: 10, payload: { percentage: '20' } }], label: 'Data Point' })
* returns a tooltip element containing "Data Point: 10" and "20% of total"
* @param {TooltipProps} { active, payload, label } - Tooltip properties including active state, data payload, and label.
* @returns {JSX.Element} A JSX element representing the tooltip.
* @description
*   - Ensures the tooltip is only rendered when active and payload is valid.
*   - Utilizes optional chaining and default values for label display.
*   - Percentage shown only if defined and not empty in the payload.
*/
const CustomTooltip = ({ active, payload, label }) => {
    if (active === true && payload != undefined && payload.length > 0) {
        return (<div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg" role="status" aria-live="assertive">
        <p className="font-medium">{`${label !== null && label !== void 0 ? label : 'Unknown'}: ${payload[0].value}`}</p>
        <p className="text-sm text-gray-600">
          {payload[0].payload.percentage != undefined &&
                payload[0].payload.percentage !== '' &&
                `${payload[0].payload.percentage}% of total`}
        </p>
      </div>);
    }
};
export default CustomTooltip;
