const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Create a connection pool with promise wrapper
let pool;

async function initializePool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  
  return pool;
}

// Initialize the pool immediately
initializePool().catch(err => {
  console.error('Failed to initialize database pool:', err);
  process.exit(1);
});

// Export the pool
module.exports = pool;

// Export a function to create the database and tables
module.exports.createDatabaseAndTables = async () => {
  let connection;
  try {
    // Create a connection without specifying the database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\``);
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        school_name VARCHAR(255),
        contact_person VARCHAR(255),
        phone_number VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Add role column to existing users table if it doesn't exist
    try {
      const [cols] = await connection.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'"
      );
      if (cols.length === 0) {
        await connection.query("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' AFTER password");
        console.log("🧬 Added role column to users table");
      }
    } catch (err) {
      console.warn("⚠️ Could not check/add role column to users:", err.message);
    }
    
    // Create testimonials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        quote TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    
    // Create OTPs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Create blogs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'published',
        tags TEXT,
        featured_image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Create blog_headings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_headings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        heading_title VARCHAR(255) NOT NULL,
        heading_content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        INDEX idx_blog_id (blog_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Seed blogs
    await seedBlogs(connection);

    // Seed testimonials
    await seedTestimonials(connection);

    // Seed default admin user
    await seedAdminUser(connection);
    
    console.log('✅ Database and tables created successfully');
  } catch (error) {
    console.error('❌ Error creating database and tables:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

async function seedBlogs(connection) {
  try {
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM blogs");
    if (rows[0].count > 0) {
      return;
    }
    
    console.log("🌱 Database blogs table is empty. Seeding initial blogs...");
    
    const initialBlogs = [
      {
        title: "Why School-Based Fitness Builds Lifelong Health",
        content: `
          <h1 class="text-4xl font-bold mt-8 mb-4">Why School-Based Fitness Programs Are Key to Lifelong Health</h1>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            In today’s screen-heavy, sedentary lifestyle, schools hold the power to influence the future of public health.
            School-based fitness programs serve as a vital foundation for lifelong health by fostering physical, emotional, and cognitive development in students from an early age.
          </p>
      
          <h2 id="physical-health-starts-early" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Physical Health Starts Early</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Childhood is a critical period for developing strength, endurance, coordination, and flexibility...
          </p>
      
          <h2 id="mental-health-benefits" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Mental Health Benefits</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Physical activity stimulates the release of endorphins and reduces cortisol levels...
          </p>
      
          <h2 id="academic-improvement" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Academic Improvement</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Research consistently shows that physically active students perform better academically...
          </p>
      
          <h2 id="habit-formation" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Habit Formation That Lasts</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Children who engage in daily movement are more likely to carry those habits into adulthood...
          </p>
      
          <h2 id="equal-access" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Equal Access to Health</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Not every family has access to extracurricular fitness programs...
          </p>
      
          <p class="text-lg text-gray-700 leading-relaxed mt-8">
            <strong>Conclusion:</strong> Quwwa Health delivers structured, inclusive fitness programs...
          </p>
        `,
        category: "Health & Wellness",
        status: "published",
        tags: JSON.stringify(["health"]),
        featured_image_url: "/src/assets/images/Hero/10.jpg",
        headings: [
          {
            title: "Physical Health Starts Early",
            content: `Childhood is a critical period for developing strength, endurance...`
          },
          {
            title: "Mental Health Benefits",
            content: `Physical activity stimulates the release of endorphins...`
          },
          {
            title: "Academic Improvement",
            content: `Research consistently shows that physically active students...`
          },
          {
            title: "Habit Formation That Lasts",
            content: `Children who engage in daily movement are more likely to...`
          },
          {
            title: "Equal Access to Health",
            content: `Not every family has access to extracurricular fitness programs...`
          }
        ]
      },
      {
        title: "How Fitness Impacts Focus: The Link Between Movement and Academic Performance",
        content: `
          <h1 class="text-4xl font-bold mt-8 mb-4">How Fitness Impacts Focus: The Link Between Movement and Academic Performance</h1>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Physical activity is a proven cognitive enhancer. By stimulating brain function, improving mood, and reducing distractions, school-based fitness plays a crucial role in the academic success of children.
          </p>
     
          <h2 id="improved-concentration" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Improved Concentration and Attention</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Exercise boosts neurotransmitter levels like dopamine and norepinephrine, which are directly linked to attention and alertness. Students participating in school-based fitness programs demonstrate better focus and are more engaged during lessons. Activities like team sports, dance, and structured play also teach students how to listen, follow directions, and stay task-oriented.
          </p>
     
          <h2 id="enhanced-memory" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Enhanced Memory and Learning Capacity</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Aerobic activity increases blood flow to the brain, enhancing memory retention and neural plasticity. Incorporating structured PE activities and active learning breaks can improve a student's ability to absorb and retain information, especially in subjects requiring concentration like math, science, and reading.
          </p>
     
          <h2 id="emotional-regulation" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Better Emotional Regulation in Class</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Physical activity helps regulate emotions and reduce impulsivity. Students who participate in regular movement are less likely to exhibit disruptive behaviors and more likely to remain calm under stress. Our Alpro Health & Fitness programs include mindfulness elements that help children manage frustration and anxiety in academic settings.
          </p>
     
          <h2 id="brain-development" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Support for Brain Development</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Movement and motor skill development in early childhood directly impact brain structure and function. Regular physical education supports the development of executive functions—such as working memory, flexible thinking, and self-control—which are essential for academic achievement.
          </p>
     
          <p class="text-lg text-gray-700 leading-relaxed mt-8">
            <strong>Conclusion:</strong> At Quwwa Health, we create school fitness programs that promote both academic excellence and lifelong wellness. By integrating fitness into education, we help schools build students who are not just smarter—but stronger, calmer, and more focused.
          </p>
        `,
        category: "Academic Performance",
        status: "published",
        tags: JSON.stringify(["focus", "academic"]),
        featured_image_url: "/src/assets/images/Hero/11.jpg",
        headings: [
          {
            title: "Improved Concentration and Attention",
            content: "Exercise boosts neurotransmitter levels like dopamine and norepinephrine..."
          },
          {
            title: "Enhanced Memory and Learning Capacity",
            content: "Aerobic activity increases blood flow to the brain..."
          },
          {
            title: "Better Emotional Regulation in Class",
            content: "Physical activity helps regulate emotions and reduce impulsivity..."
          },
          {
            title: "Support for Brain Development",
            content: "Movement and motor skill development in early childhood..."
          }
        ]
      },
      {
        title: "Understanding BMI and Fitness Metrics in Children: What Schools and Parents Should Know",
        content: `
          <h1 class="text-4xl font-bold mt-8 mb-4">Understanding BMI and Fitness Metrics in Children</h1>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Tracking student health starts with clear, accurate, and child-appropriate measurements. BMI and other physical fitness metrics help schools and parents identify early signs of risk and promote healthier habits.
          </p>
    
          <h2 id="what-is-bmi" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">What is BMI?</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            BMI, or Body Mass Index, is a simple calculation using a child's height and weight to estimate body fat levels. It categorizes students into underweight, healthy weight, overweight, or obese ranges. While it doesn't measure body fat directly, it provides a useful screening tool for schools to monitor growth trends and intervene early.
          </p>
    
          <h2 id="why-tracking-matters" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Why BMI and Fitness Tracking Matter</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Early detection of weight-related concerns allows for timely support and intervention. Routine school health assessments empower educators and parents to recognize unhealthy trends before they become long-term issues. Monitoring BMI alongside other fitness indicators creates a fuller picture of a child’s physical development.
          </p>
    
          <h2 id="beyond-bmi" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Beyond BMI: A Holistic Fitness Profile</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            A complete student fitness profile includes measurements of cardiovascular endurance, muscular strength, flexibility, balance, and coordination. Our fitness assessments at Quwwa Health are age-appropriate, non-competitive, and focused on individual progress, not comparison. This approach encourages participation and builds confidence.
          </p>
    
          <h2 id="data-driven-action" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Data-Driven Action Plans</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Schools can use this data to tailor PE classes and design effective health programs. Reports from the Alpro Health & Fitness system provide insights for PE teachers, school leaders, and parents to identify strengths, target weak areas, and track improvements throughout the year.
          </p>
    
          <p class="text-lg text-gray-700 leading-relaxed mt-8">
            <strong>Conclusion:</strong> Quwwa Health delivers comprehensive fitness and health assessment tools that help schools take a proactive approach to student wellness. With the right data, every child can receive the support they need to grow stronger and healthier.
          </p>
        `,
        category: "Fitness Metrics",
        status: "published",
        tags: JSON.stringify(["bmi", "fitness", "metrics"]),
        featured_image_url: "/src/assets/images/Hero/12 1.jpg",
        headings: [
          {
            title: "What is BMI?",
            content: "BMI, or Body Mass Index, is a simple calculation using a child's height and weight..."
          },
          {
            title: "Why BMI and Fitness Tracking Matter",
            content: "Early detection of weight-related concerns allows for timely support and intervention..."
          },
          {
            title: "Beyond BMI: A Holistic Fitness Profile",
            content: "A complete student fitness profile includes measurements of cardiovascular endurance..."
          },
          {
            title: "Data-Driven Action Plans",
            content: "Schools can use this data to tailor PE classes and design effective health programs..."
          }
        ]
      },
      {
        title: "Building a Health-Promoting School: Practical Steps for Educators and Administrators",
        content: `
          <h1 class="text-4xl font-bold mt-8 mb-4">Building a Health-Promoting School: Practical Steps</h1>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Creating a health-promoting school is about more than just adding a fitness class—it requires a shift in culture, policies, and daily routines. Here’s how schools can lead the change:
          </p>
    
          <h2 id="structured-fitness" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Start with Structured Fitness</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Daily movement should be non-negotiable. Implement school-based fitness programs that include aerobic, strength, and coordination activities. Use PE assessments to track participation and growth, and adjust programming based on student needs.
          </p>
    
          <h2 id="mental-wellness" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Embed Mental Wellness</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Mental and emotional health are just as critical as physical fitness. Integrate wellness programs that include mindfulness sessions, emotional literacy lessons, and social-emotional learning. These tools help students build resilience, focus, and healthy relationships.
          </p>
    
          <h2 id="prioritize-nutrition" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Prioritize Nutrition</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Food fuels learning. Review canteen menus, remove ultra-processed options, and introduce whole-food choices. The Healthy Canteen Initiative from Quwwa Health offers menu planning support, nutrition education materials, and food literacy workshops for students and staff.
          </p>
    
          <h2 id="engage-community" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Engage Teachers and Parents</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            The more involved adults are, the more successful the program becomes. Host teacher fitness events to model wellness for students and organize family-friendly activities like parent-child yoga, health fairs, and sports days. A whole-community approach builds momentum.
          </p>
    
          <h2 id="data-driven-policy" class="text-3xl font-bold mt-12 mb-4 scroll-mt-20">Use Fitness Data to Drive Policy</h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Collect BMI, flexibility, strength, and endurance data to evaluate outcomes and inform health-related decisions. Establish clear wellness goals, and use year-over-year comparisons to adjust policies and resource allocation.
          </p>
    
          <p class="text-lg text-gray-700 leading-relaxed mt-8">
            <strong>Conclusion:</strong> Quwwa Health partners with schools to embed wellness into their DNA—through fitness, nutrition, mental health, and data-driven strategy. A health-promoting school is not just possible; it's essential for future-ready learners.
          </p>
        `,
        category: "School Policy",
        status: "published",
        tags: JSON.stringify(["policy", "school", "health"]),
        featured_image_url: "/src/assets/images/Hero/ChatGPT Image Apr 14, 2025, 04_24_06 PM 1.jpg",
        headings: [
          {
            title: "Start with Structured Fitness",
            content: "Daily movement should be non-negotiable. Implement school-based fitness programs..."
          },
          {
            title: "Embed Mental Wellness",
            content: "Mental and emotional health are just as critical as physical fitness..."
          },
          {
            title: "Prioritize Nutrition",
            content: "Food fuels learning. Review canteen menus, remove ultra-processed options..."
          },
          {
            title: "Engage Teachers and Parents",
            content: "The more involved adults are, the more successful the program becomes..."
          },
          {
            title: "Use Fitness Data to Drive Policy",
            content: "Collect BMI, flexibility, strength, and endurance data to evaluate outcomes..."
          }
        ]
      }
    ];

    for (const blog of initialBlogs) {
      const [res] = await connection.query(
        `INSERT INTO blogs (title, content, category, status, tags, featured_image_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [blog.title, blog.content, blog.category, blog.status, blog.tags, blog.featured_image_url]
      );
      const blogId = res.insertId;
      
      // Insert headings
      for (const h of blog.headings) {
        await connection.query(
          `INSERT INTO blog_headings (blog_id, heading_title, heading_content) 
           VALUES (?, ?, ?)`,
          [blogId, h.title, h.content]
        );
      }
    }
    
    console.log("🌱 Seeded initial blogs successfully!");
  } catch (error) {
    console.error("❌ Seeding blogs failed:", error);
  }
}

async function seedTestimonials(connection) {
  try {
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM testimonials");
    if (rows[0].count > 0) {
      return;
    }
    
    console.log("🌱 Database testimonials table is empty. Seeding initial testimonials...");
    
    const initialTestimonials = [
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

    for (const t of initialTestimonials) {
      await connection.query(
        `INSERT INTO testimonials (quote, name, title) VALUES (?, ?, ?)`,
        [t.quote, t.name, t.title]
      );
    }
    console.log("🌱 Seeded initial testimonials successfully!");
  } catch (error) {
    console.error("❌ Seeding testimonials failed:", error);
  }
}

async function seedAdminUser(connection) {
  try {
    const adminEmail = "inforahil@gmail.com";
    const [rows] = await connection.query("SELECT * FROM users WHERE email = ?", [adminEmail]);
    if (rows.length > 0) {
      await connection.query("UPDATE users SET role = 'admin' WHERE email = ?", [adminEmail]);
      console.log(`👤 Admin user ${adminEmail} already exists in database. Ensured role is set to 'admin'.`);
      return;
    }

    console.log(`🌱 Seeding admin user ${adminEmail} as admin...`);
    const hashedPassword = await bcrypt.hash("quwwahealth@2026", 10);
    await connection.query(
      `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`,
      [adminEmail, hashedPassword, "admin"]
    );
    console.log(`🌱 Seeded admin user successfully!`);
  } catch (error) {
    console.error("❌ Seeding admin user failed:", error);
  }
}
