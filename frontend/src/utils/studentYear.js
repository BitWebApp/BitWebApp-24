export const getStudentYear = (batch) => {
  if (!batch) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (Jan is 0, Aug is 7)

  // Academic year starts in August (month 7)
  const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear;
  
  const batchYear = Number(batch) < 100 ? 2000 + Number(batch) : Number(batch);

  return academicYearStart - batchYear + 1;
};
