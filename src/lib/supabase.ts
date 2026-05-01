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
  accommodation?: 'none' | 'before' | 'after' | 'both';
  accommodation_required?: boolean | null; // deprecated
  job_number?: string;
  machine_counts?: {
    ssv: number;
    sv: number;
    other: number;
    old: number;
    certified: number;
    existing: number;
  };
  inspection_count?: 'first' | 'second_or_later';
  required_items?: string[];
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
  viewable_from: string | null;
  viewable_until: string | null;
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
    { id: 'org-user',        email: 'org@test.com',        full_name: '田村 健一',    phone: '03-1234-5678', address: '東京都港区芝公園',   role: 'organization', avatar_url: null, created_at: now, updated_at: now },
    { id: 'inspector-user',  email: 'inspector@test.com',  full_name: '山田 太郎',    phone: '090-1234-5678', address: '神奈川県横浜市西区', role: 'inspector',    avatar_url: null, created_at: now, updated_at: now },
    { id: 'inspector-user-2',email: 'inspector2@test.com', full_name: '鈴木 一郎',    phone: '090-2222-3333', address: '東京都新宿区',       role: 'inspector',    avatar_url: null, created_at: now, updated_at: now },
    { id: 'inspector-user-3',email: 'inspector3@test.com', full_name: '佐藤 花子',    phone: '080-4444-5555', address: '大阪府大阪市北区',   role: 'inspector',    avatar_url: null, created_at: now, updated_at: now },
    { id: 'inspector-user-4',email: 'inspector4@test.com', full_name: '伊藤 誠',      phone: '070-6666-7777', address: '愛知県名古屋市中区', role: 'inspector',    avatar_url: null, created_at: now, updated_at: now },
    { id: 'inspector-user-5',email: 'inspector5@test.com', full_name: '渡辺 幸子',    phone: '090-8888-9999', address: '福岡県福岡市博多区', role: 'inspector',    avatar_url: null, created_at: now, updated_at: now },
  ],
  organizations: [
    { id: 'org-1', user_id: 'org-user', organization_name: '青島計量検定センター', description: '計量・建築系の検定を専門とする機関', created_at: now, updated_at: now },
    { id: 'org-2', user_id: 'org-user', organization_name: '関東総合検定機関',     description: '関東圏を中心に幅広い検定業務を担う', created_at: now, updated_at: now },
    { id: 'org-3', user_id: 'org-user', organization_name: '近畿検定協会',         description: '近畿地方の計量・設備検定機関',       created_at: now, updated_at: now },
  ],
  inspectors: [
    { id: 'inspector-1', user_id: 'inspector-user',   qualifications: '一級建築士、計量士',  experience: '建築物検査・計量器検定・報告書作成の経験8年', skills: '写真記録、現地立会い、Excel報告書', available_areas: ['東京都', '神奈川県', '千葉県'],     created_at: now, updated_at: now },
    { id: 'inspector-2', user_id: 'inspector-user-2', qualifications: '設備検査員',          experience: '大型施設の設備確認経験5年',                  skills: '設備検査、写真報告',               available_areas: ['東京都', '埼玉県'],                  created_at: now, updated_at: now },
    { id: 'inspector-3', user_id: 'inspector-user-3', qualifications: '計量士',              experience: '計量器検定10年',                              skills: '計量検査、書類整理',               available_areas: ['大阪府', '兵庫県', '京都府'],        created_at: now, updated_at: now },
    { id: 'inspector-4', user_id: 'inspector-user-4', qualifications: '二級建築士',          experience: '建築検査7年',                                 skills: '現地立会い、図面確認',             available_areas: ['愛知県', '岐阜県', '静岡県'],        created_at: now, updated_at: now },
    { id: 'inspector-5', user_id: 'inspector-user-5', qualifications: '電気工事士、計量士',  experience: '電気設備・計量器の複合検査12年',              skills: '電気設備検査、計量器校正',         available_areas: ['福岡県', '佐賀県', '長崎県'],        created_at: now, updated_at: now },
  ],
  jobs: [
    { id: 'job-1',  organization_id: 'org-1', title: '建築物定期検査 立会い',          description: '商業施設の定期検査における現地確認、写真記録、検査チェックシートの提出を行います。',                      inspection_date: '2026-05-14', start_time: '09:00', end_time: '16:00', location: '芝公園 1-2-3',              prefecture: '東京都',   city: '港区',             reward: 42000, required_qualifications: '建築士資格、検定経験3年以上',  visibility: 'public', status: 'open',      inspector_count: 2, accommodation: 'none',   job_number: 'A2500001', machine_counts: { ssv: 1, sv: 0, other: 0, old: 0, certified: 1, existing: 0 }, inspection_count: 'first', required_items: ['ヘルメット', 'マスク'], created_at: '2026-04-28T09:00:00.000Z', updated_at: now },
    { id: 'job-2',  organization_id: 'org-1', title: '計量器更新後の初回検定',           description: '新設された計量器の動作確認、証跡写真、検定結果の入力までを想定しています。',                              inspection_date: '2026-05-14', start_time: '10:00', end_time: '15:30', location: '山下町 2-1',                 prefecture: '神奈川県', city: '横浜市中区',       reward: 36000, required_qualifications: '計量士資格',                    visibility: 'local',  status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500002', machine_counts: { ssv: 0, sv: 2, other: 1, old: 0, certified: 2, existing: 1 }, inspection_count: 'first', required_items: ['白つなぎ'], created_at: '2026-04-27T09:00:00.000Z', updated_at: now },
    { id: 'job-3',  organization_id: 'org-1', title: '大型倉庫設備 検査補助',            description: '複数名での設備確認。前日移動と宿泊を含むため、日程調整済みの検定官を優先します。',                        inspection_date: '2026-05-14', start_time: '08:30', end_time: '17:30', location: '港区倉庫エリア',             prefecture: '大阪府',   city: '大阪市港区',       reward: 68000, required_qualifications: '設備検査経験',                  visibility: 'local',  status: 'confirmed', inspector_count: 3, accommodation: 'before', job_number: 'A2500003', machine_counts: { ssv: 2, sv: 1, other: 0, old: 1, certified: 3, existing: 1 }, inspection_count: 'second_or_later', required_items: ['ヘルメット', '長靴'], created_at: '2026-04-26T09:00:00.000Z', updated_at: now },
    { id: 'job-4',  organization_id: 'org-1', title: '自動車計量器 定期検定',            description: 'トラックスケールの定期検定。午前中で完了予定。',                                                              inspection_date: '2026-05-14', start_time: '09:00', end_time: '12:00', location: '名古屋港運エリア',           prefecture: '愛知県',   city: '名古屋市港区',     reward: 28000, required_qualifications: '計量士資格',                    visibility: 'public', status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500004', machine_counts: { ssv: 0, sv: 0, other: 1, old: 0, certified: 0, existing: 1 }, inspection_count: 'second_or_later', required_items: ['ヘルメット'], created_at: '2026-04-25T09:00:00.000Z', updated_at: now },
    { id: 'job-5',  organization_id: 'org-1', title: '電気設備 安全検査',                description: '工場内の電気設備全般の安全確認検査。経験者優遇。',                                                            inspection_date: '2026-05-14', start_time: '08:00', end_time: '17:00', location: '北九州工業地帯',             prefecture: '福岡県',   city: '北九州市八幡東区', reward: 55000, required_qualifications: '電気工事士',                    visibility: 'public', status: 'draft',     inspector_count: 2, accommodation: 'both',   job_number: 'A2500005', machine_counts: { ssv: 1, sv: 1, other: 0, old: 0, certified: 1, existing: 1 }, inspection_count: 'second_or_later', required_items: ['マスク', '白衛生靴'], created_at: '2026-04-24T09:00:00.000Z', updated_at: now },
    { id: 'job-6',  organization_id: 'org-1', title: '医療機器 計量検定',                description: '病院内医療計量機器の定期検定。守秘義務が生じます。',                                                          inspection_date: '2026-05-14', start_time: '10:00', end_time: '15:00', location: '札幌市中央区医療センター',   prefecture: '北海道',   city: '札幌市中央区',     reward: 48000, required_qualifications: '計量士資格、医療機器経験',        visibility: 'local',  status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500006', machine_counts: { ssv: 0, sv: 0, other: 2, old: 0, certified: 1, existing: 1 }, inspection_count: 'first', required_items: ['ヘアキャップ', 'マスク', '白衛生靴'], created_at: '2026-04-23T09:00:00.000Z', updated_at: now },
    { id: 'job-7',  organization_id: 'org-1', title: 'ガス計量器 一斉検定',              description: '住宅地域のガスメーター一斉取替え作業に伴う検定補助。',                                                      inspection_date: '2026-05-14', start_time: '09:00', end_time: '18:00', location: '仙台市太白区',               prefecture: '宮城県',   city: '仙台市太白区',     reward: 38000, required_qualifications: 'ガス検査資格',                  visibility: 'public', status: 'draft',     inspector_count: 4, accommodation: 'none',   job_number: 'A2500007', machine_counts: { ssv: 0, sv: 0, other: 10, old: 0, certified: 10, existing: 0 }, inspection_count: 'second_or_later', required_items: [], created_at: '2026-04-22T09:00:00.000Z', updated_at: now },
    { id: 'job-8',  organization_id: 'org-1', title: '水道計量器 更新検定',              description: '市営水道の計量器更新に伴う検定業務。',                                                                        inspection_date: '2026-05-14', start_time: '08:30', end_time: '16:30', location: '広島市中区',                 prefecture: '広島県',   city: '広島市中区',       reward: 32000, required_qualifications: '計量士資格',                    visibility: 'local',  status: 'confirmed', inspector_count: 2, accommodation: 'none',   job_number: 'A2500008', machine_counts: { ssv: 0, sv: 0, other: 5, old: 0, certified: 5, existing: 0 }, inspection_count: 'second_or_later', required_items: ['長靴'], created_at: '2026-04-21T09:00:00.000Z', updated_at: now },
    { id: 'job-9',  organization_id: 'org-1', title: 'エレベーター定期検査 立会い',      description: 'オフィスビル内エレベーターの法定定期検査。午後から開始し夕方までに完了予定。',                              inspection_date: '2026-05-14', start_time: '13:00', end_time: '18:00', location: '新宿センタービル',           prefecture: '東京都',   city: '新宿区',           reward: 35000, required_qualifications: '昇降機検査資格',                visibility: 'public', status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500009', machine_counts: { ssv: 0, sv: 0, other: 0, old: 0, certified: 0, existing: 1 }, inspection_count: 'second_or_later', required_items: ['ヘルメット'], created_at: '2026-04-20T09:00:00.000Z', updated_at: now },
    { id: 'job-10', organization_id: 'org-1', title: '食品計量器 定期検定',              description: '食品工場内の各種計量器一括検定。衛生管理上の制約あり。白衣着用必須。',                                      inspection_date: '2026-05-15', start_time: '07:00', end_time: '13:00', location: '千葉市花見川区',             prefecture: '千葉県',   city: '千葉市花見川区',   reward: 30000, required_qualifications: '計量士資格',                    visibility: 'public', status: 'open',      inspector_count: 2, accommodation: 'none',   job_number: 'A2500010', machine_counts: { ssv: 5, sv: 0, other: 0, old: 2, certified: 3, existing: 4 }, inspection_count: 'second_or_later', required_items: ['ヘアキャップ', 'マスク', '白衛生靴', '白つなぎ'], created_at: '2026-04-19T09:00:00.000Z', updated_at: now },
    { id: 'job-11', organization_id: 'org-1', title: '消防設備 点検補助',                description: '商業施設の消防設備点検に伴う立会い・記録作業。消防設備士が現地を主導します。',                              inspection_date: '2026-05-15', start_time: '09:00', end_time: '17:00', location: '大宮ソニックシティ周辺',     prefecture: '埼玉県',   city: 'さいたま市大宮区', reward: 40000, required_qualifications: '消防設備点検経験',              visibility: 'local',  status: 'open',      inspector_count: 2, accommodation: 'none',   job_number: 'A2500011', machine_counts: { ssv: 0, sv: 0, other: 0, old: 0, certified: 0, existing: 0 }, inspection_count: 'second_or_later', required_items: ['ヘルメット'], created_at: '2026-04-18T09:00:00.000Z', updated_at: now },
    { id: 'job-12', organization_id: 'org-1', title: '港湾クレーン 定期検査',            description: '港湾施設の大型クレーン定期検査。高所作業経験者優遇。安全具貸出あり。',                                      inspection_date: '2026-05-15', start_time: '08:00', end_time: '16:00', location: '神戸港ポートアイランド',     prefecture: '兵庫県',   city: '神戸市中央区',     reward: 72000, required_qualifications: 'クレーン運転士、高所作業経験',    visibility: 'local',  status: 'draft',     inspector_count: 3, accommodation: 'before', job_number: 'A2500012', machine_counts: { ssv: 0, sv: 0, other: 1, old: 0, certified: 1, existing: 0 }, inspection_count: 'first', required_items: ['ヘルメット'], created_at: '2026-04-17T09:00:00.000Z', updated_at: now },
    { id: 'job-13', organization_id: 'org-1', title: '農業用計量器 巡回検定',            description: '管内農協各所の農業用計量器を巡回して一括検定。社用車にて移動。',                                            inspection_date: '2026-05-15', start_time: '08:30', end_time: '17:30', location: '岡山市北区農協',             prefecture: '岡山県',   city: '岡山市北区',       reward: 45000, required_qualifications: '計量士資格、普通自動車免許',      visibility: 'public', status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500013', machine_counts: { ssv: 0, sv: 0, other: 4, old: 1, certified: 3, existing: 2 }, inspection_count: 'second_or_later', required_items: ['長靴'], created_at: '2026-04-16T09:00:00.000Z', updated_at: now },
    { id: 'job-14', organization_id: 'org-1', title: '学校施設 建築物検査',              description: '市内複数の小中学校を対象とした建築物定期検査。報告書提出まで一連の作業をお願いします。',                    inspection_date: '2026-07-25', start_time: '09:00', end_time: '17:00', location: '京都市左京区学校群',         prefecture: '京都府',   city: '京都市左京区',     reward: 50000, required_qualifications: '建築士資格',                    visibility: 'local',  status: 'open',      inspector_count: 2, accommodation: 'none',   job_number: 'A2500014', machine_counts: { ssv: 0, sv: 0, other: 0, old: 0, certified: 0, existing: 0 }, inspection_count: 'second_or_later', required_items: [], created_at: '2026-04-15T09:00:00.000Z', updated_at: now },
    { id: 'job-15', organization_id: 'org-1', title: 'ボイラー定期検査 立会い',          description: '工場内大型ボイラーの法定定期検査。ボイラー協会の検査官と同行します。',                                        inspection_date: '2026-08-03', start_time: '08:00', end_time: '12:00', location: '堺市堺区臨海工業地帯',       prefecture: '大阪府',   city: '堺市堺区',         reward: 33000, required_qualifications: 'ボイラー検査経験',              visibility: 'public', status: 'open',      inspector_count: 1, accommodation: 'none',   job_number: 'A2500015', machine_counts: { ssv: 0, sv: 0, other: 1, old: 1, certified: 0, existing: 2 }, inspection_count: 'second_or_later', required_items: ['ヘルメット'], created_at: '2026-04-14T09:00:00.000Z', updated_at: now },
    { id: 'job-16', organization_id: 'org-1', title: '再生可能エネルギー設備 検査',      description: '太陽光・風力発電設備の計測機器検定。山間部のため4WD車推奨。',                                              inspection_date: '2026-08-10', start_time: '09:00', end_time: '17:00', location: '長野県阿南町',               prefecture: '長野県',   city: '下伊那郡阿南町',   reward: 60000, required_qualifications: '電気工事士、計量士資格',          visibility: 'local',  status: 'draft',     inspector_count: 2, accommodation: 'after',  job_number: 'A2500016', machine_counts: { ssv: 0, sv: 1, other: 0, old: 0, certified: 1, existing: 0 }, inspection_count: 'first', required_items: ['ヘルメット', '長靴'], created_at: '2026-04-13T09:00:00.000Z', updated_at: now },
    { id: 'job-17', organization_id: 'org-1', title: '冷凍・冷蔵設備 計量検定',          description: 'スーパーマーケットの冷凍・冷蔵庫内計量機器の検定。早朝作業で開店前に終了予定。',                            inspection_date: '2026-08-18', start_time: '05:00', end_time: '09:00', location: 'イオン那覇店',               prefecture: '沖縄県',   city: '那覇市おもろまち', reward: 25000, required_qualifications: '計量士資格',                    visibility: 'public', status: 'open',      inspector_count: 1, accommodation: 'before', job_number: 'A2500017', machine_counts: { ssv: 1, sv: 0, other: 2, old: 1, certified: 1, existing: 3 }, inspection_count: 'second_or_later', required_items: [], created_at: '2026-04-12T09:00:00.000Z', updated_at: now },
    { id: 'job-18', organization_id: 'org-1', title: '道路工事計量器 現地検定',          description: '高速道路建設現場の計量器検定。ヘルメット・安全靴持参。現場内作業規則の遵守が必要。',                          inspection_date: '2026-08-25', start_time: '08:00', end_time: '15:00', location: '新東名高速道路建設現場',     prefecture: '静岡県',   city: '浜松市北区',       reward: 47000, required_qualifications: '計量士資格、建設現場経験',        visibility: 'public', status: 'open',      inspector_count: 2, accommodation: 'none',   job_number: 'A2500018', machine_counts: { ssv: 0, sv: 0, other: 1, old: 0, certified: 1, existing: 0 }, inspection_count: 'first', required_items: ['ヘルメット'], created_at: '2026-04-11T09:00:00.000Z', updated_at: now },
    { id: 'job-19', organization_id: 'org-2', title: '半導体工場 精密計測器 検定',       description: 'クリーンルーム内の精密計測器定期検定。防塵服着用必須。高精度の作業スキルが求められます。',                    inspection_date: '2026-09-01', start_time: '10:00', end_time: '17:00', location: '熊本市テクノパーク',         prefecture: '熊本県',   city: '熊本市西区',       reward: 80000, required_qualifications: '計量士資格、クリーンルーム作業経験', visibility: 'local', status: 'draft',     inspector_count: 2, accommodation: 'both',   job_number: 'A2500019', machine_counts: { ssv: 3, sv: 2, other: 0, old: 0, certified: 5, existing: 0 }, inspection_count: 'first', required_items: ['白つなぎ', 'ヘアキャップ', 'マスク'], created_at: '2026-04-10T09:00:00.000Z', updated_at: now },
    { id: 'job-20', organization_id: 'org-3', title: '空港施設 計量・設備 一括検定',     description: '地方空港の各種計量器・設備の一括定期検定。セキュリティエリア立入のため事前審査あり。',                        inspection_date: '2026-09-10', start_time: '06:00', end_time: '16:00', location: '高松空港',                   prefecture: '香川県',   city: '高松市香南町',     reward: 90000, required_qualifications: '計量士資格、設備検査経験',        visibility: 'local',  status: 'open',      inspector_count: 4, accommodation: 'before', job_number: 'A2500020', machine_counts: { ssv: 2, sv: 2, other: 5, old: 2, certified: 6, existing: 5 }, inspection_count: 'second_or_later', required_items: [], created_at: '2026-04-09T09:00:00.000Z', updated_at: now },
  ],

  applications: [
    { id: 'app-1', job_id: 'job-1', inspector_id: 'inspector-1', message: '建築物検査の経験があります。日程対応可能です。',             status: 'pending',   created_at: '2026-04-29T09:00:00.000Z', updated_at: '2026-04-29T09:00:00.000Z' },
    { id: 'app-2', job_id: 'job-3', inspector_id: 'inspector-1', message: '大型倉庫案件の経験があります。',                            status: 'confirmed', created_at: '2026-04-28T10:00:00.000Z', updated_at: '2026-04-29T12:00:00.000Z' },
    { id: 'app-3', job_id: 'job-1', inspector_id: 'inspector-2', message: '写真報告と現地確認に対応できます。',                        status: 'pending',   created_at: '2026-04-29T11:00:00.000Z', updated_at: '2026-04-29T11:00:00.000Z' },
    { id: 'app-4', job_id: 'job-2', inspector_id: 'inspector-3', message: '計量士として10年以上の経験があります。',                    status: 'pending',   created_at: '2026-04-30T09:00:00.000Z', updated_at: '2026-04-30T09:00:00.000Z' },
    { id: 'app-5', job_id: 'job-4', inspector_id: 'inspector-4', message: '名古屋在住で交通費も少なく対応できます。',                  status: 'pending',   created_at: '2026-04-30T11:00:00.000Z', updated_at: '2026-04-30T11:00:00.000Z' },
    { id: 'app-6', job_id: 'job-6', inspector_id: 'inspector-5', message: '医療機器の計量検定経験があります。', status: 'confirmed', created_at: '2026-04-29T14:00:00.000Z', updated_at: '2026-04-30T08:00:00.000Z' },
    { id: 'app-7', job_id: 'job-8', inspector_id: 'inspector-3', message: '水道計量器の更新検定は慣れています。', status: 'confirmed', created_at: '2026-04-28T16:00:00.000Z', updated_at: '2026-04-29T10:00:00.000Z' },
    { id: 'app-8', job_id: 'job-1', inspector_id: 'inspector-3', message: '大阪からですが宿泊対応可能です。',      status: 'rejected',  created_at: '2026-04-29T15:00:00.000Z', updated_at: '2026-04-30T09:00:00.000Z' },
  ],
  messages: [
    { id: 'msg-1', job_id: 'job-1', sender_id: 'org-user',        content: '当日の集合場所は正面搬入口です。資料を更新しました。',   created_at: '2026-04-30T09:00:00.000Z' },
    { id: 'msg-2', job_id: 'job-1', sender_id: 'inspector-user',  content: '承知しました。開始前に現地担当者へ連絡します。',         created_at: '2026-04-30T09:05:00.000Z' },
    { id: 'msg-3', job_id: 'job-1', sender_id: 'org-user',        content: '駐車場は建物裏にご用意しています。',                     created_at: '2026-04-30T09:10:00.000Z' },
    { id: 'msg-4', job_id: 'job-3', sender_id: 'org-user',        content: '前泊のホテルを手配しました。詳細を送ります。',           created_at: '2026-04-30T10:00:00.000Z' },
    { id: 'msg-5', job_id: 'job-3', sender_id: 'inspector-user',  content: '確認しました。よろしくお願いします。',                   created_at: '2026-04-30T10:15:00.000Z' },
    { id: 'msg-6', job_id: 'job-2', sender_id: 'org-user',        content: '計量器の型番資料を送付しました。確認をお願いします。',   created_at: '2026-04-30T11:00:00.000Z' },
  ],
  notifications: [
    { id: 'noti-1', user_id: 'org-user',       type: 'application', title: '新しい応募があります', message: '建築物定期検査 立会いに応募が届きました',  read: false, related_id: 'job-1', created_at: '2026-04-30T08:30:00.000Z' },
    { id: 'noti-2', user_id: 'inspector-user', type: 'confirmed',   title: '案件が確定しました',   message: '大型倉庫設備 検査補助が確定しました',        read: false, related_id: 'job-3', created_at: '2026-04-29T12:00:00.000Z' },
    { id: 'noti-3', user_id: 'org-user',       type: 'application', title: '新しい応募があります', message: '計量器更新後の初回検定に応募が届きました',    read: true,  related_id: 'job-2', created_at: '2026-04-30T09:00:00.000Z' },
  ],
  files: [
    { id: 'file-1', job_id: 'job-1', uploader_id: 'org-user', file_name: '募集要項.pdf',     file_path: 'job-1/recruitment.pdf', file_size: 420000, file_type: 'application/pdf', uploaded_by_role: 'organization', access_level: 'public',    file_category: 'recruitment', created_at: '2026-04-28T10:00:00.000Z' },
    { id: 'file-2', job_id: 'job-3', uploader_id: 'org-user', file_name: '安全管理資料.pdf', file_path: 'job-3/safety.pdf',      file_size: 860000, file_type: 'application/pdf', uploaded_by_role: 'organization', access_level: 'confirmed', file_category: 'recruitment', created_at: '2026-04-27T10:00:00.000Z' },
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
