import { db } from '@/db';
import { companyPolicies } from '@/db/schema';

async function main() {
    const samplePolicies = [
        {
            title: 'Personal Information and Data Protection',
            description: 'Comprehensive guide on handling personal data and GDPR compliance',
            content: 'This policy outlines our commitment to protecting personal information and ensuring GDPR compliance. All employees must handle personal data with care and follow data protection principles.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'BBD Health and Safety when Working From Home',
            description: 'Guidelines for maintaining a safe and healthy home office environment',
            content: 'This policy provides guidelines for creating a safe and ergonomic home office environment. Ensure proper lighting, seating, and regular breaks.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Covid-19 Training Manual',
            description: 'Protocols and safety measures for Covid-19 prevention',
            content: 'This manual outlines safety protocols for Covid-19 prevention including social distancing, mask wearing, and sanitization procedures.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Information Security (2023)',
            description: 'Company information security policies and procedures',
            content: 'This policy covers information security best practices including password management, secure communication, and data encryption requirements.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Anti-bribery and Corruption (2023)',
            description: 'Zero-tolerance policy on bribery and corruption',
            content: 'Our company maintains a zero-tolerance policy on bribery and corruption. All employees must comply with anti-bribery laws and report any suspicious activities.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            title: 'Anti-harassment (2023)',
            description: 'Creating a respectful and harassment-free workplace',
            content: 'We are committed to providing a harassment-free workplace. This policy defines harassment, reporting procedures, and consequences for violations.',
            documentUrl: null,
            required: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(companyPolicies).values(samplePolicies);
    
    console.log('✅ Company policies seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});