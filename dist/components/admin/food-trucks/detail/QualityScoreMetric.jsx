/**
* Renders a quality score metric component displaying a value and label.
* @example
* QualityScoreMetric({ value: 85, label: 'Quality Score' })
* <div className="text-center"><div className="text-lg font-semibold text-gray-900">85</div><div className="text-sm text-gray-500">Quality Score</div></div>
* @param {Object} props - The properties object for the component.
* @param {number|string} props.value - The numerical or string value representing the quality score.
* @param {string} props.label - The label describing the score metric.
* @param {string} [props.className='text-gray-900'] - The optional CSS class name for styling the value text.
* @returns {JSX.Element} A JSX element representing the quality score metric.
* @description
*   - Uses default className 'text-gray-900' if none is provided, for the value text.
*   - Expected to be used within a larger component rendering context.
*   - The 'value' appears larger and more prominent due to its font size and weight.
*/
export function QualityScoreMetric({ value, label, className = 'text-gray-900', }) {
    return (<div className="text-center">
      <div className={`text-lg font-semibold ${className}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>);
}
