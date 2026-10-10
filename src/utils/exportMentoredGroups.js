import ExcelJS from "exceljs";

const idOf = (value) => (value?._id ?? value)?.toString();

const styleSheet = (worksheet) => {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF000000" },
  };

  worksheet.columns.forEach((column) => {
    let maxLength = column.header.length;
    column.eachCell((cell) => {
      maxLength = Math.max(maxLength, (cell.value ?? "").toString().length);
    });
    column.width = Math.min(maxLength + 3, 60);
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });
};

/**
 * Downloads an Excel file for the groups a professor is mentoring: one sheet
 * with a row per student and one with the discussion logs of every group.
 *
 * @param {object} options
 * @param {object[]} options.groups accepted groups with populated members
 * @param {string} options.title e.g. "Minor Project", used for the file name
 * @param {string} options.marksKey key in `member.marks`, e.g. "minorProject"
 * @param {number} options.maxMarks marks are shown out of this
 * @param {string} [options.typeKey] group field holding the project type
 */
export const exportMentoredGroups = async ({
  groups,
  title,
  marksKey,
  maxMarks,
  typeKey,
}) => {
  const workbook = new ExcelJS.Workbook();

  const students = workbook.addWorksheet("Students");
  students.columns = [
    { header: "#", key: "index" },
    { header: "Group ID", key: "groupId" },
    { header: "Project Title", key: "projectTitle" },
    ...(typeKey
      ? [
          { header: "Type", key: "type" },
          { header: "Company", key: "company" },
        ]
      : []),
    { header: "Role", key: "role" },
    { header: "Roll Number", key: "rollNumber" },
    { header: "Name", key: "name" },
    { header: "Email", key: "email" },
    { header: "Mobile Number", key: "mobileNumber" },
    { header: "Branch", key: "branch" },
    { header: "Section", key: "section" },
    { header: "CGPA", key: "cgpa" },
    { header: `Marks (out of ${maxMarks})`, key: "marks" },
  ];

  let index = 0;
  groups.forEach((group, groupIndex) => {
    const fillColor = groupIndex % 2 === 0 ? "FFFAFAFA" : "FFFFFFFF";
    (group.members || []).forEach((member) => {
      index += 1;
      const row = students.addRow({
        index,
        groupId: group.groupId?.toUpperCase(),
        projectTitle: group.projectTitle?.trim() || "N/A",
        type: group[typeKey] || "N/A",
        company: group.org?.companyName?.toUpperCase() || "N/A",
        role: idOf(group.leader) === idOf(member) ? "Team Lead" : "Member",
        rollNumber: member.rollNumber,
        name: member.fullName?.toUpperCase(),
        email: member.email,
        mobileNumber: member.mobileNumber || "N/A",
        branch: member.branch?.toUpperCase() || "N/A",
        section: member.section || "N/A",
        cgpa: member.cgpa || "N/A",
        marks: member.marks?.[marksKey] || 0,
      });
      // Shade rows by group so members of one group read as a block
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: fillColor },
        };
      });
    });
  });
  styleSheet(students);

  const logs = workbook.addWorksheet("Discussion Logs");
  logs.columns = [
    { header: "Group ID", key: "groupId" },
    { header: "Date", key: "date" },
    { header: "Description", key: "description" },
    { header: "Remark", key: "remark" },
    { header: "Absent", key: "absent" },
  ];
  groups.forEach((group) => {
    (group.discussion || []).forEach((log) => {
      logs.addRow({
        groupId: group.groupId?.toUpperCase(),
        date: log.date ? new Date(log.date).toLocaleDateString("en-IN") : "N/A",
        description: log.description || "N/A",
        remark: log.remark || "N/A",
        absent:
          (log.absent || [])
            .map((student) => student?.fullName)
            .filter(Boolean)
            .join(", ") || "None",
      });
    });
  });
  styleSheet(logs);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}_Groups.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
