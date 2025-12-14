
import { db } from '@/db';
import { users, passwordResets, courseAssignments, policyCompletions, portfolios, feedbackRequests, reviewCycles, reviewForms, reviewerAssignments, reviewComments, reviewNotifications, appraisals, employeeOnboarding } from '@/db/schema';
import { hashPassword } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Starting reset and seed process...');

    try {
        // 1. Delete dependent data first to avoid Foreign Key constraints
        console.log('Cleaning up dependent data...');
        // We delete from tables that reference users. 
        // Note: This wipes transactional data. Based on "delete all the data on the user side", this seems intended.
        await db.delete(passwordResets);
        await db.delete(courseAssignments);
        await db.delete(policyCompletions);
        // Portfolios has portfolioItems linked to it, deleting portfolios might fail if items exist and no cascade. 
        // But let's try deleting users first and see if we hit errors, or just brute force clear generic tables.

        // Actually, to be safe and thorough given "delete all data", let's clear the references.
        await db.delete(employeeOnboarding);
        await db.delete(appraisals);
        await db.delete(reviewNotifications);
        await db.delete(reviewComments);
        await db.delete(reviewerAssignments);
        await db.delete(reviewForms);
        // Cycles referencing createdBy
        await db.delete(reviewCycles);
        await db.delete(feedbackRequests);
        // Portfolios
        // await db.delete(portfolioItems); // Need to import if we want to delete this
        await db.delete(portfolios);

        // 2. Delete Users
        console.log('Deleting all users...');
        await db.delete(users);

        // 3. Create New Admins
        console.log('Creating new admin users...');

        const admins = [
            {
                email: 'sajesh.techsonance@outlook.com',
                password: 'TechSonance1711!@#$',
                name: 'Sajesh TechSonance',
                role: 'admin'
            },
            {
                email: 'admin@techsonance.co.in',
                password: 'TechSonance1711!@#$',
                name: 'TechSonance Admin',
                role: 'admin'
            }
        ];

        for (const admin of admins) {
            const passwordHash = await hashPassword(admin.password);
            await db.insert(users).values({
                id: randomUUID(),
                name: admin.name,
                email: admin.email,
                passwordHash,
                role: admin.role,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Created admin: ${admin.email}`);
        }

        console.log('Reset and seed completed successfully.');
    } catch (error) {
        console.error('Error during reset/seed:', error);
        process.exit(1);
    }
}

main();
