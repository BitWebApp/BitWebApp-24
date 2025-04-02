import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from get_data import get_academic_data  # Assuming this function fetches academic records
from io import BytesIO
from make_buffer import make_buffer

def visualize_cgpa_distribution():
    """Fetches academic data, processes CGPA values, filters outliers, and visualizes distribution."""
    record_dict = get_academic_data()
    buffers=[]
    student_cgpa = {}
    for roll_no, details in record_dict.items():
        cgpa_list = []
        for sem in range(1, 9):  # Assuming 8 semesters
            sem_key = f"sem{sem}"
            try:
                cgpa = float(details.get(sem_key, 0))  # Convert to float, default to 0 if missing
                if 5.0 <= cgpa <= 10.0:  # Accept only realistic CGPA values
                    cgpa_list.append(cgpa)
            except (ValueError, TypeError):
                continue  # Skip invalid CGPA entries

        if cgpa_list:  # Ensure student has valid CGPA data
            student_cgpa[roll_no] = sum(cgpa_list) / len(cgpa_list)  # Compute average CGPA

    df = pd.DataFrame(list(student_cgpa.items()), columns=["Roll No", "Avg CGPA"])

    # Outlier Removal: Exclude CGPA beyond 3 standard deviations
    mean_cgpa = df["Avg CGPA"].mean()
    std_cgpa = df["Avg CGPA"].std()
    df_filtered = df[(df["Avg CGPA"] >= (mean_cgpa - 3 * std_cgpa)) & (df["Avg CGPA"] <= (mean_cgpa + 3 * std_cgpa))]

    total_students = len(df_filtered)
    students_below_7_5 = df_filtered[df_filtered["Avg CGPA"] < 7.5]["Roll No"].nunique()
    percentage_below_7_5 = (students_below_7_5 / total_students) * 100

    # print(f"📊 Total Students (after filtering): {total_students}")
    # print(f"📉 Students with Avg CGPA Below 7.5: {students_below_7_5}")
    # print(f"📊 Percentage Below 7.5: {percentage_below_7_5:.2f}%")
    
    # ✅ Pie Chart
    fig1, ax1 = plt.subplots(figsize=(6, 6))
    ax1.pie(
        [students_below_7_5, total_students - students_below_7_5],
        labels=["Below 7.5", "7.5 and Above"],
        autopct="%1.1f%%",
        colors=["red", "green"],
        startangle=140,
        wedgeprops={"edgecolor": "black"}
    )
    ax1.set_title("Percentage of Students with Avg CGPA Below 7.5")
    buffers.append(make_buffer(fig1))
    # ✅ Histogram
    fig2, ax2 = plt.subplots(figsize=(10, 5))
    sns.histplot(df_filtered["Avg CGPA"], bins=15, kde=True, color="blue", edgecolor="black", ax=ax2)
    ax2.axvline(x=7.5, color="red", linestyle="--", label="CGPA 7.5 Threshold")
    ax2.set_title("Distribution of Average CGPA Across Students (Filtered)")
    ax2.set_xlabel("Average CGPA")
    ax2.set_ylabel("Frequency")
    ax2.legend()
    buffers.append(make_buffer(fig2))

    
    return buffers
