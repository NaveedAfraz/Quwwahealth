import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import config from '../config/config';

const roles = [
  'PE Coach Intern', 'Health Educator Intern', 'Content Writer', 'Graphic Designing',
  'Web & Tech', 'Admin & Operations', 'Business and Sales'
];

const InternshipForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    city: '',
    course: '',
    college: '',
    year: '',
    lookingFor: '',
    role: '',
    mode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.post(`${config.API_BASE_URL}/internshipForm`, formData);
      setSuccess(true);
      toast.success("Form submitted successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-transparent">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Application Form</h2>
          <p className="text-gray-600 mb-6 text-center">Please fill out the form below to apply for the internship position. Fields marked with <span className="text-red-500">★</span> are mandatory.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">★</span></label>
                  <input type="text" name="fullName" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address <span className="text-red-500">★</span></label>
                  <input type="email" name="email" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number <span className="text-red-500">★</span></label>
                  <input type="tel" name="phone" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">★</span></label>
                  <input type="date" name="dob" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current City/Country <span className="text-red-500">★</span></label>
                  <input type="text" name="city" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Educational Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Course or Degree <span className="text-red-500">★</span></label>
                  <input type="text" name="course" placeholder="e.g., B.P.Ed, BBA, BCA, B.Com, etc." onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">College/University Name <span className="text-red-500">★</span></label>
                  <input type="text" name="college" onChange={handleChange} className="w-full border rounded p-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Year of Study <span className="text-red-500">★</span></label>
                  <select name="year" onChange={handleChange} className="w-full border rounded p-2" required>
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="Final">Final Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">What are you looking for?</label>
                  <div className="flex items-center space-x-4">
                    <label><input type="radio" name="lookingFor" value="Job" onChange={handleChange} /> Job</label>
                    <label><input type="radio" name="lookingFor" value="Internship" onChange={handleChange} /> Internship</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Role <span className="text-red-500">★</span></label>
                  <select name="role" onChange={handleChange} className="w-full border rounded p-2" required>
                    <option value="">Select a role</option>
                    {roles.map((role, i) => (
                      <option key={i} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Work mode</label>
                  <div className="flex items-center space-x-4">
                    <label><input type="radio" name="mode" value="Remote" onChange={handleChange} /> Remote</label>
                    <label><input type="radio" name="mode" value="On-field" onChange={handleChange} /> On-field</label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#54BD95] text-white py-3 cursor-pointer px-4 rounded-lg hover:bg-[#54BD95] transition-colors text-lg font-semibold disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Apply Now'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default InternshipForm;
