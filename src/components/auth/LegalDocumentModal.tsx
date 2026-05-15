import { X } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy';

const TERMS_CONTENT: { title: string; sections: { heading: string; body: string }[] } = {
  title: '利用規約',
  sections: [
    {
      heading: '第1条（適用）',
      body: '本規約は、当社が提供する「検定員募集：情報サイト」サービス（以下「本サービス」）の利用条件を定めるものであり、当社と利用者との間の本サービスの利用に関わる一切の関係に適用されます。',
    },
    {
      heading: '第2条（利用登録）',
      body: '本サービスは、検定機関の管理者からの招待を受けた者のみが登録できる招待制サービスです。利用希望者は、招待メールに記載されたリンクから氏名・パスワード等を登録することにより、利用登録が完了します。',
    },
    {
      heading: '第3条（ユーザーIDおよびパスワードの管理）',
      body: '利用者は、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。利用者は、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。',
    },
    {
      heading: '第4条（禁止事項）',
      body: '利用者は、本サービスの利用にあたり、法令または公序良俗に違反する行為、犯罪行為に関連する行為、当社サーバーまたはネットワークの機能を破壊・妨害する行為、本サービスの運営を妨害するおそれのある行為、その他、当社が不適切と判断する行為を行ってはなりません。',
    },
    {
      heading: '第5条（本サービスの提供の停止等）',
      body: '当社は、本サービスにかかるコンピューターシステムの保守点検または更新を行う場合、地震、落雷、火災、停電または天災などの不可抗力により本サービスの提供が困難となった場合、本サービスを停止または中断することがあります。',
    },
    {
      heading: '第6条（免責事項）',
      body: '当社は、本サービスに関して、利用者と他の利用者または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。',
    },
    {
      heading: '第7条（規約の変更）',
      body: '当社は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。',
    },
    {
      heading: '第8条（準拠法・裁判管轄）',
      body: '本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。',
    },
  ],
};

const PRIVACY_CONTENT: { title: string; sections: { heading: string; body: string }[] } = {
  title: 'プライバシーポリシー',
  sections: [
    {
      heading: '1. 個人情報の定義',
      body: '本ポリシーにおける「個人情報」とは、個人情報保護法にいう「個人情報」を指し、生存する個人に関する情報であって、氏名、メールアドレス、住所、電話番号その他の記述等により特定の個人を識別できるものを指します。',
    },
    {
      heading: '2. 取得する情報',
      body: '本サービスでは、登録時に氏名・メールアドレス・所属機関・活動エリアを取得します。また、検定業務の管理に必要な範囲で、業務履歴・応募情報・メッセージ内容を取得します。',
    },
    {
      heading: '3. 利用目的',
      body: '取得した個人情報は、本サービスの提供・運営、ユーザー認証、検定業務マッチングの実施、利用者からのお問い合わせ対応、利用規約違反対応、本サービスの改善および新機能の開発に利用します。',
    },
    {
      heading: '4. 第三者提供',
      body: '当社は、法令に基づく場合を除き、あらかじめ利用者の同意を得ることなく、第三者に個人情報を提供することはありません。検定業務マッチングの性質上、応募・確定情報は当該検定業務に関わる検定機関および検定官の間で共有されます。',
    },
    {
      heading: '5. 安全管理措置',
      body: '当社は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために、必要かつ適切な措置を講じます。',
    },
    {
      heading: '6. 開示・訂正・利用停止',
      body: '利用者は、当社に対して個人情報の開示・訂正・利用停止を請求することができます。請求は、本サービス内のお問い合わせ窓口または登録メールアドレスからの連絡により行うものとします。',
    },
    {
      heading: '7. Cookieの使用',
      body: '本サービスでは、利用者の利便性向上のため、Cookieを使用することがあります。利用者はブラウザの設定によりCookieの受け入れを拒否することができますが、その場合、本サービスの一部機能が利用できなくなることがあります。',
    },
    {
      heading: '8. プライバシーポリシーの変更',
      body: '本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、利用者に通知することなく変更することができるものとします。',
    },
  ],
};

export function LegalDocumentModal({ docType, onClose }: { docType: LegalDocType; onClose: () => void }) {
  const content = docType === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-6">
          <p className="text-xs text-slate-500">最終更新日: 2026年5月1日</p>
          {content.sections.map((section, index) => (
            <section key={index}>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{section.heading}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{section.body}</p>
            </section>
          ))}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              本書はモックアプリ用のサンプル文書です。本番運用時は法務担当者と内容を確認のうえ差し替えてください。
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
