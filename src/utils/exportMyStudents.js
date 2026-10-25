import ExcelJS from "exceljs";
import { categoryLabel } from "./courses";
import { programLabel } from "./programs";
import { sessionLabel } from "./sessions";

/**
 * Downloads the rows shown on the faculty "My Students" page as an Excel
 * file, one row per student and course.
 *
 * @param {object[]} students rows from GET /api/v1/prof/my-students
 * @param {string} fileLabel describes the filters, used in the file name
 */
export const exportMyStudents = async (students, fileLabel) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("My Students");
  sheet.columns = [
    { header: "#", key: "index" },
    { header: "Roll Number", key: "rollNumber" },
    { header: "Name", key: "fullName" },
    { header: "Email", key: "email" },
    { header: "Program", key: "program" },
    { header: "Batch", key: "batch" },
    { header: "Branch", key: "branch" },
    { header: "Section", key: "section" },
    { header: "Course", key: "course" },
    { header: "Group / Type", key: "group" },
    { header: "Project Title", key: "projectTitle" },
    { header: "Session", key: "session" },
    { header: "Marks", key: "marks" },
    { header: "Out of", key: "maxMarks" },
    { header: "Marks Status", key: "marksStatus" },
  ];

  students.forEach((s, index) => {
    sheet.addRow({
      index: index + 1,
      rollNumber: s.rollNumber,
      fullName: s.fullName?.toUpperCase(),
      email: s.email || "",
      program: programLabel(s.program),
      batch: `K${s.batch}`,
      branch: s.branch?.toUpperCase() || "",
      section: s.section || "",
      course: s.courseLabel,
      group: s.source === "group" ? s.groupId : categoryLabel(s.category),
      projectTitle: s.projectTitle || "",
      session: sessionLabel(s.session),
      marks: s.marksFrozen ? s.marks : "",
      maxMarks: s.maxMarks,
      marksStatus: s.marksFrozen ? "Final" : "Not submitted",
    });
  });

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1D4ED8" },
  };
  sheet.columns.forEach((column) => {
    let width = column.header.length;
    column.eachCell((cell) => {
      width = Math.max(width, String(cell.value ?? "").length);
    });
    column.width = Math.min(width + 3, 50);
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `My_Students_${fileLabel.replace(/[^A-Za-z0-9.]+/g, "_")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
