import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLinkedinIn, FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { X } from "lucide-react";
import { FiInstagram, FiClock, FiTag } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { getBlogById, getAllBlogs, clearError } from '../store/slices/blogSlice';
import authorImage from '../assets/images/AboutUs/team1.jpeg';
import { Link } from 'react-router-dom';
import { formatDate } from '../config/formatDate';
// --- New Component for Related Articles ---
const RelatedArticles = ({ currentPostId, allBlogPosts }) => {
  // Filter out the current post and take the next 3 articles
  const relatedPosts = allBlogPosts
    .filter((post) => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null; // Don't render the section if there are no related posts
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Articles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedPosts.map((post) => (
          <Link to={`/blog/${post.id}`} key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <div className="relative">
              <img src={post.featured_image_url} alt={post.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <div className="p-6">
              <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">{post.category}</span>
              <h3 className="mt-4 font-bold text-lg text-gray-900 group-hover:text-[#5D3EFF] transition-colors">
                {post.title}
              </h3>
              <p className="text-sm text-gray-500 mt-2">{formatDate(post.date)} • {post.readTime || '5 Min'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// const post = [{
//   id: 6,
//   title: 'Building a Health-Promoting School: Practical Steps for Educators and Administrators',
//   image: '',
//   readTime: '4 Min',
//   date: 'July 12, 2025',
//   // --- Detailed Content (Added) ---
//   category: 'School Policy',
//   author: {
//     name: 'Tamás Hám-Szabó',
//     title: 'Founder of SAAS First - the Best AI and Data-Driven Customer Engagement Tool.',
//     bio: `With 11 years in SaaS, I've built MillionVerifier and SAAS First. Passionate about SaaS, data, and AI. Let's connect if you share the same drive for success!`,
//     image: '',
//     linkedin: '#',
//   },

//   headings: [
//     { id: 'structured-fitness', title: 'Start with Structured Fitness' },
//     { id: 'mental-wellness', title: 'Embed Mental Wellness' },
//     { id: 'prioritize-nutrition', title: 'Prioritize Nutrition' },
//     { id: 'engage-community', title: 'Engage Teachers and Parents' },
//     { id: 'data-driven-policy', title: 'Use Fitness Data to Drive Policy' },
//   ],
//   content: `
//       <h1 class="text-4xl font-bold mt-8 mb-4">Building a Health-Promoting School: Practical Steps</h1>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         Creating a health-promoting school is about more than just adding a fitness class—it requires a shift in culture, policies, and daily routines. Here’s how schools can lead the change:
//       </p>

//       <h2 id="structured-fitness" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Start with Structured Fitness</h2>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         Daily movement should be non-negotiable. Implement school-based fitness programs that include aerobic, strength, and coordination activities. Use PE assessments to track participation and growth, and adjust programming based on student needs.
//       </p>

//       <h2 id="mental-wellness" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Embed Mental Wellness</h2>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         Mental and emotional health are just as critical as physical fitness. Integrate wellness programs that include mindfulness sessions, emotional literacy lessons, and social-emotional learning. These tools help students build resilience, focus, and healthy relationships.
//       </p>

//       <h2 id="prioritize-nutrition" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Prioritize Nutrition</h2>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         Food fuels learning. Review canteen menus, remove ultra-processed options, and introduce whole-food choices. The Healthy Canteen Initiative from Quwwa Health offers menu planning support, nutrition education materials, and food literacy workshops for students and staff.
//       </p>

//       <h2 id="engage-community" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Engage Teachers and Parents</h2>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         The more involved adults are, the more successful the program becomes. Host teacher fitness events to model wellness for students and organize family-friendly activities like parent-child yoga, health fairs, and sports days. A whole-community approach builds momentum.
//       </p>

//       <h2 id="data-driven-policy" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Use Fitness Data to Drive Policy</h2>
//       <p class="text-lg text-gray-700 leading-relaxed mb-6">
//         Collect BMI, flexibility, strength, and endurance data to evaluate outcomes and inform health-related decisions. Establish clear wellness goals, and use year-over-year comparisons to adjust policies and resource allocation.
//       </p>

//       <p class="text-lg text-gray-700 leading-relaxed mt-8">
//         <strong>Conclusion:</strong> Quwwa Health partners with schools to embed wellness into their DNA—through fitness, nutrition, mental health, and data-driven strategy. A health-promoting school is not just possible; it's essential for future-ready learners.
//       </p>
//     `,
// },]

const BlogPost = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  // Get blog state from Redux
  const {
    currentBlog: blogData,
    blogs: allBlogs,
    loading,
    error
  } = useSelector((state) => ({
    currentBlog: state.blog.currentBlog,
    blogs: state.blog.blogs,
    loading: state.blog.loading,
    error: state.blog.error
  }));

  // Extract blog data from the response
  const post = blogData?.blog || blogData;

  // Fetch blog post data and all blogs using Redux
  useEffect(() => {
    if (id) {
      dispatch(getBlogById(id));
      // Scroll to top when the component mounts or when the ID changes
      window.scrollTo(0, 0);
      setActiveId(null);
    }

    // Fetch all blogs for related articles if not already loaded
    if (!allBlogs || allBlogs.length === 0) {
      dispatch(getAllBlogs());
    }

    // Clear any previous errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id, allBlogs]);


  // Handle scroll for table of contents highlighting
  useEffect(() => {
    if (!post || !post.headings?.length) return;

    const handleScroll = () => {
      for (const heading of post.headings) {
        const el = document.getElementById(`heading-${heading.id}`);
        if (el) {
          const top = el.getBoundingClientRect().top;
          // Adjust the range for better active state detection
          if (top >= 0 && top <= 200) {
            setActiveId(`heading-${heading.id}`);
            return; // Exit after finding the first matching heading
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check in case we're already scrolled to a heading
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);


  const handleLinkClick = (e, headingId) => {
    e.preventDefault();
    const target = document.getElementById(headingId);
    if (target) {
      const yOffset = -100; // Adjust based on your fixed navbar height
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(headingId); // Highlight the link on click
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#54BD95]"></div>
      </div>
    );
  }

  // console.log(post[0].id);
  if (error || !post) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold">Post not found!</h1>
        <p className="text-red-500 my-4">{typeof error === 'string' ? error : 'An error occurred while loading the blog post.'}</p>
        <button
          onClick={() => navigate('/blogs')}
          className="bg-[#54BD95] text-white px-6 py-2 rounded-lg hover:bg-[#3e8d74] transition-colors"
        >
          Back to Blogs
        </button>
      </div>
    );
  }
  console.log(post);
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  console.log(post.id);
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Article Content */}
          <article className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {post.category && (
                <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full mb-4">
                  {post.category}
                </span>
              )}

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

              <div className="flex items-center text-gray-500 text-sm mb-8">
                <div className="mr-4">
                  <FiClock className="inline mr-1" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center">
                    <FiTag className="mr-1" />
                    <span>{post.tags.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="prose max-w-none mb-8">
                {post.content && (
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Headings Content */}
              {post.headings && post.headings.length > 0 && (
                <div className="mt-8 space-y-8">
                  {post.headings.map((heading) => (
                    <div key={heading.id} id={`heading-${heading.id}`} className="scroll-mt-20">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{heading.title}</h2>
                      {heading.content && (
                        <div
                          className="prose max-w-none mt-4"
                          dangerouslySetInnerHTML={{ __html: heading.content }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-8 sticky top-24 h-screen">
            {/* Author Card */}
            <div className="bg-[#3D22CF] text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center space-x-4">
                <img src={authorImage} alt={post?.author?.name} className="w-20 h-20 rounded-lg border-2 border-white" />
                <div>
                  <h3 className="font-bold text-xl">Rahil Khan</h3>
                  <a href="https://www.linkedin.com/in/rahilkhan2024/" className="text-blue-300 hover:text-white transition-colors"><FaLinkedinIn className="inline" /></a>
                </div>
              </div>
              <p className="mt-4 text-blue-100 text-sm">Founder of Quwwa Health</p>
              <p className="mt-4 text-blue-100 text-sm"></p>

            </div>

            {/* Share Card */}
            <div className="bg-[#0A1C8F] text-white p-6 rounded-2xl shadow-lg">
              <h3 className="font-bold text-lg">Share with your community!</h3>
              <div className="flex space-x-3 mt-4">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    `https://www.quwwahealth.com/blog/${post?.id || ''}`
                  )}&text=${encodeURIComponent(
                    `Check out this blog: ${post?.title || 'Amazing blog post'}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800"
                >
                  <X className="text-white text-xl" />
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this blog: ${post?.title || 'Amazing blog post'}\nhttps://www.quwwahealth.com/blog/${post?.id || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10  bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-700"
                >
                  <FaWhatsapp className="text-white text-xl" />
                </a>

                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `https://www.quwwahealth.com/blog/${post?.id || ''}`
                )}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                >
                  <FaLinkedinIn className="text-white text-xl " />
                </a>
              </div>
            </div>

            {/* In this article */}
            {post.headings?.length > 0 && (
              <div className="p-6 rounded-2xl bg-white shadow-lg">
                <h3 className="font-bold text-lg mb-4">In this article</h3>
                <ul className="space-y-3">
                  {post.headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#heading-${heading.id}`}
                        onClick={(e) => handleLinkClick(e, `heading-${heading.id}`)}
                        className={`block pl-3 border-l-2 font-medium transition-colors
                          ${activeId === `heading-${heading.id}`
                            ? 'text-[#5D3EFF] border-[#5D3EFF]'
                            : 'text-gray-700 border-transparent hover:text-blue-600 hover:border-blue-600'
                          }`}
                      >
                        {heading.title || `Section ${heading.id}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

        </div>
        {allBlogs && allBlogs.length > 0 && (
          <RelatedArticles currentPostId={post.id} allBlogPosts={allBlogs} />
        )}
      </main>
    </div>
  );
};


export default BlogPost;