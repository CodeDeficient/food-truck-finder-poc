import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
/**
 * A React component for rendering email and password input fields in a form.
 * @example
 * <EmailFormFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} />
 * // Renders two input fields where users can enter an email and password, respectively.
 * @param {Object} props - Component properties.
 * @param {string} props.email - Current email value.
 * @param {Function} props.setEmail - Function to update the email state.
 * @param {string} props.password - Current password value.
 * @param {Function} props.setPassword - Function to update the password state.
 * @param {boolean} props.loading - Indicates if the form is in a loading state, but it is not used within the component.
 * @returns {JSX.Element} Rendered email and password form fields.
 * @description
 *   - The component requires an email and password, along with their respective state updater functions.
 *   - The jsx elements are wrapped in fragments for structural purposes, allowing multiple sibling elements.
 */
export function EmailFormFields({ email, setEmail, password, setPassword, loading: _loading, }) {
    return (<>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="username@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
      </div>
    </>);
}
