import axios from "axios";
import { Check, Sparkles } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserData } from "../src/redux/userSlice";
import { serverUrl } from "../routes/App";

const plans = [
  {
    id: "free",
    name: "Starter",
    description: "Perfect for trying Talksy with no commitment.",
    credits: 25,
    priceLabel: "Free",
    features: [
      "25 interview credits on signup",
      "Core interview practice access",
      "Basic report insights",
    ],
    badge: "Default Plan",
    isFree: true,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For consistent interview practice every week.",
    credits: 200,
    priceLabel: "Rs 199",
    amount: 199,
    features: [
      "200 credits pack",
      "Detailed feedback report",
      "Priority processing",
      "Email support",
    ],
    badge: "Most Popular",
    isBest: true,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Best for heavy prep and repeated mock rounds.",
    credits: 700,
    priceLabel: "Rs 599",
    amount: 599,
    features: [
      "700 credits pack",
      "Advanced analytics",
      "Fastest queue priority",
      "Premium support",
    ],
    badge: "Best Value",
  },
];

function PricingCard({ plan, onBuy }) {
  const safeName = plan?.name || "Unnamed Plan";
  const safeDescription = plan?.description || "No description available.";
  const safeCredits = Number.isFinite(plan?.credits) ? plan.credits : 0;
  const safePriceLabel = plan?.priceLabel || (plan?.isFree ? "Free" : "Custom");
  const safeFeatures = Array.isArray(plan?.features)
    ? plan.features.filter(Boolean)
    : [];
  const safeBadge = plan?.badge || "";
  const isFree = Boolean(plan?.isFree);
  const isBest = Boolean(plan?.isBest);

  return (
    <article
      className={`group relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-7 ${
        isBest
          ? "border-indigo-500 shadow-md ring-1 ring-indigo-500/20"
          : "border-slate-200"
      }`}
    >
      {safeBadge && (
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            isBest
              ? "bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
          }`}
        >
          {isBest && <Sparkles className="h-3.5 w-3.5" />}
          {safeBadge}
        </span>
      )}

      <div className="mb-5 mt-8">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {safeName}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {safeDescription}
        </p>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Plan Price
            </p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">
              {safePriceLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Credits
            </p>
            <p className="mt-1 text-xl font-bold text-slate-800">
              {safeCredits}
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {safeFeatures.length > 0 ? (
          safeFeatures.map((feature, index) => (
            <li
              key={`${plan?.id || safeName}-feature-${index}`}
              className="flex items-start gap-3 text-sm text-slate-700"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span>{feature}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-slate-500">
            Feature details coming soon.
          </li>
        )}
      </ul>

      <div className="mt-auto pt-7">
        {isFree ? (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
          >
            Current Plan
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onBuy?.(plan)}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30"
          >
            Buy Now
          </button>
        )}
      </div>
    </article>
  );
}

function Pricing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    if (!plan || plan?.isFree) {
      return;
    }

    try {
      const amount = Number.isFinite(plan?.amount) ? plan.amount : 0;

      const orderResponse = await axios.post(
        `${serverUrl}/payment/order`,
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );

      const orderData = orderResponse?.data || {};

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Talksy.AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: orderData.id,
        handler: async (response) => {
          const verifyPay = await axios.post(
            `${serverUrl}/payment/verify-payment`,
            {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            { withCredentials: true },
          );

          const verifiedUser = verifyPay?.data?.user;
          dispatch(setUserData(verifiedUser));
          alert("Payment successful. Credits have been added.");
          navigate("/");
        },
        theme: {
          color: "#6366f1",
        },
      };

      if (!window?.Razorpay) {
        alert("Razorpay SDK not loaded. Please refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment flow error:", error);
    }
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-widest text-indigo-600">
            FLEXIBLE CREDITS
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose the plan that fits your prep speed
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
            Start free and upgrade when you need more interview credits. No
            hidden fees, clear value.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan?.id || plan?.name}
              plan={plan}
              onBuy={handlePayment}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
