import React from 'react';
// Removed Mail, Phone, Globe imports as they are not directly used here

interface ContactFieldProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value?: string;
  readonly href?: string;
  readonly unavailableText: string;
}

/**
 * Renders a contact field with an icon, label, and value, providing a hyperlink if applicable.
 * @example
 * ContactField({ icon: IconComponent, label: "Email", value: "info@example.com", href: "mailto:info@example.com", unavailableText: "Not available" })
 * // Returns a JSX element displaying the contact information.
 * @param {object} options - The properties object.
 * @param {React.Component} options.icon - The icon component to display.
 * @param {string} options.label - The label describing the contact field.
 * @param {?string} options.value - The value or text related to the contact field.
 * @param {?string} options.href - The hyperlink reference for the contact value.
 * @param {string} options.unavailableText - Text to display when the value is unavailable.
 * @returns {JSX.Element} A JSX element containing the formatted contact field.
 * @description
 *   - Uses specific CSS classes to style the contact field and its elements.
 *   - Displays `unavailableText` if `value` is undefined or empty.
 *   - Opens links in a new tab with `noopener noreferrer` security attributes if `href` is provided.
 */
export function ContactField({
  icon: Icon,
  label,
  value,
  href,
  unavailableText,
}: Readonly<ContactFieldProps>) {
  if (value == undefined || value.length === 0) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="size-4" />
        <span className="text-sm">{unavailableText}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Icon className="size-4 text-gray-500" />
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
