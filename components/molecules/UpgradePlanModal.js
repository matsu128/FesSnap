import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import { useState } from 'react';
import PlanSelectionModal from './PlanSelectionModal';

export default function UpgradePlanModal({ isOpen, onClose }) {
  const [showPlanModal, setShowPlanModal] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">画像投稿上限に達しました</h2>
          <p className="mb-4 text-gray-700">このプランではこれ以上画像を投稿できません。<br />より多くの画像を投稿するにはプランをアップグレードしてください。</p>
          <Button className="w-full py-3 mb-2 bg-blue-500 text-white font-bold rounded-lg" onClick={() => setShowPlanModal(true)}>
            プラン変更
          </Button>
          <Button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </Modal>
      <PlanSelectionModal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} />
    </>
  );
} 