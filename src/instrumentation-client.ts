import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://417f783c1adee0a41b7a91c3c4ff3cc3@o438670.ingest.us.sentry.io/4511067615985664",
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
  // 100% in dev, 10% in production — avoids blowing through quota on early traffic
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
