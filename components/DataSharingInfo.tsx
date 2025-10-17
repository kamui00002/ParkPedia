import React, { useState } from 'react';

const DataSharingInfo: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-blue-600">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-blue-800">データ共有について</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="mt-4 space-y-3 text-sm text-blue-700">
                    <div>
                        <h4 className="font-semibold mb-2">現在の状況</h4>
                        <p>現在はローカルストレージを使用しており、データはあなたのデバイス内でのみ保存されています。</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">将来的な共有機能</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>全国のユーザーが投稿した公園情報を共有</li>
                            <li>リアルタイムでレビューと写真を共有</li>
                            <li>位置情報に基づく近くの公園の自動表示</li>
                            <li>ユーザー同士のコミュニティ機能</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">実装予定の技術</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Firebase Firestore（リアルタイムデータベース）</li>
                            <li>Supabase（オープンソースのFirebase代替）</li>
                            <li>Cloudinary（画像ストレージ）</li>
                            <li>Push通知（新しいレビューの通知）</li>
                        </ul>
                    </div>

                    <div className="bg-blue-100 p-3 rounded border border-blue-200">
                        <p className="text-xs">
                            <strong>注意:</strong> データ共有機能は現在開発中です。実装されると、全国のユーザーと公園情報を共有できるようになります。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataSharingInfo;
