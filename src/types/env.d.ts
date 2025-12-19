declare namespace NodeJS {
  interface ProcessEnv {
    // Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;

    // PostgreSQL Database Configuration
    DATABASE_URL: string;
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;
    DATABASE_SSL: string;

    // S3 Storage Configuration
    S3_ENDPOINT: string;
    S3_REGION: string;
    S3_BUCKET_NAME: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;

    // Application Configuration
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: "development" | "production" | "test";
  }
}
