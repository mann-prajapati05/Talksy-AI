import axios from "axios";
import { Check, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../src/redux/userSlice";
import { serverUrl } from "../routes/App";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const plans = [
  {
    id: "free", name: "Starter",
    description: "Perfect for trying Talksy with no commitment.",
    credits: 25, priceLabel: "Free",
    features: ["25 interview credits on signup", "Core interview practice access", "Basic report insights"],
    badge: "Default Plan", isFree: true,
  },
  {
    id: "growth", name: "Growth",
    description: "For consistent interview practice every week.",
    credits: 200, priceLabel: "Rs 199", amount: 199,
    features: ["200 credits pack", "Detailed feedback report", "Priority processing", "Email support"],
    badge: "Most Popular", isBest: true,
  },
  {
    id: "pro", name: "Pro",
    description: "Best for heavy prep and repeated mock rounds.",
    credits: 700, priceLabel: "Rs 599", amount: 599,
    features: ["700 credits pack", "Advanced analytics", "Fastest queue priority", "Premium support"],
    badge: "Best Value",
  },
];

function PricingCard({ plan, onBuy, index }) {
  const isFree = Boolean(plan?.isFree);
  const isBest = Boolean(plan?.isBest);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ scale: 1.03, y: -6, transition: { duration: 0.25 } }}
      className={`gradient-border group relative flex h-full flex-col rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 sm:p-7 ${
        isBest
          ? "shadow-xl shadow-indigo-100/60 ring-2 ring-indigo-500/20"
          : "hover:shadow-xl hover:shadow-indigo-100/40"
      }`}
    >
      {plan?.badge && (
        <span className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
          isBest ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
        }`}>
          {isBest && <Sparkles className="h-3.5 w-3.5" />}
          {plan.badge}
        </span>
      )}

      <div className="mb-5 mt-8">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{plan?.name || "Plan"}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{plan?.description || ""}</p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 ring-1 ring-slate-200/60">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Plan Price</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{plan?.priceLabel || "Free"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Credits</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{plan?.credits || 0}</p>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {(plan?.features || []).map((feature, i) => (
          <motion.li
            key={`${plan.id}-f-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="flex items-start gap-3 text-sm text-slate-600"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span>{feature}</span>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        {isFree ? (
          <button type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400">
            Current Plan
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onBuy?.(plan)}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/50 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-200/70"
          >
            Buy Now
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}

function Pricing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    if (!plan || plan?.isFree) return;
    try {
      const amount = Number.isFinite(plan?.amount) ? plan.amount : 0;
      const orderResponse = await axios.post(`${serverUrl}/payment/order`, { planId: plan.id, amount, credits: plan.credits }, { withCredentials: true });
      const orderData = orderResponse?.data || {};
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount, currency: "INR",
        name: "Talksy.AI", description: `${plan.name} - ${plan.credits} Credits`,
        order_id: orderData.id,
        handler: async (response) => {
          const verifyPay = await axios.post(`${serverUrl}/payment/verify-payment`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }, { withCredentials: true });
          dispatch(setUserData(verifyPay?.data?.user));
          alert("Payment successful. Credits have been added.");
          navigate("/");
        },
        theme: { color: "#6366f1" },
      };
      if (!window?.Razorpay) { alert("Razorpay SDK not loaded. Please refresh."); return; }
      new window.Razorpay(options).open();
    } catch (error) { console.error("Payment flow error:", error); }
  };

  return (
    <motion.section variants={containerVariants} initial="hidden" animate="show" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.header variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-semibold tracking-widest text-indigo-600 shadow-sm">
            ✦ FLEXIBLE CREDITS
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Choose the plan that fits{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">your prep speed</span>
          </h1>
          <p className="mt-4 text-base leading-6 text-slate-500 sm:text-lg">
            Start free and upgrade when you need more interview credits. No hidden fees.
          </p>
        </motion.header>

        <motion.div variants={containerVariants} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} onBuy={handlePayment} index={index} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default Pricing;
