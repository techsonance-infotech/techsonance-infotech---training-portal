import { db } from '@/db';
import { appraisals } from '@/db/schema';

async function main() {
    const sampleAppraisals = [
        {
            employeeId: '7d8e7f76-5690-45ca-90cc-35dbdfee20c7',
            cycleId: 1,
            reviewYear: 2025,
            pastCtc: 650000,
            currentCtc: 715000,
            hikePercentage: 10.0,
            notes: 'Excellent performance and consistent delivery throughout H1 2025',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            employeeId: '7d8e7f76-5690-45ca-90cc-35dbdfee20c7',
            cycleId: 2,
            reviewYear: 2024,
            pastCtc: 550000,
            currentCtc: 650000,
            hikePercentage: 18.18,
            notes: 'Outstanding contributor with exceptional leadership skills in H2 2024',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            employeeId: '7d8e7f76-5690-45ca-90cc-35dbdfee20c7',
            cycleId: 3,
            reviewYear: 2025,
            pastCtc: 715000,
            currentCtc: 786500,
            hikePercentage: 10.0,
            notes: 'Strong annual performance with significant contributions to key projects',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            employeeId: '8965fa4b-e312-49b1-807b-80b6ae746b3d',
            cycleId: 1,
            reviewYear: 2025,
            pastCtc: 480000,
            currentCtc: 528000,
            hikePercentage: 10.0,
            notes: 'Met expectations with solid performance in H1 2025',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            employeeId: '8965fa4b-e312-49b1-807b-80b6ae746b3d',
            cycleId: 2,
            reviewYear: 2024,
            pastCtc: 420000,
            currentCtc: 480000,
            hikePercentage: 14.29,
            notes: 'Consistent performer with improved technical skills in H2 2024',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            employeeId: '8965fa4b-e312-49b1-807b-80b6ae746b3d',
            cycleId: 3,
            reviewYear: 2025,
            pastCtc: 528000,
            currentCtc: 580800,
            hikePercentage: 10.0,
            notes: 'Good annual performance with notable improvements in collaboration',
            updatedBy: 'XcJpF76qKiGDQXBmo85ZqPbeZkBUQ2VZ',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    await db.insert(appraisals).values(sampleAppraisals);
    
    console.log('✅ Appraisals seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});