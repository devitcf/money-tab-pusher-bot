export type Course = {
  title: string;
  url_key: string;
  latest_topic: string;
  latest_topic_id: string;
};

export const CourseType = {
  "3PM_PREMIUM": "3pm-premium",
  "9PM_PREMIUM": "9pm-premium",
} as const;
export type CourseType = (typeof CourseType)[keyof typeof CourseType];
