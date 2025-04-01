import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from get_data import get_academic_data  # Assuming this function fetches academic records
from io import BytesIO
from make_buffer import make_buffer

def visualize_semester_wise_trends():
    """Fetches academic data, processes CGPA values, filters outliers, and returns section-wise semester trends."""
    record_dict = get_academic_data()  # Fetch academic data
    buffers = []
    student_cgpa = {}

    # Process each student's CGPA data
    for roll_no, details in record_dict.items():
        cgpa_list = []
        section_info = details.get('section', 'A')  # Assume section info is stored in 'section'
        
        for sem in range(1, 9):  # Assuming 8 semesters
            sem_key = f"sem{sem}"
            try:
                cgpa = float(details.get(sem_key, 0))  # Convert to float, default to 0 if missing
                if 5.0 <= cgpa <= 10.0:  # Accept only realistic CGPA values (5.0 to 10.0)
                    cgpa_list.append((section_info, cgpa))  # Store section-wise CGPA
            except (ValueError, TypeError):
                continue  # Skip invalid CGPA entries

        # Compute average CGPA per student
        if cgpa_list:  # Ensure student has valid CGPA data
            student_cgpa[roll_no] = cgpa_list

    # Convert to DataFrame for easy analysis and visualization
    section_data = []
    for roll_no, data in student_cgpa.items():
        for section, cgpa in data:
            section_data.append([roll_no, section, cgpa])
    
    df = pd.DataFrame(section_data, columns=["Roll No", "Section", "CGPA"])

    # Outlier Removal: Exclude CGPA beyond 3 standard deviations
    mean_cgpa = df["CGPA"].mean()
    std_cgpa = df["CGPA"].std()
    df_filtered = df[(df["CGPA"] >= (mean_cgpa - 3 * std_cgpa)) & (df["CGPA"] <= (mean_cgpa + 3 * std_cgpa))]

    # Section-wise Analysis - Histogram for CGPA distribution per Section
    fig1, ax1 = plt.subplots(figsize=(10, 6))
    sns.histplot(data=df_filtered, x="CGPA", hue="Section", bins=15, kde=True, ax=ax1, multiple="stack", palette="viridis")
    ax1.set_title("CGPA Distribution Across Sections (Filtered)", fontsize=16)
    ax1.set_xlabel("CGPA", fontsize=14)
    ax1.set_ylabel("Number of Students", fontsize=14)
    ax1.legend(title="Section", title_fontsize='13', fontsize='12')
    plt.xticks(fontsize=12)
    plt.yticks(fontsize=12)
    # buffers.append(make_buffer(fig3))  # Convert figure to buffer and add to the list

    # Boxplot for CGPA distribution by Section
    fig2, ax2 = plt.subplots(figsize=(10, 6))
    sns.boxplot(x="Section", y="CGPA", data=df_filtered, ax=ax2, palette="Set3")
    ax2.set_title("CGPA Distribution per Section", fontsize=16)
    ax2.set_xlabel("Section", fontsize=14)
    ax2.set_ylabel("CGPA", fontsize=14)
    ax2.set_xticklabels(['CSE(A)', 'CSE(B)', 'CSE(C)', 'AIML(A)', 'AIML(B)', 'AIML(C)'], rotation=45, fontsize=12)
    plt.yticks(fontsize=12)
    # buffers.append(make_buffer(fig2))  # Convert figure to buffer and add to the list

    # Bar Chart for Average CGPA per Section
    avg_cgpa_section = df_filtered.groupby("Section")["CGPA"].mean().reset_index()
    fig3, ax3 = plt.subplots(figsize=(10, 6))
    sns.barplot(x="Section", y="CGPA", data=avg_cgpa_section, ax=ax3, palette="coolwarm")
    ax3.set_title("Average CGPA per Section", fontsize=16)
    ax3.set_xlabel("Section", fontsize=14)
    ax3.set_ylabel("Average CGPA", fontsize=14)
    ax3.set_xticklabels(['CSE(A)', 'CSE(B)', 'CSE(C)', 'AIML(A)', 'AIML(B)', 'AIML(C)'], rotation=45, fontsize=12)
    plt.yticks(fontsize=12)
    buffers.append(make_buffer(fig3))  # Convert figure to buffer and add to the list
    # buffers.append(make_buffer(fig1))  # Convert figure to buffer and add to the list
    buffers.append(make_buffer(fig2))  # Convert figure to buffer and add to the list

    # Return the list of buffers containing the figures
    return buffers
