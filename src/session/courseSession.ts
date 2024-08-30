import fse from "fs-extra";
import { Course, UserCourse } from "../types";

const coursesJsonFile = `/app/storage/courses.json`;

class CourseSession {
  coursesByUser: { [username: string]: UserCourse[] } = {};

  constructor() {
    const exists = fse.pathExistsSync(coursesJsonFile);
    if (!exists) return;

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

  async updateCourseByUser(username: string, courses: Course[]) {
    const existingCourses = this.coursesByUser[username] ?? [];
    this.coursesByUser[username] = courses.map((course) => ({
      title: course.title,
      url_key: course.url_key,
      latest_topic: course.latest_topic,
      latest_topic_id: course.latest_topic_id,
      job: existingCourses.find((c) => c.url_key === course.url_key)?.job ?? undefined,
    }));

    const jsonData: { [username: string]: UserCourse[] } = {};
    Object.entries(this.coursesByUser).forEach(([username, courses]) => {
      jsonData[username] = courses.map((course) => ({
        ...course,
        job: undefined,
      }));
    });

    await fse.outputJson(coursesJsonFile, jsonData);
  }
}

export const courseSession = new CourseSession();
