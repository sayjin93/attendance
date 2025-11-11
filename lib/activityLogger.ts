import { prisma } from "@/prisma/prisma";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE";
export type ActivityEntity =
    | "students"
    | "professors"
    | "classes"
    | "subjects"
    | "lectures"
    | "attendance"
    | "assignments"
    | "teaching-assignments"
    | "registry";

interface LogActivityParams {
    userId: number;
    userName: string;
    action: ActivityAction;
    entity: ActivityEntity;
    entityId?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any; // Object containing changes or relevant information
}

/**
 * Logs an activity to the database
 * @param params - Activity log parameters
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
    try {
        const { userId, userName, action, entity, entityId, details } = params;

        await prisma.activityLog.create({
            data: {
                userId,
                userName,
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
            },
        });
    } catch (error) {
        // Log the error but don't throw it to prevent breaking the main operation
        console.error("Failed to log activity:", error);
    }
}

/**
 * Helper function to extract changed fields between old and new data
 * @param oldData - Original data
 * @param newData - Updated data
 * @returns Object containing only the changed fields
 */
export function getChangedFields(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oldData: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newData: Record<string, any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, { old: any; new: any }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes: Record<string, { old: any; new: any }> = {};

    Object.keys(newData).forEach((key) => {
        if (oldData[key] !== newData[key]) {
            changes[key] = {
                old: oldData[key],
                new: newData[key],
            };
        }
    });

    return changes;
}
