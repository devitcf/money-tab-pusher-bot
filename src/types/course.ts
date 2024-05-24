import { CronJob } from "cron";

export type Course = {
  title: string;
  url_key: string;
  latest_topic: string;
  latest_topic_id: string;
};

export type Video = {
  id: string;
  title: string;
  platform: "youtube";
  youtube?: {
    video_url: string;
  };
};

export type UserCourse = Course & { job?: CronJob };
