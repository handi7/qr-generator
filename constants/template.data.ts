export const templates = [
  { label: "Free Text", key: "text" },
  { label: "Wifi", key: "wifi", default: "WIFI:T:WPA;S:Wifi Name;P:Wifi Password;;" },
  {
    label: "Whatsapp",
    key: "wa",
    default: `https://wa.me/628?text=Halo%20boleh%20tanya%3F`,
  },
  {
    label: "Contact (vCard)",
    key: "contact",
    default: `BEGIN:VCARD
      VERSION:3.0
      FN:John Doe
      END:VCARD`,
  },
];
