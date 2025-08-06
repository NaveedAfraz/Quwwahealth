import React from 'react';
import InternshipHero from '../sections/InternshipHero';
import InternshipIntro from '../sections/InternshipIntro';
import InternshipDetails from '../sections/InternshipDetails';
import InternshipForm from '../sections/InternshipForm';

const Internship = () => {
  return (
    <div className="bg-gradient-to-r from-[#DFF2E0] to-[#F7F6ED]">
      <InternshipHero />
      <InternshipIntro />
      <InternshipDetails />
      <InternshipForm />
    </div>
  );
};

export default Internship;
