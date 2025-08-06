import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import footerLogo from '../assets/images/footer.png'

const Footer = () => {
  return (
    <footer className="bg-[#161C28]  text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="lg:col-span-2 flex justify-center flex-col ">
            <img src={footerLogo} alt="Quwwa Health Logo" className="h-auto w-[30%] md:w-[50%] lg:w-[40%] xl:w-[30%] mb-6" />
            <a
              href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7358912937480155136"
              target="_blank"
              rel="noopener noreferrer"
              className="relative max-w-sm block"
            >
              <div className="w-full bg-[#1E2A3A] border border-gray-400 rounded-full py-2 sm:py-3 pl-4 sm:pl-6 pr-12 sm:pr-16 text-sm sm:text-base text-white placeholder-gray-400">
                <span className="inline-flex items-center justify-center">
                  Subscribe to our newsletter
                </span>
              </div>
              <ArrowRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 text-blue-800 bg-white rounded-full p-1 cursor-pointer shadow" />
            </a>

          </div>

          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold mb-4">Support</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base md:text-lg">
              <li><Link to="/contact" className="hover:text-white transition-colors">Help centre</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">T&C Private Policy</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
              <li><Link to="/internship" className="hover:text-white transition-colors">Internships</Link></li>
            </ul>
          </div>


          <div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold mb-4">Our Programs</h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base md:text-lg">
              <li><Link to="/programs#alpro-health-card" className="hover:text-white transition-colors">Health Card</Link></li>
              <li><Link to="/programs#alpro-card" className="hover:text-white transition-colors">Sports Program</Link></li>
              <li><Link to="/programs#coach-card" className="hover:text-white transition-colors">Sports Day</Link></li>
              <li><Link to="/programs#canteen-card" className="hover:text-white transition-colors">Healthy Canteen</Link></li>
              <li><Link to="/holiday-camp" className="hover:text-white transition-colors">Holiday Camps</Link></li>
              <li><Link to="/branding" className="hover:text-white transition-colors">Branding Sponsorships</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 font-bold text-gray-400 text-xs sm:text-sm md:text-base">
          <p>COPYRIGHT {new Date().getFullYear()} QUWWA HEALTH LLP. – ALL RIGHTS RESERVED</p>
        </div>
      </div>
    </footer >
  )
}

export default Footer