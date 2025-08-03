TypeError: Cannot read properties of null (reading 'phone')

Source
components\TruckDetailsModal.tsx (167:21) @ phone

  165 |     cuisine_type = [],
  166 |     social_media = {},
> 167 |     contact_info: { phone = '', email = '', website = '' } = {},
      |                     ^
  168 |     average_rating = 0,
  169 |     review_count = 0,
  170 |   } = truck;