import React from "react";
import { Link, useLocation } from "react-router-dom";

const content: Record<string, { title: string; body: string[] }> = {
  "/privacy": { title: "Privacy Policy", body: ["StackLink stores account information, profile content, links, and click analytics needed to operate the service.", "Passwords are stored as hashes. Reset and verification tokens are single-use hashes with expiration times.", "You may delete your account and associated data from Account Settings."] },
  "/terms": { title: "Terms of Service", body: ["Use StackLink only for lawful content and destinations.", "You remain responsible for links, media, domains, and tracking integrations added to your profile.", "Abuse, impersonation, malware, and attempts to disrupt the service are prohibited."] },
  "/help": { title: "Help Center", body: ["Use Profile Settings to update identity and appearance.", "Use Links to add, reorder, pause, or schedule destinations.", "Use Publishing for SEO, custom domains, and tracking pixels. Contact support through your deployment administrator for account recovery issues."] },
};

const InfoPage: React.FC = () => {
  const page = content[useLocation().pathname] || content["/help"];
  return <main className="min-h-screen bg-[#fbfbfb] px-5 py-12"><article className="mx-auto max-w-2xl rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm"><h1 className="text-3xl font-semibold text-[#10233c]">{page.title}</h1>{page.body.map((paragraph) => <p key={paragraph} className="mt-5 leading-7 text-[#5c6f86]">{paragraph}</p>)}<Link to="/" className="mt-8 inline-block font-semibold text-[#2388ff]">Back to StackLink</Link></article></main>;
};

export default InfoPage;
