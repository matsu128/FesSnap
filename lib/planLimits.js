// FesSnap プランごとの制限値定義
// 2024年6月時点の料金セクションに準拠

export const PLAN_LIMITS = {
  free: {
    image_limit: 25,
    storage_period_days: 7,
    label: 'Freeプラン',
    description: '画像25枚・7日間保存'
  },
  plus: {
    image_limit: 125,
    storage_period_days: 30,
    label: 'Plusプラン',
    description: '画像125枚・30日間保存'
  },
  pro: {
    image_limit: null, // 無制限
    storage_period_days: 180, // 半年間
    label: 'Proプラン',
    description: '画像無制限・半年間保存'
  }
}; 