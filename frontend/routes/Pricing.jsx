import axios from "axios";
import { color } from "framer-motion";
import { Currency } from "lucide-react";
import React from "react";
import razorpay from "../../backend/services/razorpay.service";
import { useDispatch } from "react-redux";
import { useActionData, useNavigate } from "react-router-dom";
import { setUserData } from "../src/redux/userSlice";

function Pricing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    try {
      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        "http://localhost:8010/payment/order",
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        { withCredentials: true },
      );

      console.log(result.data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        Currency: "INR",
        name: "Talksy.Ai",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,

        handler: async (response) => {
          console.log(response);
          const verifyPay = await axios.post(
            "http://localhost:8010/payment/verify-payment",
            {
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              razorpaySignature: razorpay_signature,
            },
            { withCredentials: true },
          );
          dispatch(setUserData(verifyPay.data.user));
          alert("Payment Successfull 🎉🎉🎉 , Credits are added..");
          navigate("/");
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.log(err);
    }
  };

  return <div></div>;
}

export default Pricing;
