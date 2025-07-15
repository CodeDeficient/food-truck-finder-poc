import React from 'react';

interface ContactInfoCardProps {
  phone?: string;
  email?: string;
  website?: string;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ phone, email, website }) => {
  return (
    <div>
      <h3>Contact Information</h3>
      {phone && <p>Phone: {phone}</p>}
      {email && <p>Email: {email}</p>}
      {website && <p>Website: {website}</p>}
    </div>
  );
};

export default ContactInfoCard;
