import { db } from '@/db';
import { activities } from '@/db/schema';

async function main() {
    const courseStartDates: Record<number, string> = {
        1: '2024-02-01',
        2: '2024-02-01',
        3: '2024-02-15',
        4: '2024-02-01',
        5: '2024-03-01',
        6: '2024-02-15',
        7: '2024-02-01',
        8: '2024-03-01',
        9: '2024-02-01',
        10: '2024-02-15',
        11: '2024-02-15',
        12: '2024-03-01',
        13: '2024-03-01',
    };

    const addDays = (dateStr: string, days: number): Date => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date;
    };

    const setTime = (date: Date, hours: number, minutes: number): string => {
        date.setUTCHours(hours, minutes, 0, 0);
        return date.toISOString();
    };

    const sampleActivities = [];
    const currentTimestamp = new Date().toISOString();

    for (let courseId = 1; courseId <= 13; courseId++) {
        const startDate = courseStartDates[courseId];

        // Activity 1: Overview
        sampleActivities.push({
            courseId,
            title: 'Overview',
            type: 'overview',
            description: 'Introduction and overview of course objectives, structure, and expectations. Get familiar with the learning materials and schedule.',
            scheduledDate: setTime(addDays(startDate, 1), 15, 30),
            createdAt: currentTimestamp,
        });

        // Activity 2: Online Discussion
        sampleActivities.push({
            courseId,
            title: 'Online Discussion',
            type: 'discussion',
            description: 'Participate in online discussion forum to share insights, ask questions, and engage with course concepts with peers.',
            scheduledDate: setTime(addDays(startDate, 7), 15, 30),
            createdAt: currentTimestamp,
        });

        // Activity 3: Guided Discussion
        sampleActivities.push({
            courseId,
            title: 'Guided Discussion',
            type: 'discussion',
            description: 'Join a structured discussion session led by instructor to explore key topics, clarify doubts, and deepen understanding.',
            scheduledDate: setTime(addDays(startDate, 14), 15, 30),
            createdAt: currentTimestamp,
        });

        // Activity 4: Group Practical
        sampleActivities.push({
            courseId,
            title: 'Group Practical',
            type: 'practical',
            description: 'Collaborative hands-on practical session where you will apply learned concepts in real-world scenarios with your team.',
            scheduledDate: setTime(addDays(startDate, 25), 11, 30),
            createdAt: currentTimestamp,
        });

        // Activity 5: Review
        sampleActivities.push({
            courseId,
            title: 'Review',
            type: 'review',
            description: 'Comprehensive review session covering all course materials, key takeaways, and preparation for final assessment.',
            scheduledDate: setTime(addDays(startDate, 30), 11, 30),
            createdAt: currentTimestamp,
        });
    }

    await db.insert(activities).values(sampleActivities);
    
    console.log('✅ Activities seeder completed successfully - 65 activities generated for 13 courses');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});