import React from 'react';
// Removed Mail, Phone, Globe imports as they are not directly used here

interface ContactFieldProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value?: string;
  readonly href?: string;
  readonly unavailableText: string;
}

export function ContactField({
  icon: Icon,
  label,
  value,
  href,
  unavailableText
}: Readonly<ContactFieldProps>) {
  if (value == undefined || value == undefined || value === '') {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{unavailableText}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-500" />
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
