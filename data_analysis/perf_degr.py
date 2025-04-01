import matplotlib
matplotlib.use('Agg') 
from get_data import get_academic_data
from numpy import corrcoef 
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

def performance_degrade():
    # columns = ["Roll No", "Name", "branch", "section","sem1","sem2", "sem3",
    #            "sem4","sem5","sem6","sem7","sem8"]
    record_dict = get_academic_data()
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    corr = []
    plot_dict = {}

    for rollno in record_dict:
        x,gpas = [],[]
        for sem in sems:
            k = record_dict[rollno].get(sem,-1)
            if(k==-1):
                continue
            x.append(int(sem[-1]))
            gpas.append(k)
        if(len(x)==1 or len(gpas)==1):
            continue
        if(len(set(gpas))==1):
            continue
        r = corrcoef(x,gpas)[0][1]

        corr.append([r,rollno])

    corr = [ele for ele in corr if ele[0]<0]
    corr = sorted(corr)
    # print(corr)

    rollnos = [rollno for [r, rollno] in corr[:5]]
    gpas = [[record_dict[rollno].get(f'sem{i}') for i in range(1, 9)] for rollno in rollnos]
    
    fig, ax = plt.subplots(figsize=(8, 6))
    
    for i, gpa_list in enumerate(gpas):
        # print(record_dict[rollnos[i]])
        plot(gpa_list, rollnos[i], ax)
    
    ax.set_xlabel("Semesters")
    ax.set_ylabel("GPAs")
    ax.set_title("Plot of Most Degrading Student Performance")
    ax.legend()
    ax.grid(True)
    # plt.show()
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    plt.close()
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return img_base64


# def plot(y,label):
#     sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
#     x = [0,1,2,3,4,5,6,7]
#     # Convert lists to numpy arrays to handle None/NaN
#     y1_np = np.array(y, dtype=float)

#     # Find the index of None
#     none_index = np.where(np.isnan(y1_np))[0]

#     # Create a new x and y for the connected line segment
#     if none_index.size > 0 and none_index[0] > 0 and none_index[0] < len(y) - 1:
#         idx = none_index[0]
#         x_connect = [x[idx - 1], x[idx + 1]]
#         y_connect = [y1_np[idx - 1], y1_np[idx + 1]]
#         plt.plot(x_connect, y_connect, linestyle='-') # Plot the connecting line

#     # Plot the original data (ignoring None values)
#     plt.plot(sems, y1_np, marker='o', linestyle='-', label=label)
#     # plt.plot(x, y2, marker='x', linestyle='-', label='Second Data')

def plot(y, label, ax):
    sems = ["sem1", "sem2", "sem3", "sem4", "sem5", "sem6", "sem7", "sem8"]
    x = np.arange(len(sems))
    
    # Convert lists to numpy arrays to handle None/NaN
    y1_np = np.array(y, dtype=float)
    
    # Find the index of None
    none_index = np.where(np.isnan(y1_np))[0]
    
    # Create a new x and y for the connected line segment
    if none_index.size > 0 and none_index[0] > 0 and none_index[0] < len(y) - 1:
        idx = none_index[0]
        x_connect = [x[idx - 1], x[idx + 1]]
        y_connect = [y1_np[idx - 1], y1_np[idx + 1]]
        ax.plot(x_connect, y_connect, linestyle='-')  # Plot the connecting line
    
    # Plot the original data (ignoring None values)
    ax.plot(sems, y1_np, marker='o', linestyle='-', label=label)


# performance_degrade()