import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Autoplay } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

import 'swiper/css';
import 'swiper/css/navigation';

import team1 from '../assets/images/AboutUs/team1.jpeg';
import team2 from '../assets/images/AboutUs/team2.jpeg';
import team3 from '../assets/images/AboutUs/team3.jpeg';
import team4 from '../assets/images/AboutUs/team4.jpeg';
import team5 from '../assets/images/AboutUs/team5.jpeg';

const CEO = [
  {
    name: 'Rahil Khan',
    image: team1,
    roles: ['CEO'],
  },
]

const teamMembers = [
  {
    name: 'Rahil Khan',
    roles: ['Founder and CEO'],
    image: team1,
    description: "Founder & CEO, Quwwa Health Rahil Khan is a national-level athlete, professional gymnast, and an alumnus of the Sports Authority of India. With years of experience working in schools and health institutions, he has devoted his life to preventive health, child development, and structured physical education.Recognizing the urgent need for integrated wellness in schools, Rahil founded Quwwa Health to bridge the gap between academics and holistic well-being. His leadership reflects a deep commitment to empowering students and educators through fitness, mental wellness, and sustainable health practices.Today, Rahil continues to lead Quwwa Health with a clear vision: To build healthier futures for every child, one school at a time."
  },
  {
    name: 'Zeeshan Khan',
    roles: ['Environmentalist & Sustainability Strategist- Dubai'],
    image: team5,
    description: 'Zeeshan Khan is a pioneering environmentalist and socio-entrepreneur. He brings a unique perspective to building scalable, eco-conscious systems in health and education. His guidance helps shape environmentally responsible strategies within Quwwa Health’s school wellness programs and sustainable initiatives.'
  },
  {
    name: 'Dr. Zeeshan Ahmad',
    roles: ['MPT (Sports), Certified Strength & Conditioning Coach (Australia)'],
    image: team4,
    description: 'Bringing global expertise in athletic conditioning and sports physiotherapy, Dr. Zeeshan Ahmad guides the development of injury-prevention protocols and performance-based fitness programming within school environments.'
  },
  {
    name: 'Dr. Prashant',
    roles: ['MPT (Sports Physiotherapy), India'],
    image: team2,
    description: 'Dr. Prashant offers specialized knowledge in pediatric physiotherapy and functional movement assessments, helping shape Quwwa Health’s student fitness screening and recovery frameworks.'
  },
  {
    name: 'Dr. Shahana Pathan',
    roles: ['Ph.D. in Counseling Psychology | Certified Special Educator | Life Skill Trainer – Riyadh'],
    image: team3,
    description: 'Dr. Shahana supports the integration of emotional intelligence, resilience training, and inclusive education practices into Quwwa Health’s wellness programs, ensuring a holistic, student-centered approach.'
  },
];

const TeamCard = ({ member, isFounder = false }) => (
  <div className={`bg rounded-3xl shadow-lg p-2 md:p-4 flex flex-col items-center h-full transform hover:scale-105 transition-transform duration-300 ${isFounder ? 'lg:flex-row lg:items-start lg:text-left' : ''}`}>
    <img
      src={member.image}
      alt={`Portrait of ${member.name}`}
      className="w-42 h-48 md:w-40 md:h-48 rounded-full object-cover mb-6 ring-4 ring-yellow-200 ring-offset-4 flex-shrink-0"
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/CCCCCC/FFFFFF?text=Image+Not+Found'; }}
    />
    <div className={`w-full ${isFounder ? 'lg:ml-8' : 'text-center'}`}>
      <h3 className="text-2xl font-bold text-[#191A15] mb-2">{member.name}</h3>
      <div className={`text-gray-600 w-full mt-4 space-y-2 border-b border-gray-200 pb-4 mb-4 ${isFounder ? '' : 'text-left'}`}>
        {member.roles.map((role, i) => (
          <p key={i} className={`flex text-sm ${isFounder ? 'md:flex md:justify-start justify-center md:items-center' : 'items-start'}`}>
            <span className="mr-2 mt-1 text-yellow-400 flex-shrink-0">&#8226;</span>
            <span>{role}</span>
          </p>
        ))}
      </div>
      <p className={`text-gray-700 text-sm whitespace-pre-line ${isFounder ? '' : 'text-left'}`}>
        {member.description}
      </p>
    </div>
  </div>
);

const Team = () => {
  const founder = teamMembers.find(member => member.name === 'Rahil Khan');
  const advisoryBoard = teamMembers.filter(member => member.name !== 'Rahil Khan');

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gray-50 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Founder Section */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Meet Our Founder
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            The vision behind our movement to build a healthier generation.
          </p>
          <div className="mt-12 max-w-4xl mx-auto">
            {founder && <TeamCard member={founder} isFounder={true} />}
          </div>
        </div>

        {/* Advisory Board Section */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Our Advisory Board
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our team members are not just leaders in their fields – they are advocates for a healthier, more educated generation.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 items-start mt-12">
          {advisoryBoard.map((member, index) => (
            <TeamCard key={index} member={member} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Team;
