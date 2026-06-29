import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  getTestimonials, 
  getTestimonialById, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial,
  clearError,
  clearSuccess,
  resetTestimonialState
} from '../store/slices/testimonialSlice';

/**
 * Custom hook to manage testimonials state and actions
 * @returns {Object} Testimonials state and action dispatchers
 */
export const useTestimonials = () => {
  const dispatch = useDispatch();
  const {
    testimonials = [],
    currentTestimonial = null,
    loading = false,
    error = null,
    success = false
  } = useSelector((state) => state.testimonial || {});

  // Clear error message
  const clearErrorHandler = () => dispatch(clearError());
  
  // Clear success message
  const clearSuccessHandler = () => dispatch(clearSuccess());
  
  // Reset testimonial state
  const resetTestimonialStateHandler = () => dispatch(resetTestimonialState());

  // Fetch all testimonials
  const fetchTestimonials = () => {
    dispatch(getTestimonials());
  };

  // Fetch single testimonial by ID
  const fetchTestimonialById = (id) => {
    dispatch(getTestimonialById(id));
  };

  // Create new testimonial
  const addTestimonial = (testimonialData) => {
    return dispatch(createTestimonial(testimonialData));
  };

  // Update existing testimonial
  const updateExistingTestimonial = (id, testimonialData) => {
    return dispatch(updateTestimonial({ id, ...testimonialData }));
  };

  // Delete testimonial
  const removeTestimonial = (id) => {
    return dispatch(deleteTestimonial(id));
  };

  // Automatically fetch testimonials when the component mounts
  useEffect(() => {
    fetchTestimonials();
  }, []);

  return {
    // State
    testimonials,
    currentTestimonial,
    loading,
    error,
    success,
    
    // Actions
    fetchTestimonials,
    fetchTestimonialById,
    addTestimonial,
    updateExistingTestimonial,
    removeTestimonial,
    clearError: clearErrorHandler,
    clearSuccess: clearSuccessHandler,
    resetTestimonialState: resetTestimonialStateHandler,
  };
};

export default useTestimonials;
