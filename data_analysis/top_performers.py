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
    plt.figure(figsize=(10, 6))  # Adjust figure size as needed
    plt.bar(roll_nos, cgpas, color='skyblue')
    plt.xlabel("Roll Number")
    plt.ylabel("CGPA")
    plt.title("Student CGPA")
    major_yticks = np.arange(0, 11, 1)
    plt.yticks(major_yticks)

    # Set minor y-axis ticks at the desired locations
    minor_yticks = np.arange(0.2, 10, 0.2)  # Example: Ticks every 0.2
    plt.gca().set_yticks(minor_yticks, minor=True)
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout() 
    plt.show()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return img_base64


top_performers()