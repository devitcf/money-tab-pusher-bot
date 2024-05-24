import { Course, UserCourse } from "../types";

class CourseSession {
  courseByUser: { [username: string]: UserCourse[] } = {};

  updateCourseByUser(username: string, course: Course[]) {
    const existingCourses = this.courseByUser[username] ?? [];
    const newCourses = course.map((course) => ({
      ...course,
      job: existingCourses.find((c) => c.url_key === course.url_key)?.job ?? undefined,
    }));
    this.courseByUser[username] = newCourses;
  }
}

export const courseSession = new CourseSession();
