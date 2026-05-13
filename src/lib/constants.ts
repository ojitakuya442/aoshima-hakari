export const REGIONS: Record<string, string[]> = {
  '北海道・東北': ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
};

export const PREFECTURES = Object.values(REGIONS).flat();

export const REGION_COLORS: Record<string, string> = {
  '北海道・東北': 'bg-sky-500',
  '関東': 'bg-rose-500',
  '中部': 'bg-amber-500',
  '近畿': 'bg-emerald-500',
  '中国': 'bg-purple-500',
  '四国': 'bg-orange-500',
  '九州・沖縄': 'bg-indigo-500',
};

export function getRegionForPrefecture(prefecture: string | undefined): string | null {
  if (!prefecture) return null;
  for (const [region, prefs] of Object.entries(REGIONS)) {
    if (prefs.includes(prefecture)) return region;
  }
  return null;
}
