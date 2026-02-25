import React from "react";
import ModernAuth from "./ModernAuth";
import SEO from "../SEO/SEO";

const WhatsAppAuth = () => {
  return (
    <>
      <SEO
        title="Login"
        description="Login to PK.Chat to connect with your friends and family in real-time."
      />
      <ModernAuth />
    </>
  );
};

export default WhatsAppAuth;
