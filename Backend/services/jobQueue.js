// Simple job queue for async tasks
// TODO: Replace with proper queue system (Bull/RabbitMQ) in production
class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async add(job) {
    // Add job to queue with unique ID
    this.queue.push({
      ...job,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    });
    
    // Start processing if not already running
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    // Process all jobs in queue
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      
      try {
        await this.executeJob(job);
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error.message);
      }
    }

    this.processing = false;
  }

  async executeJob(job) {
    switch (job.type) {
      case "SEND_EMAIL":
        await this.sendEmail(job.data);
        break;
      default:
        console.warn(`Unknown job type: ${job.type}`);
    }
  }

  // Mock email sending (replace with actual email service)
  async sendEmail(data) {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`📧 Email sent to ${data.email}`);
    console.log(`   Subject: ${data.subject}`);
    console.log(`   Body: ${data.body}`);
  }
}

export const jobQueue = new JobQueue();

