import { Course, UserCourse } from "../types";
import fse from "fs-extra";

const coursesJsonFile = `/app/storage/courses.json`;

class CourseSession {
  coursesByUser: { [username: string]: UserCourse[] } = {};

  constructor() {
    const exists = fse.pathExistsSync(coursesJsonFile);
    if (exists) {
      console.log("courses.json exists, importing...");
      fse
        .readJson(coursesJsonFile, { throws: false })
        .then((obj) => {
          if (obj) {
            this.coursesByUser = obj;
          }
        })
        .catch((err) => {
          console.error(err); // Not called
        });
    }
  }

  async updateCourseByUser(username: string, courses: Course[]) {
    const existingCourses = this.coursesByUser[username] ?? [];
    const newCourses = courses.map((course) => ({
      ...course,
      job: existingCourses.find((c) => c.url_key === course.url_key)?.job ?? undefined,
    }));
    this.coursesByUser[username] = newCourses;
    await fse.outputJson(coursesJsonFile, this.coursesByUser);
  }
}

export const courseSession = new CourseSession();
