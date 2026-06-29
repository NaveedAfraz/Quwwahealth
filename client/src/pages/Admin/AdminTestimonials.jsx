import React, { useState, useEffect } from 'react';
import { useTestimonials } from '../../hooks/useTestimonials';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminTestimonials = () => {
    const {
        testimonials,
        loading,
        error,
        success,
        fetchTestimonials,
        addTestimonial,
        updateExistingTestimonial,
        removeTestimonial,
        clearError,
        clearSuccess,
    } = useTestimonials();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        quote: '',
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            quote: '',
        });
        setEditingId(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateExistingTestimonial(editingId, formData);
                toast.success('Testimonial updated successfully');
            } else {
                await addTestimonial(formData);
                toast.success('Testimonial added successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err) {
            toast.error(error || 'Failed to save testimonial');
        }
    };

    // Handle edit
    const handleEdit = (testimonial) => {
        setFormData({
            name: testimonial.name,
            title: testimonial.title,
            quote: testimonial.quote,
        });
        setEditingId(testimonial.id);
        setIsModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                await removeTestimonial(id);
                toast.success('Testimonial deleted successfully');
            } catch (err) {
                toast.error('Failed to delete testimonial');
            }
        }
    };

    // Handle modal close
    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Load testimonials on component mount
    useEffect(() => {
        fetchTestimonials();
    }, []);

    // Handle success/error toasts
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
        if (success) {
            clearSuccess();
        }
    }, [error, success, clearError, clearSuccess]);

    if (loading && (!testimonials || !testimonials.length)) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                    <p className="text-gray-600">Manage customer testimonials</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <span className="mr-2">+</span> Add Testimonial
                </button>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials && testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col h-full">
                            <div className="flex-grow">
                                <blockquote className="text-gray-700 italic mb-4">
                                    "{testimonial.quote}"
                                </blockquote>
                                <div className="mt-4">
                                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.title}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                                <button
                                    onClick={() => handleEdit(testimonial)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(testimonial.id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {(!testimonials || testimonials.length === 0) && (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500">No testimonials found. Add your first testimonial!</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Testimonial Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Aarav Singh"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                        Age & Grade *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Age: 12, Grade 6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Format: Age: number, Grade: number</p>
                                </div>

                                <div>
                                    <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                                        Testimonial Quote *
                                    </label>
                                    <textarea
                                        id="quote"
                                        name="quote"
                                        rows="6"
                                        value={formData.quote}
                                        onChange={handleChange}
                                        placeholder="Share your experience..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Testimonial'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTestimonials;
