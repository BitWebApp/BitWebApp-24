import matplotlib
matplotlib.use('Agg') 
from get_data import get_academic_data
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

def top_performers():
    record_dict = get_academic_data()
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    gpa_list = []
    for rollno in record_dict:
        gpas = []
        for sem in sems:
            k = record_dict[rollno].get(sem,-1)
            if(k==-1):
                continue
            # x.append(int(sem[-1]))
            gpas.append(k)
        if len(gpas) < 3:
            continue
        avg = sum(gpas)/len(gpas)
        gpa_list.append([avg,rollno])
    
    gpa_list = sorted(gpa_list,reverse=True)
    gpa_list = gpa_list[:15]
    # print(gpa_list)
    cgpas = [item[0] for item in gpa_list]
    roll_nos = [item[1] for item in gpa_list]
    buffer = make_cgpa_bar_plot(cgpas, roll_nos)
    return buffer


def make_cgpa_bar_plot(cgpas, roll_nos):
    """Generates a bar plot of CGPAs with roll numbers as labels and returns a Base64 encoded PNG."""
    fig, ax = plt.subplots(figsize=(10, 6))  # Use subplots for better figure handling
    bars = ax.bar(roll_nos, cgpas, color='skyblue')
    
    # Display GPA values on top of bars
    for bar, cgpa in zip(bars, cgpas):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height(), f'{cgpa:.2f}', ha='center', va='bottom', fontsize=10, color='black')
    
    ax.set_xlabel("Roll Number")
    ax.set_ylabel("CGPA")
    ax.set_title("Student CGPA")
    
    major_yticks = np.arange(0, 11, 1)
    ax.set_yticks(major_yticks)
    
    # Set minor y-axis ticks at the desired locations
    minor_yticks = np.arange(0.2, 10, 0.2)  # Example: Ticks every 0.2
    ax.set_yticks(minor_yticks, minor=True)
    ax.set_xticklabels(roll_nos, rotation=45, ha="right")
    
    plt.tight_layout()
    # plt.show()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return img_base64

# top_performers()