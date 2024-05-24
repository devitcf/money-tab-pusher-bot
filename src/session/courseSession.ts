import { Course } from "../types";

export type UserCourse = Course & { time?: string };

class CourseSession {
  courseByUser: { [username: string]: UserCourse[] } = {};

  updateCourseByUser(username: string, course: Course[]) {
    const existingCourses = this.courseByUser[username] ?? [];
    const newCourses = course.map((course) => ({
      ...course,
      time: existingCourses.find((c) => c.url_key === course.url_key)?.time ?? undefined,
    }));
    this.courseByUser[username] = newCourses;
  }
}

export const courseSession = new CourseSession();
