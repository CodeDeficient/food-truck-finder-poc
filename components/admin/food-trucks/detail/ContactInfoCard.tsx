import React from 'react';

interface ContactInfoCardProps {
  phone?: string;
  email?: string;
  website?: string;
}

// Default props for the component
const defaultProps: Required<ContactInfoCardProps> = {
  phone: '',
  email: '',
  website: '',
};

const ContactInfoCard: React.FC<ContactInfoCardProps> = (props) => {
  // Merge props with defaults to ensure we have all values
  const { phone, email, website } = { ...defaultProps, ...props };
  
  // Check if any contact info is available
  const hasContactInfo = Boolean((phone && phone.trim() !== '') || 
                        (email && email.trim() !== '') || 
                        (website && website.trim() !== ''));
  
  return (
    <div>
      <h3>Contact Information</h3>
      {hasContactInfo ? (
        <>
          {phone && phone.trim() !== '' && <p>Phone: {phone}</p>}
          {email && email.trim() !== '' && <p>Email: {email}</p>}
          {website && website.trim() !== '' && <p>Website: {website}</p>}
        </>
      ) : (
        <p className="text-gray-500 italic">No contact information available</p>
      )}
    </div>
  );
};

export default ContactInfoCard;
