"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseSession = void 0;
class CourseSession {
    constructor() {
        this.courseByUser = {};
    }
    updateCourseByUser(username, course) {
        var _a;
        const existingCourses = (_a = this.courseByUser[username]) !== null && _a !== void 0 ? _a : [];
        const newCourses = course.map((course) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, course), { job: (_b = (_a = existingCourses.find((c) => c.url_key === course.url_key)) === null || _a === void 0 ? void 0 : _a.job) !== null && _b !== void 0 ? _b : undefined }));
        });
        this.courseByUser[username] = newCourses;
    }
}
exports.courseSession = new CourseSession();
//# sourceMappingURL=courseSession.js.map