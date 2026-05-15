export const REGIONS: Record<string, string[]> = {
  '北海道・東北': ['北海道', '青森県', '秋田県', '山形県', '岩手県', '宮城県', '福島県'],
  '関東・甲信越': ['新潟県', '長野県', '栃木県', '群馬県', '茨城県', '埼玉県', '千葉県', '東京都', '神奈川県', '山梨県'],
  '東海・北陸': ['静岡県', '愛知県', '岐阜県', '三重県', '富山県', '石川県', '福井県'],
  '近畿': ['滋賀県', '京都府', '大阪府', '奈良県', '和歌山県', '兵庫県'],
  '中国・四国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '高知県', '香川県', '愛媛県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '大分県', '熊本県', '宮崎県', '鹿児島県', '沖縄県'],
};

export const PREFECTURES = Object.values(REGIONS).flat();

export const REGION_COLORS: Record<string, string> = {
  '北海道・東北': 'bg-sky-500',
  '関東・甲信越': 'bg-rose-500',
  '東海・北陸': 'bg-amber-500',
  '近畿': 'bg-emerald-500',
  '中国・四国': 'bg-purple-500',
  '九州・沖縄': 'bg-indigo-500',
};

export function getRegionForPrefecture(prefecture: string | undefined): string | null {
  if (!prefecture) return null;
  for (const [region, prefs] of Object.entries(REGIONS)) {
    if (prefs.includes(prefecture)) return region;
  }
  return null;
}
