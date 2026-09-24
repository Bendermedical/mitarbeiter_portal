import { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET && process.env.AZURE_AD_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
          }),
        ]
      : []),
    // Simulation / Dev AD SSO Provider for local Docker Compose and automated testing
    // Enforces zero local password handling: authentication delegates strictly to AD identity claims
    CredentialsProvider({
      id: "ad-mock-sso",
      name: "Active Directory SSO (Simulated)",
      credentials: {
        email: { label: "AD Corporate Email", type: "email", placeholder: "thomas.weber@bmv-medical.de" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Mock AD Identity Provider claims (matches AD Directory seed in backend)
        const mockDirectory: Record<string, any> = {
          "thomas.weber@bmv-medical.de": {
            oid: "ad-guid-emp-001",
            email: "thomas.weber@bmv-medical.de",
            given_name: "Thomas",
            family_name: "Weber",
            department: "Qualitätssicherung",
            job_title: "QA Engineer (Medical Devices)",
            groups: ["BMV-Employees-All", "BMV-Dept-QA"],
          },
          "anna.schmidt@bmv-medical.de": {
            oid: "ad-guid-mgr-002",
            email: "anna.schmidt@bmv-medical.de",
            given_name: "Anna",
            family_name: "Schmidt",
            department: "Qualitätssicherung",
            job_title: "Head of QA & Regulatory",
            groups: ["BMV-Employees-All", "BMV-Dept-QA", "BMV-Managers-All"],
          },
          "maria.kraus@bmv-medical.de": {
            oid: "ad-guid-hr-003",
            email: "maria.kraus@bmv-medical.de",
            given_name: "Maria",
            family_name: "Kraus",
            department: "Human Resources",
            job_title: "HR Director",
            groups: ["BMV-Employees-All", "BMV-Dept-HR", "BMV-HR-Administrators"],
          },
          "admin@bmv-medical.de": {
            oid: "ad-guid-admin-004",
            email: "admin@bmv-medical.de",
            given_name: "System",
            family_name: "Administrator",
            department: "IT Infrastructure",
            job_title: "Senior Systems Engineer",
            groups: ["BMV-Employees-All", "BMV-IT-Administrators"],
          },
        };

        const adClaims = mockDirectory[credentials.email.toLowerCase()] || {
          oid: `ad-guid-dyn-${Date.now()}`,
          email: credentials.email.toLowerCase(),
          given_name: credentials.email.split("@")[0].split(".")[0] || "Staff",
          family_name: credentials.email.split("@")[0].split(".")[1] || "Member",
          department: "Allgemein",
          job_title: "Employee",
          groups: ["BMV-Employees-All"],
        };

        try {
          // Perform JIT token exchange and claims sync with FastAPI backend (Path A)
          const exchangeUrl = `${API_BASE_URL.replace("localhost", "127.0.0.1")}/auth/oidc/exchange`;
          const res = await fetch(exchangeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(adClaims),
          });

          if (!res.ok) {
            console.error("FastAPI OIDC token exchange failed:", await res.text());
            return null;
          }

          const tokenData = await res.json();
          return {
            id: tokenData.user.id,
            email: tokenData.user.email,
            name: `${tokenData.user.first_name} ${tokenData.user.last_name}`,
            firstName: tokenData.user.first_name,
            lastName: tokenData.user.last_name,
            department: tokenData.user.department,
            jobTitle: tokenData.user.job_title,
            role: tokenData.user.role,
            adGroups: tokenData.user.ad_groups || adClaims.groups,
            accessToken: tokenData.access_token,
          };
        } catch (error) {
          console.error("Error contacting FastAPI backend for OIDC exchange:", error);
          // Return simulated session user if backend is offline during client testing
          return {
            id: "ad-fallback-user-id",
            email: adClaims.email,
            name: `${adClaims.given_name} ${adClaims.family_name}`,
            firstName: adClaims.given_name,
            lastName: adClaims.family_name,
            department: adClaims.department,
            jobTitle: adClaims.job_title,
            role: adClaims.groups.includes("BMV-HR-Administrators") ? "hr_admin" : adClaims.groups.includes("BMV-Managers-All") ? "manager" : "employee",
            adGroups: adClaims.groups,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.name = user.name || "";
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.department = (user as any).department;
        token.jobTitle = (user as any).jobTitle;
        token.role = (user as any).role;
        token.adGroups = (user as any).adGroups;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.department = token.department as string;
        session.user.jobTitle = token.jobTitle as string;
        session.user.role = token.role as string;
        session.user.adGroups = token.adGroups as string[];
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours corporate session
  },
  secret: process.env.NEXTAUTH_SECRET || "bmv_nextauth_development_secret_key_2026",
};
