import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from get_data import get_academic_data  # Assuming the same data source
from io import BytesIO
from make_buffer import make_buffer

def compute_percentiles_and_visualize():
    record_dict = get_academic_data()
    """Computes CGPA percentiles and returns visualizations as a list."""
    if len(record_dict) < 10:
        return ["Not enough overall records to generate visualization. At least 10 records required."]
    
    student_cgpas = []
    buffers = []
    # Extract and compute average CGPA per student
    for details in record_dict.values():
        sem_cgpas = []
        
        for sem in range(1, 9):  # Assuming 8 semesters
            sem_key = f"sem{sem}"
            try:
                cgpa = float(details.get(sem_key, 0))  # Convert to float, default to 0 if missing
                if 5.0 <= cgpa <= 10.0:  # Accept only realistic CGPA values
                    sem_cgpas.append(cgpa)
            except (ValueError, TypeError):
                continue  # Skip invalid CGPA entries
        
        # ✅ Compute average CGPA for each student
        if sem_cgpas:
            student_cgpas.append(sum(sem_cgpas) / len(sem_cgpas))

    if not student_cgpas:
        return ["No valid CGPA data available for visualization."]

    df = pd.DataFrame({"Avg_CGPA": student_cgpas})
    total_students = len(df)
    below_7_5_pct = (df["Avg_CGPA"] < 7.5).sum() / total_students * 100
    
    percentiles = [90, 80, 70, 60, 50, 40, 30, 20, 10]
    percentile_values = {p: df["Avg_CGPA"].quantile(p / 100) for p in percentiles}

    # ✅ Create a histogram with percentile markers
    fig1, ax1 = plt.subplots(figsize=(10, 5))
    sns.histplot(df["Avg_CGPA"], bins=20, kde=True, color="blue", alpha=0.6, ax=ax1)
    
    for p, value in percentile_values.items():
        ax1.axvline(value, linestyle="--", color="red", label=f"{p}th Pctl: {value:.2f}")
    
    ax1.set_title("Average CGPA Distribution with Percentiles")
    ax1.set_xlabel("Average CGPA")
    ax1.set_ylabel("Frequency")
    ax1.legend()
    ax1.grid()

    buffers.append(make_buffer(fig1))

    
    # ✅ Create a box plot for percentile visualization
    fig2, ax2 = plt.subplots(figsize=(8, 4))
    sns.boxplot(x=df["Avg_CGPA"], color="lightblue", ax=ax2)
    ax2.set_title("Average CGPA Box Plot with Percentile Markers")
    ax2.set_xlabel("Average CGPA")
    ax2.grid()
    buffers.append(make_buffer(fig2))
    return buffers

# Fetch data and run the visualization
# if __name__ == "__main__":
#     record_dict = get_academic_data()  # Fetch academic data
#     visualizations = compute_percentiles_and_visualize()
    
    # for fig in visualizations:
    #     if isinstance(fig, str):
    #         print(fig)  # Print any error messages
    #     else:
    #         fig.show()  # Show the visualization
