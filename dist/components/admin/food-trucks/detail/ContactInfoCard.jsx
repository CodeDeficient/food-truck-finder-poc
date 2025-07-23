import React from 'react';
const ContactInfoCard = ({ phone, email, website }) => {
    return (<div>
      <h3>Contact Information</h3>
      {phone && <p>Phone: {phone}</p>}
      {email && <p>Email: {email}</p>}
      {website && <p>Website: {website}</p>}
    </div>);
};
export default ContactInfoCard;
