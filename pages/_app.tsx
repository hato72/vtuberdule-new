import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { GroupProvider } from "@/components/atoms/groupContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import { GlobalChangeCardObserver } from "@/utils/globalChangeCardObserver";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GroupProvider>
        <GlobalChangeCardObserver>
          <Component {...pageProps} />
        </GlobalChangeCardObserver>
      </GroupProvider>
    </AuthProvider>
  );
}