import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { toast } from 'react-hot-toast';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, userId }) => {
  if (!isOpen) return null;

  const handlePayment = () => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // .env file se key aayegi
      amount: 49900, // ₹499 in paise
      currency: "INR",
      name: "Evolvere AI",
      description: "Upgrade to PRO for Detailed PDFs",
      handler: async function (response: any) {
        if (response.razorpay_payment_id) {
          try {
            // Firestore mein subscription status update karna
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
              isSubscribed: true,
              paymentId: response.razorpay_payment_id,
              updatedAt: new Date().toISOString()
            });

            toast.success("Welcome to PRO, Aditya! 🚀");
            onClose();
            window.location.reload(); // UI refresh ke liye
          } catch (error) {
            toast.error("Database update failed. Contact support.");
          }
        }
      },
      prefill: {
        name: "Aditya", // Tera preferred name automatically use ho raha hai
      },
      theme: { color: "#8B5CF6" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-black">
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            <CheckCircle2 className="text-purple-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to PRO</h2>
          <p className="text-gray-500 mb-6">Unlock 30+ pages of detailed PDFs and advanced AI features.</p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
            <span className="text-4xl font-black text-gray-900">₹499</span>
            <span className="text-gray-500 font-medium">/lifetime</span>
            <ul className="text-left mt-4 space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">✅ Detailed 30-page AI Analysis</li>
              <li className="flex items-center gap-2">✅ Priority Cloud Storage</li>
              <li className="flex items-center gap-2">✅ Ad-free Experience</li>
            </ul>
          </div>

          <button 
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition transform active:scale-95"
          >
            Pay Now & Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;