import { Course, UserCourse } from "../types";

class CourseSession {
  courseByUser: { [username: string]: UserCourse[] } = {};

  updateCourseByUser(username: string, courses: Course[]) {
    const existingCourses = this.courseByUser[username] ?? [];
    const newCourses = courses.map((course) => ({
      ...course,
      job: existingCourses.find((c) => c.url_key === course.url_key)?.job ?? undefined,
    }));
    this.courseByUser[username] = newCourses;
  }
}

export const courseSession = new CourseSession();
