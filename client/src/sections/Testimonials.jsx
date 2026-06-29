import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, Autoplay } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { FaQuoteLeft } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getTestimonials, clearError } from '../store/slices/testimonialSlice';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

// Fallback testimonials in case API is not available
/*
const fallbackTestimonials = [
  {
    quote: "Quwwa Health Summer Camp was the best part of my holidays! I learned swimming, did fun educational activities, and enjoyed team games. Every day was exciting, and I became more active and confident.",
    name: 'Aarav Singh',
    title: 'Age: 12, Grade 6',
  },
  {
    quote: "I loved the art and craft sessions and the learning games. The camp made learning so much fun! I even made new friends and started enjoying physical activities.",
    name: 'Siya Joshi',
    title: 'Age: 10, Grade 5',
  },
  {
    quote: "This camp was a perfect mix of learning and fun. The structured drills helped me stay focused, and swimming gave me a lot of confidence. I wish the camp was longer!",
    name: 'Zain Khan',
    title: 'Age: 13, Grade 7',
  },
  {
    quote: "Before the camp, I used to feel tired easily. But after joining Quwwa Health Summer Camp, I feel stronger and more energetic. I loved the games and daily activities!",
    name: 'Manya Rathore',
    title: 'Age: 9, Grade 4',
  },
  {
    quote: "Every day at Quwwa Health Camp was different! Swimming, creative crafts, and games kept us all excited. I even started waking up early just to not miss the camp!",
    name: 'Rohan Mehta',
    title: 'Age: 11, Grade 5',
  },
  {
    quote: "Quwwa Health Summer Camp brought so much joy and growth to my child. They learned to swim, got creative with art & craft, and returned home each day with new things to share. The camp is truly well-balanced and inspiring.",
    name: 'Mrs. Kavita Mehra',
    title: 'Parent of Grade 5 Student',
  },
  {
    quote: "My child enjoyed every minute of the camp. The structured drills and physical games helped them become more disciplined and confident. I'm thankful to the Quwwa team for such a meaningful program.",
    name: 'Mr. Tariq Ansari',
    title: 'Parent of Grade 6 Student',
  },
  {
    quote: "My child was always excited to attend the camp! They loved the educational activities and started showing more interest in fitness too. The way the program combines fun and learning is just amazing.",
    name: 'Mrs. Ritu Sharma',
    title: 'Parent of Grade 4 Student',
  },
  {
    quote: "Quwwa's summer camp helped my child step out of screen time and into real action. They picked up new skills, made friends, and most importantly, enjoyed learning. A great initiative for young minds!",
    name: 'Mr. Sanjay Kulkarni',
    title: 'Parent of Grade 7 Student',
  }
];
*/
const fallbackTestimonials = [];

const Testimonials = () => {
  const dispatch = useDispatch();
  const { 
    testimonials, 
    loading, 
    error 
  } = useSelector((state) => ({
    testimonials: state.testimonial?.testimonials || [],
    loading: state.testimonial?.loading || false,
    error: state.testimonial?.error || null
  }));

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError());
    // Fetch testimonials
    dispatch(getTestimonials());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 lg:py-32 bg-gray-50">
        <div className="container mx-auto text-center px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!loading && (!testimonials || testimonials.length === 0)) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Testimonials</h2>
        <div className="flex justify-center mb-12 md:mb-16 lg:mb-20">
          <svg width="284" height="40" viewBox="0 0 284 40" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="w-48 sm:w-64 md:w-72 lg:w-96 h-auto">
            <g clipPath="url(#clip0_1_13202)">
              <path d="M180.851 0.697709C160.655 1.32266 140.471 2.37085 120.321 3.84229C102.035 4.16634 83.7464 4.49039 65.4609 4.81443C45.3964 5.17155 25.3319 5.52535 5.27073 5.88247C3.32975 5.91553 0.324047 7.34068 0.0264527 9.49328C-0.300901 11.8674 2.63536 12.2642 4.28867 12.2378C17.3266 12.0063 30.3646 11.7748 43.4025 11.5434C37.9764 12.2345 32.5568 12.952 27.1373 13.7026C25.2592 13.9638 22.637 14.8434 22.0385 16.8968C21.5029 18.7286 23.176 20.0281 24.9516 20.0612C55.0616 20.577 85.1748 21.0962 115.285 21.612C121.693 21.7211 128.101 21.8335 134.509 21.9426C125.291 22.9512 116.085 24.1118 106.906 25.4245C92.5122 27.4878 78.1781 29.9347 63.9068 32.7222C62.3659 33.0231 60.1802 34.3722 59.9454 36.1015C59.7173 37.7548 61.5392 38.8361 63.0007 38.8493C97.2439 39.1469 131.487 39.4478 165.73 39.7454C175.386 39.8281 185.038 39.914 194.693 39.9967C196.905 40.0165 199.742 39.385 200.856 37.2126C201.852 35.2683 199.987 33.6513 198.085 33.6348C165.122 33.3471 132.158 33.0595 99.1948 32.7718C100.114 32.6329 101.03 32.4907 101.949 32.3551C114.405 30.5101 126.904 28.946 139.43 27.6664C164.494 25.1071 189.67 23.6819 214.863 23.4009C215.978 23.3876 217.105 23.381 218.229 23.3744C230.999 23.5926 243.766 23.8142 256.536 24.0324C258.745 24.0688 261.592 23.4075 262.7 21.2483C263.718 19.2643 261.814 17.7466 259.929 17.6705C246.898 17.1481 233.853 16.9232 220.812 16.9993C203.74 16.705 186.668 16.414 169.596 16.1197C139.486 15.6039 109.373 15.0847 79.2626 14.5689C76.8356 14.5259 74.4052 14.4863 71.9782 14.4433C87.7441 12.7668 103.536 11.3483 119.349 10.1943C152.312 9.60901 185.279 9.02705 218.243 8.44178C238.307 8.08467 258.372 7.73086 278.433 7.37374C280.274 7.34068 282.979 6.07756 283.531 4.17956C284.074 2.32456 282.387 1.08127 280.618 1.01514C247.377 -0.221528 214.096 -0.330646 180.851 0.697709Z" fill="#F3F25B" />
            </g>
            <defs>
              <clipPath id="clip0_1_13202">
                <rect width="283.634" height="40" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="relative px-6 md:px-10 lg:px-16">
          <Swiper
            modules={[Navigation, A11y, Autoplay]}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            centeredSlides={true}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 40,
              }
            }}
            className="!pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index} className="h-full">
                {({ isActive }) => (
                  <div className={`h-full p-1 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-90'}`}>
                    <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col p-6 md:p-8">
                      <FaQuoteLeft className="text-3xl text-green-400 mb-4" />
                      <p className="text-gray-600 italic text-left flex-grow">
                        {testimonial.quote}
                      </p>
                      <div className="mt-6 pt-4 border-t border-gray-200 text-left">
                        <p className="font-bold text-lg text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/80 shadow-md hover:bg-gray-100 transition-colors">
            <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
          </button>
          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-white/80 shadow-md hover:bg-gray-100 transition-colors">
            <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
