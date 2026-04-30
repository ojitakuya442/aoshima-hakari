import {
  Application,
  AuditLog,
  FileRecord,
  Inspector,
  Job,
  Message,
  Notification,
  Organization,
  mockData,
} from '../lib/supabase';

const delay = async () => new Promise((resolve) => window.setTimeout(resolve, 120));
const stamp = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

function withOrganization(job: Job) {
  const organization = mockData.organizations.find((item) => item.id === job.organization_id);
  return {
    ...job,
    organizations: {
      organization_name: organization?.organization_name || '青島計量検定センター',
      description: organization?.description || null,
    },
  };
}

function withInspector(application: Application) {
  const inspector = mockData.inspectors.find((item) => item.id === application.inspector_id);
  const profile = mockData.profiles.find((item) => item.id === inspector?.user_id);
  return {
    ...application,
    inspectors: inspector
      ? {
          ...inspector,
          profiles: {
            full_name: profile?.full_name || '検定官',
            email: profile?.email || 'inspector@example.com',
            phone: profile?.phone || null,
          },
        }
      : null,
  };
}

function withJob(application: Application) {
  const job = mockData.jobs.find((item) => item.id === application.job_id);
  return {
    ...application,
    jobs: job ? withOrganization(job) : null,
  };
}

export const jobsApi = {
  async getAll() {
    await delay();
    return [...mockData.jobs].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(withOrganization);
  },

  async getById(id: string) {
    await delay();
    const job = mockData.jobs.find((item) => item.id === id);
    return job ? withOrganization(job) : null;
  },

  async getByOrganization(organizationId: string) {
    await delay();
    return mockData.jobs
      .filter((item) => item.organization_id === organizationId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async create(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) {
    await delay();
    const nextJob: Job = {
      ...job,
      id: id('job'),
      created_at: stamp(),
      updated_at: stamp(),
    };
    mockData.jobs.unshift(nextJob);
    return nextJob;
  },

  async update(id: string, updates: Partial<Job>) {
    await delay();
    const job = mockData.jobs.find((item) => item.id === id);
    if (!job) return null;
    Object.assign(job, updates, { updated_at: stamp() });
    return job;
  },

  async delete(id: string) {
    await delay();
    const index = mockData.jobs.findIndex((item) => item.id === id);
    if (index >= 0) mockData.jobs.splice(index, 1);
  },

  async getOpenJobs(prefecture?: string) {
    await delay();
    return mockData.jobs
      .filter((item) => item.status === 'open')
      .filter((item) => !prefecture || item.prefecture === prefecture)
      .sort((a, b) => a.inspection_date.localeCompare(b.inspection_date))
      .map(withOrganization);
  },

  async updateStatus(id: string, status: Job['status']) {
    return this.update(id, { status });
  },
};

export const applicationsApi = {
  async getByJob(jobId: string) {
    await delay();
    return mockData.applications
      .filter((item) => item.job_id === jobId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(withInspector);
  },

  async getByInspector(inspectorId: string) {
    await delay();
    return mockData.applications
      .filter((item) => item.inspector_id === inspectorId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map(withJob);
  },

  async create(application: Omit<Application, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    await delay();
    const nextApplication: Application = {
      ...application,
      id: id('app'),
      status: 'pending',
      created_at: stamp(),
      updated_at: stamp(),
    };
    mockData.applications.unshift(nextApplication);
    return nextApplication;
  },

  async updateStatus(id: string, status: Application['status']) {
    await delay();
    const application = mockData.applications.find((item) => item.id === id);
    if (!application) return null;
    Object.assign(application, { status, updated_at: stamp() });
    return application;
  },

  async withdraw(id: string) {
    return this.updateStatus(id, 'withdrawn');
  },

  async confirm(id: string) {
    return this.updateStatus(id, 'confirmed');
  },

  async reject(id: string) {
    return this.updateStatus(id, 'rejected');
  },
};

export const messagesApi = {
  async getByJob(jobId: string) {
    await delay();
    return mockData.messages
      .filter((item) => item.job_id === jobId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((message) => {
        const sender = mockData.profiles.find((item) => item.id === message.sender_id);
        return {
          ...message,
          sender: sender
            ? {
                full_name: sender.full_name,
                role: sender.role,
                avatar_url: sender.avatar_url,
              }
            : null,
        };
      });
  },

  async send(message: Omit<Message, 'id' | 'created_at'>) {
    await delay();
    const nextMessage: Message = {
      ...message,
      id: id('msg'),
      created_at: stamp(),
    };
    mockData.messages.push(nextMessage);
    return nextMessage;
  },

  async subscribeToJob(_jobId: string, _callback: (message: Message) => void) {
    return {
      unsubscribe: () => undefined,
    };
  },
};

export const notificationsApi = {
  async getByUser(userId: string) {
    await delay();
    return mockData.notifications
      .filter((item) => item.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'read'> & { read?: boolean }) {
    await delay();
    const nextNotification: Notification = {
      ...notification,
      id: id('noti'),
      read: notification.read ?? false,
      created_at: stamp(),
    };
    mockData.notifications.unshift(nextNotification);
    return nextNotification;
  },

  async markAsRead(id: string) {
    await delay();
    const notification = mockData.notifications.find((item) => item.id === id);
    if (notification) notification.read = true;
  },

  async markAllAsRead(userId: string) {
    await delay();
    mockData.notifications.forEach((item) => {
      if (item.user_id === userId) item.read = true;
    });
  },

  async getUnreadCount(userId: string) {
    await delay();
    return mockData.notifications.filter((item) => item.user_id === userId && !item.read).length;
  },
};

export const filesApi = {
  async getByJob(jobId: string) {
    await delay();
    return mockData.files.filter((item) => item.job_id === jobId);
  },

  async upload(file: File, jobId: string, uploaderId: string) {
    return this.uploadWithMetadata(file, jobId, uploaderId, {
      uploaded_by_role: 'organization',
      access_level: 'public',
      file_category: 'recruitment',
    });
  },

  async uploadWithMetadata(
    file: File,
    jobId: string,
    uploaderId: string,
    metadata: {
      uploaded_by_role: 'organization' | 'inspector';
      access_level: 'public' | 'confirmed';
      file_category: 'recruitment' | 'submission';
    }
  ) {
    await delay();
    const nextFile: FileRecord = {
      id: id('file'),
      job_id: jobId,
      uploader_id: uploaderId,
      file_name: file.name,
      file_path: `${jobId}/${file.name}`,
      file_size: file.size,
      file_type: file.type,
      created_at: stamp(),
      ...metadata,
    };
    mockData.files.unshift(nextFile);
    return nextFile;
  },

  async download(filePath: string) {
    await delay();
    return new Blob([`Mock file: ${filePath}`], { type: 'text/plain' });
  },

  async getPublicUrl(filePath: string) {
    return `mock://${filePath}`;
  },
};

export const organizationsApi = {
  async getByUserId(userId: string) {
    await delay();
    return mockData.organizations.find((item) => item.user_id === userId) || null;
  },

  async update(id: string, updates: Partial<Organization>) {
    await delay();
    const organization = mockData.organizations.find((item) => item.id === id);
    if (!organization) return null;
    Object.assign(organization, updates, { updated_at: stamp() });
    return organization;
  },
};

export const inspectorsApi = {
  async getByUserId(userId: string) {
    await delay();
    return mockData.inspectors.find((item) => item.user_id === userId) || null;
  },

  async update(id: string, updates: Partial<Inspector>) {
    await delay();
    const inspector = mockData.inspectors.find((item) => item.id === id);
    if (!inspector) return null;
    Object.assign(inspector, updates, { updated_at: stamp() });
    return inspector;
  },
};

export const auditLogsApi = {
  async getAll(options?: {
    limit?: number;
    offset?: number;
    action?: string;
    entity_type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    await delay();
    let data = [...mockData.audit_logs];
    if (options?.action) data = data.filter((item) => item.action === options.action);
    if (options?.entity_type) data = data.filter((item) => item.entity_type === options.entity_type);
    if (options?.startDate) data = data.filter((item) => item.created_at >= options.startDate!.toISOString());
    if (options?.endDate) data = data.filter((item) => item.created_at <= options.endDate!.toISOString());
    const count = data.length;
    if (options?.offset !== undefined || options?.limit !== undefined) {
      const offset = options.offset || 0;
      data = data.slice(offset, offset + (options.limit || 50));
    }
    return { data, count };
  },

  async getByUser(userId: string, limit = 100) {
    await delay();
    return mockData.audit_logs.filter((item) => item.user_id === userId).slice(0, limit);
  },

  async create(log: {
    action: string;
    entity_type?: string;
    entity_id?: string;
    details?: unknown;
    ip_address?: string;
    user_agent?: string;
    organization_id?: string;
    action_type?: string;
  }) {
    await delay();
    const nextLog: AuditLog = {
      id: id('log'),
      user_id: mockData.currentUserId,
      created_at: stamp(),
      ...log,
    };
    mockData.audit_logs.unshift(nextLog);
    return nextLog;
  },

  async getStats(startDate?: Date, endDate?: Date) {
    let data = [...mockData.audit_logs];
    if (startDate) data = data.filter((item) => item.created_at >= startDate.toISOString());
    if (endDate) data = data.filter((item) => item.created_at <= endDate.toISOString());
    return {
      total: data.length,
      byAction: data.reduce<Record<string, number>>((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
      byEntityType: data.reduce<Record<string, number>>((acc, log) => {
        if (log.entity_type) acc[log.entity_type] = (acc[log.entity_type] || 0) + 1;
        return acc;
      }, {}),
    };
  },
};
