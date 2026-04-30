export type MockUser = {
  id: string;
  email?: string;
  role?: 'organization' | 'inspector';
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  role: 'organization' | 'inspector';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  user_id: string;
  organization_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Inspector = {
  id: string;
  user_id: string;
  qualifications: string | null;
  experience: string | null;
  skills: string | null;
  available_areas: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  inspection_date: string;
  start_time: string;
  end_time: string;
  location: string;
  prefecture: string;
  city: string;
  reward: number;
  required_qualifications: string | null;
  visibility: 'local' | 'public' | 'progressive';
  status: 'draft' | 'open' | 'closed' | 'confirmed' | 'completed' | 'cancelled';
  inspector_count: number | null;
  accommodation_required: boolean | null;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  job_id: string;
  inspector_id: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_id: string | null;
  created_at: string;
};

export type FileRecord = {
  id: string;
  job_id: string;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  uploaded_by_role: 'organization' | 'inspector' | null;
  access_level: 'public' | 'confirmed' | null;
  file_category: 'recruitment' | 'submission' | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: unknown;
  ip_address?: string;
  user_agent?: string;
  organization_id?: string;
  action_type?: string;
  created_at: string;
};

const now = '2026-04-30T09:00:00.000Z';

type MockData = {
  currentUserId: string;
  profiles: Profile[];
  organizations: Organization[];
  inspectors: Inspector[];
  jobs: Job[];
  applications: Application[];
  messages: Message[];
  notifications: Notification[];
  files: FileRecord[];
  audit_logs: AuditLog[];
};

export const mockData: MockData = {
  currentUserId: 'org-user',
  profiles: [
    {
      id: 'org-user',
      email: 'org@test.com',
      full_name: 'テスト検定機関',
      phone: '03-1234-5678',
      address: '東京都港区芝公園',
      role: 'organization',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: 'inspector-user',
      email: 'inspector@test.com',
      full_name: 'テスト検定官',
      phone: '090-1234-5678',
      address: '神奈川県横浜市',
      role: 'inspector',
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
  ],
  organizations: [
    {
      id: 'org-1',
      user_id: 'org-user',
      organization_name: '青島計量検定センター',
      description: '検定依頼と検定官の手配を行うサンプル検定機関です。',
      created_at: now,
      updated_at: now,
    },
  ],
  inspectors: [
    {
      id: 'inspector-1',
      user_id: 'inspector-user',
      qualifications: '一級建築士、計量士',
      experience: '建築物検査、計量器検定、報告書作成の経験8年',
      skills: '写真記録、現地立会い、Excel報告書',
      available_areas: ['東京都', '神奈川県', '千葉県'],
      created_at: now,
      updated_at: now,
    },
    {
      id: 'inspector-2',
      user_id: 'inspector-user-2',
      qualifications: '設備検査員',
      experience: '大型施設の設備確認経験5年',
      skills: '設備検査、写真報告',
      available_areas: ['東京都', '埼玉県'],
      created_at: now,
      updated_at: now,
    },
  ],
  jobs: [
    {
      id: 'job-1',
      organization_id: 'org-1',
      title: '建築物定期検査 立会い',
      description: '商業施設の定期検査における現地確認、写真記録、検査チェックシートの提出を行います。',
      inspection_date: '2026-05-14',
      start_time: '09:00',
      end_time: '16:00',
      location: '芝公園 1-2-3',
      prefecture: '東京都',
      city: '港区',
      reward: 42000,
      required_qualifications: '建築士資格、検定経験3年以上',
      visibility: 'public',
      status: 'open',
      inspector_count: 2,
      accommodation_required: false,
      created_at: '2026-04-28T09:00:00.000Z',
      updated_at: now,
    },
    {
      id: 'job-2',
      organization_id: 'org-1',
      title: '計量器更新後の初回検定',
      description: '新設された計量器の動作確認、証跡写真、検定結果の入力までを想定しています。',
      inspection_date: '2026-05-18',
      start_time: '10:00',
      end_time: '15:30',
      location: '山下町 2-1',
      prefecture: '神奈川県',
      city: '横浜市中区',
      reward: 36000,
      required_qualifications: '計量士資格',
      visibility: 'local',
      status: 'open',
      inspector_count: 1,
      accommodation_required: false,
      created_at: '2026-04-27T09:00:00.000Z',
      updated_at: now,
    },
    {
      id: 'job-3',
      organization_id: 'org-1',
      title: '大型倉庫設備 検査補助',
      description: '複数名での設備確認。前日移動と宿泊を含むため、日程調整済みの検定官を優先します。',
      inspection_date: '2026-05-23',
      start_time: '08:30',
      end_time: '17:30',
      location: '港区倉庫エリア',
      prefecture: '大阪府',
      city: '大阪市港区',
      reward: 68000,
      required_qualifications: '設備検査経験',
      visibility: 'progressive',
      status: 'confirmed',
      inspector_count: 3,
      accommodation_required: true,
      created_at: '2026-04-26T09:00:00.000Z',
      updated_at: now,
    },
  ],
  applications: [
    {
      id: 'app-1',
      job_id: 'job-1',
      inspector_id: 'inspector-1',
      message: '建築物検査の経験があります。日程対応可能です。',
      status: 'pending',
      created_at: '2026-04-29T09:00:00.000Z',
      updated_at: '2026-04-29T09:00:00.000Z',
    },
    {
      id: 'app-2',
      job_id: 'job-3',
      inspector_id: 'inspector-1',
      message: '大型倉庫案件の経験があります。',
      status: 'confirmed',
      created_at: '2026-04-28T10:00:00.000Z',
      updated_at: '2026-04-29T12:00:00.000Z',
    },
    {
      id: 'app-3',
      job_id: 'job-1',
      inspector_id: 'inspector-2',
      message: '写真報告と現地確認に対応できます。',
      status: 'pending',
      created_at: '2026-04-29T11:00:00.000Z',
      updated_at: '2026-04-29T11:00:00.000Z',
    },
  ],
  messages: [
    {
      id: 'msg-1',
      job_id: 'job-1',
      sender_id: 'org-user',
      content: '当日の集合場所は正面搬入口です。資料を更新しました。',
      created_at: '2026-04-30T09:00:00.000Z',
    },
    {
      id: 'msg-2',
      job_id: 'job-1',
      sender_id: 'inspector-user',
      content: '承知しました。開始前に現地担当者へ連絡します。',
      created_at: '2026-04-30T09:05:00.000Z',
    },
  ],
  notifications: [
    {
      id: 'noti-1',
      user_id: 'org-user',
      type: 'application',
      title: '新しい応募があります',
      message: '建築物定期検査 立会いに応募が届きました',
      read: false,
      related_id: 'job-1',
      created_at: '2026-04-30T08:30:00.000Z',
    },
    {
      id: 'noti-2',
      user_id: 'inspector-user',
      type: 'confirmed',
      title: '案件が確定しました',
      message: '大型倉庫設備 検査補助が確定しました',
      read: false,
      related_id: 'job-3',
      created_at: '2026-04-29T12:00:00.000Z',
    },
  ],
  files: [
    {
      id: 'file-1',
      job_id: 'job-1',
      uploader_id: 'org-user',
      file_name: '募集要項.pdf',
      file_path: 'job-1/recruitment.pdf',
      file_size: 420000,
      file_type: 'application/pdf',
      uploaded_by_role: 'organization',
      access_level: 'public',
      file_category: 'recruitment',
      created_at: '2026-04-28T10:00:00.000Z',
    },
    {
      id: 'file-2',
      job_id: 'job-3',
      uploader_id: 'org-user',
      file_name: '安全管理資料.pdf',
      file_path: 'job-3/safety.pdf',
      file_size: 860000,
      file_type: 'application/pdf',
      uploaded_by_role: 'organization',
      access_level: 'confirmed',
      file_category: 'recruitment',
      created_at: '2026-04-27T10:00:00.000Z',
    },
  ],
  audit_logs: [],
};

export function getCurrentUser(): MockUser {
  const profile = mockData.profiles.find((item) => item.id === mockData.currentUserId) || mockData.profiles[0];
  return { id: profile.id, email: profile.email, role: profile.role };
}

class MockQuery<T extends Record<string, unknown>> implements PromiseLike<{ data: T[]; error: null; count?: number }> {
  private rows: T[];
  private selectedCount = false;
  private headOnly = false;

  constructor(rows: T[]) {
    this.rows = [...rows];
  }

  select(_columns?: string, options?: { count?: 'exact'; head?: boolean }) {
    this.selectedCount = options?.count === 'exact';
    this.headOnly = options?.head === true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[column] === value);
    return this;
  }

  gte(column: string, value: string) {
    this.rows = this.rows.filter((row) => String(row[column]) >= value);
    return this;
  }

  lte(column: string, value: string) {
    this.rows = this.rows.filter((row) => String(row[column]) <= value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? -1 : 1;
    this.rows = [...this.rows].sort((a, b) => String(a[column]).localeCompare(String(b[column])) * dir);
    return this;
  }

  limit(limit: number) {
    this.rows = this.rows.slice(0, limit);
    return this;
  }

  range(from: number, to: number) {
    this.rows = this.rows.slice(from, to + 1);
    return this;
  }

  update(updates: Partial<T>) {
    this.rows.forEach((row) => Object.assign(row, updates));
    return this;
  }

  insert(row: T | T[]) {
    const rows = Array.isArray(row) ? row : [row];
    this.rows = rows;
    return this;
  }

  single() {
    return Promise.resolve({ data: this.rows[0] || null, error: null });
  }

  maybeSingle() {
    return Promise.resolve({ data: this.rows[0] || null, error: null });
  }

  then<TResult1 = { data: T[]; error: null; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[]; error: null; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const value = {
      data: this.headOnly ? [] : this.rows,
      error: null,
      count: this.selectedCount ? this.rows.length : undefined,
    };
    return Promise.resolve(value).then(onfulfilled, onrejected);
  }
}

function tableRows(table: string): Record<string, unknown>[] {
  const data = mockData as unknown as Record<string, Record<string, unknown>[]>;
  return data[table] || [];
}

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: { user: getCurrentUser() } }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe: () => undefined } } };
    },
    async signUp({ email }: { email: string; password: string }) {
      const profile = mockData.profiles.find((item) => item.email === email) || mockData.profiles[0];
      mockData.currentUserId = profile.id;
      return { data: { user: getCurrentUser() }, error: null };
    },
    async signInWithPassword({ email }: { email: string; password: string }) {
      const profile = mockData.profiles.find((item) => item.email === email) || mockData.profiles[0];
      mockData.currentUserId = profile.id;
      return { data: { user: getCurrentUser() }, error: null };
    },
    async signOut() {
      return { error: null };
    },
    async resetPasswordForEmail() {
      return { error: null };
    },
    async getUser() {
      return { data: { user: getCurrentUser() }, error: null };
    },
  },
  from(table: string) {
    return new MockQuery(tableRows(table));
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(filePath: string, file: File, _options?: { upsert?: boolean }) {
          return { data: { path: filePath, name: file.name }, error: null };
        },
        async download(filePath: string) {
          return { data: new Blob([`Mock file: ${filePath}`], { type: 'text/plain' }), error: null };
        },
        getPublicUrl(filePath: string) {
          return { data: { publicUrl: `mock://${filePath}` } };
        },
      };
    },
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return { unsubscribe: () => undefined };
      },
    };
  },
};
