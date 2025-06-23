import React from 'react';
import { Mail, Phone, Globe } from 'lucide-react';

interface ContactFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  href?: string;
  unavailableText: string;
}

export function ContactField({
  icon: Icon,
  label,
  value,
  href,
  unavailableText
}: Readonly<ContactFieldProps>) {
  if (value == undefined || value === '') {
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
