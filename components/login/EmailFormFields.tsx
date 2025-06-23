import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailFormFieldsProps {
  readonly email: string;
  readonly setEmail: (email: string) => void;
  readonly password: string;
  readonly setPassword: (password: string) => void;
  readonly loading: boolean;
}

export function EmailFormFields({
  email,
  setEmail,
  password,
  setPassword,
  loading: _loading,
}: Readonly<EmailFormFieldsProps>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="zabrien@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </>
  );
}
