import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
          <AlertCircle size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Something went wrong</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          {error?.statusText || error?.message || "An unexpected error occurred. Don't worry, we're on it."}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
          >
            <RefreshCw size={18} />
            Retry
          </button>
          <button
            onClick={() => navigate("/app")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Home size={18} />
            Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
