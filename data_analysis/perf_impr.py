import matplotlib
matplotlib.use('Agg') 
from get_data import get_academic_data
from numpy import corrcoef 
import numpy as np
import matplotlib.pyplot as plt
import io 
import base64

def performance_improve():
    record_dict = get_academic_data()
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    corr = []
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
        if len(gpas) < 3:
            continue
        if(len(set(gpas))==1):
            continue
        r = corrcoef(x,gpas)[0][1]

        corr.append([r,rollno])

    corr = [ele for ele in corr if ele[0]>0]
    corr = sorted(corr,reverse=True)

    rollnos = [rollno for [r,rollno] in corr[:5]]
    gpas = [[record_dict[rollno].get(f'sem{i}') for i in range(1, 9)] for rollno in rollnos]
    print(gpas)
    for i, gpa_list in enumerate(gpas):
        # print(record_dict[rollnos[i]])
        plot(gpa_list,rollnos[i])

    plt.xlabel("sems")
    plt.ylabel("gpas")
    plt.title("Plot most improving student performance")
    plt.legend()
    plt.grid(True)
    buf = io.BytesIO()
    plt.savefig(buf,format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return img_base64
    

def plot(y,label):
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    x = [0,1,2,3,4,5,6,7]

    y1_np = np.array(y, dtype=float)
    none_index = np.where(np.isnan(y1_np))[0]

    # Create a new x and y for the connected line segment
    if none_index.size > 0 and none_index[0] > 0 and none_index[0] < len(y) - 1:
        idx = none_index[0]
        x_connect = [x[idx - 1], x[idx + 1]]
        y_connect = [y1_np[idx - 1], y1_np[idx + 1]]
        plt.plot(x_connect, y_connect, linestyle='-') # Plot the connecting line

    plt.plot(sems, y1_np, marker='o', linestyle='-', label=label)
    # plt.plot(x, y2, marker='x', linestyle='-', label='Second Data')

# performance_improve()