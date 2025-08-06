import React from 'react';
import heroImage from '../assets/images/OurProgrammes/jobImage.jpg';

const InternshipHero = () => {
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
  };

  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat py-20 sm:py-24 md:py-32 lg:py-40 text-white text-center"
      style={heroStyle}
    >
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white">Jobs & Careers</h1>
        <p className="text-xl text-gray-200 mt-4">
          Step into the real world. Develop your skills. Make an impact.
        </p>
      </div>
    </section>
  );
};

export default InternshipHero;