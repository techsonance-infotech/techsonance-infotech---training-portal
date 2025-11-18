import { db } from '@/db';
import { courses } from '@/db/schema';

async function main() {
    const currentTimestamp = new Date().toISOString();
    
    const sampleCourses = [
        {
            title: '.NET Track',
            description: 'Master .NET development with C# and ASP.NET Core',
            startDate: '2024-02-01',
            endDate: '2024-05-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Java Track',
            description: 'Comprehensive Java programming and Spring Framework training',
            startDate: '2024-02-01',
            endDate: '2024-05-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Design Track',
            description: 'UI/UX design principles and modern design tools',
            startDate: '2024-02-15',
            endDate: '2024-04-15',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Web Track',
            description: 'Full-stack web development with modern frameworks',
            startDate: '2024-02-01',
            endDate: '2024-06-30',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Cloud Track',
            description: 'Cloud computing with AWS, Azure, and GCP',
            startDate: '2024-03-01',
            endDate: '2024-06-30',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Security Track',
            description: 'Cybersecurity fundamentals and best practices',
            startDate: '2024-02-15',
            endDate: '2024-05-15',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Databases Track',
            description: 'SQL and NoSQL database design and optimization',
            startDate: '2024-02-01',
            endDate: '2024-04-30',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Containerisation Track',
            description: 'Docker, Kubernetes, and container orchestration',
            startDate: '2024-03-01',
            endDate: '2024-05-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'React Readiness (Node JS)',
            description: 'React and Node.js full-stack development',
            startDate: '2024-02-01',
            endDate: '2024-05-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Testing Track',
            description: 'Software testing, QA, and test automation',
            startDate: '2024-02-15',
            endDate: '2024-05-15',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'UI/UX Design Track',
            description: 'Advanced user interface and experience design',
            startDate: '2024-02-15',
            endDate: '2024-05-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Data Science',
            description: 'Data analysis, machine learning, and Python',
            startDate: '2024-03-01',
            endDate: '2024-07-31',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
        {
            title: 'Generative AI',
            description: 'AI, machine learning, and generative models',
            startDate: '2024-03-01',
            endDate: '2024-06-30',
            createdBy: 1,
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        },
    ];

    await db.insert(courses).values(sampleCourses);
    
    console.log('✅ Courses seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});