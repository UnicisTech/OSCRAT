import type { PrismaClient } from '@oscrat/model/server';
import {
  ensureAwarenessTrainingTask,
  getAwarenessTrainingOverdueMembers,
} from '@oscrat/model/operations';
import { AWARENESS_TRAINING_REGENERATION_DAYS } from '@oscrat/model/constants/awarenessTraining';

export async function checkAwarenessTrainingRegeneration(
  prisma: PrismaClient
): Promise<{ processed: number; created: number; errors: number }> {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - AWARENESS_TRAINING_REGENERATION_DAYS);

  const overdueMembers = await getAwarenessTrainingOverdueMembers(prisma, threshold);

  let created = 0;
  let errors = 0;

  for (const member of overdueMembers) {
    try {
      const auditInfo = {
        user: { id: 'system', name: 'System' },
        team: { id: member.team.id, name: member.team.name },
      };

      await ensureAwarenessTrainingTask(
        prisma,
        member.teamId,
        member.user.id,
        member.user.name,
        auditInfo
      );
      created++;
    } catch (err) {
      errors++;
      console.error(
        `[Awareness] Failed to create task for user ${member.user.id} in team ${member.teamId}:`,
        err
      );
    }
  }

  console.log(
    `[Awareness] Regeneration check complete: checked=${overdueMembers.length}, created=${created}, errors=${errors}`
  );

  return { processed: overdueMembers.length, created, errors };
}
