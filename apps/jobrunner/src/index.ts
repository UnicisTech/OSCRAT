import { PrismaClient } from '@oscrat/model/server';
import { WorkerJobType, WorkerJob } from '@oscrat/model';
import { popWorkerJob, finishWorkerJob } from '@oscrat/model/operations';
import { executeSbomGeneration } from './jobs/sbom';
import { executeSbomImport } from './jobs/sbomImport';
import { executeVulnerabilityScan } from './jobs/vulnerabilityScan';
import { executeSbomReportScan } from './jobs/sbomReportScan';
import { executeConfigurationScan } from './jobs/configurationScan';
import { checkAwarenessTrainingRegeneration } from './jobs/awarenessTraining';
import * as fs from 'fs';
import * as path from 'path';
import { $ } from 'zx';

// Import local config
import env from './lib/env';

class JobRunner {
  private prisma: PrismaClient;
  private isRunning = false;
  private runningJobs = new Set<Promise<void>>();
  private maxConcurrentJobs: number;
  private pollTimeout: NodeJS.Timeout | null = null;
  private isProcessingJobs = false;
  private trainingCheckTimeout: NodeJS.Timeout | null = null;
  private grypeDbRefreshTimeout: NodeJS.Timeout | null = null;
  private grypeDbRefreshDue = false;
  private workspaceRoot: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.maxConcurrentJobs = env.jobRunner.maxConcurrentJobs;
    this.workspaceRoot = env.workspaceRoot;
    console.log(
      `[Job Runner] Configured with ${this.maxConcurrentJobs} max concurrent jobs`
    );
    console.log(`[Job Runner] Workspace root: ${this.workspaceRoot}`);
  }

  private async ensureWorkspaceRoot(): Promise<void> {
    try {
      console.log(
        `[Job Runner] Checking workspace root: ${this.workspaceRoot}`
      );

      // Check if directory exists
      if (!fs.existsSync(this.workspaceRoot)) {
        console.log(`[Job Runner] Creating workspace root directory...`);
        fs.mkdirSync(this.workspaceRoot, { recursive: true });
        console.log(
          `[Job Runner] Workspace root created: ${this.workspaceRoot}`
        );
      } else {
        console.log(
          `[Job Runner] Workspace root exists: ${this.workspaceRoot}`
        );
      }

      // Verify we can write to it
      const testFile = path.join(this.workspaceRoot, '.jobrunner-test');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);

      console.log(`[Job Runner] Workspace root is writable`);
    } catch (error) {
      throw new Error(
        `Failed to setup workspace root: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  private async checkSyftAvailability(): Promise<void> {
    try {
      console.log('[Job Runner] Checking syft availability...');
      await $`which syft`;
      console.log('[Job Runner] syft is available');
    } catch (error) {
      throw new Error(
        'syft is not installed or not available in PATH. SBOM generation requires syft to be installed.'
      );
    }
  }

  private async checkGrypeAvailability(): Promise<void> {
    try {
      console.log('[Job Runner] Checking grype availability...');
      await $`which grype`;
      console.log('[Job Runner] grype is available');
    } catch (error) {
      throw new Error(
        'grype is not installed or not available in PATH. Vulnerability scanning requires grype to be installed.'
      );
    }
  }

  private async checkOscapReportAvailability(): Promise<void> {
    try {
      console.log('[Job Runner] Checking oscap-report availability...');
      await $`which oscap-report`;
      console.log('[Job Runner] oscap-report is available');
    } catch (error) {
      throw new Error(
        'oscap-report is not installed or not available in PATH. Configuration scanning requires oscap-report to be installed. Install with: pip install openscap-report'
      );
    }
  }

  public getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }

  async start() {
    console.log('[Job Runner] Starting...');

    try {
      await this.checkSyftAvailability();
      await this.checkGrypeAvailability();
      await this.checkOscapReportAvailability();
      await this.ensureWorkspaceRoot();
      await this.prisma.$connect();
      console.log('[Job Runner] Database connected');

      try {
        await this.updateGrypeDb();
      } catch (error) {
        console.error('[Job Runner] Initial grype DB update failed:', error);
      }

      this.isRunning = true;
      this.processJobs();
      this.startTrainingRegeneration();
      this.scheduleGrypeDbRefresh();
      console.log(
        `[Job Runner] Started successfully (max ${this.maxConcurrentJobs} concurrent jobs)`
      );
    } catch (error) {
      console.error('[Job Runner] Failed to start:', error);
      process.exit(1);
    }
  }

  private startTrainingRegeneration() {
    this.runTrainingCheck();
    console.log('[Job Runner] Awareness training regeneration scheduled (every 24h)');
  }

  private async runTrainingCheck() {
    try {
      await checkAwarenessTrainingRegeneration(this.prisma);
    } catch (err) {
      console.error('[Job Runner] Awareness training check failed:', err);
    } finally {
      this.scheduleTrainingCheck();
    }
  }

  private scheduleTrainingCheck() {
    if (!this.isRunning) return;
    const intervalMs = 24 * 60 * 60 * 1000;
    this.trainingCheckTimeout = setTimeout(() => this.runTrainingCheck(), intervalMs);
  }

  private async updateGrypeDb() {
    console.log('[Job Runner] Updating grype vulnerability DB...');
    await $`grype db update`;
    console.log('[Job Runner] grype vulnerability DB up to date');
  }

  private scheduleGrypeDbRefresh() {
    if (!this.isRunning) return;
    const intervalMs = 24 * 60 * 60 * 1000;
    this.grypeDbRefreshTimeout = setTimeout(() => {
      this.grypeDbRefreshDue = true;
      this.processJobs();
    }, intervalMs);
  }

  async stop() {
    console.log('[Job Runner] Stopping...');
    this.isRunning = false;

    if (this.trainingCheckTimeout) {
      clearTimeout(this.trainingCheckTimeout);
      this.trainingCheckTimeout = null;
    }

    if (this.grypeDbRefreshTimeout) {
      clearTimeout(this.grypeDbRefreshTimeout);
      this.grypeDbRefreshTimeout = null;
    }

    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }

    if (this.runningJobs.size > 0) {
      console.log(
        `[Job Runner] Waiting for ${this.runningJobs.size} jobs to complete...`
      );
      await Promise.all(Array.from(this.runningJobs));
      console.log('[Job Runner] All jobs completed');
    }

    await this.prisma.$disconnect();
    console.log('[Job Runner] Stopped');
  }

  private async processJobs() {
    if (!this.isRunning || this.isProcessingJobs) return;

    this.isProcessingJobs = true;

    try {
      if (this.pollTimeout) {
        clearTimeout(this.pollTimeout);
        this.pollTimeout = null;
      }

      if (this.grypeDbRefreshDue) {
        if (this.runningJobs.size > 0) return;
        this.grypeDbRefreshDue = false;
        try {
          await this.updateGrypeDb();
        } catch (err) {
          console.error('[Job Runner] grype DB refresh failed:', err);
        } finally {
          this.scheduleGrypeDbRefresh();
        }
      }

      let jobsStarted = 0;
      while (this.runningJobs.size < this.maxConcurrentJobs && this.isRunning) {
        const job = await popWorkerJob(this.prisma);

        if (!job) break;

        console.log(
          `[Job Runner] Starting job ${job.id} (${job.type}) - ${this.runningJobs.size + 1}/${this.maxConcurrentJobs} slots`
        );
        jobsStarted++;

        const jobPromise = this.processJob(job);
        this.runningJobs.add(jobPromise);

        jobPromise.finally(() => {
          this.runningJobs.delete(jobPromise);
          if (
            this.isRunning &&
            this.runningJobs.size < this.maxConcurrentJobs &&
            !this.isProcessingJobs
          ) {
            setImmediate(() => this.processJobs());
          }
        });
      }

      if (jobsStarted === 0) {
        if (this.runningJobs.size === 0) {
          console.log('[Job Runner] No jobs in queue, polling in 5s...');
        }
        // If jobs are running but no new ones started, don't log anything
      }
    } catch (error) {
      console.error('[Job Runner] Error in processJobs:', error);
    } finally {
      this.isProcessingJobs = false;
      if (this.isRunning && this.runningJobs.size < this.maxConcurrentJobs) {
        this.scheduleNextPoll();
      }
    }
  }

  private scheduleNextPoll() {
    if (!this.isRunning || this.runningJobs.size >= this.maxConcurrentJobs) {
      return;
    }

    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }

    const pollInterval = env.jobRunner.pollIntervalMs;
    this.pollTimeout = setTimeout(() => {
      this.pollTimeout = null;
      this.processJobs();
    }, pollInterval);
  }

  private async processJob(job: WorkerJob): Promise<void> {
    const startTime = Date.now();

    try {
      const result = await this.executeJob(job);

      await finishWorkerJob(this.prisma, {
        jobId: job.id,
        success: true,
        result,
      });

      const duration = Date.now() - startTime;
      console.log(`[Job Runner] Job ${job.id} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Job Runner] Job ${job.id} failed after ${duration}ms:`, {
        error: error instanceof Error ? error.message : String(error),
        type: job.type,
      });

      try {
        await finishWorkerJob(this.prisma, {
          jobId: job.id,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (updateError) {
        console.error(
          `[Job Runner] Failed to update job ${job.id} status:`,
          updateError
        );
      }
    }
  }

  private async executeJob(job: WorkerJob): Promise<any> {
    console.log(`[Job Runner] Executing ${job.type} for job ${job.id}`);

    try {
      switch (job.type) {
        case WorkerJobType.REPO_GENERATE_SBOM:
          return await executeSbomGeneration(
            job,
            this.prisma,
            this.workspaceRoot
          );
        case WorkerJobType.FILE_IMPORT_SBOM:
          return await executeSbomImport(job, this.prisma, this.workspaceRoot);
        case WorkerJobType.REPO_SCAN_VULNERABILITIES:
          return await executeVulnerabilityScan(
            job,
            this.prisma,
            this.workspaceRoot
          );
        case WorkerJobType.SBOM_REPORT_SCAN_VULNERABILITIES:
          return await executeSbomReportScan(
            job,
            this.prisma,
            this.workspaceRoot
          );
        case WorkerJobType.PROCESS_CONFIGURATION_SCAN:
          return await executeConfigurationScan(
            job,
            this.prisma,
            this.workspaceRoot
          );
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }
    } catch (error) {
      console.error(`[Job Runner] Job ${job.id} execution error:`, {
        type: job.type,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      runningJobs: this.runningJobs.size,
      maxConcurrentJobs: this.maxConcurrentJobs,
      hasCapacity: this.runningJobs.size < this.maxConcurrentJobs,
      isProcessingJobs: this.isProcessingJobs,
      hasPendingPoll: this.pollTimeout !== null,
    };
  }

  public triggerJobProcessing() {
    if (
      this.isRunning &&
      this.runningJobs.size < this.maxConcurrentJobs &&
      !this.isProcessingJobs
    ) {
      if (this.pollTimeout) {
        clearTimeout(this.pollTimeout);
        this.pollTimeout = null;
      }
      setImmediate(() => this.processJobs());
    }
  }
}

// Handle graceful shutdown
const jobRunner = new JobRunner();

process.on('SIGINT', async () => {
  console.log('\n[Job Runner] Received SIGINT, shutting down...');
  try {
    await jobRunner.stop();
    process.exit(0);
  } catch (error) {
    console.error('[Job Runner] Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n[Job Runner] Received SIGTERM, shutting down...');
  try {
    await jobRunner.stop();
    process.exit(0);
  } catch (error) {
    console.error('[Job Runner] Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Job Runner] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Job Runner] Unhandled rejection:', reason);
  process.exit(1);
});

// Start the job runner
console.log('[Job Runner] Starting up...');
jobRunner.start().catch((error) => {
  console.error('[Job Runner] Failed to start:', error);
  process.exit(1);
});
