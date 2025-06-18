// views/ContactPage/index.tsx

import React from 'react';
import FormSection from './FormSection';
import InformationSection from './InformationSection';

export default function ContactPage() {
  return (
    <div>
      <InformationSection />
      <FormSection />
    </div>
  );
}
