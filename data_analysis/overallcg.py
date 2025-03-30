import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from get_data import get_academic_data  # Fetches academic records
from io import BytesIO
from make_buffer import make_buffer

def visualize_filtered_cgpa():
    """Fetches academic data, filters outliers, and returns CGPA distribution visualizations."""
    record_dict = get_academic_data()
    
    student_avg_cgpas = []
    
    for student_id, details in record_dict.items():
        sem_cgpas = []
        
        for sem in range(1, 9):  # Assuming 8 semesters
            sem_key = f"sem{sem}"
            try:
                cgpa = float(details.get(sem_key, 0))  # Convert to float, default to 0 if missing
                if 5.0 <= cgpa <= 10.0:  # Accept only realistic CGPA values
                    sem_cgpas.append(cgpa)
            except (ValueError, TypeError):
                continue  # Skip invalid CGPA entries
        
        if sem_cgpas:  # Only include students with valid CGPA data
            student_avg_cgpas.append(sum(sem_cgpas) / len(sem_cgpas))
    
    if not student_avg_cgpas:
        print("⚠️ No valid student-wise CGPA data found!")
        return []
    
    # Convert to DataFrame
    df = pd.DataFrame({"Avg_CGPA": student_avg_cgpas})
    
    # ✅ Outlier Removal using IQR Method
    Q1 = df["Avg_CGPA"].quantile(0.25)
    Q3 = df["Avg_CGPA"].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    df_filtered = df[(df["Avg_CGPA"] >= lower_bound) & (df["Avg_CGPA"] <= upper_bound)]
    
    # ✅ Compute overall average CGPA (after filtering)
    overall_avg_cgpa = df_filtered["Avg_CGPA"].mean()
    print(f"📊 Overall Average CGPA (Filtered, Student-Wise): {overall_avg_cgpa:.2f}")
    
    buffers = []  # Store image buffers

    # ✅ Histogram Visualization
    fig1, ax1 = plt.subplots(figsize=(10, 5))
    sns.histplot(df_filtered["Avg_CGPA"], bins=15, kde=True, color="blue", edgecolor="black", ax=ax1)
    ax1.axvline(x=overall_avg_cgpa, color="red", linestyle="--", label=f"Avg CGPA: {overall_avg_cgpa:.2f}")
    ax1.set_title("Student-Wise Average CGPA Distribution (Filtered)")
    ax1.set_xlabel("Average CGPA")
    ax1.set_ylabel("Frequency")
    ax1.legend()
    ax1.grid(axis="y", linestyle="--", alpha=0.7)

    
    buffers.append(make_buffer(fig1))
   
    # ✅ Box Plot Visualization
    fig2, ax2 = plt.subplots(figsize=(8, 4))
    sns.boxplot(x=df_filtered["Avg_CGPA"], color="lightblue", ax=ax2)
    ax2.set_title("CGPA Box Plot (Filtered)")
    ax2.set_xlabel("Average CGPA")
    ax2.grid()
    buffers.append(make_buffer(fig2))

    

    return buffers
